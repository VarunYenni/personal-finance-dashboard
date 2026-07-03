import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoData } from "./demoData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Account, Budget, Card, Category, FinanceSnapshot, Investment, Merchant, PaymentMethod, RecurringTransaction, Rule, Transaction, TransactionKind } from "../types/finance";

type DbAccount = {
  id: string;
  name: string;
  institution: string;
  type: Account["type"];
  opening_balance: string | number;
  current_balance: string | number;
  currency: string;
  status: Account["status"];
  notes: string | null;
};

type DbCard = {
  id: string;
  account_id: string;
  credit_limit: string | number;
  outstanding_amount: string | number;
  statement_date: number;
  due_date: string;
  annual_fee: string | number;
  joining_fee: string | number;
  reward_rate: string | number;
  reward_points: string | number;
  interest_rate: string | number;
  accounts?: { name: string; institution: string } | null;
};

type DbCategory = {
  id: string;
  name: string;
  type: Category["type"];
  icon: string;
  color: string;
  monthly_budget: string | number | null;
};

type DbTransaction = {
  id: string;
  date: string;
  merchant: string;
  description: string | null;
  amount: string | number;
  kind: TransactionKind;
  category_id: string;
  account_id: string;
  payment_method: PaymentMethod;
  card_id: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type DbBudget = {
  id: string;
  month: string;
  category_id: string;
  amount: string | number;
  alert_threshold: number;
};

type DbInvestment = {
  id: string;
  name: string;
  type: Investment["type"];
  investment_amount: string | number;
  current_value: string | number;
};

type DbRecurringTransaction = {
  id: string;
  name: string;
  merchant: string;
  amount: string | number;
  kind: TransactionKind;
  category_id: string;
  account_id: string;
  payment_method: PaymentMethod;
  frequency: RecurringTransaction["frequency"];
  next_run_date: string;
  active: boolean;
};

type DbMerchant = {
  id: string;
  name: string;
  default_category_id: string | null;
};

type DbRule = {
  id: string;
  field: Rule["field"];
  operator: Rule["operator"];
  value: string;
  category_id: string;
  payment_method: PaymentMethod | null;
};

export interface CreateTransactionInput {
  merchant: string;
  amount: number;
  kind: Exclude<TransactionKind, "transfer" | "card_payment">;
  categoryId: string;
  accountId: string;
  date: string;
  description?: string;
}

export interface CreateAccountInput {
  name: string;
  institution: string;
  type: Exclude<Account["type"], "credit_card">;
  openingBalance: number;
  currency: string;
}

export interface CreateCreditCardInput {
  name: string;
  institution: string;
  creditLimit: number;
  outstandingAmount: number;
  statementDate: number;
  dueDate: string;
  annualFee: number;
  rewardRate: number;
}

export interface CreateBudgetInput {
  month: string;
  categoryId: string;
  amount: number;
  alertThreshold: number;
}

export interface CreateRecurringInput {
  name: string;
  merchant: string;
  amount: number;
  kind: Exclude<TransactionKind, "transfer" | "card_payment">;
  categoryId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringTransaction["frequency"];
  nextRunDate: string;
}

export interface CreateCardPaymentInput {
  cardId: string;
  sourceAccountId: string;
  categoryId: string;
  amount: number;
  date: string;
}

export interface UpdateTransactionInput extends CreateTransactionInput {
  id: string;
}

export interface UpdateAccountInput {
  id: string;
  name: string;
  institution: string;
  currentBalance: number;
  status: Account["status"];
  notes?: string;
}

export interface UpdateCreditCardInput {
  id: string;
  accountId: string;
  name: string;
  institution: string;
  creditLimit: number;
  outstandingAmount: number;
  statementDate: number;
  dueDate: string;
  annualFee: number;
  rewardRate: number;
}

export interface UpsertInvestmentInput {
  id?: string;
  name: string;
  type: Investment["type"];
  investmentAmount: number;
  currentValue: number;
}

const defaultCategories = demoData.categories.map((category) => ({
  name: category.name,
  type: category.type,
  icon: category.icon,
  color: category.color,
  monthly_budget: category.monthlyBudget ?? null
}));

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

function mapAccount(row: DbAccount): Account {
  return {
    id: row.id,
    name: row.name,
    institution: row.institution,
    type: row.type,
    openingBalance: toNumber(row.opening_balance),
    currentBalance: toNumber(row.current_balance),
    currency: row.currency,
    status: row.status,
    notes: row.notes ?? undefined
  };
}

function mapCard(row: DbCard): Card {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.accounts?.name ?? "Credit card",
    institution: row.accounts?.institution ?? "Card issuer",
    creditLimit: toNumber(row.credit_limit),
    outstandingAmount: toNumber(row.outstanding_amount),
    statementDate: row.statement_date,
    dueDate: row.due_date,
    annualFee: toNumber(row.annual_fee),
    joiningFee: toNumber(row.joining_fee),
    rewardRate: toNumber(row.reward_rate),
    rewardPoints: toNumber(row.reward_points),
    interestRate: toNumber(row.interest_rate),
    paymentHistory: []
  };
}

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    monthlyBudget: row.monthly_budget === null ? undefined : toNumber(row.monthly_budget)
  };
}

