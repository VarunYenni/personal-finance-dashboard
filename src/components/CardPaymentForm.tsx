import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCardPayment } from "../data/queries";
import type { Account, Card, Category } from "../types/finance";

const schema = z.object({
  cardId: z.string().min(1),
  sourceAccountId: z.string().min(1),
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(10)
});

type FormValues = z.infer<typeof schema>;

export function CardPaymentForm({ cards, accounts, categories }: { cards: Card[]; accounts: Account[]; categories: Category[] }) {
  const createPayment = useCreateCardPayment();
  const sourceAccounts = accounts.filter((account) => account.status === "active" && account.type !== "credit_card" && account.type !== "investment");
  const fallbackCategory = categories.find((category) => category.name === "Miscellaneous") ?? categories.find((category) => category.type === "expense") ?? categories[0];
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cardId: cards[0]?.id ?? "",
      sourceAccountId: sourceAccounts[0]?.id ?? "",
      categoryId: fallbackCategory?.id ?? "",
      amount: 1000,
      date: new Date().toISOString().slice(0, 10)
    }
  });

  async function onSubmit(values: FormValues) {
    await createPayment.mutateAsync(values);
    reset({ ...values, amount: 1000 });
  }

  return (
    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
      <label><CreditCard size={16} /> Card<select {...register("cardId")}>{cards.map((card) => <option value={card.id} key={card.id}>{card.name}</option>)}</select></label>
      <label>Pay from<select {...register("sourceAccountId")}>{sourceAccounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>
      <label>Amount<input type="number" {...register("amount")} /></label>
      <label>Date<input type="date" {...register("date")} /></label>
      <input type="hidden" {...register("categoryId")} />
      <button className="primary-button" type="submit" disabled={formState.isSubmitting || createPayment.isPending || !cards.length || !sourceAccounts.length || !fallbackCategory}>
        <CreditCard size={16} /> {createPayment.isPending ? "Recording" : "Record payment"}
      </button>
      {createPayment.isError && <p className="inline-error">{createPayment.error.message}</p>}
    </form>
  );
}
