import { CreditCard, Landmark, WalletCards } from "lucide-react";
import { useFinanceSnapshot } from "../data/queries";
import { currency } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";

export default function Accounts() {
  const { data, isLoading } = useFinanceSnapshot();
  if (isLoading || !data) return <LoadingScreen />;

  return (
    <div className="page-stack">
      <Section title="Bank accounts">
        <div className="card-grid">
          {data.accounts.filter((account) => account.type !== "credit_card").map((account) => (
            <article className="account-card" key={account.id}>
              <Landmark size={22} />
              <span>{account.institution}</span>
              <h3>{account.name}</h3>
              <strong>{currency(account.currentBalance)}</strong>
              <small>{account.type.replace("_", " ")} · {account.status}</small>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Credit cards">
        <div className="card-grid">
          {data.cards.map((card) => (
            <article className="account-card credit" key={card.id}>
              <CreditCard size={22} />
              <span>{card.institution}</span>
              <h3>{card.name}</h3>
              <strong>{currency(card.outstandingAmount)}</strong>
              <small>{currency(card.creditLimit - card.outstandingAmount)} available · {Math.round((card.outstandingAmount / card.creditLimit) * 100)}% utilization</small>
              <progress value={(card.outstandingAmount / card.creditLimit) * 100} max={100} />
            </article>
          ))}
        </div>
      </Section>
      <Section title="Investment summary">
        <div className="card-grid">
          {data.investments.map((investment) => (
            <article className="account-card" key={investment.id}>
              <WalletCards size={22} />
              <span>{investment.type.replace("_", " ")}</span>
              <h3>{investment.name}</h3>
              <strong>{currency(investment.currentValue)}</strong>
              <small>{currency(investment.currentValue - investment.investmentAmount)} gain/loss</small>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
