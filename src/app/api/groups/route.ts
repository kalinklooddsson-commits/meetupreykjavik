import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";
import { hasTrustedOrigin } from "@/lib/security/request";

/**
 * POST /api/groups
 *
 * Create a new group (organizer submits for admin review).
 */
export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
    if (session.accountType !== "organizer" && session.accountType !== "admin") {
      return NextResponse.json({ error: "Only organizers and admins can create groups" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, visibility, join_mode, tags, banner_url } = body;

    if (!name) {
      return NextResponse.json({
        error: "Validation failed",
        details: { formErrors: ["Group name is required"] },
      }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for existing slug and append suffix if needed
    const { data: existingSlug } = await db
      .from("groups")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (existingSlug) {
      const suffix = Date.now().toString(36).slice(-4);
      slug = `${slug}-${suffix}`;
    }

    const { error } = await db.from("groups").insert({
      name,
      slug,
      description: description ?? null,
      visibility: visibility ?? "public",
      join_mode: join_mode ?? "open",
      tags: tags ?? [],
      banner_url: banner_url ?? null,
      organizer_id: session.id,
      status: "pending",
    });

    if (error) {
      console.error("Group creation failed:", error);
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
