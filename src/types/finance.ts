export type AccountType = "checking" | "savings" | "cash" | "credit_card" | "investment";
export type AccountStatus = "active" | "archived";
export type CategoryType = "income" | "expense" | "transfer" | "investment";
export type PaymentMethod = "upi" | "cash" | "bank_transfer" | "debit_card" | "credit_card" | "cheque" | "wallet";
export type TransactionKind = "income" | "expense" | "transfer" | "card_payment" | "investment";
export type RecurringFrequency = "weekly" | "monthly" | "quarterly" | "yearly";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: AccountStatus;
  notes?: string;
}

export interface Card {
  id: string;
  accountId: string;
  name: string;
  institution: string;
  creditLimit: number;
  outstandingAmount: number;
  statementDate: number;
  dueDate: string;
  annualFee: number;
  joiningFee: number;
  rewardRate: number;
  rewardPoints: number;
  interestRate: number;
  paymentHistory: CardPayment[];
}

export interface CardPayment {
  id: string;
  date: string;
  amount: number;
  sourceAccountId: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  monthlyBudget?: number;
}

export interface Merchant {
  id: string;
  name: string;
  defaultCategoryId?: string;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  kind: TransactionKind;
  categoryId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string;
  tags: string[];
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: string;
  categoryId: string;
  amount: number;
  alertThreshold: number;
}

export interface Investment {
  id: string;
  name: string;
  type: "stocks" | "mutual_funds" | "gold" | "ppf" | "nps" | "fd" | "espp" | "crypto";
  investmentAmount: number;
  currentValue: number;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  merchant: string;
  amount: number;
  kind: TransactionKind;
  categoryId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  frequency: RecurringFrequency;
  nextRunDate: string;
  active: boolean;
}

export interface Rule {
  id: string;
  field: "merchant" | "description";
  operator: "contains" | "starts_with" | "equals";
  value: string;
  categoryId: string;
  paymentMethod?: PaymentMethod;
}

export interface FinanceSnapshot {
  accounts: Account[];
  cards: Card[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  investments: Investment[];
  recurringTransactions: RecurringTransaction[];
  merchants: Merchant[];
  rules: Rule[];
}
