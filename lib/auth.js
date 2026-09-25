"use strict";

// Stateless, signed session tokens.
//
// Previously sessions lived in an in-memory Map, which breaks on serverless and
// multi-instance deployments: every cold start or new instance loses the store,
// so a logged-in admin is randomly logged out. Instead we issue an HMAC-signed
// token that carries its own expiry. Any instance can verify it with the shared
// signing key, so no server-side session state is needed.
//
// Signing key: SESSION_SECRET when provided (recommended in production), else a
// key derived from ADMIN_PASSWORD so the signature is still stable across
// instances without extra configuration. Tokens cannot be individually revoked
// server-side; logout clears the cookie and rotating ADMIN_PASSWORD/SESSION_SECRET
// invalidates all outstanding tokens.

const crypto = require("crypto");
const config = require("./config");

const COOKIE_NAME = "portfolio_session";

function base64url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function getSigningKey() {
  if (config.SESSION_SECRET) return config.SESSION_SECRET;
  if (config.ADMIN_PASSWORD) {
    return crypto.createHash("sha256").update(`session:${config.ADMIN_PASSWORD}`).digest("hex");
  }
  return "";
}

function sign(payloadB64, key) {
  return crypto.createHmac("sha256", key).update(payloadB64).digest("base64url");
}

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createSessionToken(ttlMs = config.SESSION_TTL_MS) {
  const key = getSigningKey();
  if (!key) throw new Error("No signing key available (set ADMIN_PASSWORD or SESSION_SECRET).");
  const payload = { exp: Date.now() + ttlMs };
  const payloadB64 = base64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64, key)}`;
}

function verifySessionToken(token) {
  const key = getSigningKey();
  if (!key || typeof token !== "string" || !token.includes(".")) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;
  if (!timingSafeEqualStr(signature, sign(payloadB64, key))) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        return [
          decodeURIComponent(cookie.slice(0, index)),
          decodeURIComponent(cookie.slice(index + 1))
        ];
      })
  );
}

function isAuthenticated(req) {
  return verifySessionToken(parseCookies(req)[COOKIE_NAME]);
}

function buildCookie(name, value, maxAgeSeconds, { httpOnly = true } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`
  ];
  if (httpOnly) parts.push("HttpOnly");
  if (config.IS_PRODUCTION) parts.push("Secure");
  return parts.join("; ");
}

function sessionCookie(token, maxAgeSeconds) {
  return buildCookie(COOKIE_NAME, token, maxAgeSeconds, { httpOnly: true });
}

// ---- CSRF (double-submit, bound to the session) --------------------------
//
// The CSRF token is an HMAC of the session token, so it is deterministic per
// session and cannot be forged without the signing key. It is delivered in a
// non-HttpOnly cookie (readable by our own JS) and must be echoed back in the
// X-CSRF-Token header on every state-changing request. A cross-site request
// cannot read the cookie value to set the header, so it is rejected.

const CSRF_COOKIE_NAME = "portfolio_csrf";
const CSRF_HEADER = "x-csrf-token";

function csrfTokenFor(sessionToken) {
  const key = getSigningKey();
  if (!key || !sessionToken) return "";
  return crypto.createHmac("sha256", key).update(`csrf:${sessionToken}`).digest("base64url");
}

function csrfCookie(value, maxAgeSeconds) {
  return buildCookie(CSRF_COOKIE_NAME, value, maxAgeSeconds, { httpOnly: false });
}

function verifyCsrf(req) {
  const sessionToken = parseCookies(req)[COOKIE_NAME];
  if (!verifySessionToken(sessionToken)) return false;
  const expected = csrfTokenFor(sessionToken);
  const provided = req.headers[CSRF_HEADER];
  return Boolean(expected) && typeof provided === "string" && timingSafeEqualStr(provided, expected);
}

module.exports = {
  COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER,
  createSessionToken,
  verifySessionToken,
  isAuthenticated,
  parseCookies,
  sessionCookie,
  buildCookie,
  timingSafeEqualStr,
  csrfTokenFor,
  csrfCookie,
  verifyCsrf
};
