// Tiny link checker for the built site: every internal href/src (site served at the domain root)
// must resolve to a file in _site, and every #fragment must exist as an id in the target page.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "_site";
const PREFIX = "/";
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    statSync(path).isDirectory() ? walk(path) : files.push(path);
  }
})(ROOT);

const pages = files.filter((f) => extname(f) === ".html");
const ids = new Map(
  pages.map((f) => [f, new Set([...readFileSync(f, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]),
);
const problems = [];

function resolve(target) {
  const local = join(ROOT, target.slice(PREFIX.length));
  if (existsSync(local) && statSync(local).isFile()) return local;
  const index = join(local, "index.html");
  return existsSync(index) ? index : null;
}

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(https?:|mailto:|data:|\/\/)/.test(value)) continue;
    if (value.startsWith("/") && !value.startsWith(PREFIX)) {
      problems.push(`${file}: ${attr}="${value}" is missing the ${PREFIX} prefix`);
      continue;
    }
    let [path, fragment] = value.split("#");
    path = path.split("?")[0];
    const targetFile = path === "" ? file : resolve(path);
    if (!targetFile) {
      problems.push(`${file}: ${attr}="${value}" does not exist`);
      continue;
    }
    if (fragment && extname(targetFile) === ".html" && !ids.get(targetFile)?.has(fragment)) {
      problems.push(`${file}: ${attr}="${value}" has no #${fragment} in the target`);
    }
  }
}

console.log(`Checked ${pages.length} pages.`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("No broken internal links.");
