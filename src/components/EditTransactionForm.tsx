import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateTransaction } from "../data/queries";
import type { Account, Category, Transaction } from "../types/finance";

const schema = z.object({
  date: z.string().min(10),
  merchant: z.string().min(2),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  kind: z.enum(["income", "expense", "investment"]),
  categoryId: z.string().min(1),
  accountId: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export function EditTransactionForm({ transaction, categories, accounts, onDone }: { transaction: Transaction; categories: Category[]; accounts: Account[]; onDone: () => void }) {
  const updateTransaction = useUpdateTransaction();
  const validCategories = categories.filter((category) => category.type === transaction.kind);
  const validAccounts = accounts.filter((account) => account.status === "active");
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: transaction.date,
      merchant: transaction.merchant,
      description: transaction.description,
      amount: transaction.amount,
      kind: transaction.kind === "card_payment" || transaction.kind === "transfer" ? "expense" : transaction.kind,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId
    }
  });

  async function onSubmit(values: FormValues) {
    await updateTransaction.mutateAsync({ ...values, id: transaction.id });
    onDone();
  }

  return (
    <form className="inline-edit-form" onSubmit={handleSubmit(onSubmit)}>
      <input aria-label="Date" type="date" {...register("date")} />
      <input aria-label="Merchant" {...register("merchant")} />
      <input aria-label="Description" placeholder="Description" {...register("description")} />
      <input aria-label="Amount" type="number" {...register("amount")} />
      <select aria-label="Category" {...register("categoryId")}>{validCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <select aria-label="Account" {...register("accountId")}>{validAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
      <button className="primary-button" disabled={formState.isSubmitting || updateTransaction.isPending} type="submit"><Save size={16} /> Save</button>
      <button className="ghost-button" type="button" onClick={onDone}>Cancel</button>
      {updateTransaction.isError && <p className="inline-error">{updateTransaction.error.message}</p>}
    </form>
  );
}
