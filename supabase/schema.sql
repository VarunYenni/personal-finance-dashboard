create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text not null default 'INR',
  locale text not null default 'en-IN',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution text not null,
  type text not null check (type in ('checking','savings','cash','credit_card','investment')),
  opening_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  currency text not null default 'INR',
  status text not null default 'active' check (status in ('active','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense','transfer','investment')),
  icon text not null default 'Circle',
  color text not null default '#60a5fa',
  monthly_budget numeric(14,2),
  created_at timestamptz not null default now()
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  default_category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  credit_limit numeric(14,2) not null default 0,
  outstanding_amount numeric(14,2) not null default 0,
  statement_date int not null check (statement_date between 1 and 31),
  due_date date not null,
  annual_fee numeric(14,2) not null default 0,
  joining_fee numeric(14,2) not null default 0,
  reward_rate numeric(6,2) not null default 0,
  reward_points numeric(14,2) not null default 0,
  interest_rate numeric(6,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id),
  category_id uuid not null references public.categories(id),
  merchant_id uuid references public.merchants(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  date date not null,
  merchant text not null,
  description text,
  amount numeric(14,2) not null check (amount > 0),
  kind text not null check (kind in ('income','expense','transfer','card_payment','investment')),
  payment_method text not null check (payment_method in ('upi','cash','bank_transfer','debit_card','credit_card','cheque','wallet')),
  receipt_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month text not null,
  amount numeric(14,2) not null,
  alert_threshold int not null default 80,
  unique (user_id, category_id, month)
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  investment_amount numeric(14,2) not null default 0,
  current_value numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  merchant text not null,
  amount numeric(14,2) not null,
  kind text not null,
  category_id uuid not null references public.categories(id),
  account_id uuid not null references public.accounts(id),
  payment_method text not null,
  frequency text not null check (frequency in ('weekly','monthly','quarterly','yearly')),
  next_run_date date not null,
  active boolean not null default true
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'INR',
  locale text not null default 'en-IN',
  theme text not null default 'dark',
  updated_at timestamptz not null default now()
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  field text not null check (field in ('merchant','description')),
  operator text not null check (operator in ('contains','starts_with','equals')),
  value text not null,
  category_id uuid not null references public.categories(id),
  payment_method text
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table if not exists public.transaction_tags (
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);

create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_user_kind on public.transactions(user_id, kind);
create index if not exists idx_transactions_account on public.transactions(account_id);
create index if not exists idx_transactions_category on public.transactions(category_id);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month);
create index if not exists idx_merchants_user_name on public.merchants(user_id, name);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.merchants enable row level security;
alter table public.investments enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.receipts enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.settings enable row level security;
alter table public.rules enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "accounts own rows" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards own rows" on public.cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions own rows" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories own rows" on public.categories for all using (auth.uid() = user_id or user_id is null) with check (auth.uid() = user_id);
create policy "budgets own rows" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "merchants own rows" on public.merchants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "investments own rows" on public.investments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recurring own rows" on public.recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "receipts own rows" on public.receipts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports own rows" on public.monthly_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings own rows" on public.settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rules own rows" on public.rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tags own rows" on public.tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transaction tags through owned txns" on public.transaction_tags
  for all using (exists (select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid()));
