import { execSync } from "node:child_process";

const isVercel = Boolean(process.env.VERCEL);
const schema = isVercel ? "prisma/schema.postgres.prisma" : "prisma/schema.prisma";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

// Locally, Next will also load `.env.production.local` during `next build`,
// which can accidentally override sqlite `DATABASE_URL` with a postgres URL.
// OS env vars win, so enforce a sqlite URL for local builds.
if (!isVercel) {
  const current = process.env.DATABASE_URL || "";
  if (!current.startsWith("file:")) process.env.DATABASE_URL = "file:./dev.db";
}

run(`npx prisma generate --schema ${schema}`);

// In production, apply migrations safely. In dev, keep it lightweight.
if (isVercel) run(`npx prisma migrate deploy --schema ${schema}`);
else run(`npx prisma db push --skip-generate --schema ${schema}`);

run("next build");
