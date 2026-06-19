# Ops Board

Internal task marketplace for the company. Built with Next.js, Prisma (PostgreSQL), and Google Workspace SSO.

## How it works

- **Boards** are root/main tasks. Only the owner (set via `OWNER_EMAIL`) can create them.
- Anyone can claim an open `Todo` task ("assign to me"), splitting it into subtasks while keeping
  some credits for themselves, as long as the subtask credits never exceed what's left unclaimed
  on the parent.
- Whoever **creates** a task is responsible for reviewing it: `In Review` → `Done` (approve) or
  back to `Todo`, unassigned (reject).
- All task credits, lineage, and the leaderboard are visible to everyone.
- The owner can fully delete a board, which cascades and removes every task (and credits) derived
  from it.

## Local setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string. For local dev, run a Postgres container:
     ```bash
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
     ```
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

## Deploying on Railway

1. **Create the project.** In Railway, create a new project from this GitHub repo.
2. **Add a Postgres plugin.** In the same project, click "New" → "Database" → "Add PostgreSQL".
3. **Configure environment variables** on the app service (not the Postgres plugin):
   - `DATABASE_URL` — reference the plugin's connection string: `${{Postgres.DATABASE_URL}}`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — same OAuth client as local dev, or a separate
     production client.
   - `AUTH_SECRET` — generate a fresh one for production (`openssl rand -base64 32`), don't reuse
     your local dev secret.
   - `ALLOWED_EMAIL_DOMAIN` — your company's email domain.
   - `OWNER_EMAIL` — your email.
4. **Update the Google OAuth client** with the production redirect URI: once Railway gives you a
   domain (e.g. `https://your-app.up.railway.app`), add
   `https://your-app.up.railway.app/api/auth/callback/google` to the OAuth client's authorized
   redirect URIs in the Google Cloud Console (in addition to the localhost one, if you still need
   local dev access).
5. **Deploy.** Railway will run `npm install` (which triggers `postinstall: prisma generate`), then
   `npm run build`, then `npm start` — the start command runs `prisma migrate deploy` before
   booting the server, so the production database schema stays in sync automatically on every
   deploy.
6. **(Optional) Custom domain.** Under the service's "Settings" → "Networking", add a custom
   domain and update the OAuth redirect URI again to match.

Once deployed, share the Railway domain with your coworkers — anyone with an email on the allowed
domain can sign in with Google and start using the board.

## Notes

- Credits are tracked as a ledger only; this app does not move money. Use the leaderboard /
  per-board totals to calculate payouts manually.
- Credits are derived (not stored) from the task tree, so deleting a board automatically removes
  its credits from the leaderboard.
