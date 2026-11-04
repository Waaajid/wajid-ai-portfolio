import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../_site",
);
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const location = path.join(dir, entry.name);
    files.push(...(entry.isDirectory() ? await walk(location) : [location]));
  }
  return files;
}
const files = await walk(root),
  html = files.filter((f) => f.endsWith(".html"));
assert.equal(
  html.length,
  10,
  "Expected homepage, four destinations, four case studies and 404",
);
for (const file of html) {
  const source = await readFile(file, "utf8");
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${file}`);
  assert.equal((source.match(/<h1[ >]/g) || []).length, 1, `One h1: ${file}`);
  assert(source.includes("https://wajids.co.uk/"), "Canonical domain");
  assert(!/Sidekick|Conducttr|ChatGPT/i.test(source), "Restricted content");
  assert(
    source.includes('rel="describedby" href="/llms.txt"'),
    "Agent discovery link",
  );
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (url.startsWith("#")) {
      assert(ids.includes(url.slice(1)), `Missing anchor ${url}`);
      continue;
    }
    if (!url.startsWith("/")) continue;
    const target = path.join(
      root,
      url.endsWith("/") ? `${url}index.html` : url,
    );
    assert((await stat(target)).isFile(), `Missing file ${url}`);
  }
}
const agentFiles = files.filter(
  (file) => file.endsWith(".md") || /\/llms(?:-full)?\.txt$/.test(file),
);
assert.equal(
  agentFiles.length,
  11,
  "Nine page Markdown files and two agent entry points",
);
for (const file of agentFiles) {
  const source = await readFile(file, "utf8");
  assert(source.startsWith("# "), `Markdown title: ${file}`);
  assert(
    !/<\/?(?:html|main|script|div|section)\b/i.test(source),
    `HTML leaked into agent text: ${file}`,
  );
  assert(
    !/Sidekick|Conducttr|ChatGPT/i.test(source),
    `Restricted agent content: ${file}`,
  );
  for (const match of source.matchAll(
    /\]\((https:\/\/wajids\.co\.uk[^)\s]*)\)/g,
  )) {
    const url = new URL(match[1]);
    const target = path.join(
      root,
      url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname,
    );
    assert(
      (await stat(target)).isFile(),
      `Missing agent reference ${url.pathname}`,
    );
  }
}
const fullProfile = await readFile(path.join(root, "llms-full.txt"), "utf8");
for (const term of [
  "AI Product Manager",
  "London",
  "wajithkhan05@gmail.com",
  "AI Red Team Tool",
  "Monster Manor",
  "Team Quiz Game",
  "Luma API Playground",
  "unverified",
]) {
  assert(fullProfile.includes(term), `Missing profile detail: ${term}`);
}
assert.equal(
  (await readFile(path.join(root, "CNAME"), "utf8")).trim(),
  "wajids.co.uk",
);
assert(
  files.every(
    (f) =>
      !f.includes("node_modules") &&
      !f.includes(".env") &&
      !f.includes(".git/"),
  ),
  "Artifact contains source or secrets",
);
console.log(
  `PASS: ${html.length} HTML pages, ${agentFiles.length} agent-readable files, links/assets, anchors, content restrictions and domain packaging`,
);
