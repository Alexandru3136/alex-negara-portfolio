"use strict";

// Vercel serverless entry. All routes are rewritten here (see vercel.json); the
// shared handler serves both /api/* and static files from public/.

const { bootstrapCredentials } = require("../lib/credentials");
const { handler } = require("../lib/handler");

bootstrapCredentials();

module.exports = (req, res) => handler(req, res);
