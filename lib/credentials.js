"use strict";

// Resolves the admin password at startup instead of shipping a hardcoded
// default. Behavior:
//   - ADMIN_PASSWORD set        -> use it (any environment).
//   - not set, development      -> generate a random one and print it once, so
//                                  local login works without a known constant.
//   - not set, production       -> leave empty; login returns 503 until the
//                                  operator configures ADMIN_PASSWORD.

const crypto = require("crypto");
const config = require("./config");

function bootstrapCredentials({ log = console } = {}) {
  if (config.ADMIN_PASSWORD) {
    if (config.IS_PRODUCTION && !config.SESSION_SECRET) {
      log.warn("[auth] SESSION_SECRET nu este setat; cheia de semnare este derivata din ADMIN_PASSWORD.");
    }
    return;
  }

  if (config.IS_PRODUCTION) {
    log.warn("[auth] ADMIN_PASSWORD nu este configurat in productie; login-ul admin este dezactivat (503).");
    return;
  }

  const generated = crypto.randomBytes(9).toString("base64url");
  config.ADMIN_PASSWORD = generated;
  log.warn(`[auth] ADMIN_PASSWORD negenerat -> parola de dezvoltare generata: ${generated}`);
  log.warn("[auth] Seteaza ADMIN_PASSWORD in mediu pentru o parola stabila.");
}

module.exports = { bootstrapCredentials };
