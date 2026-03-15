import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/guards";
import type { GroupStatus } from "@/types/domain";

export async function POST(request: NextRequest) {
  const session = await getUser();
  if (!session || session.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: { key: string; action: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid or missing JSON body" }, { status: 400 });
  }
  const { key, action } = body;
  if (!key || !action) {
    return NextResponse.json({ error: "Missing key or action" }, { status: 400 });
  }

  const db = createSupabaseAdminClient() as Awaited<ReturnType<typeof createSupabaseServerClient>>;
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const statusMap: Record<string, GroupStatus> = {
    approved: "active",
    rejected: "archived",
    archived: "archived",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const { error } = await db
    .from("groups")
    .update({ status: newStatus })
    .eq("id", key);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
