import { CalendarDays, CreditCard, Sparkles, Store, TrendingUp } from "lucide-react";
import type { FinanceSnapshot } from "../types/finance";
import { currency, dateLabel, percent } from "../lib/format";
import { expenses, groupByMerchant, savingsRate } from "../lib/analytics";

interface DashboardGreetingProps {
  name: string;
  data: FinanceSnapshot;
}

export function DashboardGreeting({ name, data }: DashboardGreetingProps) {
  const topMerchant = groupByMerchant(data.transactions)[0];
  const nextCardDue = data.cards
    .filter((card) => card.outstandingAmount > 0)
    .map((card) => ({ ...card, dueTime: new Date(card.dueDate).getTime() }))
    .sort((a, b) => a.dueTime - b.dueTime)[0];
  const totalExpense = expenses(data.transactions);
  const rate = savingsRate(data.transactions);

  return (
    <section className="personal-hero" aria-label="Personal dashboard summary">
      <div className="personal-copy">
        <p className="eyebrow"><Sparkles size={14} /> Your finance workspace</p>
        <h2>Hi {name}, here&apos;s your money picture.</h2>
        <p>{summaryLine(totalExpense, rate, nextCardDue?.name)}</p>
      </div>
      <div className="personal-insights">
        <Insight icon={TrendingUp} label="Savings rate" value={percent(rate)} />
        <Insight icon={CreditCard} label="Next card due" value={nextCardDue ? `${nextCardDue.name} · ${dateLabel(nextCardDue.dueDate)}` : "No dues"} />
        <Insight icon={Store} label="Top merchant" value={topMerchant ? `${topMerchant.merchant} · ${currency(topMerchant.spend)}` : "No spend yet"} />
        <Insight icon={CalendarDays} label="Tracked entries" value={`${data.transactions.length} transactions`} />
      </div>
    </section>
  );
}

function Insight({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <article className="personal-insight">
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function summaryLine(totalExpense: number, rate: number, nextCardName?: string) {
  if (totalExpense === 0) return "Start by adding accounts and your first transaction; the dashboard will sharpen as your data grows.";
  if (rate >= 40) return `Strong month so far: you are saving ${percent(rate)} while keeping spending visible.`;
  if (rate >= 15) return `You are saving ${percent(rate)} so far. Keep an eye on spending patterns and upcoming dues${nextCardName ? `, especially ${nextCardName}` : ""}.`;
  return `Savings are tight at ${percent(rate)}. The fastest next check is your top merchants and card dues.`;
}
