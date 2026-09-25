"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

test("fs backend: read returns the portfolio document with projects", async () => {
  const storage = require("../lib/storage");
  assert.equal(storage.backend, "fs");
  const data = await storage.readPortfolio();
  assert.ok(Array.isArray(data.projects));
  assert.ok(data.projects.length > 0);
});

test("fs backend: write then read round-trips without losing data", async () => {
  const storage = require("../lib/storage");
  const original = await storage.readPortfolio();
  const count = original.projects.length;
  const clone = JSON.parse(JSON.stringify(original));
  clone.projects.push({ id: "__test_probe__", name: "probe", description: "d", category: "web", technologies: [], links: [] });
  try {
    await storage.writePortfolio(clone);
    const after = await storage.readPortfolio();
    assert.equal(after.projects.length, count + 1);
    assert.ok(after.projects.some((p) => p.id === "__test_probe__"));
  } finally {
    await storage.writePortfolio(original); // restore
  }
  const restored = await storage.readPortfolio();
  assert.equal(restored.projects.length, count);
});

test("kv backend: reads from KV and seeds an empty store", async () => {
  // Isolate a fresh module graph with KV env configured and fetch stubbed.
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${require("path").sep}lib${require("path").sep}`)) delete require.cache[key];
  }
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "token";

  const store = new Map();
  const originalFetch = global.fetch;
  global.fetch = async (_url, options) => {
    const [cmd, key, value] = JSON.parse(options.body);
    let result = null;
    if (cmd === "GET") result = store.has(key) ? store.get(key) : null;
    if (cmd === "SET") { store.set(key, value); result = "OK"; }
    return { ok: true, json: async () => ({ result }) };
  };

  try {
    const storage = require("../lib/storage");
    assert.equal(storage.backend, "kv");
    // Empty store -> seeded from bundled file and persisted.
    const first = await storage.readPortfolio();
    assert.ok(first.projects.length > 0);
    assert.ok(store.has("portfolio"));
    // Write is persisted and read back.
    const clone = JSON.parse(JSON.stringify(first));
    clone.projects[0].name = "KV Roundtrip";
    await storage.writePortfolio(clone);
    const back = await storage.readPortfolio();
    assert.equal(back.projects[0].name, "KV Roundtrip");
  } finally {
    global.fetch = originalFetch;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    for (const key of Object.keys(require.cache)) {
      if (key.includes(`${require("path").sep}lib${require("path").sep}`)) delete require.cache[key];
    }
  }
});
