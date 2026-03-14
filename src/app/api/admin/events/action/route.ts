import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/guards";
import type { EventStatus } from "@/types/domain";

export async function POST(request: NextRequest) {
  const session = await getUser();
  if (!session || session.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key, action } = (await request.json()) as { key: string; action: string };
  if (!key || !action) {
    return NextResponse.json({ error: "Missing key or action" }, { status: 400 });
  }

  const db = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  if (action === "featured") {
    const { error } = await db
      .from("events")
      .update({ is_featured: true })
      .eq("id", key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "featured" });
  }

  const statusMap: Record<string, EventStatus> = {
    published: "published",
    cancelled: "cancelled",
    completed: "completed",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const { error } = await db
    .from("events")
    .update({ status: newStatus })
    .eq("id", key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
