"use strict";

// The core request handler, shared by the local Node server (server.js) and the
// Vercel serverless entry (api/index.js). It is a plain (req, res) function so
// it works both with http.createServer and with Vercel's Node runtime.

const security = require("./security");
const { sendJson } = require("./http");
const { logRequest } = require("./logger");
const { handleApi } = require("../routes/api");
const { serveStatic } = require("../routes/static");

async function handler(req, res) {
  logRequest(req, res);
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  security.applySecurityHeaders(res);

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
}

module.exports = { handler };
