import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations need a direct (non -pooler) connection: PgBouncer transaction mode breaks session state.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
