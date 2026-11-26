# Dakhina City — Payment & Expense Tracker (Cloudflare Pages + D1)

Free hosting: Cloudflare Pages (free plan) + Cloudflare D1 (free plan).
Live URL after deploy: `https://dakhina-city.pages.dev` (or the name you choose).

## What is in this folder

- `index.html` — the full app (single file, Tailwind via CDN)
- `functions/api/data.js` — Pages Function for `GET /api/data`, `GET /api/data?verify=1`, `POST /api/data`
- `schema.sql` — D1 table `app_state (id, payload, updated_at)`
- `wrangler.toml` — Pages project + D1 binding (`env.DB`)

## How the DB works

- Public visitors: read-only, `GET /api/data` returns the whole ledger JSON.
- Admin: login with `ADMIN_PIN`, every edit auto-saves with `POST /api/data` + `X-Admin-Pin` header.
- First deploy: D1 is empty, the app shows "D1 Connected (Not Initialized)".
  Admin logs in, clicks **Initialize Cloud DB** — that uploads the seed data
  (Installments #20–#43 completed, #44 Dec 2026 upcoming).
- Default PIN in the code is `1234` if `ADMIN_PIN` is not set. **Change it before sharing the link.**

## Deploy with Wrangler (needs a Cloudflare login once)

```bash
cd dakhina-city
npx wrangler login
npx wrangler d1 create dakhina-city-db
# copy the database_id from the output into wrangler.toml
npx wrangler d1 execute dakhina-city-db --remote --file=./schema.sql
npx wrangler pages deploy . --project-name=dakhina-city
```

Then in Cloudflare Dashboard → Workers & Pages → dakhina-city → Settings → Variables:
- Add variable `ADMIN_PIN` = your chosen PIN (e.g. a 6-digit PIN only the admin knows)
- Bindings → D1 Database → variable `DB` → database `dakhina-city-db`
- Redeploy after adding the variable/binding.

## Deploy from the Dashboard (no terminal)

1. Dashboard → Workers & Pages → Create → Pages → Upload assets → upload this folder (or connect the GitHub repo).
2. Workers & Pages → D1 → Create database `dakhina-city-db` → Console → run `schema.sql`.
3. Pages project → Settings → Functions → D1 bindings: variable `DB` → `dakhina-city-db`.
4. Settings → Variables: `ADMIN_PIN` = your PIN.
5. Deployments → Redeploy. Open `https://dakhina-city.pages.dev`.

## Local test

```bash
npx wrangler pages dev . --d1 DB=dakhina-city-db
# then: curl http://localhost:8788/api/data  -> {"empty":true}
```
