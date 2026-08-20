#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const r = spawnSync(
  "npx",
  [
    "--yes",
    "tsx",
    "-e",
    `import { runImprovementAudit } from "./src/lib/travel/improvements.ts";
     const report = runImprovementAudit();
     console.log(JSON.stringify(report, null, 2));
     if (report.total !== 3000) process.exit(1);
     if (report.open > 200) process.exit(2);`,
  ],
  { cwd: "/workspace", stdio: "inherit" },
);
process.exit(r.status ?? 1);
