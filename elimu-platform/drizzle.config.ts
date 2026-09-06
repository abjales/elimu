import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';

// Next.js reads .env.local at app runtime, but the drizzle-kit CLI is a
// separate process and only auto-loads .env. Load .env.local explicitly so
// `pnpm db:migrate` / `db:push` / `db:studio` resolve DATABASE_URL without
// needing it exported in the shell. dotenv does not override vars already
// present in the environment, so an exported DATABASE_URL still wins.
loadEnv({ path: '.env.local' });
loadEnv();

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
