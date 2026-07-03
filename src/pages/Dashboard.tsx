import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, CreditCard, Landmark, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { useFinanceSnapshot } from "../data/queries";
import { bankBalance, budgetProgress, expenses, groupByMerchant, groupExpensesByCategory, income, monthlyCashFlow, monthTransactions, netWorth, outstanding, savings, savingsRate } from "../lib/analytics";
import { currency, dateLabel, monthKey, percent } from "../lib/format";
import { KpiCard } from "../components/KpiCard";
import { QuickAddTransaction } from "../components/QuickAddTransaction";
import { Section } from "../components/Section";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { OnboardingChecklist } from "../components/OnboardingChecklist";
import { DashboardGreeting } from "../components/DashboardGreeting";
import { useAuthSession } from "../lib/auth";
import { getDisplayName } from "../lib/user";

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  const { session } = useAuthSession();
  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  const currentMonth = monthTransactions(data.transactions, monthKey());
  const categorySpend = groupExpensesByCategory(currentMonth, data.categories);
  const merchantSpend = groupByMerchant(currentMonth).slice(0, 5);
  const cashFlow = monthlyCashFlow(data.transactions);
  const budgets = budgetProgress(data.budgets, data.transactions, data.categories);
  const cardDue = data.cards.map((card) => ({ ...card, days: Math.ceil((new Date(card.dueDate).getTime() - Date.now()) / 86_400_000) }));
  const investmentsValue = data.investments.reduce((total, item) => total + item.currentValue, 0);
  const paymentMethodMix = currentMonth.reduce<Array<{ method: string; value: number }>>((acc, item) => {
    const existing = acc.find((entry) => entry.method === item.paymentMethod);
    if (existing) existing.value += 1;
    else acc.push({ method: item.paymentMethod, value: 1 });
    return acc;
  }, []);

  return (
    <div className="dashboard-grid">
      <DashboardGreeting name={getDisplayName(session)} data={data} />
      <OnboardingChecklist data={data} />
      <div className="kpi-grid">
        <KpiCard label="Net worth" value={currency(netWorth(data.accounts, data.cards, data.investments))} detail="Assets minus card liabilities" icon={Wallet} tone="green" />
        <KpiCard label="Monthly income" value={currency(income(currentMonth))} detail="Salary and credits" icon={Banknote} tone="green" />
        <KpiCard label="Monthly expenses" value={currency(expenses(currentMonth))} detail="Card payments excluded" icon={CreditCard} tone="red" />
        <KpiCard label="Savings rate" value={percent(savingsRate(currentMonth))} detail={`${currency(savings(currentMonth))} saved`} icon={PiggyBank} tone="blue" />
        <KpiCard label="Bank balance" value={currency(bankBalance(data.accounts))} detail="Checking, savings, cash" icon={Landmark} tone="blue" />
        <KpiCard label="Card outstanding" value={currency(outstanding(data.cards))} detail="Upcoming liabilities" icon={CreditCard} tone="amber" />
        <KpiCard label="Investments" value={currency(investmentsValue)} detail="Manual portfolio value" icon={TrendingUp} tone="green" />
      </div>

      <Section title="Quick add">
        <QuickAddTransaction categories={data.categories} accounts={data.accounts} />
      </Section>

      <section className="analytics-grid">
        <Section title="Monthly cash flow">
          <div className="chart-box">
            {cashFlow.length ? <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cashFlow}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" stopOpacity={0.45} /><stop offset="100%" stopColor="#4ade80" stopOpacity={0.03} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" tickFormatter={(value) => `₹${Number(value) / 1000}K`} />
                <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)" }} />
                <Area dataKey="income" stroke="#4ade80" fill="url(#income)" />
                <Area dataKey="expenses" stroke="#fb7185" fill="#fb718522" />
              </AreaChart>
            </ResponsiveContainer> : <EmptyState title="No cash flow yet" message="Add income and expenses to see monthly trends." />}
          </div>
        </Section>
        <Section title="Expense breakdown">
          <div className="chart-box">
            {categorySpend.length ? <ResponsiveContainer width="100%" height={260}>
              <RePieChart>
                <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={4}>
                  {categorySpend.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)" }} />
              </RePieChart>
            </ResponsiveContainer> : <EmptyState title="No expenses yet" message="Expense categories appear after you add spending." />}
          </div>
        </Section>
      </section>

      <section className="analytics-grid">
        <Section title="Top merchants">
          <div className="table-list">
            {merchantSpend.length ? merchantSpend.map((merchant) => (
              <div className="table-row" key={merchant.merchant}>
                <span>{merchant.merchant}</span>
                <strong>{currency(merchant.spend)}</strong>
                <small>{merchant.count} txns</small>
              </div>
            )) : <EmptyState title="No merchants yet" message="Your top merchants appear after expenses are recorded." />}
          </div>
        </Section>
        <Section title="Budget progress">
          <div className="budget-list">
            {budgets.length ? budgets.map((budget) => (
              <div className="budget-item" key={budget.id}>
                <div><strong>{budget.category}</strong><span>{currency(budget.spent)} of {currency(budget.amount)}</span></div>
                <progress value={budget.progress} max={100} />
              </div>
            )) : <EmptyState title="No budgets yet" message="Category budgets will show here once configured." />}
          </div>
        </Section>
      </section>

      <section className="analytics-grid">
        <Section title="Upcoming card dues">
          <div className="table-list">
            {cardDue.length ? cardDue.map((card) => (
              <div className="table-row" key={card.id}>
                <span>{card.name}</span>
                <strong>{currency(card.outstandingAmount)}</strong>
                <small>{dateLabel(card.dueDate)} · {Math.max(card.days, 0)} days</small>
              </div>
            )) : <EmptyState title="No cards yet" message="Add credit cards to track dues and utilization." />}
          </div>
        </Section>
        <Section title="Recent transactions">
          <div className="table-list">
            {data.transactions.length ? data.transactions.slice(0, 6).map((transaction) => (
              <div className="table-row" key={transaction.id}>
                <span>{transaction.merchant}</span>
                <strong className={transaction.kind === "income" ? "positive" : transaction.kind === "card_payment" ? "neutral" : "negative"}>{currency(transaction.amount)}</strong>
                <small>{transaction.kind.replace("_", " ")} · {dateLabel(transaction.date)}</small>
              </div>
            )) : <EmptyState title="No transactions yet" message="Use Quick Add to start tracking money movement." />}
          </div>
        </Section>
      </section>

      <Section title="Payment method mix">
        <div className="chart-box">
          {paymentMethodMix.length ? <ResponsiveContainer width="100%" height={240}>
            <BarChart data={paymentMethodMix}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="method" stroke="var(--muted)" />
              <YAxis allowDecimals={false} stroke="var(--muted)" />
              <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)" }} />
              <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <EmptyState title="No payment mix yet" message="Payment method usage appears after transactions are added." />}
        </div>
      </Section>
    </div>
  );
}
