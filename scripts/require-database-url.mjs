import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is required. Copy .env.example to .env.local and provide a Neon connection string.",
  );
  process.exit(1);
}
