import { existsSync } from "node:fs";
import process from "node:process";

for (const path of [".env", ".env.local"]) {
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}
