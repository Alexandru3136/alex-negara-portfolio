"use strict";

// Project input validation/normalization.

const crypto = require("crypto");

const TRANSLATABLE_FIELDS = ["name", "description", "details", "challenge", "outcome"];
const SUPPORTED_TRANSLATION_LANGS = ["ro", "ru"];

function createId() {
  return crypto.randomBytes(8).toString("hex");
}

// Keep only supported languages and translatable string fields, dropping empty
// values. A language with no non-empty field is omitted entirely, so the public
// site cleanly falls back to the base (English) content.
function cleanTranslations(input) {
  const source = input && typeof input === "object" ? input : {};
  const result = {};
  for (const lang of SUPPORTED_TRANSLATION_LANGS) {
    const langInput = source[lang];
    if (!langInput || typeof langInput !== "object") continue;
    const cleaned = {};
    for (const field of TRANSLATABLE_FIELDS) {
      const value = String(langInput[field] || "").trim();
      if (value) cleaned[field] = value;
    }
    if (Object.keys(cleaned).length) result[lang] = cleaned;
  }
  return result;
}

function cleanProject(input) {
  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  const details = String(input.details || "").trim();
  const challenge = String(input.challenge || "").trim();
  const outcome = String(input.outcome || "").trim();
  const mediaUrl = String(input.mediaUrl || "").trim();
  const mediaType = String(input.mediaType || "image").trim() === "video" ? "video" : "image";
  const allowedCategories = new Set(["automation", "web"]);
  const category = allowedCategories.has(String(input.category || "").trim())
    ? String(input.category).trim()
    : "web";
  const technologies = Array.isArray(input.technologies)
    ? input.technologies.map((item) => String(item).trim()).filter(Boolean)
    : String(input.technologies || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const links = Array.isArray(input.links)
    ? input.links
        .map((link) => ({
          label: String(link.label || "").trim(),
          url: String(link.url || "").trim()
        }))
        .filter((link) => link.label && link.url)
    : [];

  if (!name || !description) {
    const error = new Error("Numele si descrierea sunt obligatorii.");
    error.statusCode = 400;
    throw error;
  }

  const project = {
    name,
    description,
    details,
    challenge,
    outcome,
    mediaUrl,
    mediaType,
    category,
    technologies,
    links
  };

  // Only touch translations when the caller actually sent them. This keeps an
  // edit (PUT) that omits the field from wiping a project's existing ro/ru
  // translations; sending `translations` (even {}) explicitly replaces them.
  if (input.translations && typeof input.translations === "object") {
    project.translations = cleanTranslations(input.translations);
  }

  return project;
}

module.exports = { createId, cleanProject, cleanTranslations, TRANSLATABLE_FIELDS, SUPPORTED_TRANSLATION_LANGS };
