import { useMemo, useState } from "react";
import { Copy, Download, Edit3, Filter, Search, Trash2, Upload } from "lucide-react";
import { useDeleteTransactions, useDuplicateTransaction, useFinanceSnapshot } from "../data/queries";
import { dateLabel, currency } from "../lib/format";
import { LoadingScreen } from "../components/LoadingScreen";
import { Section } from "../components/Section";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { EditTransactionForm } from "../components/EditTransactionForm";

export default function Transactions() {
  const { data, isLoading, isError, error, refetch } = useFinanceSnapshot();
  const deleteTransactions = useDeleteTransactions();
  const duplicateTransaction = useDuplicateTransaction();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter((transaction) => {
      const matchesSearch = `${transaction.merchant} ${transaction.description} ${transaction.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const matchesKind = kind === "all" || transaction.kind === kind;
      const matchesDateFrom = !dateFrom || transaction.date >= dateFrom;
      const matchesDateTo = !dateTo || transaction.date <= dateTo;
      const matchesCategory = categoryId === "all" || transaction.categoryId === categoryId;
      const matchesAccount = accountId === "all" || transaction.accountId === accountId;
      const matchesPayment = paymentMethod === "all" || transaction.paymentMethod === paymentMethod;
      const matchesMin = !minAmount || transaction.amount >= Number(minAmount);
      const matchesMax = !maxAmount || transaction.amount <= Number(maxAmount);
      return matchesSearch && matchesKind && matchesDateFrom && matchesDateTo && matchesCategory && matchesAccount && matchesPayment && matchesMin && matchesMax;
    });
  }, [accountId, categoryId, data, dateFrom, dateTo, kind, maxAmount, minAmount, paymentMethod, search]);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  const categoryById = new Map(data.categories.map((category) => [category.id, category.name]));
  const accountById = new Map(data.accounts.map((account) => [account.id, account.name]));

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function exportCsv() {
    const header = ["Date", "Merchant", "Description", "Type", "Category", "Source", "Payment Method", "Amount"];
    const csvRows = rows.map((transaction) => [
      transaction.date,
      transaction.merchant,
      transaction.description,
      transaction.kind,
      categoryById.get(transaction.categoryId) ?? "",
      accountById.get(transaction.accountId) ?? "",
      transaction.paymentMethod,
      String(transaction.amount)
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ledgerly-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function bulkDelete() {
    await deleteTransactions.mutateAsync(selected);
    setSelected([]);
  }

  function clearAdvancedFilters() {
    setDateFrom("");
    setDateTo("");
    setCategoryId("all");
    setAccountId("all");
    setPaymentMethod("all");
    setMinAmount("");
    setMaxAmount("");
    setSelected([]);
  }

  const activeAdvancedCount = [dateFrom, dateTo, minAmount, maxAmount].filter(Boolean).length
    + [categoryId, accountId, paymentMethod].filter((value) => value !== "all").length;

  return (
    <div className="page-stack">
      <Section title="Transactions" action={<button className="primary-button" type="button" onClick={exportCsv}><Download size={16} /> Export CSV</button>}>
        <div className="filter-bar">
          <label className="search-input"><Search size={16} /><input placeholder="Search merchant, notes, tags" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <select aria-label="Transaction type" value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
            <option value="card_payment">Card payment</option>
          </select>
          <button className={`ghost-button ${advancedOpen ? "active-filter" : ""}`} type="button" onClick={() => setAdvancedOpen((open) => !open)}>
            <Filter size={16} /> Advanced{activeAdvancedCount ? ` (${activeAdvancedCount})` : ""}
          </button>
          <button className="ghost-button"><Upload size={16} /> Receipt</button>
          <button className="danger-button" type="button" disabled={!selected.length || deleteTransactions.isPending} onClick={bulkDelete}><Trash2 size={16} /> {deleteTransactions.isPending ? "Deleting" : "Delete"}</button>
        </div>
        {advancedOpen && (
          <div className="advanced-filters" aria-label="Advanced transaction filters">
            <label>From<input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setSelected([]); }} /></label>
            <label>To<input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setSelected([]); }} /></label>
            <label>Category<select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSelected([]); }}>
              <option value="all">All categories</option>
              {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select></label>
            <label>Source<select value={accountId} onChange={(event) => { setAccountId(event.target.value); setSelected([]); }}>
              <option value="all">All sources</option>
              {data.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select></label>
            <label>Payment<select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setSelected([]); }}>
              <option value="all">All methods</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="debit_card">Debit card</option>
              <option value="credit_card">Credit card</option>
              <option value="cheque">Cheque</option>
              <option value="wallet">Wallet</option>
            </select></label>
            <label>Min amount<input type="number" value={minAmount} onChange={(event) => { setMinAmount(event.target.value); setSelected([]); }} /></label>
            <label>Max amount<input type="number" value={maxAmount} onChange={(event) => { setMaxAmount(event.target.value); setSelected([]); }} /></label>
            <button className="ghost-button" type="button" onClick={clearAdvancedFilters}>Clear filters</button>
          </div>
        )}
        <div className="data-table" role="table" aria-label="Transactions">
          <div className="data-row head" role="row">
            <span></span><span>Date</span><span>Merchant</span><span>Category</span><span>Source</span><span>Amount</span><span></span>
          </div>
          {rows.length ? rows.map((transaction) => (
            <div className="data-row" role="row" key={transaction.id}>
              <input aria-label={`Select ${transaction.merchant}`} type="checkbox" checked={selected.includes(transaction.id)} onChange={() => toggleSelected(transaction.id)} />
              <span>{dateLabel(transaction.date)}</span>
              <span><strong>{transaction.merchant}</strong><small>{transaction.description}</small></span>
              <span>{categoryById.get(transaction.categoryId) ?? transaction.kind.replace("_", " ")}</span>
              <span>{accountById.get(transaction.accountId) ?? transaction.paymentMethod.replace("_", " ")}</span>
              <strong className={transaction.kind === "income" ? "positive" : transaction.kind === "card_payment" ? "neutral" : "negative"}>{currency(transaction.amount)}</strong>
              <span className="row-actions">
                <button className="icon-button" aria-label="Edit transaction" type="button" onClick={() => setEditingId(transaction.id)}><Edit3 size={16} /></button>
                <button className="icon-button" aria-label="Duplicate transaction" type="button" disabled={duplicateTransaction.isPending} onClick={() => duplicateTransaction.mutate(transaction.id)}><Copy size={16} /></button>
              </span>
              {editingId === transaction.id && (
                <div className="data-row-editor">
                  <EditTransactionForm transaction={transaction} categories={data.categories} accounts={data.accounts} onDone={() => setEditingId(null)} />
                </div>
              )}
            </div>
          )) : <EmptyState title="No transactions found" message="Adjust filters or add a transaction from the dashboard." />}
          {deleteTransactions.isError && <p className="inline-error">{deleteTransactions.error.message}</p>}
          {duplicateTransaction.isError && <p className="inline-error">{duplicateTransaction.error.message}</p>}
        </div>
      </Section>
    </div>
  );
}
