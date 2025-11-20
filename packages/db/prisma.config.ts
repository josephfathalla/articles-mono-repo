import path from "node:path";
// import dotenv from "dotenv";
import "dotenv/config";
// import type { PrismaConfig } from "prisma";

// dotenv.config({
//   path: "../../apps/server/.env",
// });

// export default {
//   schema: path.join("prisma", "schema"),
//   migrations: {
//     path: path.join("prisma", "migrations"),
//   },
// } satisfies PrismaConfig;

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
