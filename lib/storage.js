"use strict";

// Storage abstraction for the portfolio document.
//
// Local/dev: atomic writes to data/portfolio.json (temp file + rename), with
// writes serialized so a crash or concurrent request can never corrupt the file.
//
// Production on serverless (Vercel etc.): the filesystem is read-only/ephemeral,
// so admin edits written to disk would silently disappear. When a KV REST store
// is configured (KV_REST_API_URL + KV_REST_API_TOKEN — the Vercel KV / Upstash
// convention), the whole document is persisted there instead. On first read the
// KV store is seeded from the bundled data/portfolio.json so production starts
// with the shipped content.

const fs = require("fs/promises");
const crypto = require("crypto");
const config = require("./config");
const kv = require("./kv");

async function readBundledSeed() {
  const raw = await fs.readFile(config.DATA_FILE, "utf8");
  return JSON.parse(raw);
}

// ---- Filesystem backend --------------------------------------------------

let writeQueue = Promise.resolve();

const fsBackend = {
  async read() {
    const raw = await fs.readFile(config.DATA_FILE, "utf8");
    return JSON.parse(raw);
  },
  async write(data) {
    const run = writeQueue.then(async () => {
      const payload = JSON.stringify(data, null, 2) + "\n";
      const tmpFile = `${config.DATA_FILE}.${crypto.randomBytes(6).toString("hex")}.tmp`;
      await fs.writeFile(tmpFile, payload, "utf8");
      await fs.rename(tmpFile, config.DATA_FILE);
    });
    writeQueue = run.catch(() => {});
    return run;
  }
};

// ---- KV (REST) backend ---------------------------------------------------

let kvWriteQueue = Promise.resolve();

const kvBackend = {
  async read() {
    const stored = await kv.command(["GET", config.KV_KEY]);
    if (stored) {
      return typeof stored === "string" ? JSON.parse(stored) : stored;
    }
    // Empty store: seed from the bundled document and persist it.
    const seed = await readBundledSeed();
    await this.write(seed);
    return seed;
  },
  async write(data) {
    // Serialize writes so overlapping admin saves don't interleave (each SET is
    // itself atomic at the KV level; the queue prevents lost-update races within
    // an instance).
    const run = kvWriteQueue.then(() => kv.command(["SET", config.KV_KEY, JSON.stringify(data)]));
    kvWriteQueue = run.catch(() => {});
    return run;
  }
};

// ---- Public API ----------------------------------------------------------

const backend = config.STORAGE_BACKEND === "kv" ? kvBackend : fsBackend;

module.exports = {
  backend: config.STORAGE_BACKEND,
  readPortfolio: () => backend.read(),
  writePortfolio: (data) => backend.write(data),
  // Exposed for tests.
  _fsBackend: fsBackend,
  _kvBackend: kvBackend
};
