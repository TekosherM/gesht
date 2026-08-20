#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const r = spawnSync(
  "npx",
  [
    "--yes",
    "tsx",
    "-e",
    `import { writeFileSync } from "node:fs";
     import { runAllScenarios } from "./src/lib/travel/scenarios.ts";
     const report = runAllScenarios();
     writeFileSync("/tmp/gesht-scenario-report.json", JSON.stringify(report));
     console.log(JSON.stringify({
       total: report.total,
       passed: report.passed,
       failed: report.failed,
       byFamily: report.byFamily,
       sampleFailures: report.failures.slice(0, 30),
     }, null, 2));
     if (report.total !== 1000) process.exit(1);
     if (report.failed > 0) process.exit(2);`,
  ],
  { cwd: "/workspace", stdio: "inherit", encoding: "utf8" },
);
process.exit(r.status ?? 1);
