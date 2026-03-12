import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];

export async function createTransaction(transaction: TransactionInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...transaction, status: "completed" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user transactions:", error);
    return [];
  }

  return data ?? [];
}

interface GetPlatformRevenueOptions {
  from?: string;
  to?: string;
}

export async function getPlatformRevenue(
  period?: GetPlatformRevenueOptions,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { total_isk: 0 };

  let query = supabase
    .from("transactions")
    .select("amount_isk")
    .eq("status", "completed");

  if (period?.from) {
    query = query.gte("created_at", period.from);
  }
  if (period?.to) {
    query = query.lte("created_at", period.to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch platform revenue:", error);
    return { total_isk: 0 };
  }

  const total_isk = (data ?? []).reduce(
    (sum, row) => sum + (row.amount_isk ?? 0),
    0,
  );

  return { total_isk };
}
