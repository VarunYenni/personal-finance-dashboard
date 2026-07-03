import { AlertTriangle, Wand2 } from "lucide-react";
import { useFinanceSnapshot } from "../data/queries";
import { budgetProgress } from "../lib/analytics";
import { currency, dateLabel } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { BudgetForm } from "../components/BudgetForm";
import { RecurringForm } from "../components/RecurringForm";

export default function Budgets() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  const budgets = budgetProgress(data.budgets, data.transactions, data.categories);

  return (
    <div className="page-stack">
      <Section title="Create budget">
        <BudgetForm categories={data.categories} />
      </Section>
      <Section title="Monthly budgets">
        <div className="budget-list large">
          {budgets.length ? budgets.map((budget) => (
            <article className="budget-item" key={budget.id}>
              <div>
                <strong>{budget.category}</strong>
                <span>{currency(budget.remaining)} remaining</span>
              </div>
              <progress value={budget.progress} max={100} />
              {budget.progress >= budget.alertThreshold && <small className="warning"><AlertTriangle size={14} /> Approaching budget</small>}
            </article>
          )) : <EmptyState title="No budgets yet" message="Set monthly category budgets to monitor progress." />}
        </div>
      </Section>
      <Section title="Add recurring transaction">
        <RecurringForm categories={data.categories} accounts={data.accounts} />
      </Section>
      <Section title="Recurring transactions">
        <div className="table-list">
          {data.recurringTransactions.length ? data.recurringTransactions.map((item) => (
            <div className="table-row" key={item.id}>
              <span>{item.name}</span>
              <strong>{currency(item.amount)}</strong>
              <small>{item.frequency} · next {dateLabel(item.nextRunDate)}</small>
            </div>
          )) : <EmptyState title="No recurring transactions yet" message="Recurring income and bills will show here." />}
        </div>
      </Section>
      <Section title="Smart rules">
        <div className="table-list">
          {data.rules.length ? data.rules.map((rule) => (
            <div className="table-row" key={rule.id}>
              <span><Wand2 size={15} /> {rule.field} {rule.operator.replace("_", " ")} "{rule.value}"</span>
              <strong>{data.categories.find((category) => category.id === rule.categoryId)?.name}</strong>
              <small>{rule.paymentMethod?.replace("_", " ") ?? "Any method"}</small>
            </div>
          )) : <EmptyState title="No smart rules yet" message="Rules will help categorize repeat merchants automatically." />}
        </div>
      </Section>
    </div>
  );
}
