import { useMemo, useState } from "react";
import { Copy, Download, Filter, Search, Trash2, Upload } from "lucide-react";
import { useFinanceSnapshot } from "../data/queries";
import { dateLabel, currency } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";

export default function Transactions() {
  const { data, isLoading } = useFinanceSnapshot();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter((transaction) => {
      const matchesSearch = `${transaction.merchant} ${transaction.description} ${transaction.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const matchesKind = kind === "all" || transaction.kind === kind;
      return matchesSearch && matchesKind;
    });
  }, [data, kind, search]);

  if (isLoading || !data) return <LoadingScreen />;

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="page-stack">
      <Section title="Transactions" action={<button className="primary-button"><Download size={16} /> Export CSV</button>}>
        <div className="filter-bar">
          <label className="search-input"><Search size={16} /><input placeholder="Search merchant, notes, tags" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <select aria-label="Transaction type" value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
            <option value="card_payment">Card payment</option>
          </select>
          <button className="ghost-button"><Filter size={16} /> Advanced</button>
          <button className="ghost-button"><Upload size={16} /> Receipt</button>
          <button className="danger-button" disabled={!selected.length}><Trash2 size={16} /> Delete</button>
        </div>
        <div className="data-table" role="table" aria-label="Transactions">
          <div className="data-row head" role="row">
            <span></span><span>Date</span><span>Merchant</span><span>Type</span><span>Payment</span><span>Amount</span><span></span>
          </div>
          {rows.map((transaction) => (
            <div className="data-row" role="row" key={transaction.id}>
              <input aria-label={`Select ${transaction.merchant}`} type="checkbox" checked={selected.includes(transaction.id)} onChange={() => toggleSelected(transaction.id)} />
              <span>{dateLabel(transaction.date)}</span>
              <span><strong>{transaction.merchant}</strong><small>{transaction.description}</small></span>
              <span>{transaction.kind.replace("_", " ")}</span>
              <span>{transaction.paymentMethod.replace("_", " ")}</span>
              <strong className={transaction.kind === "income" ? "positive" : transaction.kind === "card_payment" ? "neutral" : "negative"}>{currency(transaction.amount)}</strong>
              <button className="icon-button" aria-label="Duplicate transaction"><Copy size={16} /></button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
