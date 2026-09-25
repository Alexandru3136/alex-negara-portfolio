"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const projects = require("../lib/projects");

test("cleanProject requires name and description", () => {
  assert.throws(() => projects.cleanProject({ name: "", description: "x" }), /obligatorii/);
  assert.throws(() => projects.cleanProject({ name: "x", description: "" }), /obligatorii/);
});

test("cleanProject normalizes technologies from a comma string", () => {
  const p = projects.cleanProject({ name: "n", description: "d", technologies: "a, b ,, c" });
  assert.deepEqual(p.technologies, ["a", "b", "c"]);
});

test("cleanProject clamps category to the allowed set", () => {
  assert.equal(projects.cleanProject({ name: "n", description: "d", category: "hacking" }).category, "web");
  assert.equal(projects.cleanProject({ name: "n", description: "d", category: "automation" }).category, "automation");
});

test("cleanProject keeps only valid links", () => {
  const p = projects.cleanProject({
    name: "n", description: "d",
    links: [{ label: "ok", url: "https://x" }, { label: "", url: "https://y" }, { label: "z", url: "" }]
  });
  assert.deepEqual(p.links, [{ label: "ok", url: "https://x" }]);
});

test("cleanProject accepts and sanitizes ro/ru translations", () => {
  const p = projects.cleanProject({
    name: "n", description: "d",
    translations: {
      ro: { name: "  Nume  ", description: "Descriere", details: "", bogus: "x" },
      ru: { name: "Имя" },
      de: { name: "ignored" }
    }
  });
  assert.deepEqual(p.translations.ro, { name: "Nume", description: "Descriere" });
  assert.deepEqual(p.translations.ru, { name: "Имя" });
  assert.equal(p.translations.de, undefined); // unsupported language dropped
});

test("cleanProject omits a language with no non-empty fields", () => {
  const p = projects.cleanProject({
    name: "n", description: "d",
    translations: { ro: { name: "   ", details: "" }, ru: {} }
  });
  assert.deepEqual(p.translations, {});
});

test("cleanProject omits translations key when input has none (edit must not wipe them)", () => {
  const p = projects.cleanProject({ name: "n", description: "d" });
  assert.equal("translations" in p, false);
  // Simulates the PUT merge: existing translations survive.
  const merged = { ...{ id: "x", translations: { ro: { name: "Nume" } } }, ...p };
  assert.deepEqual(merged.translations, { ro: { name: "Nume" } });
});

test("cleanProject includes translations key when explicitly provided (even empty)", () => {
  assert.deepEqual(projects.cleanProject({ name: "n", description: "d", translations: {} }).translations, {});
  assert.deepEqual(
    projects.cleanProject({ name: "n", description: "d", translations: { ro: { name: "N" } } }).translations,
    { ro: { name: "N" } }
  );
});

test("createId returns a 16-char hex id", () => {
  assert.match(projects.createId(), /^[0-9a-f]{16}$/);
});
