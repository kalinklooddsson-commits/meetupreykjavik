import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";
import { hasTrustedOrigin } from "@/lib/security/request";

/**
 * PATCH /api/profile
 *
 * Update the current user's profile.
 * Accepts partial profile updates (display_name, bio, etc.)
 * or structured sections from the venue profile editor.
 */
export async function PATCH(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
      const sections = body.sections as Array<{
        key: string;
        items: Array<{ label: string; value: string }>;
      }>;

      // Extract profile fields (bio lives on profiles table)
      const profileUpdate: Record<string, unknown> = {};
      // Extract venue fields (address, capacity, etc. live on venues table)
      const venueUpdate: Record<string, unknown> = {};

      for (const section of sections) {
        if (section.key === "general") {
          for (const item of section.items) {
            if (item.label === "Public summary") profileUpdate.bio = item.value;
            if (item.label === "Address") venueUpdate.address = item.value;
            if (item.label === "Capacity") {
              const capMatch = item.value.match(/^(\d+)/);
              if (capMatch) venueUpdate.capacity_standing = parseInt(capMatch[1], 10);
            }
          }
        }
        if (section.key === "amenities") {
          // Amenities come as items with label = amenity name
          venueUpdate.amenities = section.items
            .map((item) => item.label || item.value)
            .filter(Boolean);
        }
        if (section.key === "hours") {
          const hours: Record<string, string> = {};
          for (const item of section.items) {
            hours[item.label] = item.value;
          }
          venueUpdate.opening_hours = hours;
        }
        if (section.key === "socials") {
          const links: Record<string, string> = {};
          for (const item of section.items) {
            const key = item.label.toLowerCase();
            if (key === "website") venueUpdate.website = item.value;
            else if (key === "booking phone" || key === "phone") venueUpdate.phone = item.value;
            else links[key] = item.value;
          }
          if (Object.keys(links).length > 0) venueUpdate.social_links = links;
        }
      }

      // Save profile fields
      if (Object.keys(profileUpdate).length > 0) {
        await db.from("profiles").update(profileUpdate).eq("id", session.id);
      }

      // Save venue fields — find the venue by owner_id, then fall back to slug
      if (Object.keys(venueUpdate).length > 0) {
        // First try to find which venue this user owns
        const { data: ownedVenue } = await db
          .from("venues")
          .select("id")
          .eq("owner_id", session.id)
          .maybeSingle();

        if (ownedVenue) {
          await db.from("venues").update(venueUpdate).eq("id", ownedVenue.id);
        } else if (session.slug) {
          // Fallback: match by slug (for seed/demo accounts where owner_id may not match)
          await db.from("venues").update(venueUpdate).eq("slug", session.slug);
        }
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
