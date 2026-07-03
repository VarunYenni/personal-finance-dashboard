import { zodResolver } from "@hookform/resolvers/zod";
import { Repeat2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateRecurringTransaction } from "../data/queries";
import type { Account, Category, PaymentMethod } from "../types/finance";

const schema = z.object({
  name: z.string().min(2),
  merchant: z.string().min(2),
  amount: z.coerce.number().positive(),
  kind: z.enum(["income", "expense", "investment"]),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
  paymentMethod: z.enum(["upi", "cash", "bank_transfer", "debit_card", "credit_card", "cheque", "wallet"]),
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  nextRunDate: z.string().min(10)
});

type FormValues = z.infer<typeof schema>;

export function RecurringForm({ categories, accounts }: { categories: Category[]; accounts: Account[] }) {
  const createRecurring = useCreateRecurringTransaction();
  const filteredCategories = categories.filter((category) => category.type !== "transfer");
  const activeAccounts = accounts.filter((account) => account.status === "active");
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      merchant: "",
      amount: 1000,
      kind: "expense",
      categoryId: filteredCategories[0]?.id ?? "",
      accountId: activeAccounts[0]?.id ?? "",
      paymentMethod: "bank_transfer" as PaymentMethod,
      frequency: "monthly",
      nextRunDate: new Date().toISOString().slice(0, 10)
    }
  });

  async function onSubmit(values: FormValues) {
    await createRecurring.mutateAsync(values);
    reset();
  }

  return (
    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
      <label><Repeat2 size={16} /> Name<input placeholder="Rent" {...register("name")} /></label>
      <label>Merchant<input placeholder="Landlord" {...register("merchant")} /></label>
      <label>Amount<input type="number" {...register("amount")} /></label>
      <label>Type<select {...register("kind")}><option value="expense">Expense</option><option value="income">Income</option><option value="investment">Investment</option></select></label>
      <label>Category<select {...register("categoryId")}>{filteredCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <label>Account<select {...register("accountId")}>{activeAccounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>
      <label>Frequency<select {...register("frequency")}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></label>
      <label>Next date<input type="date" {...register("nextRunDate")} /></label>
      <input type="hidden" {...register("paymentMethod")} />
      <button className="primary-button" type="submit" disabled={formState.isSubmitting || createRecurring.isPending || !activeAccounts.length || !filteredCategories.length}>
        <Repeat2 size={16} /> {createRecurring.isPending ? "Saving" : "Add recurring"}
      </button>
      {createRecurring.isError && <p className="inline-error">{createRecurring.error.message}</p>}
    </form>
  );
}
