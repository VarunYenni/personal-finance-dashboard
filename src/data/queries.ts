import { useQuery } from "@tanstack/react-query";
import { demoData } from "./demoData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { FinanceSnapshot } from "../types/finance";

export function useFinanceSnapshot() {
  return useQuery({
    queryKey: ["finance-snapshot"],
    queryFn: async (): Promise<FinanceSnapshot> => {
      if (!isSupabaseConfigured || !supabase) return demoData;

      const [accounts, cards, categories, transactions, budgets, investments, recurringTransactions, merchants, rules] = await Promise.all([
        supabase.from("accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("cards").select("*"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("transactions").select("*").order("date", { ascending: false }).limit(100),
        supabase.from("budgets").select("*"),
        supabase.from("investments").select("*"),
        supabase.from("recurring_transactions").select("*"),
        supabase.from("merchants").select("*"),
        supabase.from("rules").select("*")
      ]);

      const failed = [accounts, cards, categories, transactions, budgets, investments, recurringTransactions, merchants, rules].find((result) => result.error);
      if (failed?.error) throw failed.error;

      return {
        accounts: demoData.accounts,
        cards: demoData.cards,
        categories: demoData.categories,
        transactions: demoData.transactions,
        budgets: demoData.budgets,
        investments: demoData.investments,
        recurringTransactions: demoData.recurringTransactions,
        merchants: demoData.merchants,
        rules: demoData.rules
      };
    },
    staleTime: 60_000
  });
}
