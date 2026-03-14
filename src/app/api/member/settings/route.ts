import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * PATCH /api/member/settings
 *
 * Update member notification and preference settings.
 * Accepts { section: string, values: Record<string, boolean | string> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { section, values } = body as {
      section: string;
      values: Record<string, boolean | string>;
    };

    if (!section || !values) {
      return NextResponse.json({ error: "Missing section or values" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // The profiles table does not have a "settings" jsonb column yet.
    // Store per-user settings in platform_settings keyed by user ID.
    const settingsKey = `user_settings:${session.id}`;
    const { data: existing } = await db
      .from("platform_settings")
      .select("value")
      .eq("key", settingsKey)
      .maybeSingle();

    const existingSettings = (existing?.value as Record<string, unknown>) ?? {};
    const updatedSettings = {
      ...existingSettings,
      [section]: values,
    };

    const { error } = await db
      .from("platform_settings")
      .upsert(
        { key: settingsKey, value: updatedSettings, updated_by: session.id },
        { onConflict: "key" },
      );

    if (error) {
      console.error("Member settings update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Member settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
