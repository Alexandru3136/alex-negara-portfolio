"use strict";

// API routing. Returns false when no route matched so the caller can 404.

const config = require("../lib/config");
const storage = require("../lib/storage");
const auth = require("../lib/auth");
const security = require("../lib/security");
const projects = require("../lib/projects");
const { sendJson, clientIp, parseBody } = require("../lib/http");

async function handleApi(req, res, url) {
  if (url.pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, {
      status: "ok",
      storage: storage.backend,
      adminConfigured: Boolean(config.ADMIN_PASSWORD),
      time: new Date().toISOString()
    });
  }

  if (url.pathname === "/api/portfolio" && req.method === "GET") {
    return sendJson(res, 200, await storage.readPortfolio());
  }

  if (url.pathname === "/api/session" && req.method === "GET") {
    return sendJson(res, 200, { authenticated: auth.isAuthenticated(req) });
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    const ip = clientIp(req);
    if (await security.isLoginBlocked(ip)) {
      return sendJson(res, 429, { error: "Prea multe incercari. Reincearca mai tarziu." });
    }

    const body = await parseBody(req);
    if (!config.ADMIN_PASSWORD) {
      return sendJson(res, 503, { error: "Parola admin nu este configurata pe server." });
    }

    if (!auth.timingSafeEqualStr(body.password || "", config.ADMIN_PASSWORD)) {
      await security.registerLoginFailure(ip);
      return sendJson(res, 401, { error: "Parola este incorecta." });
    }

    await security.resetLoginAttempts(ip);
    const token = auth.createSessionToken(config.SESSION_TTL_MS);
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": [
        auth.sessionCookie(token, config.SESSION_TTL_MS / 1000),
        auth.csrfCookie(auth.csrfTokenFor(token), config.SESSION_TTL_MS / 1000)
      ]
    });
  }

  if (url.pathname === "/api/logout" && req.method === "POST") {
    // Stateless sessions: clearing the cookies is enough.
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": [auth.sessionCookie("", 0), auth.csrfCookie("", 0)]
    });
  }

  // Everything below mutates state and requires authentication.
  if (url.pathname.startsWith("/api/projects")) {
    if (!auth.isAuthenticated(req)) {
      return sendJson(res, 401, { error: "Autentificare necesara." });
    }
    if (!auth.verifyCsrf(req)) {
      return sendJson(res, 403, { error: "Token CSRF invalid." });
    }
  }

  if (url.pathname === "/api/projects" && req.method === "POST") {
    const portfolio = await storage.readPortfolio();
    const project = {
      id: projects.createId(),
      ...projects.cleanProject(await parseBody(req))
    };
    portfolio.projects.unshift(project);
    await storage.writePortfolio(portfolio);
    return sendJson(res, 201, project);
  }

  const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch && (req.method === "PUT" || req.method === "DELETE")) {
    const portfolio = await storage.readPortfolio();
    const projectId = projectMatch[1];
    const index = portfolio.projects.findIndex((project) => project.id === projectId);

    if (index === -1) {
      return sendJson(res, 404, { error: "Proiectul nu a fost gasit." });
    }

    if (req.method === "DELETE") {
      const [removed] = portfolio.projects.splice(index, 1);
      await storage.writePortfolio(portfolio);
      return sendJson(res, 200, removed);
    }

    portfolio.projects[index] = {
      ...portfolio.projects[index],
      ...projects.cleanProject(await parseBody(req))
    };
    await storage.writePortfolio(portfolio);
    return sendJson(res, 200, portfolio.projects[index]);
  }

  return false;
}

module.exports = { handleApi };
