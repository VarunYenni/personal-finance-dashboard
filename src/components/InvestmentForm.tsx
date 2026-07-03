import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpsertInvestment } from "../data/queries";
import type { Investment } from "../types/finance";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["stocks", "mutual_funds", "gold", "ppf", "nps", "fd", "espp", "crypto"]),
  investmentAmount: z.coerce.number().min(0),
  currentValue: z.coerce.number().min(0)
});

type FormValues = z.infer<typeof schema>;

export function InvestmentForm({ investment, onDone }: { investment?: Investment; onDone?: () => void }) {
  const upsertInvestment = useUpsertInvestment();
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: investment?.name ?? "",
      type: investment?.type ?? "mutual_funds",
      investmentAmount: investment?.investmentAmount ?? 0,
      currentValue: investment?.currentValue ?? 0
    }
  });

  async function onSubmit(values: FormValues) {
    await upsertInvestment.mutateAsync({ ...values, id: investment?.id });
    if (investment) onDone?.();
    else reset();
  }

  return (
    <form className={investment ? "inline-edit-form stacked" : "account-form"} onSubmit={handleSubmit(onSubmit)}>
      <label>Name<input placeholder="Index Mutual Fund" {...register("name")} /></label>
      <label>Type<select {...register("type")}><option value="stocks">Stocks</option><option value="mutual_funds">Mutual funds</option><option value="gold">Gold</option><option value="ppf">PPF</option><option value="nps">NPS</option><option value="fd">FD</option><option value="espp">ESPP</option><option value="crypto">Crypto</option></select></label>
      <label>Invested<input type="number" {...register("investmentAmount")} /></label>
      <label>Current value<input type="number" {...register("currentValue")} /></label>
      <button className="primary-button" disabled={formState.isSubmitting || upsertInvestment.isPending} type="submit">{investment ? <Save size={16} /> : <Plus size={16} />} {investment ? "Save" : "Add investment"}</button>
      {investment && <button className="ghost-button" type="button" onClick={onDone}>Cancel</button>}
      {upsertInvestment.isError && <p className="inline-error">{upsertInvestment.error.message}</p>}
    </form>
  );
}
