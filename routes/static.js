"use strict";

// Static file serving from PUBLIC_DIR with path-traversal protection.
// Page-like requests (no extension) fall back to index.html; a missing asset
// (has an extension) returns a real 404.

const fs = require("fs/promises");
const path = require("path");
const config = require("../lib/config");
const { sendJson } = require("../lib/http");

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

async function serveStatic(req, res, url) {
  const routePath = url.pathname === "/"
    ? "/index.html"
    : url.pathname === "/admin"
      ? "/admin.html"
      : url.pathname;
  const filePath = path.normalize(path.join(config.PUBLIC_DIR, routePath));

  if (!filePath.startsWith(config.PUBLIC_DIR)) {
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
    if (!path.extname(routePath)) {
      const fallback = await fs.readFile(path.join(config.PUBLIC_DIR, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fallback);
      return;
    }
    sendJson(res, 404, { error: "Resursa nu a fost gasita." });
  }
}

module.exports = { serveStatic, contentTypes };
