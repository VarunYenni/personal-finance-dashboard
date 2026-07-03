import { AlertTriangle, Wand2 } from "lucide-react";
import { useFinanceSnapshot } from "../data/queries";
import { budgetProgress } from "../lib/analytics";
import { currency, dateLabel } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";

export default function Budgets() {
  const { data, isLoading } = useFinanceSnapshot();
  if (isLoading || !data) return <LoadingScreen />;
  const budgets = budgetProgress(data.budgets, data.transactions, data.categories);

  return (
    <div className="page-stack">
      <Section title="Monthly budgets">
        <div className="budget-list large">
          {budgets.map((budget) => (
            <article className="budget-item" key={budget.id}>
              <div>
                <strong>{budget.category}</strong>
                <span>{currency(budget.remaining)} remaining</span>
              </div>
              <progress value={budget.progress} max={100} />
              {budget.progress >= budget.alertThreshold && <small className="warning"><AlertTriangle size={14} /> Approaching budget</small>}
            </article>
          ))}
        </div>
      </Section>
      <Section title="Recurring transactions">
        <div className="table-list">
          {data.recurringTransactions.map((item) => (
            <div className="table-row" key={item.id}>
              <span>{item.name}</span>
              <strong>{currency(item.amount)}</strong>
              <small>{item.frequency} · next {dateLabel(item.nextRunDate)}</small>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Smart rules">
        <div className="table-list">
          {data.rules.map((rule) => (
            <div className="table-row" key={rule.id}>
              <span><Wand2 size={15} /> {rule.field} {rule.operator.replace("_", " ")} "{rule.value}"</span>
              <strong>{data.categories.find((category) => category.id === rule.categoryId)?.name}</strong>
              <small>{rule.paymentMethod?.replace("_", " ") ?? "Any method"}</small>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
