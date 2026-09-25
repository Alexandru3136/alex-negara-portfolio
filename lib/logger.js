"use strict";

// Minimal structured request logger. Logs one line per request on response
// finish: method, path, status and duration. Silent under NODE_ENV=test.

const SILENT = process.env.NODE_ENV === "test";

function logRequest(req, res) {
  if (SILENT) return;
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = {
      t: new Date().toISOString(),
      method: req.method,
      path: (req.url || "").split("?")[0],
      status: res.statusCode,
      ms: Math.round(ms * 10) / 10
    };
    console.log(JSON.stringify(line));
  });
}

module.exports = { logRequest };
