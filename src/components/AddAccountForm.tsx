import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateAccount } from "../data/queries";

const schema = z.object({
  name: z.string().min(2),
  institution: z.string().min(2),
  type: z.enum(["checking", "savings", "cash", "investment"]),
  openingBalance: z.coerce.number(),
  currency: z.string().min(3).max(3)
});

type FormValues = z.infer<typeof schema>;

export function AddAccountForm() {
  const createAccount = useCreateAccount();
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      institution: "",
      type: "checking",
      openingBalance: 0,
      currency: "INR"
    }
  });

  async function onSubmit(values: FormValues) {
    await createAccount.mutateAsync(values);
    reset();
  }

  return (
    <form className="account-form" onSubmit={handleSubmit(onSubmit)}>
      <label><Landmark size={16} /> Name<input placeholder="ICICI Salary" {...register("name")} /></label>
      <label>Institution<input placeholder="ICICI Bank" {...register("institution")} /></label>
      <label>Type<select {...register("type")}>
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
        <option value="cash">Cash</option>
        <option value="investment">Investment</option>
      </select></label>
      <label>Opening balance<input type="number" placeholder="0" {...register("openingBalance")} /></label>
      <label>Currency<input placeholder="INR" {...register("currency")} /></label>
      <button className="primary-button" type="submit" disabled={formState.isSubmitting || createAccount.isPending}>
        <Plus size={16} /> {createAccount.isPending ? "Saving" : "Add account"}
      </button>
      {createAccount.isError && <p className="inline-error">{createAccount.error.message}</p>}
    </form>
  );
}
