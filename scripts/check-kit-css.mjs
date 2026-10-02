// Post-build sentinel: the ui-kit registers its compiled JavaScript as a
// Tailwind source (`@source "../**/*.js"` in its tailwind.css). If a bundler
// stops resolving that path, kit components render unstyled while our own
// classes still work. These selectors only exist in kit components, so their
// absence from the built CSS means the kit's sources were not scanned.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SENTINELS = [
  // Header: the floating pill's offset from the top edge.
  ".top-2\\.5",
  // Header: the same offset from md up.
  "md\\:top-3",
];

function cssFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...cssFiles(path));
    else if (name.endsWith(".css")) out.push(path);
  }
  return out;
}

const files = cssFiles(".next/static");
const css = files.map((file) => readFileSync(file, "utf8")).join("\n");
const missing = SENTINELS.filter((selector) => !css.includes(selector));

if (files.length === 0 || missing.length > 0) {
  console.error(
    `Kit CSS sentinel failed: ${files.length} CSS files, missing ${missing.join(", ") || "all"}.`,
  );
  console.error("Check that @tum.ai/ui-kit/tailwind.css is imported and its @source resolves.");
  process.exit(1);
}
console.log(`Kit CSS sentinel passed (${SENTINELS.length} selectors in ${files.length} files).`);
