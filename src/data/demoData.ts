import type { FinanceSnapshot } from "../types/finance";

const now = new Date().toISOString();

export const demoData: FinanceSnapshot = {
  accounts: [
    { id: "acc-icici", name: "ICICI Salary", institution: "ICICI Bank", type: "checking", openingBalance: 200000, currentBalance: 428000, currency: "INR", status: "active" },
    { id: "acc-hdfc", name: "HDFC Savings", institution: "HDFC Bank", type: "savings", openingBalance: 120000, currentBalance: 286500, currency: "INR", status: "active" },
    { id: "acc-cash", name: "Cash Wallet", institution: "Cash", type: "cash", openingBalance: 15000, currentBalance: 9200, currency: "INR", status: "active" },
    { id: "acc-magnus", name: "Magnus Card", institution: "Axis Bank", type: "credit_card", openingBalance: 0, currentBalance: -74500, currency: "INR", status: "active" },
    { id: "acc-infinia", name: "Infinia Card", institution: "HDFC Bank", type: "credit_card", openingBalance: 0, currentBalance: -38200, currency: "INR", status: "active" }
  ],
  cards: [
    {
      id: "card-magnus",
      accountId: "acc-magnus",
      name: "Axis Magnus",
      institution: "Axis Bank",
      creditLimit: 800000,
      outstandingAmount: 74500,
      statementDate: 12,
      dueDate: "2026-07-22",
      annualFee: 12500,
      joiningFee: 10000,
      rewardRate: 4.8,
      rewardPoints: 18400,
      interestRate: 42,
      paymentHistory: [{ id: "pay-1", date: "2026-06-20", amount: 50000, sourceAccountId: "acc-icici" }]
    },
    {
      id: "card-infinia",
      accountId: "acc-infinia",
      name: "HDFC Infinia",
      institution: "HDFC Bank",
      creditLimit: 1200000,
      outstandingAmount: 38200,
      statementDate: 5,
      dueDate: "2026-07-18",
      annualFee: 12500,
      joiningFee: 0,
      rewardRate: 3.3,
      rewardPoints: 42100,
      interestRate: 39,
      paymentHistory: []
    }
  ],
  categories: [
    { id: "cat-salary", name: "Salary", type: "income", color: "#4ade80", icon: "Briefcase" },
    { id: "cat-bonus", name: "Bonus", type: "income", color: "#22d3ee", icon: "Sparkles" },
    { id: "cat-food", name: "Food", type: "expense", color: "#fb7185", icon: "Utensils", monthlyBudget: 22000 },
    { id: "cat-groceries", name: "Groceries", type: "expense", color: "#facc15", icon: "ShoppingBasket", monthlyBudget: 16000 },
    { id: "cat-rent", name: "Rent", type: "expense", color: "#a78bfa", icon: "Home", monthlyBudget: 65000 },
    { id: "cat-cab", name: "Cab", type: "expense", color: "#38bdf8", icon: "Car", monthlyBudget: 9000 },
    { id: "cat-shopping", name: "Shopping", type: "expense", color: "#f97316", icon: "ShoppingBag", monthlyBudget: 30000 },
    { id: "cat-medical", name: "Medical", type: "expense", color: "#2dd4bf", icon: "HeartPulse", monthlyBudget: 10000 },
    { id: "cat-travel", name: "Travel", type: "expense", color: "#60a5fa", icon: "Plane", monthlyBudget: 25000 },
    { id: "cat-subscriptions", name: "Subscriptions", type: "expense", color: "#c084fc", icon: "Repeat2", monthlyBudget: 6000 },
    { id: "cat-investments", name: "Investments", type: "investment", color: "#34d399", icon: "TrendingUp", monthlyBudget: 90000 },
    { id: "cat-insurance", name: "Insurance", type: "expense", color: "#f472b6", icon: "Shield", monthlyBudget: 12000 },
    { id: "cat-misc", name: "Miscellaneous", type: "expense", color: "#94a3b8", icon: "Circle" }
  ],
  merchants: [
    { id: "mer-amazon", name: "Amazon", defaultCategoryId: "cat-shopping" },
    { id: "mer-swiggy", name: "Swiggy", defaultCategoryId: "cat-food" },
    { id: "mer-blinkit", name: "Blinkit", defaultCategoryId: "cat-groceries" },
    { id: "mer-uber", name: "Uber", defaultCategoryId: "cat-cab" },
    { id: "mer-irctc", name: "IRCTC", defaultCategoryId: "cat-travel" }
  ],
  transactions: [
    { id: "txn-1", date: "2026-07-01", merchant: "Employer", description: "Monthly salary", amount: 300000, kind: "income", categoryId: "cat-salary", accountId: "acc-icici", paymentMethod: "bank_transfer", tags: ["salary"], createdAt: now, updatedAt: now },
    { id: "txn-2", date: "2026-07-02", merchant: "Prestige Estates", description: "Rent", amount: 65000, kind: "expense", categoryId: "cat-rent", accountId: "acc-icici", paymentMethod: "bank_transfer", tags: ["fixed"], createdAt: now, updatedAt: now },
    { id: "txn-3", date: "2026-07-02", merchant: "Amazon", description: "Electronics and household", amount: 18500, kind: "expense", categoryId: "cat-shopping", accountId: "acc-magnus", paymentMethod: "credit_card", creditCardId: "card-magnus", tags: ["card"], createdAt: now, updatedAt: now },
    { id: "txn-4", date: "2026-07-03", merchant: "Swiggy", description: "Dinner", amount: 1450, kind: "expense", categoryId: "cat-food", accountId: "acc-infinia", paymentMethod: "credit_card", creditCardId: "card-infinia", tags: ["food"], createdAt: now, updatedAt: now },
    { id: "txn-5", date: "2026-07-03", merchant: "Blinkit", description: "Weekly groceries", amount: 4200, kind: "expense", categoryId: "cat-groceries", accountId: "acc-icici", paymentMethod: "upi", tags: ["home"], createdAt: now, updatedAt: now },
    { id: "txn-6", date: "2026-07-04", merchant: "Uber", description: "Airport cab", amount: 2150, kind: "expense", categoryId: "cat-cab", accountId: "acc-infinia", paymentMethod: "credit_card", creditCardId: "card-infinia", tags: ["travel"], createdAt: now, updatedAt: now },
    { id: "txn-7", date: "2026-07-05", merchant: "Kuvera", description: "SIP", amount: 75000, kind: "investment", categoryId: "cat-investments", accountId: "acc-hdfc", paymentMethod: "bank_transfer", tags: ["sip"], createdAt: now, updatedAt: now },
    { id: "txn-8", date: "2026-07-06", merchant: "Netflix", description: "Subscription", amount: 649, kind: "expense", categoryId: "cat-subscriptions", accountId: "acc-magnus", paymentMethod: "credit_card", creditCardId: "card-magnus", tags: ["recurring"], createdAt: now, updatedAt: now },
    { id: "txn-9", date: "2026-06-01", merchant: "Employer", description: "Monthly salary", amount: 300000, kind: "income", categoryId: "cat-salary", accountId: "acc-icici", paymentMethod: "bank_transfer", tags: ["salary"], createdAt: now, updatedAt: now },
    { id: "txn-10", date: "2026-06-11", merchant: "IRCTC", description: "Train tickets", amount: 8200, kind: "expense", categoryId: "cat-travel", accountId: "acc-magnus", paymentMethod: "credit_card", creditCardId: "card-magnus", tags: ["travel"], createdAt: now, updatedAt: now },
    { id: "txn-11", date: "2026-06-18", merchant: "Apollo", description: "Medicines", amount: 3600, kind: "expense", categoryId: "cat-medical", accountId: "acc-icici", paymentMethod: "upi", tags: ["health"], createdAt: now, updatedAt: now },
    { id: "txn-12", date: "2026-06-20", merchant: "Axis Bank", description: "Magnus card payment", amount: 50000, kind: "card_payment", categoryId: "cat-misc", accountId: "acc-icici", paymentMethod: "bank_transfer", creditCardId: "card-magnus", tags: ["card-payment"], createdAt: now, updatedAt: now }
  ],
  budgets: [
    { id: "budget-food", month: "2026-07", categoryId: "cat-food", amount: 22000, alertThreshold: 80 },
    { id: "budget-groceries", month: "2026-07", categoryId: "cat-groceries", amount: 16000, alertThreshold: 80 },
    { id: "budget-shopping", month: "2026-07", categoryId: "cat-shopping", amount: 30000, alertThreshold: 75 },
    { id: "budget-travel", month: "2026-07", categoryId: "cat-travel", amount: 25000, alertThreshold: 75 }
  ],
  investments: [
    { id: "inv-1", name: "Index Mutual Funds", type: "mutual_funds", investmentAmount: 980000, currentValue: 1215000 },
    { id: "inv-2", name: "PPF", type: "ppf", investmentAmount: 700000, currentValue: 862000 },
    { id: "inv-3", name: "Gold ETF", type: "gold", investmentAmount: 180000, currentValue: 211000 },
    { id: "inv-4", name: "ESPP", type: "espp", investmentAmount: 320000, currentValue: 389000 }
  ],
  recurringTransactions: [
    { id: "rec-rent", name: "Rent", merchant: "Prestige Estates", amount: 65000, kind: "expense", categoryId: "cat-rent", accountId: "acc-icici", paymentMethod: "bank_transfer", frequency: "monthly", nextRunDate: "2026-08-02", active: true },
    { id: "rec-salary", name: "Salary", merchant: "Employer", amount: 300000, kind: "income", categoryId: "cat-salary", accountId: "acc-icici", paymentMethod: "bank_transfer", frequency: "monthly", nextRunDate: "2026-08-01", active: true },
    { id: "rec-netflix", name: "Netflix", merchant: "Netflix", amount: 649, kind: "expense", categoryId: "cat-subscriptions", accountId: "acc-magnus", paymentMethod: "credit_card", frequency: "monthly", nextRunDate: "2026-08-06", active: true }
  ],
  rules: [
    { id: "rule-swiggy", field: "merchant", operator: "contains", value: "Swiggy", categoryId: "cat-food" },
    { id: "rule-blinkit", field: "merchant", operator: "contains", value: "Blinkit", categoryId: "cat-groceries" },
    { id: "rule-uber", field: "merchant", operator: "contains", value: "Uber", categoryId: "cat-cab" },
    { id: "rule-salary", field: "description", operator: "contains", value: "salary", categoryId: "cat-salary", paymentMethod: "bank_transfer" }
  ]
};
