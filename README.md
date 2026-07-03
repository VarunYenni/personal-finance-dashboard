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
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_SITE_URL=http://127.0.0.1:5173
```

In Supabase Authentication, enable **Email** with password-based signups/logins. If email confirmations are enabled, users must confirm their email before signing in.

Run `supabase/schema.sql` in the Supabase SQL editor to create the finance tables, indexes, and RLS policies.
