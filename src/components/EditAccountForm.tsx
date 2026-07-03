import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateAccount } from "../data/queries";
import type { Account } from "../types/finance";

const schema = z.object({
  name: z.string().min(2),
  institution: z.string().min(2),
  currentBalance: z.coerce.number(),
  status: z.enum(["active", "archived"]),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function EditAccountForm({ account, onDone }: { account: Account; onDone: () => void }) {
  const updateAccount = useUpdateAccount();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: account.name,
      institution: account.institution,
      currentBalance: account.currentBalance,
      status: account.status,
      notes: account.notes ?? ""
    }
  });

  async function onSubmit(values: FormValues) {
    await updateAccount.mutateAsync({ ...values, id: account.id });
    onDone();
  }

  return (
    <form className="inline-edit-form stacked" onSubmit={handleSubmit(onSubmit)}>
      <input aria-label="Name" {...register("name")} />
      <input aria-label="Institution" {...register("institution")} />
      <input aria-label="Current balance" type="number" {...register("currentBalance")} />
      <select aria-label="Status" {...register("status")}><option value="active">Active</option><option value="archived">Archived</option></select>
      <input aria-label="Notes" placeholder="Notes" {...register("notes")} />
      <button className="primary-button" disabled={formState.isSubmitting || updateAccount.isPending} type="submit"><Save size={16} /> Save</button>
      <button className="ghost-button" type="button" onClick={onDone}>Cancel</button>
      {updateAccount.isError && <p className="inline-error">{updateAccount.error.message}</p>}
    </form>
  );
}
