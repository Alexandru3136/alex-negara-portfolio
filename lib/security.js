"use strict";

// Security helpers: response headers and a login rate limiter.
//
// The rate limiter uses a shared KV store when configured (so limits hold across
// serverless instances), and falls back to an in-memory Map otherwise. All
// functions are async so both backends share one interface.

const config = require("./config");
const kv = require("./kv");

const loginAttempts = new Map();
const keyFor = (ip) => `rl:login:${ip}`;

async function isLoginBlocked(ip) {
  if (kv.isConfigured()) {
    const count = Number(await kv.command(["GET", keyFor(ip)])) || 0;
    return count >= config.LOGIN_MAX_ATTEMPTS;
  }
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > config.LOGIN_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= config.LOGIN_MAX_ATTEMPTS;
}

async function registerLoginFailure(ip) {
  if (kv.isConfigured()) {
    const count = await kv.command(["INCR", keyFor(ip)]);
    if (Number(count) === 1) {
      await kv.command(["PEXPIRE", keyFor(ip), config.LOGIN_WINDOW_MS]);
    }
    return;
  }
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.first > config.LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

async function resetLoginAttempts(ip) {
  if (kv.isConfigured()) {
    await kv.command(["DEL", keyFor(ip)]);
    return;
  }
  loginAttempts.delete(ip);
}

function pruneLoginAttempts() {
  // Only the in-memory backend needs pruning; KV entries expire via PEXPIRE.
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (now - entry.first > config.LOGIN_WINDOW_MS) loginAttempts.delete(ip);
  }
}

function applySecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "media-src 'self'",
      "style-src 'self' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "form-action 'self' https://formsubmit.co",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join("; ")
  );
}

module.exports = {
  isLoginBlocked,
  registerLoginFailure,
  resetLoginAttempts,
  pruneLoginAttempts,
  applySecurityHeaders,
  _loginAttempts: loginAttempts
};
