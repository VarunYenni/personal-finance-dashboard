import { Link } from "react-router-dom";
import { CheckCircle2, CreditCard, Landmark, ReceiptText } from "lucide-react";
import type { FinanceSnapshot } from "../types/finance";

export function OnboardingChecklist({ data }: { data: FinanceSnapshot }) {
  const hasBankAccount = data.accounts.some((account) => account.type !== "credit_card");
  const hasCard = data.cards.length > 0;
  const hasTransaction = data.transactions.length > 0;
  const isComplete = hasBankAccount && hasCard && hasTransaction;

  if (isComplete) return null;

  const items = [
    { done: hasBankAccount, label: "Add your first bank or cash account", icon: Landmark, to: "/app/accounts" },
    { done: hasCard, label: "Add credit cards you spend from", icon: CreditCard, to: "/app/accounts" },
    { done: hasTransaction, label: "Record your first transaction", icon: ReceiptText, to: "/app" }
  ];

  return (
    <section className="onboarding-panel" aria-label="Setup checklist">
      <div>
        <p className="eyebrow">Setup</p>
        <h2>Finish your finance workspace</h2>
      </div>
      <div className="onboarding-list">
        {items.map((item) => (
          <Link className={`onboarding-item ${item.done ? "done" : ""}`} to={item.to} key={item.label}>
            {item.done ? <CheckCircle2 size={18} /> : <item.icon size={18} />}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
