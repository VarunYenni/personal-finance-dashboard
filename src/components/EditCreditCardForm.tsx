import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateCreditCard } from "../data/queries";
import type { Card } from "../types/finance";

const schema = z.object({
  name: z.string().min(2),
  institution: z.string().min(2),
  creditLimit: z.coerce.number().positive(),
  outstandingAmount: z.coerce.number().min(0),
  statementDate: z.coerce.number().int().min(1).max(31),
  dueDate: z.string().min(10),
  annualFee: z.coerce.number().min(0),
  rewardRate: z.coerce.number().min(0)
});

type FormValues = z.infer<typeof schema>;

export function EditCreditCardForm({ card, onDone }: { card: Card; onDone: () => void }) {
  const updateCard = useUpdateCreditCard();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: card.name,
      institution: card.institution,
      creditLimit: card.creditLimit,
      outstandingAmount: card.outstandingAmount,
      statementDate: card.statementDate,
      dueDate: card.dueDate,
      annualFee: card.annualFee,
      rewardRate: card.rewardRate
    }
  });

  async function onSubmit(values: FormValues) {
    await updateCard.mutateAsync({ ...values, id: card.id, accountId: card.accountId });
    onDone();
  }

  return (
    <form className="inline-edit-form stacked" onSubmit={handleSubmit(onSubmit)}>
      <input aria-label="Card name" {...register("name")} />
      <input aria-label="Institution" {...register("institution")} />
      <input aria-label="Credit limit" type="number" {...register("creditLimit")} />
      <input aria-label="Outstanding" type="number" {...register("outstandingAmount")} />
      <input aria-label="Statement day" type="number" min={1} max={31} {...register("statementDate")} />
      <input aria-label="Due date" type="date" {...register("dueDate")} />
      <input aria-label="Annual fee" type="number" {...register("annualFee")} />
      <input aria-label="Reward rate" type="number" step="0.1" {...register("rewardRate")} />
      <button className="primary-button" disabled={formState.isSubmitting || updateCard.isPending} type="submit"><Save size={16} /> Save</button>
      <button className="ghost-button" type="button" onClick={onDone}>Cancel</button>
      {updateCard.isError && <p className="inline-error">{updateCard.error.message}</p>}
    </form>
  );
}
