# G7 Provider Steel Works

Ultra-modern marketing site + secure admin dashboard built with Next.js App Router, Prisma, and SQLite.

## Default Admin Credentials
- Admin: `admin@g7provider.local` / `Admin123!`
- Staff: `staff@g7provider.local` / `Staff123!`

Please change these passwords after first login.

## Environment
Copy `.env.example` to `.env` and update values as needed.

Required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Optional (email notifications):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_NOTIFY_EMAIL`

Optional (analytics):
- `NEXT_PUBLIC_GA_ID`

## Run Instructions
1. `npm install`
2. `npx prisma migrate dev`
3. `npx prisma db seed`
4. `npm run dev`

## Notes
- Admin routes are under `/admin` and protected by NextAuth middleware.
- The contact form includes honeypot and throttling protection.
- File uploads are stored in `public/uploads` for local development.
- Audit and analytics events are stored in DB (`AuditLog`, `AnalyticsEvent`).

## Vercel Deployment (Recommended)
1. Use a managed Postgres DB (Neon/Supabase/Vercel Postgres).
2. Set Vercel env vars:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (32+ chars)
- `NEXTAUTH_URL` (your production domain)
- Optional: `SMTP_*`, `ADMIN_NOTIFY_EMAIL`, `NEXT_PUBLIC_GA_ID`
3. Use Postgres Prisma schema for production commands:
- `npm run prisma:generate:postgres`
- `npm run prisma:migrate:deploy:postgres`
4. Build and deploy:
- `npm run build`
