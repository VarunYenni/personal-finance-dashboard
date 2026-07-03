import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCreditCard } from "../data/queries";

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

export function AddCreditCardForm() {
  const createCard = useCreateCreditCard();
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      institution: "",
      creditLimit: 100000,
      outstandingAmount: 0,
      statementDate: 1,
      dueDate: new Date().toISOString().slice(0, 10),
      annualFee: 0,
      rewardRate: 0
    }
  });

  async function onSubmit(values: FormValues) {
    await createCard.mutateAsync(values);
    reset();
  }

  return (
    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
      <label><CreditCard size={16} /> Card name<input placeholder="HDFC Infinia" {...register("name")} /></label>
      <label>Issuer<input placeholder="HDFC Bank" {...register("institution")} /></label>
      <label>Credit limit<input type="number" placeholder="500000" {...register("creditLimit")} /></label>
      <label>Outstanding<input type="number" placeholder="0" {...register("outstandingAmount")} /></label>
      <label>Statement day<input type="number" min={1} max={31} {...register("statementDate")} /></label>
      <label>Due date<input type="date" {...register("dueDate")} /></label>
      <label>Annual fee<input type="number" placeholder="0" {...register("annualFee")} /></label>
      <label>Reward rate<input type="number" step="0.1" placeholder="0" {...register("rewardRate")} /></label>
      <button className="primary-button" type="submit" disabled={formState.isSubmitting || createCard.isPending}>
        <Plus size={16} /> {createCard.isPending ? "Saving" : "Add card"}
      </button>
      {createCard.isError && <p className="inline-error">{createCard.error.message}</p>}
    </form>
  );
}
