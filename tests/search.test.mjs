import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// search.js is a browser script that sets window.TT; run it in a sandbox.
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL("../src/assets/js/search.js", import.meta.url), "utf8"), context);
const { matches } = context.window.TT;

test("should find a tool described with the plural when the singular is typed", () => {
  assert.equal(matches("The best Tibetan dictionaries in one place", "dictionary"), true);
});

test("should find a tool described with the singular when the plural is typed", () => {
  assert.equal(matches("A Tibetan keyboard for Windows", "keyboards"), true);
});

test("should ignore accents and case", () => {
  assert.equal(matches("Élie Roux's bophono", "elie"), true);
});

test("should require every word typed", () => {
  assert.equal(matches("Tibetan fonts", "fonts ocr"), false);
});
