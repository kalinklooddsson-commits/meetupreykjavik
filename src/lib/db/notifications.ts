import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

export async function getUserNotifications(userId: string, limit = 20) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch user notifications:", error);
    return [];
  }

  return data ?? [];
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  // Use admin client — notifications table may restrict updates via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Notification not found or not yours.");
  return data;
}

export async function createNotification(notification: NotificationInsert) {
  // Use admin client — notifications table may restrict inserts via RLS
  const supabase = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!supabase) throw new Error("Database unavailable");

  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}
