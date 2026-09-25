"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test-secret";
const auth = require("../lib/auth");

test("createSessionToken produces a token verified by verifySessionToken", () => {
  const token = auth.createSessionToken();
  assert.equal(auth.verifySessionToken(token), true);
});

test("tampered token is rejected", () => {
  const token = auth.createSessionToken();
  assert.equal(auth.verifySessionToken(token + "x"), false);
  const [payload] = token.split(".");
  assert.equal(auth.verifySessionToken(`${payload}.deadbeef`), false);
});

test("expired token is rejected", () => {
  const token = auth.createSessionToken(-1000);
  assert.equal(auth.verifySessionToken(token), false);
});

test("garbage input is rejected without throwing", () => {
  assert.equal(auth.verifySessionToken(""), false);
  assert.equal(auth.verifySessionToken(null), false);
  assert.equal(auth.verifySessionToken("no-dot"), false);
  assert.equal(auth.verifySessionToken("a.b.c"), false);
});

test("isAuthenticated reads the session cookie", () => {
  const token = auth.createSessionToken();
  const req = { headers: { cookie: `${auth.COOKIE_NAME}=${encodeURIComponent(token)}` } };
  assert.equal(auth.isAuthenticated(req), true);
  assert.equal(auth.isAuthenticated({ headers: {} }), false);
});

test("parseCookies parses multiple cookies", () => {
  const req = { headers: { cookie: "a=1; b=two; c=%20space" } };
  const cookies = auth.parseCookies(req);
  assert.equal(cookies.a, "1");
  assert.equal(cookies.b, "two");
  assert.equal(cookies.c, " space");
});

test("sessionCookie sets HttpOnly, SameSite and Path", () => {
  const cookie = auth.sessionCookie("abc", 3600);
  assert.match(cookie, /portfolio_session=abc/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
});

test("timingSafeEqualStr compares correctly", () => {
  assert.equal(auth.timingSafeEqualStr("abc", "abc"), true);
  assert.equal(auth.timingSafeEqualStr("abc", "abd"), false);
  assert.equal(auth.timingSafeEqualStr("abc", "abcd"), false);
});

test("csrfTokenFor is deterministic per session and differs across sessions", () => {
  const s1 = auth.createSessionToken(3600 * 1000);
  const s2 = auth.createSessionToken(7200 * 1000); // different exp -> different token
  assert.notEqual(s1, s2);
  assert.equal(auth.csrfTokenFor(s1), auth.csrfTokenFor(s1));
  assert.notEqual(auth.csrfTokenFor(s1), auth.csrfTokenFor(s2));
  assert.equal(auth.csrfTokenFor(""), "");
});

test("verifyCsrf accepts matching header and rejects otherwise", () => {
  const token = auth.createSessionToken();
  const csrf = auth.csrfTokenFor(token);
  const cookie = `${auth.COOKIE_NAME}=${encodeURIComponent(token)}`;
  assert.equal(auth.verifyCsrf({ headers: { cookie, [auth.CSRF_HEADER]: csrf } }), true);
  assert.equal(auth.verifyCsrf({ headers: { cookie, [auth.CSRF_HEADER]: "wrong" } }), false);
  assert.equal(auth.verifyCsrf({ headers: { cookie } }), false);
  assert.equal(auth.verifyCsrf({ headers: { [auth.CSRF_HEADER]: csrf } }), false);
});
