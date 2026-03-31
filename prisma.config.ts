import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv();
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "db/schema/schema.prisma",
  migrations: {
    path: "db/migrations",
    seed: "tsx db/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
