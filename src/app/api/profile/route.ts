import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * PATCH /api/profile
 *
 * Update the current user's profile.
 * Accepts partial profile updates (display_name, bio, etc.)
 * or structured sections from the venue profile editor.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // If body contains "sections", it's a structured venue profile update
    if (body.sections) {
      // Extract relevant fields from sections for the profiles table
      const sections = body.sections as Array<{
        key: string;
        items: Array<{ label: string; value: string }>;
      }>;

      const update: Record<string, unknown> = {};
      for (const section of sections) {
        if (section.key === "general") {
          for (const item of section.items) {
            if (item.label === "Public summary") update.bio = item.value;
          }
        }
      }

      if (Object.keys(update).length > 0) {
        await db.from("profiles").update(update).eq("id", session.id);
      }

      return NextResponse.json({ ok: true });
    }

    // Standard profile field updates
    // Profiles columns: display_name, bio, avatar_url, slug, city, languages,
    // interests, locale, age_range (no location, no social_links)
    const allowedFields = [
      "display_name", "bio", "avatar_url", "slug",
      "city", "languages", "interests", "locale", "age_range",
    ];
    // Accept camelCase aliases from frontend forms
    const camelToSnake: Record<string, string> = {
      displayName: "display_name",
      avatarUrl: "avatar_url",
      ageRange: "age_range",
    };
    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        update[field] = body[field];
      }
    }
    // Map camelCase keys to snake_case DB columns
    for (const [camel, snake] of Object.entries(camelToSnake)) {
      if (camel in body && !(snake in update)) {
        update[snake] = body[camel];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error } = await db
      .from("profiles")
      .update(update)
      .eq("id", session.id);

    if (error) {
      console.error("Profile update failed:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
