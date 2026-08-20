import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("exactly 1000 Gesht scenarios pass", () => {
  const r = spawnSync(
    "npx",
    [
      "--yes",
      "tsx",
      "-e",
      `import { generateScenarios, runAllScenarios } from "./src/lib/travel/scenarios.ts";
       const scenarios = generateScenarios();
       if (scenarios.length !== 1000) {
         console.error("count", scenarios.length);
         process.exit(1);
       }
       const report = runAllScenarios();
       if (report.failed) {
         console.error(JSON.stringify(report.failures.slice(0, 15), null, 2));
         process.exit(2);
       }
       console.log(JSON.stringify({ total: report.total, passed: report.passed }));`,
    ],
    { cwd: "/workspace", encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
