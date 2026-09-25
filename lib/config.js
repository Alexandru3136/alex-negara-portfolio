"use strict";

const path = require("path");

const ROOT = path.join(__dirname, "..");

const config = {
  ROOT,
  PORT: Number(process.env.PORT || 3000),
  IS_PRODUCTION: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
  PUBLIC_DIR: path.join(ROOT, "public"),
  DATA_FILE: path.join(ROOT, "data", "portfolio.json"),

  // Auth. ADMIN_PASSWORD resolution (env / generated dev password) is finalized
  // by lib/credentials.js, which mutates the value below during bootstrap.
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  SESSION_TTL_MS: 1000 * 60 * 60 * 8,

  // Limits
  MAX_BODY_BYTES: 1024 * 100, // 100 KB
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 1000 * 60 * 15, // 15 min

  // Storage backend selection (KV when configured, else local filesystem).
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",
  KV_KEY: process.env.KV_KEY || "portfolio"
};

config.STORAGE_BACKEND = config.KV_REST_API_URL && config.KV_REST_API_TOKEN ? "kv" : "fs";

module.exports = config;
