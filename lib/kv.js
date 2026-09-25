"use strict";

// Thin client for a KV REST store (Vercel KV / Upstash Redis REST convention).
// Shared by storage (portfolio document) and security (rate-limit counters).

const config = require("./config");

function isConfigured() {
  return Boolean(config.KV_REST_API_URL && config.KV_REST_API_TOKEN);
}

// Runs a single Redis-style command, e.g. ["GET", "key"] or ["INCR", "key"].
async function command(args) {
  const response = await fetch(config.KV_REST_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args)
  });
  if (!response.ok) {
    throw new Error(`KV request failed with status ${response.status}`);
  }
  const payload = await response.json();
  return payload.result;
}

module.exports = { isConfigured, command };
