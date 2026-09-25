"use strict";

const http = require("http");
const config = require("./lib/config");
const security = require("./lib/security");
const { bootstrapCredentials } = require("./lib/credentials");
const { handler } = require("./lib/handler");

bootstrapCredentials();

// Prune stale in-memory rate-limit entries periodically. Sessions are stateless
// (signed tokens) and KV rate-limit entries expire on their own. unref() keeps
// the timer from holding the process open.
setInterval(() => security.pruneLoginAttempts(), 1000 * 60 * 10).unref();

const server = http.createServer(handler);

server.listen(config.PORT, () => {
  console.log(`Portofoliul ruleaza la http://localhost:${config.PORT}`);
  console.log("Ruta admin: http://localhost:" + config.PORT + "/admin");
});

module.exports = server;
