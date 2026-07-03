import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateTransaction } from "../data/queries";
import type { Category, Account } from "../types/finance";

const schema = z.object({
  date: z.string().min(10),
  merchant: z.string().min(2),
  amount: z.coerce.number().positive(),
  kind: z.enum(["income", "expense", "investment"]),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
  description: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

interface QuickAddTransactionProps {
  categories: Category[];
  accounts: Account[];
}

export function QuickAddTransaction({ categories, accounts }: QuickAddTransactionProps) {
  const createTransaction = useCreateTransaction();
  const { register, handleSubmit, reset, formState, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), kind: "expense", categoryId: categories[0]?.id, accountId: accounts[0]?.id, description: "" }
  });
  const kind = watch("kind");

  async function onSubmit(values: FormValues) {
    await createTransaction.mutateAsync(values);
    reset({ date: values.date, kind: values.kind, categoryId: values.categoryId, accountId: values.accountId, merchant: "", amount: undefined as unknown as number, description: "" });
  }

  const availableAccounts = useMemo(() => accounts.filter((account) => {
    if (account.status !== "active") return false;
    if (kind === "expense") return account.type !== "investment";
    if (kind === "investment") return account.type !== "credit_card";
    return account.type !== "credit_card" && account.type !== "investment";
  }), [accounts, kind]);
  const availableCategories = useMemo(() => categories.filter((category) => category.type === kind), [categories, kind]);
  const isDisabled = formState.isSubmitting || createTransaction.isPending || !availableAccounts.length || !availableCategories.length;

  useEffect(() => {
    if (availableCategories.length) setValue("categoryId", availableCategories[0].id);
    else setValue("categoryId", "");
  }, [availableCategories, setValue]);

  useEffect(() => {
    if (availableAccounts.length) setValue("accountId", availableAccounts[0].id);
    else setValue("accountId", "");
  }, [availableAccounts, setValue]);

  return (
    <form className="quick-add" onSubmit={handleSubmit(onSubmit)}>
      <input aria-label="Date" type="date" {...register("date")} />
      <input aria-label="Merchant" placeholder="Merchant" {...register("merchant")} />
      <input aria-label="Amount" placeholder="Amount" type="number" {...register("amount")} />
      <select aria-label="Kind" {...register("kind")}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="investment">Investment</option>
      </select>
      <select aria-label="Category" {...register("categoryId")}>
        {!availableCategories.length && <option value="">No {kind} categories</option>}
        {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select aria-label="Payment source" {...register("accountId")}>
        {!availableAccounts.length && <option value="">No payment sources</option>}
        {availableAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}{account.type === "credit_card" ? " · credit card" : ""}
          </option>
        ))}
      </select>
      <button className="primary-button" type="submit" disabled={isDisabled}>
        <Plus size={16} /> {createTransaction.isPending ? "Saving" : "Add"}
      </button>
      <input className="quick-add-wide" aria-label="Description" placeholder="Description or note" {...register("description")} />
      {createTransaction.isError && <p className="inline-error">{createTransaction.error.message}</p>}
      {!availableAccounts.length && <p className="inline-error">Add a bank account or credit card on the Accounts page before using Quick Add.</p>}
      {!availableCategories.length && <p className="inline-error">No {kind} categories found. Default categories are created after your first signed-in data load.</p>}
    </form>
  );
}
