# Ops Board

Internal task marketplace for the company. Built with Next.js, Prisma (SQLite), and Google Workspace SSO.

## How it works

- **Boards** are root/main tasks. Only the owner (set via `OWNER_EMAIL`) can create them.
- Anyone can claim an open `Todo` task ("assign to me"), splitting it into subtasks while keeping
  some credits for themselves, as long as the subtask credits never exceed what's left unclaimed
  on the parent.
- Whoever **creates** a task is responsible for reviewing it: `In Review` → `Done` (approve) or
  back to `Todo`, unassigned (reject).
- All task credits, lineage, and the leaderboard are visible to everyone.

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — OAuth client from the
     [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add
     `http://localhost:3000/api/auth/callback/google` (and your prod URL) as an authorized redirect URI.
   - `AUTH_SECRET` — any random string, e.g. `openssl rand -base64 32`.
   - `ALLOWED_EMAIL_DOMAIN` — your company's email domain (e.g. `acme.com`) to restrict sign-in.
   - `OWNER_EMAIL` — your email. The first time you sign in with this address you become the owner.
2. Install dependencies and set up the database:

   ```bash
   npm install
   npx prisma migrate deploy
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Notes for production

- Swap the SQLite datasource for Postgres (e.g. Neon/Supabase) when deploying — change the
  `datasource` provider in `prisma/schema.prisma` to `postgresql` and update `DATABASE_URL`.
- Credits are tracked as a ledger only; this app does not move money. Use the leaderboard /
  per-board totals to calculate payouts manually.
