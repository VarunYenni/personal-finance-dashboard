import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Category, Account } from "../types/finance";

const schema = z.object({
  merchant: z.string().min(2),
  amount: z.coerce.number().positive(),
  kind: z.enum(["income", "expense", "investment"]),
  categoryId: z.string().min(1),
  accountId: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

interface QuickAddTransactionProps {
  categories: Category[];
  accounts: Account[];
}

export function QuickAddTransaction({ categories, accounts }: QuickAddTransactionProps) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind: "expense", categoryId: categories[0]?.id, accountId: accounts[0]?.id }
  });

  function onSubmit(values: FormValues) {
    console.info("Ready to persist transaction", values);
    reset();
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit(onSubmit)}>
      <input aria-label="Merchant" placeholder="Merchant" {...register("merchant")} />
      <input aria-label="Amount" placeholder="Amount" type="number" {...register("amount")} />
      <select aria-label="Kind" {...register("kind")}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="investment">Investment</option>
      </select>
      <select aria-label="Category" {...register("categoryId")}>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select aria-label="Account" {...register("accountId")}>
        {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
      </select>
      <button className="primary-button" type="submit" disabled={formState.isSubmitting}>
        <Plus size={16} /> Add
      </button>
    </form>
  );
}
