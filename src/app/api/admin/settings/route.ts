import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * PATCH /api/admin/settings
 *
 * Admin-only: update platform settings.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session || session.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    // Support both { key, value } and { sectionKey, items } from admin settings UI
    const key = (body.key as string) ?? (body.sectionKey as string) ?? "";
    const value = body.value ?? body.items ?? null;

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Upsert into platform_settings
    // value column is JSONB — Supabase serializes automatically, no JSON.stringify needed
    const { error } = await db
      .from("platform_settings")
      .upsert({ key, value, updated_by: session.id }, { onConflict: "key" });

    if (error) {
      console.error("Settings update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
