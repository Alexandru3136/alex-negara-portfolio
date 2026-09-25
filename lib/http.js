"use strict";

// Small HTTP helpers shared across routes.

const config = require("./config");

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

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || (req.socket && req.socket.remoteAddress) || "unknown";
}

async function parseBody(req) {
  // Some runtimes (e.g. Vercel) pre-parse the JSON body and consume the stream.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string") {
      if (!req.body) return {};
      try {
        return JSON.parse(req.body);
      } catch {
        const error = new Error("JSON invalid.");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > config.MAX_BODY_BYTES) {
      const error = new Error("Corpul cererii este prea mare.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON invalid.");
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { send, sendJson, clientIp, parseBody };
