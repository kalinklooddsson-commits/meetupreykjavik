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
      // No DB — settings saved client-side only
      return NextResponse.json({ ok: true, offline: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Store settings as JSON in the profile's settings column
    // First fetch existing settings
    const { data: profile } = await db
      .from("profiles")
      .select("settings")
      .eq("id", session.id)
      .maybeSingle();

    const existingSettings = (profile?.settings as Record<string, unknown>) ?? {};
    const updatedSettings = {
      ...existingSettings,
      [section]: values,
    };

    const { error } = await db
      .from("profiles")
      .update({ settings: updatedSettings })
      .eq("id", session.id);

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
