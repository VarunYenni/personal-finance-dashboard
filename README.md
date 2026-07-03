# Ledgerly Personal Finance Dashboard

A production-oriented React 19 + TypeScript + Vite personal finance dashboard backed by Supabase. It includes a public SEO-ready marketing surface and an authenticated app shell for net worth, accounts, credit cards, transactions, budgets, recurring expenses, reports, investments, rules, and settings.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_SITE_URL=
```

Without Supabase keys, the app runs in demo mode with realistic finance data.

## Supabase

Run `supabase/schema.sql` in your Supabase SQL editor. It creates normalized tables, indexes, foreign keys, and row level security policies. Receipt upload is designed for Supabase Storage and the `receipts` table stores file metadata.

## Deploy

Deploy the repository to Vercel as a Vite app and configure the same environment variables. Public pages are indexable; `/app/*` is marked `noindex,nofollow`.