function mapTransaction(row: DbTransaction): Transaction {
  return {
    id: row.id,
    date: row.date,
    merchant: row.merchant,
    description: row.description ?? "",
    amount: toNumber(row.amount),
    kind: row.kind,
    categoryId: row.category_id,
    accountId: row.account_id,
    paymentMethod: row.payment_method,
    creditCardId: row.card_id ?? undefined,
    tags: [],
    receiptUrl: row.receipt_url ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBudget(row: DbBudget): Budget {
  return {
    id: row.id,
    month: row.month,
    categoryId: row.category_id,
    amount: toNumber(row.amount),
    alertThreshold: row.alert_threshold
  };
}

function mapInvestment(row: DbInvestment): Investment {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    investmentAmount: toNumber(row.investment_amount),
    currentValue: toNumber(row.current_value)
  };
}

function mapRecurring(row: DbRecurringTransaction): RecurringTransaction {
  return {
    id: row.id,
    name: row.name,
    merchant: row.merchant,
    amount: toNumber(row.amount),
    kind: row.kind,
    categoryId: row.category_id,
    accountId: row.account_id,
    paymentMethod: row.payment_method,
    frequency: row.frequency,
    nextRunDate: row.next_run_date,
    active: row.active
  };
}

function mapMerchant(row: DbMerchant): Merchant {
  return {
    id: row.id,
    name: row.name,
    defaultCategoryId: row.default_category_id ?? undefined
  };
}

function mapRule(row: DbRule): Rule {
  return {
    id: row.id,
    field: row.field,
    operator: row.operator,
    value: row.value,
    categoryId: row.category_id,
    paymentMethod: row.payment_method ?? undefined
  };
}

async function requireUserId() {
  if (!supabase) throw new Error("Sign in is not available in this preview.");
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

async function seedDefaultCategories(userId: string) {
  if (!supabase) return;
  const { count, error } = await supabase.from("categories").select("id", { count: "exact", head: true });
  if (error) throw error;
  if (count && count > 0) return;

  const { error: insertError } = await supabase.from("categories").insert(defaultCategories.map((category) => ({ ...category, user_id: userId })));
  if (insertError) throw insertError;
}

async function getAccount(id: string) {
  if (!supabase) throw new Error("Sign in is not available in this preview.");
  const { data, error } = await supabase.from("accounts").select("id, type, current_balance").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function adjustAccountBalance(id: string, delta: number) {
  if (!supabase) throw new Error("Sign in is not available in this preview.");
  const account = await getAccount(id);
  const { error } = await supabase
    .from("accounts")
    .update({ current_balance: toNumber(account.current_balance) + delta, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

async function adjustCardOutstanding(id: string, delta: number) {
  if (!supabase) throw new Error("Sign in is not available in this preview.");
  const { data, error } = await supabase.from("cards").select("outstanding_amount").eq("id", id).single();
  if (error) throw error;
  const { error: updateError } = await supabase
    .from("cards")
    .update({ outstanding_amount: Math.max(0, toNumber(data.outstanding_amount) + delta) })
    .eq("id", id);
  if (updateError) throw updateError;
}

async function applyTransactionEffects(row: { account_id: string; card_id?: string | null; kind: TransactionKind; amount: string | number }, direction: 1 | -1) {
  const amount = toNumber(row.amount);
  const accountDelta = row.kind === "income" ? amount : row.kind === "card_payment" ? -amount : -amount;
  await adjustAccountBalance(row.account_id, accountDelta * direction);
  if (row.card_id && row.kind === "expense") await adjustCardOutstanding(row.card_id, amount * direction);
  if (row.card_id && row.kind === "card_payment") await adjustCardOutstanding(row.card_id, -amount * direction);
}

export function useFinanceSnapshot() {
  return useQuery({
    queryKey: ["finance-snapshot"],
    queryFn: async (): Promise<FinanceSnapshot> => {
      if (!isSupabaseConfigured || !supabase) return demoData;

      const userId = await requireUserId();
      await seedDefaultCategories(userId);

      const [accounts, cards, categories, transactions, budgets, investments, recurringTransactions, merchants, rules] = await Promise.all([
        supabase.from("accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("cards").select("*, accounts(name, institution)"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("transactions").select("*").order("date", { ascending: false }).limit(200),
        supabase.from("budgets").select("*"),
        supabase.from("investments").select("*"),
        supabase.from("recurring_transactions").select("*"),
        supabase.from("merchants").select("*"),
        supabase.from("rules").select("*")
      ]);

      const failed = [accounts, cards, categories, transactions, budgets, investments, recurringTransactions, merchants, rules].find((result) => result.error);
      if (failed?.error) throw failed.error;

      return {
        accounts: (accounts.data ?? []).map((row) => mapAccount(row as DbAccount)),
        cards: (cards.data ?? []).map((row) => mapCard(row as DbCard)),
        categories: (categories.data ?? []).map((row) => mapCategory(row as DbCategory)),
        transactions: (transactions.data ?? []).map((row) => mapTransaction(row as DbTransaction)),
        budgets: (budgets.data ?? []).map((row) => mapBudget(row as DbBudget)),
        investments: (investments.data ?? []).map((row) => mapInvestment(row as DbInvestment)),
        recurringTransactions: (recurringTransactions.data ?? []).map((row) => mapRecurring(row as DbRecurringTransaction)),
        merchants: (merchants.data ?? []).map((row) => mapMerchant(row as DbMerchant)),
        rules: (rules.data ?? []).map((row) => mapRule(row as DbRule))
      };
    },
    staleTime: 30_000
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      if (!isSupabaseConfigured || !supabase) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        return;
      }

      const userId = await requireUserId();
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, type, current_balance")
        .eq("id", input.accountId)
        .single();

      if (accountError) throw accountError;

      const accountType = account.type as Account["type"];
      if (accountType === "credit_card" && input.kind !== "expense") {
        throw new Error("Credit cards can only be used for expenses in Quick Add.");
      }

      const paymentMethod: PaymentMethod = accountType === "credit_card" ? "credit_card" : "bank_transfer";
      const cardQuery = accountType === "credit_card"
        ? await supabase.from("cards").select("id, outstanding_amount").eq("account_id", input.accountId).maybeSingle()
        : { data: null, error: null };

      if (cardQuery.error) throw cardQuery.error;
      if (accountType === "credit_card" && !cardQuery.data) {
        throw new Error("This credit card is missing card details. Add it from the Credit cards section.");
      }

      const { data: merchantRow, error: merchantError } = await supabase
        .from("merchants")
        .upsert({ user_id: userId, name: input.merchant }, { onConflict: "user_id,name" })
        .select("id")
        .single();

      if (merchantError) throw merchantError;

      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        account_id: input.accountId,
        category_id: input.categoryId,
        merchant_id: merchantRow.id,
        card_id: cardQuery.data?.id ?? null,
        date: input.date,
        merchant: input.merchant,
        description: input.description ?? input.merchant,
        amount: input.amount,
        kind: input.kind,
        payment_method: paymentMethod
      });

      if (transactionError) throw transactionError;

      const delta = input.kind === "income" ? input.amount : -input.amount;
      const { error: balanceError } = await supabase
        .from("accounts")
        .update({ current_balance: toNumber(account.current_balance) + delta, updated_at: new Date().toISOString() })
        .eq("id", input.accountId);

      if (balanceError) throw balanceError;

      if (cardQuery.data && input.kind === "expense") {
        const { error: cardError } = await supabase
          .from("cards")
          .update({ outstanding_amount: toNumber(cardQuery.data.outstanding_amount) + input.amount })
          .eq("id", cardQuery.data.id);

        if (cardError) throw cardError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();
      const { data: oldRow, error: oldError } = await supabase
        .from("transactions")
        .select("id, account_id, card_id, kind, amount")
        .eq("id", input.id)
        .single();
      if (oldError) throw oldError;

      await applyTransactionEffects(oldRow, -1);

      const account = await getAccount(input.accountId);
      const accountType = account.type as Account["type"];
      if (accountType === "credit_card" && input.kind !== "expense") {
        throw new Error("Credit cards can only be used for expenses.");
      }
      const cardQuery = accountType === "credit_card"
        ? await supabase.from("cards").select("id").eq("account_id", input.accountId).maybeSingle()
        : { data: null, error: null };
      if (cardQuery.error) throw cardQuery.error;

      const { data: merchantRow, error: merchantError } = await supabase
        .from("merchants")
        .upsert({ user_id: userId, name: input.merchant }, { onConflict: "user_id,name" })
        .select("id")
        .single();
      if (merchantError) throw merchantError;

      const nextRow = {
        account_id: input.accountId,
        category_id: input.categoryId,
        merchant_id: merchantRow.id,
        card_id: cardQuery.data?.id ?? null,
        date: input.date,
        merchant: input.merchant,
        description: input.description ?? input.merchant,
        amount: input.amount,
        kind: input.kind,
        payment_method: accountType === "credit_card" ? "credit_card" : "bank_transfer",
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from("transactions").update(nextRow).eq("id", input.id);
      if (error) throw error;
      await applyTransactionEffects({ account_id: nextRow.account_id, card_id: nextRow.card_id, kind: nextRow.kind, amount: nextRow.amount }, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAccountInput) => {
      if (!isSupabaseConfigured || !supabase) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        return;
      }

      const userId = await requireUserId();
      const { error } = await supabase.from("accounts").insert({
        user_id: userId,
        name: input.name,
        institution: input.institution,
        type: input.type,
        opening_balance: input.openingBalance,
        current_balance: input.openingBalance,
        currency: input.currency,
        status: "active"
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const { error } = await supabase.from("accounts").update({
        name: input.name,
        institution: input.institution,
        current_balance: input.currentBalance,
        status: input.status,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString()
      }).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCreditCardInput) => {
      if (!isSupabaseConfigured || !supabase) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        return;
      }

      const userId = await requireUserId();
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          name: input.name,
          institution: input.institution,
          type: "credit_card",
          opening_balance: -input.outstandingAmount,
          current_balance: -input.outstandingAmount,
          currency: "INR",
          status: "active"
        })
        .select("id")
        .single();

      if (accountError) throw accountError;

      const { error: cardError } = await supabase.from("cards").insert({
        user_id: userId,
        account_id: account.id,
        credit_limit: input.creditLimit,
        outstanding_amount: input.outstandingAmount,
        statement_date: input.statementDate,
        due_date: input.dueDate,
        annual_fee: input.annualFee,
        joining_fee: 0,
        reward_rate: input.rewardRate,
        reward_points: 0,
        interest_rate: 0
      });

      if (cardError) throw cardError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCreditCardInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const { error: accountError } = await supabase.from("accounts").update({
        name: input.name,
        institution: input.institution,
        current_balance: -input.outstandingAmount,
        updated_at: new Date().toISOString()
      }).eq("id", input.accountId);
      if (accountError) throw accountError;

      const { error } = await supabase.from("cards").update({
        credit_limit: input.creditLimit,
        outstanding_amount: input.outstandingAmount,
        statement_date: input.statementDate,
        due_date: input.dueDate,
        annual_fee: input.annualFee,
        reward_rate: input.rewardRate
      }).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useUpsertInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertInvestmentInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();
      const payload = {
        user_id: userId,
        name: input.name,
        type: input.type,
        investment_amount: input.investmentAmount,
        current_value: input.currentValue
      };
      const query = input.id
        ? supabase.from("investments").update(payload).eq("id", input.id)
        : supabase.from("investments").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useDeleteTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isSupabaseConfigured || !supabase || !ids.length) return;

      const { data: rows, error: fetchError } = await supabase
        .from("transactions")
        .select("id, account_id, card_id, kind, amount")
        .in("id", ids);

      if (fetchError) throw fetchError;

      for (const row of rows ?? []) {
        const amount = toNumber(row.amount);
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("current_balance")
          .eq("id", row.account_id)
          .single();

        if (accountError) throw accountError;

        const reversal = row.kind === "income" ? -amount : row.kind === "card_payment" ? amount : amount;
        const { error: balanceError } = await supabase
          .from("accounts")
          .update({ current_balance: toNumber(account.current_balance) + reversal, updated_at: new Date().toISOString() })
          .eq("id", row.account_id);

        if (balanceError) throw balanceError;

        if (row.card_id && row.kind === "expense") {
          const { data: card, error: cardFetchError } = await supabase
            .from("cards")
            .select("outstanding_amount")
            .eq("id", row.card_id)
            .single();

          if (cardFetchError) throw cardFetchError;

          const { error: cardError } = await supabase
            .from("cards")
            .update({ outstanding_amount: Math.max(0, toNumber(card.outstanding_amount) - amount) })
            .eq("id", row.card_id);

          if (cardError) throw cardError;
        }

        if (row.card_id && row.kind === "card_payment") {
          const { data: card, error: cardFetchError } = await supabase
            .from("cards")
            .select("outstanding_amount, account_id")
            .eq("id", row.card_id)
            .single();

          if (cardFetchError) throw cardFetchError;

          const { error: cardError } = await supabase
            .from("cards")
            .update({ outstanding_amount: toNumber(card.outstanding_amount) + amount })
            .eq("id", row.card_id);

          if (cardError) throw cardError;

          const { data: cardAccount, error: cardAccountError } = await supabase
            .from("accounts")
            .select("current_balance")
            .eq("id", card.account_id)
            .single();

          if (cardAccountError) throw cardAccountError;

          const { error: cardAccountUpdateError } = await supabase
            .from("accounts")
            .update({ current_balance: toNumber(cardAccount.current_balance) - amount, updated_at: new Date().toISOString() })
            .eq("id", card.account_id);

          if (cardAccountUpdateError) throw cardAccountUpdateError;
        }
      }

      const { error } = await supabase.from("transactions").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useDuplicateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();
      const { data: row, error } = await supabase
        .from("transactions")
        .select("account_id, category_id, merchant_id, card_id, merchant, description, amount, kind, payment_method, receipt_url, notes")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { error: insertError } = await supabase.from("transactions").insert({
        ...row,
        user_id: userId,
        date: new Date().toISOString().slice(0, 10),
        description: `${row.description ?? row.merchant} copy`
      });

      if (insertError) throw insertError;

      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("current_balance")
        .eq("id", row.account_id)
        .single();

      if (accountError) throw accountError;

      const amount = toNumber(row.amount);
      const delta = row.kind === "income" ? amount : -amount;
      const { error: balanceError } = await supabase
        .from("accounts")
        .update({ current_balance: toNumber(account.current_balance) + delta, updated_at: new Date().toISOString() })
        .eq("id", row.account_id);

      if (balanceError) throw balanceError;

      if (row.card_id && row.kind === "expense") {
        const { data: card, error: cardFetchError } = await supabase
          .from("cards")
          .select("outstanding_amount")
          .eq("id", row.card_id)
          .single();

        if (cardFetchError) throw cardFetchError;

        const { error: cardError } = await supabase
          .from("cards")
          .update({ outstanding_amount: toNumber(card.outstanding_amount) + amount })
          .eq("id", row.card_id);

        if (cardError) throw cardError;
      }

      if (row.card_id && row.kind === "card_payment") {
        const { data: card, error: cardFetchError } = await supabase
          .from("cards")
          .select("outstanding_amount, account_id")
          .eq("id", row.card_id)
          .single();

        if (cardFetchError) throw cardFetchError;

        const { error: cardError } = await supabase
          .from("cards")
          .update({ outstanding_amount: Math.max(0, toNumber(card.outstanding_amount) - amount) })
          .eq("id", row.card_id);

        if (cardError) throw cardError;

        const { data: cardAccount, error: cardAccountError } = await supabase
          .from("accounts")
          .select("current_balance")
          .eq("id", card.account_id)
          .single();

        if (cardAccountError) throw cardAccountError;

        const { error: cardAccountUpdateError } = await supabase
          .from("accounts")
          .update({ current_balance: toNumber(cardAccount.current_balance) + amount, updated_at: new Date().toISOString() })
          .eq("id", card.account_id);

        if (cardAccountUpdateError) throw cardAccountUpdateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();
      const { error } = await supabase.from("budgets").upsert({
        user_id: userId,
        month: input.month,
        category_id: input.categoryId,
        amount: input.amount,
        alert_threshold: input.alertThreshold
      }, { onConflict: "user_id,category_id,month" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecurringInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();
      const { error } = await supabase.from("recurring_transactions").insert({
        user_id: userId,
        name: input.name,
        merchant: input.merchant,
        amount: input.amount,
        kind: input.kind,
        category_id: input.categoryId,
        account_id: input.accountId,
        payment_method: input.paymentMethod,
        frequency: input.frequency,
        next_run_date: input.nextRunDate,
        active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}

export function useCreateCardPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCardPaymentInput) => {
      if (!isSupabaseConfigured || !supabase) return;
      const userId = await requireUserId();

      const { data: card, error: cardFetchError } = await supabase
        .from("cards")
        .select("id, account_id, outstanding_amount, accounts(name)")
        .eq("id", input.cardId)
        .single();
      if (cardFetchError) throw cardFetchError;

      const { data: source, error: sourceError } = await supabase
        .from("accounts")
        .select("current_balance")
        .eq("id", input.sourceAccountId)
        .single();
      if (sourceError) throw sourceError;

      const relatedAccount = Array.isArray(card.accounts) ? card.accounts[0] : card.accounts;
      const paymentAmount = Math.min(input.amount, toNumber(card.outstanding_amount));
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: userId,
        account_id: input.sourceAccountId,
        category_id: input.categoryId,
        card_id: input.cardId,
        date: input.date,
        merchant: "Credit card payment",
        description: `Payment toward ${relatedAccount?.name ?? "credit card"}`,
        amount: paymentAmount,
        kind: "card_payment",
        payment_method: "bank_transfer"
      });
      if (transactionError) throw transactionError;

      const { error: sourceBalanceError } = await supabase
        .from("accounts")
        .update({ current_balance: toNumber(source.current_balance) - paymentAmount, updated_at: new Date().toISOString() })
        .eq("id", input.sourceAccountId);
      if (sourceBalanceError) throw sourceBalanceError;

      const { error: cardError } = await supabase
        .from("cards")
        .update({ outstanding_amount: Math.max(0, toNumber(card.outstanding_amount) - paymentAmount) })
        .eq("id", input.cardId);
      if (cardError) throw cardError;

      const { data: cardAccount, error: cardAccountError } = await supabase
        .from("accounts")
        .select("current_balance")
        .eq("id", card.account_id)
        .single();
      if (cardAccountError) throw cardAccountError;

      const { error: cardAccountUpdateError } = await supabase
        .from("accounts")
        .update({ current_balance: toNumber(cardAccount.current_balance) + paymentAmount, updated_at: new Date().toISOString() })
        .eq("id", card.account_id);
      if (cardAccountUpdateError) throw cardAccountUpdateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
    }
  });
}
