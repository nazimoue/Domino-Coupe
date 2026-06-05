ydek fih 

Darolah 6 f 7

## Prisma migrations – multiple providers (SQLite & Supabase)

The project can run with **SQLite** (local development) **or** with **Supabase** (PostgreSQL) in production. The same `prisma/schema.prisma` file is used for both.

### Environment variables
```dotenv
# Choose the provider (sqlite | postgresql)
PRISMA_PROVIDER=sqlite   # for local dev
# PRISMA_PROVIDER=postgresql   # uncomment for Supabase

# SQLite DB (local) – only needed when PRISMA_PROVIDER=sqlite
DATABASE_URL="file:./prisma/dev.db"

# Supabase connection string – set when PRISMA_PROVIDER=postgresql
# DATABASE_URL="postgresql://<user>:<password>@<host>.supabase.co:5432/<db>?sslmode=require"
```

### npm scripts (run via `npm run <script>`)
| Script | Description |
|-------|-------------|
| `prisma:generate` | Regenerate the Prisma client (`npx prisma generate`). |
| `prisma:sqlite:migrate` | Create & apply a migration for the **SQLite** dev DB. Uses folder `prisma/migrations_sqlite`. |
| `prisma:sqlite:reset` | Drop and recreate the SQLite dev DB (data will be lost). |
| `prisma:supabase:migrate` | Create & apply a migration for **Supabase** (PostgreSQL). Uses folder `prisma/migrations_postgres`. |
| `prisma:supabase:deploy` | Deploy pending migrations to Supabase (no dev‑only prompts). |
| `prisma:supabase:reset` | Reset the Supabase DB (destructive – use with caution). |

#### Typical workflow
```bash
# Local development (SQLite)
npm run prisma:sqlite:migrate   # first time – creates the init migration
npm run prisma:generate        # regenerate client
npm run dev                     # start Next.js dev server
```
```bash
# Deploy to Supabase (production)
# Ensure PRISMA_PROVIDER=postgresql and DATABASE_URL points to Supabase
npm run prisma:supabase:migrate  # generate/apply migration
npm run prisma:generate          # regenerate client for Postgres
# Then run your build / deployment steps
```

### Why separate migration folders?
SQLite and PostgreSQL generate slightly different SQL (e.g., `AUTOINCREMENT` vs `SERIAL`, `PRAGMA` statements, timestamp defaults). Keeping them in distinct directories prevents Prisma from trying to re‑apply a migration that was generated for the other provider.

---

*Feel free to adjust the scripts or env variables to match your CI/CD pipeline.*