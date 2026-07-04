import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFinanceSnapshot } from "../data/queries";
import { expenses, groupByMerchant, groupExpensesByCategory, income, monthTransactions, monthlyCashFlow, savingsRate } from "../lib/analytics";
import { currency, monthKey, percent } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

const monthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

export default function Reports() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  const currentMonth = monthKey();
  const [reportMonth, setReportMonth] = useState(currentMonth.slice(5));
  const [reportYear, setReportYear] = useState(currentMonth.slice(0, 4));
  const yearOptions = useMemo(() => {
    const years = new Set([currentMonth.slice(0, 4)]);
    data?.transactions.forEach((transaction) => years.add(transaction.date.slice(0, 4)));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [currentMonth, data?.transactions]);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  const cashFlow = monthlyCashFlow(data.transactions);
  const topMerchant = groupByMerchant(data.transactions)[0];
  const topCategory = groupExpensesByCategory(data.transactions, data.categories)[0];
  const largestExpense = data.transactions.filter((item) => item.kind === "expense").sort((a, b) => b.amount - a.amount)[0];
  const largestIncome = data.transactions.filter((item) => item.kind === "income").sort((a, b) => b.amount - a.amount)[0];
  const selectedPeriod = `${reportYear}-${reportMonth}`;
  const selectedTransactions = monthTransactions(data.transactions, selectedPeriod);
  const selectedExpenseTotal = expenses(selectedTransactions);
  const categoryById = new Map(data.categories.map((category) => [category.id, category]));
  const categoryReport = Array.from(
    selectedTransactions
      .filter((transaction) => transaction.kind === "expense")
      .reduce((grouped, transaction) => {
        const current = grouped.get(transaction.categoryId) ?? { value: 0, count: 0 };
        grouped.set(transaction.categoryId, { value: current.value + transaction.amount, count: current.count + 1 });
        return grouped;
      }, new Map<string, { value: number; count: number }>())
      .entries()
  )
    .map(([categoryId, values]) => {
      const category = categoryById.get(categoryId);
      return {
        id: categoryId,
        name: category?.name ?? "Uncategorized",
        color: category?.color ?? "#8b949e",
        value: values.value,
        count: values.count,
        share: selectedExpenseTotal === 0 ? 0 : (values.value / selectedExpenseTotal) * 100
      };
    })
    .sort((a, b) => b.value - a.value);

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

      <Section title="Category expenses">
        <div className="report-controls">
          <label>
            Month
            <select value={reportMonth} onChange={(event) => setReportMonth(event.target.value)}>
              {monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
          </label>
          <label>
            Year
            <select value={reportYear} onChange={(event) => setReportYear(event.target.value)}>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <article className="period-total">
            <span>Total expenses</span>
            <strong>{currency(selectedExpenseTotal)}</strong>
          </article>
        </div>
        {categoryReport.length ? (
          <div className="category-report-grid">
            {categoryReport.map((category) => (
              <article className="category-report-card" key={category.id}>
                <span className="category-color" style={{ background: category.color }} />
                <div>
                  <h3>{category.name}</h3>
                  <small>{category.count} transactions · {percent(category.share)} of spend</small>
                </div>
                <strong>{currency(category.value)}</strong>
                <progress value={category.share} max={100} />
              </article>
            ))}
          </div>
        ) : <EmptyState title="No expenses for this period" message="Choose another month or year to see category-wise spending." />}
      </Section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}
