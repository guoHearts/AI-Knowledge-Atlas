import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// node:test's own "**/*.test.mts" glob resolution is unreliable across Node 20.x
// patch versions (nodejs/node#50658, #52191), so we enumerate files ourselves
// with fs.readdirSync's recursive option instead of trusting tsx --test's glob.
const frontendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const testDir = path.join(frontendRoot, "src", "test");

const files = readdirSync(testDir, { recursive: true })
  .filter((entry) => entry.endsWith(".test.mts"))
  .map((entry) => path.join(testDir, entry))
  .sort();

if (files.length === 0) {
  console.error(`No *.test.mts files found under ${testDir}`);
  process.exit(1);
}

const result = spawnSync("tsx", ["--test", ...files], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
