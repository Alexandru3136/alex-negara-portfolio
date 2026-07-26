const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PRODUCTION ? "" : "schimba-parola");
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "data", "portfolio.json");
const sessions = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function sendJson(res, status, body, headers = {}) {
  send(res, status, body, headers);
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        return [
          decodeURIComponent(cookie.slice(0, index)),
          decodeURIComponent(cookie.slice(index + 1))
        ];
      })
  );
}

function isAuthenticated(req) {
  const token = parseCookies(req).portfolio_session;
  if (!token) return false;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return true;
}

async function readPortfolio() {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

async function writePortfolio(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON invalid.");
    error.statusCode = 400;
    throw error;
  }
}

function cleanProject(input) {
  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  const details = String(input.details || "").trim();
  const challenge = String(input.challenge || "").trim();
  const outcome = String(input.outcome || "").trim();
  const mediaUrl = String(input.mediaUrl || "").trim();
  const mediaType = String(input.mediaType || "image").trim() === "video" ? "video" : "image";
  const allowedCategories = new Set(["automation", "web"]);
  const category = allowedCategories.has(String(input.category || "").trim())
    ? String(input.category).trim()
    : "web";
  const technologies = Array.isArray(input.technologies)
    ? input.technologies.map((item) => String(item).trim()).filter(Boolean)
    : String(input.technologies || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const links = Array.isArray(input.links)
    ? input.links
        .map((link) => ({
          label: String(link.label || "").trim(),
          url: String(link.url || "").trim()
        }))
        .filter((link) => link.label && link.url)
    : [];

  if (!name || !description) {
    const error = new Error("Numele si descrierea sunt obligatorii.");
    error.statusCode = 400;
    throw error;
  }

  return {
    name,
    description,
    details,
    challenge,
    outcome,
    mediaUrl,
    mediaType,
    category,
    technologies,
    links
  };
}

function createId() {
  return crypto.randomBytes(8).toString("hex");
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/portfolio" && req.method === "GET") {
    return sendJson(res, 200, await readPortfolio());
  }

  if (url.pathname === "/api/session" && req.method === "GET") {
    return sendJson(res, 200, { authenticated: isAuthenticated(req) });
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    const body = await parseBody(req);
    if (!ADMIN_PASSWORD) {
      return sendJson(res, 503, { error: "Parola admin nu este configurata pe server." });
    }

    if (String(body.password || "") !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: "Parola este incorecta." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": `portfolio_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`
    });
  }

  if (url.pathname === "/api/logout" && req.method === "POST") {
    const token = parseCookies(req).portfolio_session;
    if (token) sessions.delete(token);
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": "portfolio_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    });
  }

  if (url.pathname.startsWith("/api/projects") && !isAuthenticated(req)) {
    return sendJson(res, 401, { error: "Autentificare necesara." });
  }

  if (url.pathname === "/api/projects" && req.method === "POST") {
    const portfolio = await readPortfolio();
    const project = {
      id: createId(),
      ...cleanProject(await parseBody(req))
    };
    portfolio.projects.unshift(project);
    await writePortfolio(portfolio);
    return sendJson(res, 201, project);
  }

  const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch && (req.method === "PUT" || req.method === "DELETE")) {
    const portfolio = await readPortfolio();
    const projectId = projectMatch[1];
    const index = portfolio.projects.findIndex((project) => project.id === projectId);

    if (index === -1) {
      return sendJson(res, 404, { error: "Proiectul nu a fost gasit." });
    }

    if (req.method === "DELETE") {
      const [removed] = portfolio.projects.splice(index, 1);
      await writePortfolio(portfolio);
      return sendJson(res, 200, removed);
    }

    portfolio.projects[index] = {
      ...portfolio.projects[index],
      ...cleanProject(await parseBody(req))
    };
    await writePortfolio(portfolio);
    return sendJson(res, 200, portfolio.projects[index]);
  }

  return false;
}

async function serveStatic(req, res, url) {
  const routePath = url.pathname === "/"
    ? "/index.html"
    : url.pathname === "/admin"
      ? "/admin.html"
      : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, routePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendJson(res, 403, { error: "Acces interzis." });
  }

  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    });
    res.end(data);
  } catch {
    const fallback = await fs.readFile(path.join(PUBLIC_DIR, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fallback);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (handled === false) sendJson(res, 404, { error: "Ruta API inexistenta." });
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.statusCode ? error.message : "A aparut o eroare pe server."
    });
  }
});

server.listen(PORT, () => {
  console.log(`Portofoliul ruleaza la http://localhost:${PORT}`);
  console.log("Ruta admin: http://localhost:" + PORT + "/admin");
});
