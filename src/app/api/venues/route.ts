import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/guards";

/**
 * POST /api/venues
 *
 * Submit a new venue application (from onboarding wizard).
 * Creates venue with "pending" status for admin review.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, legal_name, kennitala, type, description, address, city,
      capacity_seated, capacity_standing, capacity_total,
      amenities, phone, email, website, opening_hours, partnership_tier,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Venue name is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data, error } = await db.from("venues").insert({
      name,
      slug,
      legal_name: legal_name ?? null,
      kennitala: kennitala ?? null,
      type: type ?? null,
      description: description ?? null,
      address: address ?? null,
      city: city ?? "Reykjavik",
      capacity_seated: capacity_seated ?? null,
      capacity_standing: capacity_standing ?? null,
      capacity_total: capacity_total ?? null,
      amenities: amenities ?? [],
      phone: phone ?? null,
      email: email ?? null,
      website: website ?? null,
      opening_hours: opening_hours ?? null,
      partnership_tier: partnership_tier ?? "free",
      owner_id: session.id,
      status: "pending",
    }).select("id, slug").single();

    if (error) {
      console.error("Venue creation failed:", error);
      return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
    }

    // Update user's account type to venue if they're a regular user
    if (session.accountType === "user") {
      await db.from("profiles").update({ account_type: "venue" }).eq("id", session.id);
    }

    return NextResponse.json({ ok: true, slug: data?.slug });
  } catch (error) {
    console.error("Venue creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
