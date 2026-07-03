import { CreditCard, Edit3, Landmark, WalletCards } from "lucide-react";
import { useState } from "react";
import { useFinanceSnapshot } from "../data/queries";
import { currency } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";
import { AddAccountForm } from "../components/AddAccountForm";
import { AddCreditCardForm } from "../components/AddCreditCardForm";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { CardPaymentForm } from "../components/CardPaymentForm";
import { EditAccountForm } from "../components/EditAccountForm";
import { EditCreditCardForm } from "../components/EditCreditCardForm";
import { InvestmentForm } from "../components/InvestmentForm";

export default function Accounts() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);
  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  return (
    <div className="page-stack">
      <Section title="Add account">
        <AddAccountForm />
      </Section>
      <Section title="Add credit card">
        <AddCreditCardForm />
      </Section>
      <Section title="Record card payment">
        <CardPaymentForm cards={data.cards} accounts={data.accounts} categories={data.categories} />
      </Section>
      <Section title="Bank accounts">
        <div className="card-grid">
          {data.accounts.filter((account) => account.type !== "credit_card").length ? data.accounts.filter((account) => account.type !== "credit_card").map((account) => (
            <article className="account-card" key={account.id}>
              <Landmark size={22} />
              <span>{account.institution}</span>
              <h3>{account.name}</h3>
              <strong>{currency(account.currentBalance)}</strong>
              <small>{account.type.replace("_", " ")} · {account.status}</small>
              <button className="ghost-button" type="button" onClick={() => setEditingAccountId(account.id)}><Edit3 size={16} /> Edit</button>
              {editingAccountId === account.id && <EditAccountForm account={account} onDone={() => setEditingAccountId(null)} />}
            </article>
          )) : <EmptyState title="No bank accounts yet" message="Add a bank, cash, or investment account to begin." />}
        </div>
      </Section>
      <Section title="Credit cards">
        <div className="card-grid">
          {data.cards.length ? data.cards.map((card) => (
            <article className="account-card credit" key={card.id}>
              <CreditCard size={22} />
              <span>{card.institution}</span>
              <h3>{card.name}</h3>
              <strong>{currency(card.outstandingAmount)}</strong>
              <small>{currency(card.creditLimit - card.outstandingAmount)} available · {card.creditLimit > 0 ? Math.round((card.outstandingAmount / card.creditLimit) * 100) : 0}% utilization</small>
              <progress value={card.creditLimit > 0 ? (card.outstandingAmount / card.creditLimit) * 100 : 0} max={100} />
              <button className="ghost-button" type="button" onClick={() => setEditingCardId(card.id)}><Edit3 size={16} /> Edit</button>
              {editingCardId === card.id && <EditCreditCardForm card={card} onDone={() => setEditingCardId(null)} />}
            </article>
          )) : <EmptyState title="No credit cards yet" message="Add cards to track dues, limits, and expenses." />}
        </div>
      </Section>
      <Section title="Add investment">
        <InvestmentForm />
      </Section>
      <Section title="Investment summary">
        <div className="card-grid">
          {data.investments.length ? data.investments.map((investment) => (
            <article className="account-card" key={investment.id}>
              <WalletCards size={22} />
              <span>{investment.type.replace("_", " ")}</span>
              <h3>{investment.name}</h3>
              <strong>{currency(investment.currentValue)}</strong>
              <small>{currency(investment.currentValue - investment.investmentAmount)} gain/loss</small>
              <button className="ghost-button" type="button" onClick={() => setEditingInvestmentId(investment.id)}><Edit3 size={16} /> Edit</button>
              {editingInvestmentId === investment.id && <InvestmentForm investment={investment} onDone={() => setEditingInvestmentId(null)} />}
            </article>
          )) : <EmptyState title="No investments yet" message="Manual portfolio tracking will appear here." />}
        </div>
      </Section>
    </div>
  );
}
