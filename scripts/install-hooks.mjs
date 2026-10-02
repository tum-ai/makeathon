import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!process.env.CI && existsSync("githooks") && existsSync(".git"))
  spawnSync("git", ["config", "core.hooksPath", "githooks"], { stdio: "inherit" });
