"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

test("applySecurityHeaders sets CSP and hardening headers", () => {
  const security = require("../lib/security");
  const headers = {};
  const res = { setHeader: (k, v) => { headers[k] = v; } };
  security.applySecurityHeaders(res);
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
});

test("in-memory rate limiter blocks after LOGIN_MAX_ATTEMPTS", async () => {
  const config = require("../lib/config");
  const security = require("../lib/security");
  const ip = `test-${Date.now()}`;
  assert.equal(await security.isLoginBlocked(ip), false);
  for (let i = 0; i < config.LOGIN_MAX_ATTEMPTS; i++) {
    await security.registerLoginFailure(ip);
  }
  assert.equal(await security.isLoginBlocked(ip), true);
  await security.resetLoginAttempts(ip);
  assert.equal(await security.isLoginBlocked(ip), false);
});

test("KV rate limiter uses INCR/PEXPIRE and blocks at the threshold", async () => {
  const path = require("path");
  const bust = () => {
    for (const key of Object.keys(require.cache)) {
      if (key.includes(`${path.sep}lib${path.sep}`)) delete require.cache[key];
    }
  };
  bust();
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "token";
  const store = new Map();
  const originalFetch = global.fetch;
  global.fetch = async (_url, options) => {
    const [cmd, key] = JSON.parse(options.body);
    let result = null;
    if (cmd === "GET") result = store.has(key) ? store.get(key) : null;
    if (cmd === "INCR") { result = (Number(store.get(key)) || 0) + 1; store.set(key, result); }
    if (cmd === "PEXPIRE") result = 1;
    if (cmd === "DEL") { store.delete(key); result = 1; }
    return { ok: true, json: async () => ({ result }) };
  };
  try {
    const config = require("../lib/config");
    const security = require("../lib/security");
    const ip = "1.2.3.4";
    assert.equal(await security.isLoginBlocked(ip), false);
    for (let i = 0; i < config.LOGIN_MAX_ATTEMPTS; i++) {
      await security.registerLoginFailure(ip);
    }
    assert.equal(await security.isLoginBlocked(ip), true);
    await security.resetLoginAttempts(ip);
    assert.equal(await security.isLoginBlocked(ip), false);
  } finally {
    global.fetch = originalFetch;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    bust();
  }
});
