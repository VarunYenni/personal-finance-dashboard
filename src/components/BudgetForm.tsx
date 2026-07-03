import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateBudget } from "../data/queries";
import type { Category } from "../types/finance";
import { monthKey } from "../lib/format";

const schema = z.object({
  month: z.string().min(7),
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  alertThreshold: z.coerce.number().min(1).max(100)
});

type FormValues = z.infer<typeof schema>;

export function BudgetForm({ categories }: { categories: Category[] }) {
  const createBudget = useCreateBudget();
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: monthKey(),
      categoryId: expenseCategories[0]?.id ?? "",
      amount: 10000,
      alertThreshold: 80
    }
  });

  async function onSubmit(values: FormValues) {
    await createBudget.mutateAsync(values);
    reset({ ...values, amount: 10000 });
  }

  return (
    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
      <label>Month<input type="month" {...register("month")} /></label>
      <label>Category<select {...register("categoryId")}>
        {!expenseCategories.length && <option value="">No expense categories</option>}
        {expenseCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
      </select></label>
      <label>Budget amount<input type="number" {...register("amount")} /></label>
      <label>Alert at %<input type="number" min={1} max={100} {...register("alertThreshold")} /></label>
      <button className="primary-button" type="submit" disabled={formState.isSubmitting || createBudget.isPending || !expenseCategories.length}>
        <Plus size={16} /> {createBudget.isPending ? "Saving" : "Save budget"}
      </button>
      {createBudget.isError && <p className="inline-error">{createBudget.error.message}</p>}
    </form>
  );
}
