import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFinanceSnapshot } from "../data/queries";
import { expenses, groupByMerchant, groupExpensesByCategory, income, monthlyCashFlow, savingsRate } from "../lib/analytics";
import { currency } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

export default function Reports() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  const cashFlow = monthlyCashFlow(data.transactions);
  const topMerchant = groupByMerchant(data.transactions)[0];
  const topCategory = groupExpensesByCategory(data.transactions, data.categories)[0];
  const largestExpense = data.transactions.filter((item) => item.kind === "expense").sort((a, b) => b.amount - a.amount)[0];
  const largestIncome = data.transactions.filter((item) => item.kind === "income").sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="page-stack">
      <Section title="Monthly summary">
        <div className="summary-grid">
          <Metric label="Income" value={currency(income(data.transactions))} />
          <Metric label="Expenses" value={currency(expenses(data.transactions))} />
          <Metric label="Savings rate" value={`${Math.round(savingsRate(data.transactions))}%`} />
          <Metric label="Top merchant" value={topMerchant?.merchant ?? "None"} />
          <Metric label="Top category" value={topCategory?.name ?? "None"} />
          <Metric label="Largest expense" value={largestExpense ? currency(largestExpense.amount) : "None"} />
          <Metric label="Largest income" value={largestIncome ? currency(largestIncome.amount) : "None"} />
          <Metric label="Transactions" value={String(data.transactions.length)} />
        </div>
      </Section>
      <section className="analytics-grid">
        <Section title="Savings trend">
          <div className="chart-box">
            {cashFlow.length ? <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" tickFormatter={(value) => `₹${Number(value) / 1000}K`} />
                <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)" }} />
                <Line type="monotone" dataKey="savings" stroke="#4ade80" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer> : <EmptyState title="No savings trend yet" message="Add transactions to generate reports." />}
          </div>
        </Section>
        <Section title="Spending by month">
          <div className="chart-box">
            {cashFlow.length ? <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" tickFormatter={(value) => `₹${Number(value) / 1000}K`} />
                <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)" }} />
                <Bar dataKey="expenses" fill="#fb7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer> : <EmptyState title="No spending history yet" message="Monthly spending appears after expense entries." />}
          </div>
        </Section>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}
