import type { Account, Budget, Card, Category, Investment, Transaction } from "../types/finance";

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function getCategory(categories: Category[], id: string) {
  return categories.find((category) => category.id === id);
}

export function signedAmount(transaction: Transaction) {
  if (transaction.kind === "income") return transaction.amount;
  if (transaction.kind === "expense" || transaction.kind === "investment") return -transaction.amount;
  return 0;
}

export function monthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter((transaction) => transaction.date.startsWith(month));
}

export function income(transactions: Transaction[]) {
  return sum(transactions.filter((item) => item.kind === "income").map((item) => item.amount));
}

export function expenses(transactions: Transaction[]) {
  return sum(transactions.filter((item) => item.kind === "expense").map((item) => item.amount));
}

export function savings(transactions: Transaction[]) {
  return income(transactions) - expenses(transactions);
}

export function savingsRate(transactions: Transaction[]) {
  const earned = income(transactions);
  return earned === 0 ? 0 : (savings(transactions) / earned) * 100;
}

export function bankBalance(accounts: Account[]) {
  return sum(accounts.filter((account) => account.type !== "credit_card").map((account) => account.currentBalance));
}

export function outstanding(cards: Card[]) {
  return sum(cards.map((card) => card.outstandingAmount));
}

export function netWorth(accounts: Account[], cards: Card[], investments: Investment[]) {
  return bankBalance(accounts) + sum(investments.map((item) => item.currentValue)) - outstanding(cards);
}

export function groupExpensesByCategory(transactions: Transaction[], categories: Category[]) {
  const grouped = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.kind === "expense")
    .forEach((transaction) => grouped.set(transaction.categoryId, (grouped.get(transaction.categoryId) ?? 0) + transaction.amount));

  return Array.from(grouped.entries())
    .map(([categoryId, value]) => ({
      name: getCategory(categories, categoryId)?.name ?? "Uncategorized",
      value,
      color: getCategory(categories, categoryId)?.color ?? "#8b949e"
    }))
    .sort((a, b) => b.value - a.value);
}

export function groupByMerchant(transactions: Transaction[]) {
  const grouped = new Map<string, { spend: number; count: number }>();
  transactions
    .filter((transaction) => transaction.kind === "expense")
    .forEach((transaction) => {
      const current = grouped.get(transaction.merchant) ?? { spend: 0, count: 0 };
      grouped.set(transaction.merchant, { spend: current.spend + transaction.amount, count: current.count + 1 });
    });

  return Array.from(grouped.entries())
    .map(([merchant, value]) => ({ merchant, ...value, average: value.spend / value.count }))
    .sort((a, b) => b.spend - a.spend);
}

export function monthlyCashFlow(transactions: Transaction[]) {
  const grouped = new Map<string, { income: number; expenses: number; savings: number }>();
  transactions.forEach((transaction) => {
    const key = transaction.date.slice(0, 7);
    const current = grouped.get(key) ?? { income: 0, expenses: 0, savings: 0 };
    if (transaction.kind === "income") current.income += transaction.amount;
    if (transaction.kind === "expense") current.expenses += transaction.amount;
    current.savings = current.income - current.expenses;
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([month, values]) => ({ month, ...values }));
}

export function budgetProgress(budgets: Budget[], transactions: Transaction[], categories: Category[]) {
  return budgets.map((budget) => {
    const spent = sum(
      transactions
        .filter((transaction) => transaction.categoryId === budget.categoryId && transaction.kind === "expense" && transaction.date.startsWith(budget.month))
        .map((transaction) => transaction.amount)
    );
    return {
      ...budget,
      category: getCategory(categories, budget.categoryId)?.name ?? "Unknown",
      spent,
      remaining: budget.amount - spent,
      progress: budget.amount === 0 ? 0 : Math.min(100, (spent / budget.amount) * 100)
    };
  });
}

export function mostUsedCard(transactions: Transaction[], cards: Card[]) {
  const counts = new Map<string, number>();
  transactions
    .filter((transaction) => transaction.creditCardId)
    .forEach((transaction) => counts.set(transaction.creditCardId!, (counts.get(transaction.creditCardId!) ?? 0) + 1));
  const [cardId] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];
  return cards.find((card) => card.id === cardId);
}
