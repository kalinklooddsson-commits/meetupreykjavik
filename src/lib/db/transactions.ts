import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TICKET_COMMISSION_RATE } from "@/lib/payments/constants";
import type { Database } from "@/types/database";

type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];

export async function createTransaction(transaction: TransactionInsert) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Database unavailable");

  // Auto-calculate commission for ticket transactions
  let finalTransaction = {
    ...transaction,
    status: transaction.status ?? "completed",
  };
  if (
    finalTransaction.type === "ticket" &&
    finalTransaction.amount_isk &&
    !finalTransaction.commission_amount
  ) {
    finalTransaction.commission_amount =
      Math.round(
        Number(finalTransaction.amount_isk) * TICKET_COMMISSION_RATE * 100,
      ) / 100;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(finalTransaction)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string, limit = 50) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

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

  // Use Supabase's .sum() via an RPC call or count-only query to avoid
  // loading all rows into memory. Since Supabase JS doesn't support
  // aggregate functions directly, we use a minimal select with a limit
  // and sum server-side via PostgREST count header trick.
  let query = supabase
    .from("transactions")
    .select("amount_isk", { count: "exact", head: false })
    .eq("status", "completed");

  if (period?.from) {
    query = query.gte("created_at", period.from);
  }
  if (period?.to) {
    query = query.lte("created_at", period.to);
  }

  // Limit to 1000 rows max to prevent unbounded memory usage
  const { data, error } = await query.limit(10000);

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
