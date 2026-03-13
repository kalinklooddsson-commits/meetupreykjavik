/**
 * Supabase seed script
 * Run: npx tsx supabase/seed.ts
 *
 * Creates auth users, profiles, categories, venues, groups, events,
 * RSVPs, notifications, messages, transactions, bookings, and reviews.
 *
 * Uses the service_role key to bypass RLS.
 */

import { createClient } from "@supabase/supabase-js";

/* ── env ─────────────────────────────────────────────────────── */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.local values or export them before running this script.",
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ── helpers ─────────────────────────────────────────────────── */

let _userCache: { id: string; email?: string }[] | null = null;

async function upsertUser(
  email: string,
  password: string,
): Promise<string> {
  if (!_userCache) {
    const { data } = await sb.auth.admin.listUsers();
    _userCache = data?.users ?? [];
  }
  const found = _userCache.find((u) => u.email === email);
  if (found) return found.id;

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);
  _userCache.push(data.user);
  return data.user.id;
}

/** Look up existing row by slug, return its id or null */
async function existingId(table: string, slugVal: string): Promise<string | null> {
  const { data } = await sb.from(table).select("id").eq("slug", slugVal).maybeSingle();
  return data?.id ?? null;
}

/** Get or create: returns the existing id if found by slug, otherwise uses the provided id */
async function resolveId(table: string, slugVal: string, fallbackId: string): Promise<string> {
  const existing = await existingId(table, slugVal);
  return existing ?? fallbackId;
}

function deterministicUuid(namespace: string): string {
  let hash = 0;
  for (let i = 0; i < namespace.length; i++) {
    hash = ((hash << 5) - hash + namespace.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const full = (hex + hex + hex + hex).slice(0, 32);
  return [
    full.slice(0, 8),
    full.slice(8, 12),
    "4" + full.slice(13, 16),
    "8" + full.slice(17, 20),
    full.slice(20, 32),
  ].join("-");
}

/* ── main seed ───────────────────────────────────────────────── */

async function seed() {
  console.log("🌱 Starting seed...\n");

  /* ── 1. Create auth users ──────────────────────────────────── */
  console.log("Creating auth users...");

  const users = {
    admin: {
      email: "admin@meetupreykjavik.is",
      password: "Admin123!",
      name: "Platform Admin",
      slug: "admin",
      accountType: "admin" as const,
    },
    kari: {
      email: "kari@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Kari Sigurdsson",
      slug: "kari-sigurdsson",
      accountType: "organizer" as const,
    },
    helga: {
      email: "helga@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Helga Arnadottir",
      slug: "helga-arnadottir",
      accountType: "organizer" as const,
    },
    bjorn: {
      email: "bjorn@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Bjorn Olafsson",
      slug: "bjorn-olafsson",
      accountType: "organizer" as const,
    },
    elin: {
      email: "elin@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Elin Thors",
      slug: "elin-thors",
      accountType: "organizer" as const,
    },
    sara: {
      email: "sara@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Sara Magnusdottir",
      slug: "sara-magnusdottir",
      accountType: "organizer" as const,
    },
    marta: {
      email: "marta@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Marta Polak",
      slug: "marta-polak",
      accountType: "organizer" as const,
    },
    pierre: {
      email: "pierre@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Pierre Dupont",
      slug: "pierre-dupont",
      accountType: "organizer" as const,
    },
    johanna: {
      email: "johanna@meetupreykjavik.is",
      password: "Organizer123!",
      name: "Johanna Petursdottir",
      slug: "johanna-petursdottir",
      accountType: "organizer" as const,
    },
    venueLebowski: {
      email: "lebowski@meetupreykjavik.is",
      password: "Venue123!",
      name: "Lebowski Bar",
      slug: "lebowski-bar-owner",
      accountType: "venue" as const,
    },
    venueKex: {
      email: "kex@meetupreykjavik.is",
      password: "Venue123!",
      name: "Kex Hostel",
      slug: "kex-hostel-owner",
      accountType: "venue" as const,
    },
    venueGrandi: {
      email: "grandi@meetupreykjavik.is",
      password: "Venue123!",
      name: "Grandi Hub",
      slug: "grandi-hub-owner",
      accountType: "venue" as const,
    },
    member1: {
      email: "anna@example.com",
      password: "Member123!",
      name: "Anna Jonsdottir",
      slug: "anna-jonsdottir",
      accountType: "user" as const,
    },
    member2: {
      email: "jon@example.com",
      password: "Member123!",
      name: "Jon Magnusson",
      slug: "jon-magnusson",
      accountType: "user" as const,
    },
    member3: {
      email: "sofia@example.com",
      password: "Member123!",
      name: "Sofia Einarsdottir",
      slug: "sofia-einarsdottir",
      accountType: "user" as const,
    },
  };

  const userIds: Record<string, string> = {};
  for (const [key, u] of Object.entries(users)) {
    userIds[key] = await upsertUser(u.email, u.password);
    console.log(`  ✓ ${u.name} (${u.accountType}) → ${userIds[key]}`);
  }

  /* ── 2. Upsert profiles ───────────────────────────────────── */
  console.log("\nCreating profiles...");

  for (const [key, u] of Object.entries(users)) {
    // Check if profile already exists (by id or slug)
    const { data: existingById } = await sb.from("profiles").select("id").eq("id", userIds[key]).maybeSingle();
    const { data: existingBySlug } = await sb.from("profiles").select("id").eq("slug", u.slug).maybeSingle();

    if (existingById) {
      // Update existing profile
      const { error } = await sb.from("profiles").update({
        display_name: u.name,
        email: u.email,
        account_type: u.accountType,
        is_verified: true,
        languages: ["en", "is"],
      }).eq("id", userIds[key]);
      if (error) console.error(`  ✗ profile update ${u.name}: ${error.message}`);
      else console.log(`  ✓ ${u.name} (updated)`);
    } else if (existingBySlug) {
      // Slug exists with different user — skip to avoid conflict
      console.log(`  ⊘ ${u.name} (slug exists, skipping)`);
    } else {
      const { error } = await sb.from("profiles").insert({
        id: userIds[key],
        display_name: u.name,
        slug: u.slug,
        email: u.email,
        account_type: u.accountType,
        city: "Reykjavik",
        locale: "en",
        is_verified: true,
        languages: ["en", "is"],
      });
      if (error) console.error(`  ✗ profile ${u.name}: ${error.message}`);
      else console.log(`  ✓ ${u.name}`);
    }
  }

  /* ── 3. Categories ─────────────────────────────────────────── */
  console.log("\nCreating categories...");

  const cats = [
    { name_en: "Nightlife & Social", name_is: "Næturlíf og félagslíf", slug: "nightlife-social", letter: "N", bg: "coral", text: "white" },
    { name_en: "Outdoors & Hiking", name_is: "Útivist og göngur", slug: "outdoors-hiking", letter: "O", bg: "sage", text: "white" },
    { name_en: "Tech & Startups", name_is: "Tækni og sprotafyrirtæki", slug: "tech-startups", letter: "T", bg: "indigo", text: "white" },
    { name_en: "Music & Arts", name_is: "Tónlist og listir", slug: "music-arts", letter: "M", bg: "sand", text: "dark" },
    { name_en: "Food & Drink", name_is: "Matur og drykkur", slug: "food-drink", letter: "F", bg: "coral", text: "white" },
    { name_en: "Sports & Fitness", name_is: "Íþróttir og heilsa", slug: "sports-fitness", letter: "S", bg: "sage", text: "white" },
    { name_en: "Language Exchange", name_is: "Tungumálaskipti", slug: "language-exchange", letter: "L", bg: "indigo", text: "white" },
    { name_en: "Expat Community", name_is: "Útlendingasamfélag", slug: "expat-community", letter: "E", bg: "coral", text: "white" },
    { name_en: "Books & Culture", name_is: "Bækur og menning", slug: "books-culture", letter: "B", bg: "sand", text: "dark" },
    { name_en: "Professional", name_is: "Fagleg tengslanet", slug: "professional", letter: "P", bg: "indigo", text: "white" },
  ];

  const catIds: Record<string, string> = {};
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    const fallbackId = deterministicUuid(`cat-${c.slug}`);
    const id = await resolveId("categories", c.slug, fallbackId);
    catIds[c.slug] = id;

    const payload = {
      name_en: c.name_en,
      name_is: c.name_is,
      icon_letter: c.letter,
      bg_color: c.bg,
      text_color: c.text,
      sort_order: i,
      is_active: true,
    };

    if (id !== fallbackId) {
      // existing row — update it
      await sb.from("categories").update(payload).eq("id", id);
      console.log(`  ✓ ${c.name_en} (updated)`);
    } else {
      const { error } = await sb.from("categories").insert({ id, slug: c.slug, ...payload });
      if (error) console.error(`  ✗ cat ${c.name_en}: ${error.message}`);
      else console.log(`  ✓ ${c.name_en}`);
    }
  }

  /* ── 4. Venues ─────────────────────────────────────────────── */
  console.log("\nCreating venues...");

  const venueTypeMap: Record<string, string> = {
    "Bar & Grill": "bar",
    "Bar & Venue": "bar",
    "Bar & Social Space": "bar",
    "Craft Beer Bar": "bar",
    "Bar": "bar",
    "Bar & Restaurant": "restaurant",
    "Coworking": "coworking",
    "Wine Bar": "restaurant",
    "Restaurant & Bar": "restaurant",
    "Restaurant": "restaurant",
    "Live Music Cafe": "cafe",
    "Food Hall & Bar": "restaurant",
    "Historic Cafe": "cafe",
    "Coffee Shop": "cafe",
    "Café": "cafe",
  };

  const venueData = [
    {
      slug: "lebowski-bar", name: "Lebowski Bar", type: "Bar & Grill", area: "Laugavegur",
      address: "Laugavegur 20b, 101 Reykjavik", capacity: 120, rating: 4.7,
      ownerId: userIds.venueLebowski, tier: "premium" as const,
      lat: 64.1475, lng: -21.9256, amenities: ["Hosted meetup area", "Cocktail menu", "Late hours", "Group seating"],
      photo: "/place-images/reykjavik/venues/lebowski-bar.jpg",
      description: "A lively central venue that embraces a bold, retro theme on Laugavegur. Lebowski Bar offers dedicated group seating, a full cocktail menu, and late-night availability — making it ideal for social mixers, trivia nights, and casual networking events.",
    },
    {
      slug: "kex-hostel", name: "Kex Hostel", type: "Bar & Venue", area: "Skulagata",
      address: "Skulagata 28, 101 Reykjavik", capacity: 150, rating: 4.8,
      ownerId: userIds.venueKex, tier: "standard" as const,
      lat: 64.1499, lng: -21.9319, amenities: ["Arrival desk", "Food service", "Flexible tables", "Harbor access"],
      photo: "/place-images/reykjavik/venues/kex-hostel.jpg",
      description: "A flexible social venue with harbor views on Skulagata. Kex Hostel combines a spacious ground-floor bar with a mezzanine performance area, food service, and a welcoming atmosphere that suits everything from panel talks to live music nights.",
    },
    {
      slug: "grandi-hub", name: "Grandi Hub", type: "Coworking", area: "Grandi",
      address: "Grandagardur 16, 101 Reykjavik", capacity: 90, rating: 4.6,
      ownerId: userIds.venueGrandi, tier: "standard" as const,
      lat: 64.1562, lng: -21.9558, amenities: ["Projector", "Fast wifi", "Stage zone", "Coffee setup"],
      photo: "/place-images/reykjavik/venues/grandi-hub.jpg",
      description: "A practical venue for workshops, pitch nights, and tech meetups in the Grandi harbor district. Grandi Hub provides fast wifi, a projector, a stage zone, and a coffee setup — purpose-built for productive group events.",
    },
    {
      slug: "bryggjuhusid", name: "Bryggjuhusid", type: "Wine Bar", area: "Bankastraeti",
      address: "Bankastraeti 9, 101 Reykjavik", capacity: 40, rating: 4.9,
      ownerId: userIds.venueLebowski, tier: "premium" as const,
      amenities: ["Seated tasting", "Curated menu", "Premium service", "Quiet format"],
      photo: "/place-images/reykjavik/venues/apotek.jpg",
      description: "A premium small-format wine bar on Bankastraeti, perfect for curated tasting events and intimate gatherings. Bryggjuhusid offers seated tasting setups, a carefully curated menu, and a quiet, upscale atmosphere for groups of up to 40.",
    },
    {
      slug: "loft-hostel", name: "Loft Hostel", type: "Bar & Social Space", area: "Bankastraeti",
      address: "Bankastraeti 7a, 101 Reykjavik", capacity: 100, rating: 4.5,
      ownerId: userIds.venueKex, tier: "free" as const,
      lat: 64.1471, lng: -21.9331, amenities: ["Rooftop terrace", "Flexible ground floor", "Morning availability"],
      photo: "/place-images/reykjavik/venues/loft-hostel.jpg",
      description: "A central social space with a rooftop terrace overlooking the city. Loft Hostel offers a flexible ground floor for morning yoga sessions and afternoon meetups, plus a popular bar area for evening socials.",
    },
    {
      slug: "micro-bar", name: "Micro Bar", type: "Craft Beer Bar", area: "Vesturgata",
      address: "Vesturgata 2, 101 Reykjavik", capacity: 45, rating: 4.8,
      ownerId: userIds.venueKex, tier: "standard" as const,
      amenities: ["Rotating tap list", "Tasting boards", "Knowledgeable staff", "Intimate seating"],
      photo: "/place-images/reykjavik/venues/micro-bar.jpg",
      description: "An intimate craft beer bar on Vesturgata with rotating taps from Icelandic and international microbreweries. Micro Bar is ideal for tasting events and small-group socials, with knowledgeable staff and a cozy, unpretentious vibe.",
    },
    {
      slug: "hlemmur-square", name: "Hlemmur Square", type: "Food Hall & Bar", area: "Hlemmur",
      address: "Laugavegur 105, 105 Reykjavik", capacity: 200, rating: 4.4,
      ownerId: userIds.venueLebowski, tier: "premium" as const,
      lat: 64.1443, lng: -21.9148, amenities: ["Multiple food stalls", "Central bar", "High ceilings", "Stage area"],
      photo: "/place-images/reykjavik/venues/hlemmur-square.jpg",
      description: "A food hall and bar venue near Hlemmur with high ceilings, a central bar, and a stage area. Hlemmur Square works well for large-format events, food-themed meetups, and community gatherings with diverse catering options.",
    },
    {
      slug: "mokka", name: "Mokka Kaffi", type: "Historic Cafe", area: "Skólavörðustígur",
      address: "Skólavörðustígur 3a, 101 Reykjavik", capacity: 35, rating: 4.9,
      ownerId: userIds.venueGrandi, tier: "free" as const,
      amenities: ["Historic interior", "Strong coffee", "Quiet atmosphere", "Waffle menu"],
      photo: "/place-images/reykjavik/venues/mokka.jpg",
      description: "The oldest cafe in Reykjavik, Mokka Kaffi has been serving strong coffee and fresh waffles since 1958. Its historic interior and quiet atmosphere make it perfect for book clubs, language exchanges, and intimate morning meetups.",
    },
    {
      slug: "stofan-cafe", name: "Stofan Café", type: "Café", area: "Vesturgata",
      address: "Vesturgata 3, 101 Reykjavik", capacity: 50, rating: 4.7,
      ownerId: userIds.venueGrandi, tier: "free" as const,
      lat: 64.1483, lng: -21.9411, amenities: ["Cozy seating", "Coffee & cake", "Board games", "Quiet daytime"],
      photo: "/place-images/reykjavik/venues/stofan-cafe.jpg",
      description: "A cozy neighborhood cafe on Vesturgata with mismatched furniture, board games, and strong coffee. Stofan is a community favorite for daytime meetups, study groups, and relaxed weekend socials.",
    },
    {
      slug: "cafe-rosenberg", name: "Cafe Rosenberg", type: "Live Music Cafe", area: "Klapparstígur",
      address: "Klapparstígur 25-27, 101 Reykjavik", capacity: 60, rating: 4.7,
      ownerId: userIds.venueKex, tier: "standard" as const,
      amenities: ["Stage with sound system", "Candlelit tables", "Good acoustics", "Bar service"],
      photo: "/place-images/reykjavik/venues/cafe-rosenberg.jpg",
      description: "A live music cafe with warm acoustics and candlelit tables on Klapparstígur. Cafe Rosenberg hosts jazz nights, open mics, and acoustic sessions — a natural fit for music-centered meetups and intimate performance events.",
    },
    {
      slug: "snaps", name: "Snaps Bistro Bar", type: "Restaurant & Bar", area: "Þórsgata",
      address: "Þórsgata 1, 101 Reykjavik", capacity: 80, rating: 4.6,
      ownerId: userIds.venueLebowski, tier: "standard" as const,
      amenities: ["Communal tables", "Set menu option", "Wine pairing", "Private dining area"],
      photo: "/place-images/reykjavik/venues/hlemmur-square.jpg",
      description: "A neighborhood bistro with communal tables and a private dining area on Þórsgata. Snaps offers set menu options and wine pairing — great for dinner socials, foodie meetups, and small celebration events.",
    },
    {
      slug: "dillon", name: "Dillon", type: "Bar", area: "Laugavegur",
      address: "Laugavegur 30, 101 Reykjavik", capacity: 80, rating: 4.5,
      ownerId: userIds.venueKex, tier: "free" as const,
      amenities: ["Live music stage", "Late hours", "Affordable drinks", "Standing room"],
      photo: "/place-images/reykjavik/venues/dillon.jpg",
      description: "A no-frills rock bar on Laugavegur with a live music stage and late hours. Dillon is the go-to for casual evening meetups, music-focused socials, and groups that prefer an affordable, high-energy atmosphere.",
    },
  ];

  const venueIds: Record<string, string> = {};
  for (const v of venueData) {
    const fallbackId = deterministicUuid(`venue-${v.slug}`);
    const id = await resolveId("venues", v.slug, fallbackId);
    venueIds[v.slug] = id;
    const dbType = venueTypeMap[v.type] || "other";

    const payload = {
      owner_id: v.ownerId,
      name: v.name,
      type: dbType,
      description: v.description ?? `${v.name} — ${v.area}`,
      address: v.address,
      city: "Reykjavik",
      latitude: v.lat ?? null,
      longitude: v.lng ?? null,
      capacity_total: v.capacity,
      amenities: v.amenities,
      hero_photo_url: v.photo,
      photos: v.photo ? [v.photo] : [],
      partnership_tier: v.tier,
      is_verified: true,
      status: "active" as const,
      avg_rating: v.rating,
    };

    if (id !== fallbackId) {
      await sb.from("venues").update(payload).eq("id", id);
      console.log(`  ✓ ${v.name} (updated)`);
    } else {
      const { error } = await sb.from("venues").insert({ id, slug: v.slug, ...payload });
      if (error) console.error(`  ✗ venue ${v.name}: ${error.message}`);
      else console.log(`  ✓ ${v.name}`);
    }
  }

  /* ── 5. Groups ─────────────────────────────────────────────── */
  console.log("\nCreating groups...");

  const groupDescriptions: Record<string, string> = {
    "nightlife-reykjavik": "The city's largest social group for people who want to get out in the evening. We run hosted mixers, bar crawls, singles nights, and late-night socials across Reykjavik's best downtown venues. All events include a host, conversation starters, and a welcoming atmosphere for newcomers.",
    "reykjavik-hikers": "Weekend hikes and outdoor adventures around Reykjavik and the wider southwest. We organize group hikes to Mt. Esja, Reykjadalur hot springs, Glymur waterfall, and seasonal glacier walks. All fitness levels welcome — we match pace groups on every trip.",
    "tech-community-rvk": "Reykjavik's hub for developers, designers, founders, and tech-curious professionals. We host workshops, hackathons, pitch nights, and study groups covering everything from React to machine learning. Bring a laptop, meet collaborators, learn something new.",
    "creative-reykjavik": "A community for musicians, visual artists, writers, and anyone drawn to creative work. We run open mic nights, gallery visits, collaborative jam sessions, and creative writing meetups. The goal is connection through shared creative practice.",
    "reykjavik-foodies": "For people who love discovering Reykjavik's food scene together. We organize wine tastings, restaurant crawls, home cooking sessions, and seasonal food festivals. Every event is social first — the food is the conversation starter.",
    "expats-in-iceland": "The largest expat community in Iceland. Whether you just moved or have been here for years, this group helps you meet people, navigate local life, and build a social circle. We run welcome socials, cultural exchanges, and practical workshops.",
    "language-exchange-rvk": "Practice Icelandic, English, or any language in a relaxed social setting. Our Thursday exchanges pair native speakers with learners over coffee or beer. No textbooks, no pressure — just conversation and connection.",
    "wellness-reykjavik": "Morning yoga, group runs, meditation sessions, and wellness workshops in Reykjavik. We believe physical and mental wellbeing are social activities. Join us for community fitness events that are inclusive, encouraging, and never competitive.",
  };

  const groupData = [
    { slug: "nightlife-reykjavik", name: "Nightlife Reykjavik", catSlug: "nightlife-social", organizer: "kari", members: 389 },
    { slug: "reykjavik-hikers", name: "Reykjavik Hikers", catSlug: "outdoors-hiking", organizer: "helga", members: 284 },
    { slug: "tech-community-rvk", name: "Tech Community RVK", catSlug: "tech-startups", organizer: "bjorn", members: 198 },
    { slug: "creative-reykjavik", name: "Creative Reykjavik", catSlug: "music-arts", organizer: "elin", members: 203 },
    { slug: "reykjavik-foodies", name: "Reykjavik Foodies", catSlug: "food-drink", organizer: "sara", members: 167 },
    { slug: "expats-in-iceland", name: "Expats in Iceland", catSlug: "expat-community", organizer: "marta", members: 512 },
    { slug: "language-exchange-rvk", name: "Language Exchange RVK", catSlug: "language-exchange", organizer: "pierre", members: 231 },
    { slug: "wellness-reykjavik", name: "Wellness Reykjavik", catSlug: "sports-fitness", organizer: "johanna", members: 142 },
  ];

  const groupIds: Record<string, string> = {};
  for (const g of groupData) {
    const fallbackId = deterministicUuid(`group-${g.slug}`);
    const id = await resolveId("groups", g.slug, fallbackId);
    groupIds[g.slug] = id;

    const payload = {
      name: g.name,
      description: groupDescriptions[g.slug] ?? `${g.name} — community group in Reykjavik`,
      category_id: catIds[g.catSlug],
      organizer_id: userIds[g.organizer],
      member_count: g.members,
      status: "active" as const,
      is_featured: true,
      visibility: "public" as const,
      join_mode: "open" as const,
    };

    if (id !== fallbackId) {
      await sb.from("groups").update(payload).eq("id", id);
      console.log(`  ✓ ${g.name} (updated)`);
    } else {
      const { error } = await sb.from("groups").insert({ id, slug: g.slug, ...payload });
      if (error) console.error(`  ✗ group ${g.name}: ${error.message}`);
      else console.log(`  ✓ ${g.name}`);
    }
  }

  // Add members to groups
  const memberKeys = ["member1", "member2", "member3"];
  for (const gSlug of Object.keys(groupIds)) {
    for (const mk of memberKeys) {
      const memId = deterministicUuid(`gm-${gSlug}-${mk}`);
      await sb.from("group_members").upsert(
        {
          id: memId,
          group_id: groupIds[gSlug],
          user_id: userIds[mk],
          role: "member",
          status: "active",
        },
        { onConflict: "id" },
      );
    }
  }
  console.log("  ✓ Added 3 members to all groups");

  /* ── 6. Events ─────────────────────────────────────────────── */
  console.log("\nCreating events...");

  // Map category names to catIds
  const catNameMap: Record<string, string> = {
    Social: catIds["nightlife-social"],
    Outdoors: catIds["outdoors-hiking"],
    Tech: catIds["tech-startups"],
    Arts: catIds["music-arts"],
    Food: catIds["food-drink"],
    Sports: catIds["sports-fitness"],
    Expat: catIds["expat-community"],
    Language: catIds["language-exchange"],
  };

  const eventDescriptions: Record<string, string> = {
    "singles-night-25-35": "A warm, hosted social night with easy intros, small-group prompts, and a venue perk on arrival. Hosts open with simple conversation prompts, table rotations stay light, and the pace is relaxed enough for newcomers. The venue supports the night with a member deal and a dedicated arrival area.",
    "saturday-hike-mt-esja": "A guided group hike up Mt. Esja with pace groups for all fitness levels. We meet at the trailhead, warm up together, and split into groups. The summit group does the full ascent; the social group takes the scenic loop. Hot drinks and snacks at the top. Carpooling available from downtown.",
    "react-server-components-workshop": "A hands-on technical workshop covering React Server Components, streaming, and the Next.js App Router. Bring a laptop — we'll build a real feature together. Suitable for intermediate React developers. Coffee and wifi provided by the venue.",
    "wine-tasting-volcanic-terroir": "An intimate seated tasting exploring volcanic-region wines from Iceland, the Canary Islands, Sicily, and Santorini. Our sommelier guide walks through each pour with tasting notes and food pairing suggestions. Light bites included in the ticket price.",
    "speed-friending-newcomers": "A structured social event designed to help newcomers meet people quickly. Short conversation rounds with guided prompts, followed by a casual mixer. No pressure, no awkwardness — just a fast way to expand your circle in Reykjavik.",
    "harbor-jazz-social": "Live jazz by local musicians in a harbor-side venue. Arrive early for the best seats. The band plays two sets with a social break in between. Member deal on drinks. Casual dress, good vibes, and a chance to meet fellow music lovers.",
    "craft-beer-tasting-vesturgata": "A guided tasting of 6 Icelandic craft beers at Micro Bar, led by a knowledgeable beer enthusiast. Learn about the local brewing scene, taste seasonal releases, and compare styles. Snack plate included. Limited to 45 to keep it intimate.",
    "morning-yoga-flow": "A gentle morning yoga flow suitable for all levels. We meet at the venue, lay out mats, and move through 60 minutes of breathwork and movement. Mats provided if you don't have one. Stay for tea and conversation after class.",
    "startup-pitch-night": "Five early-stage founders pitch their ideas to a friendly audience of developers, designers, and investors. Each pitch is 5 minutes followed by 3 minutes of Q&A. Network over drinks after the pitches. Great for finding collaborators or just learning what's being built in Reykjavik.",
    "poetry-open-mic": "An open mic night for poets, spoken word artists, and anyone who wants to share something they've written. Sign up at the door for a 5-minute slot. Supportive crowd, candlelit atmosphere, and a drink deal for performers.",
    "language-exchange-thursday": "A free weekly language exchange where native speakers pair up with learners. Icelandic, English, Spanish, French, and more. No registration needed — just show up, grab a coffee, and start talking. Beginners very welcome.",
    "friday-dinner-social": "A seated dinner social at Snaps Bistro with a set 3-course menu. Tables of 6 are mixed so you meet new people. Wine pairing available. A great way to end the week with good food, good conversation, and new connections.",
  };

  const eventData = [
    {
      slug: "singles-night-25-35", title: "Singles Night - Ages 25-35",
      cat: "Social", host: "kari", group: "nightlife-reykjavik", venue: "lebowski-bar",
      startsAt: "2026-03-15T20:00:00Z", endsAt: "2026-03-15T23:30:00Z",
      attendees: 43, capacity: 60, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "saturday-hike-mt-esja", title: "Saturday Hike to Mt. Esja",
      cat: "Outdoors", host: "helga", group: "reykjavik-hikers", venue: "esja-trailhead",
      startsAt: "2026-03-21T09:00:00Z", endsAt: "2026-03-21T13:30:00Z",
      attendees: 27, capacity: 35, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "react-server-components-workshop", title: "React Server Components Workshop",
      cat: "Tech", host: "bjorn", group: "tech-community-rvk", venue: "grandi-hub",
      startsAt: "2026-03-19T18:30:00Z", endsAt: "2026-03-19T21:00:00Z",
      attendees: 61, capacity: 80, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "wine-tasting-volcanic-terroir", title: "Wine Tasting - Volcanic Terroir",
      cat: "Food", host: "sara", group: "reykjavik-foodies", venue: "bryggjuhusid",
      startsAt: "2026-03-19T19:00:00Z", endsAt: "2026-03-19T21:30:00Z",
      attendees: 24, capacity: 28, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "speed-friending-newcomers", title: "Speed Friending - Newcomers Welcome",
      cat: "Expat", host: "marta", group: "expats-in-iceland", venue: "kex-hostel",
      startsAt: "2026-03-20T19:30:00Z", endsAt: "2026-03-20T22:00:00Z",
      attendees: 58, capacity: 70, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "harbor-jazz-social", title: "Harbor Jazz Social",
      cat: "Arts", host: "elin", group: "creative-reykjavik", venue: "dillon",
      startsAt: "2026-03-28T20:30:00Z", endsAt: "2026-03-28T23:00:00Z",
      attendees: 34, capacity: 90, isFree: false, eventType: "hybrid" as const,
    },
    {
      slug: "craft-beer-tasting-vesturgata", title: "Craft Beer Tasting - Vesturgata",
      cat: "Food", host: "sara", group: "reykjavik-foodies", venue: "micro-bar",
      startsAt: "2026-03-21T18:00:00Z", endsAt: "2026-03-21T20:30:00Z",
      attendees: 35, capacity: 45, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "morning-yoga-flow", title: "Morning Yoga Flow",
      cat: "Sports", host: "johanna", group: "wellness-reykjavik", venue: "loft-hostel",
      startsAt: "2026-03-18T07:30:00Z", endsAt: "2026-03-18T08:45:00Z",
      attendees: 22, capacity: 30, isFree: false, eventType: "hybrid" as const,
    },
    {
      slug: "startup-pitch-night", title: "Startup Pitch Night",
      cat: "Tech", host: "bjorn", group: "tech-community-rvk", venue: "hlemmur-square",
      startsAt: "2026-04-02T19:00:00Z", endsAt: "2026-04-02T21:30:00Z",
      attendees: 78, capacity: 120, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "poetry-open-mic", title: "Poetry Open Mic",
      cat: "Arts", host: "elin", group: "creative-reykjavik", venue: "cafe-rosenberg",
      startsAt: "2026-03-19T20:00:00Z", endsAt: "2026-03-19T22:30:00Z",
      attendees: 28, capacity: 50, isFree: false, eventType: "in_person" as const,
    },
    {
      slug: "language-exchange-thursday", title: "Language Exchange Thursday",
      cat: "Language", host: "pierre", group: "language-exchange-rvk", venue: "mokka",
      startsAt: "2026-03-19T17:30:00Z", endsAt: "2026-03-19T19:30:00Z",
      attendees: 18, capacity: 25, isFree: true, eventType: "in_person" as const,
    },
    {
      slug: "friday-dinner-social", title: "Friday Dinner Social",
      cat: "Social", host: "kari", group: "nightlife-reykjavik", venue: "snaps",
      startsAt: "2026-03-20T19:30:00Z", endsAt: "2026-03-20T22:30:00Z",
      attendees: 42, capacity: 60, isFree: false, eventType: "in_person" as const,
    },
  ];

  const eventIds: Record<string, string> = {};
  for (const e of eventData) {
    const fallbackId = deterministicUuid(`event-${e.slug}`);
    const id = await resolveId("events", e.slug, fallbackId);
    eventIds[e.slug] = id;
    const venueId = venueIds[e.venue] ?? null;

    const payload = {
      title: e.title,
      description: eventDescriptions[e.slug] ?? `${e.title} event in Reykjavik`,
      group_id: groupIds[e.group] ?? null,
      host_id: userIds[e.host],
      venue_id: venueId,
      category_id: catNameMap[e.cat] ?? null,
      event_type: e.eventType,
      status: "published" as const,
      starts_at: e.startsAt,
      ends_at: e.endsAt,
      venue_name: e.venue.replace(/-/g, " "),
      attendee_limit: e.capacity,
      is_free: e.isFree,
      is_featured: true,
      rsvp_count: e.attendees,
      rsvp_mode: "open" as const,
    };

    if (id !== fallbackId) {
      await sb.from("events").update(payload).eq("id", id);
      console.log(`  ✓ ${e.title} (updated)`);
    } else {
      const { error } = await sb.from("events").insert({ id, slug: e.slug, ...payload });
      if (error) console.error(`  ✗ event ${e.title}: ${error.message}`);
      else console.log(`  ✓ ${e.title}`);
    }
  }

  /* ── 7. RSVPs for demo members ─────────────────────────────── */
  console.log("\nCreating RSVPs...");

  const rsvpPairs = [
    ["member1", "singles-night-25-35"],
    ["member1", "react-server-components-workshop"],
    ["member1", "language-exchange-thursday"],
    ["member2", "saturday-hike-mt-esja"],
    ["member2", "speed-friending-newcomers"],
    ["member2", "harbor-jazz-social"],
    ["member3", "wine-tasting-volcanic-terroir"],
    ["member3", "startup-pitch-night"],
    ["member3", "morning-yoga-flow"],
  ];

  for (const [userKey, eventSlug] of rsvpPairs) {
    const id = deterministicUuid(`rsvp-${userKey}-${eventSlug}`);
    const { error } = await sb.from("rsvps").upsert(
      {
        id,
        event_id: eventIds[eventSlug],
        user_id: userIds[userKey],
        status: "going",
        guest_count: 0,
        payment_status: "na",
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ rsvp ${userKey}→${eventSlug}: ${error.message}`);
  }
  console.log(`  ✓ ${rsvpPairs.length} RSVPs created`);

  /* ── 8. Notifications ──────────────────────────────────────── */
  console.log("\nCreating notifications...");

  const notifications = [
    { user: "member1", type: "rsvp_confirmed" as const, title: "RSVP Confirmed", body: "You're going to Singles Night - Ages 25-35!", link: "/events/singles-night-25-35" },
    { user: "member1", type: "event_reminder" as const, title: "Event Tomorrow", body: "React Server Components Workshop starts tomorrow at 18:30", link: "/events/react-server-components-workshop" },
    { user: "member2", type: "new_event" as const, title: "New Hike Posted", body: "Reykjavik Hikers posted a new Saturday hike to Mt. Esja", link: "/events/saturday-hike-mt-esja" },
    { user: "kari", type: "new_member" as const, title: "New Member", body: "Anna Jonsdottir joined Nightlife Reykjavik", link: "/organizer/groups" },
    { user: "venueLebowski", type: "booking_request" as const, title: "Booking Request", body: "Kari Sigurdsson wants to book Lebowski Bar for Singles Night", link: "/venue/bookings" },
  ];

  for (const n of notifications) {
    const id = deterministicUuid(`notif-${n.user}-${n.type}-${n.title}`);
    const { error } = await sb.from("notifications").upsert(
      {
        id,
        user_id: userIds[n.user],
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        is_read: false,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ notif: ${error.message}`);
  }
  console.log(`  ✓ ${notifications.length} notifications`);

  /* ── 9. Messages ───────────────────────────────────────────── */
  console.log("\nCreating messages...");

  const messages = [
    { from: "kari", to: "venueLebowski", subject: "Singles Night booking", body: "Hi, I'd like to book Lebowski Bar for our Singles Night on March 15th. We expect around 40-60 people." },
    { from: "venueLebowski", to: "kari", subject: "Re: Singles Night booking", body: "Sounds great! We can do the 2-for-1 welcome drink deal for your group. Let me know the final headcount by March 12th." },
    { from: "member1", to: "kari", subject: "Question about Singles Night", body: "Hi Kari, is there a dress code for the singles night? Also, can I bring a friend who's 36?" },
    { from: "bjorn", to: "venueGrandi", subject: "Workshop setup", body: "Hi, we'll need the projector and about 20 power outlets for laptops. Can you confirm setup by 17:30?" },
    { from: "helga", to: "member2", subject: "Hike preparation", body: "Hey Jon! For the Saturday hike, bring waterproof boots and a warm layer. We'll meet at the parking lot at 08:45." },
  ];

  for (const m of messages) {
    const threadId = deterministicUuid(`thread-${m.from}-${m.to}-${m.subject}`);
    const id = deterministicUuid(`msg-${m.from}-${m.to}-${m.subject}`);
    const { error } = await sb.from("messages").upsert(
      {
        id,
        sender_id: userIds[m.from],
        receiver_id: userIds[m.to],
        subject: m.subject,
        body: m.body,
        is_read: false,
        thread_id: threadId,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ msg: ${error.message}`);
  }
  console.log(`  ✓ ${messages.length} messages`);

  /* ── 10. Transactions ──────────────────────────────────────── */
  console.log("\nCreating transactions...");

  const txns = [
    { user: "member1", type: "ticket" as const, desc: "Singles Night - Ages 25-35 ticket", isk: 750, event: "singles-night-25-35" },
    { user: "member1", type: "ticket" as const, desc: "React Workshop ticket", isk: 950, event: "react-server-components-workshop" },
    { user: "member2", type: "ticket" as const, desc: "Saturday Hike ticket", isk: 500, event: "saturday-hike-mt-esja" },
    { user: "member3", type: "ticket" as const, desc: "Wine Tasting ticket", isk: 3900, event: "wine-tasting-volcanic-terroir" },
    { user: "venueLebowski", type: "venue_partnership" as const, desc: "Premium venue partnership - Monthly", isk: 15000, event: null },
    { user: "kari", type: "subscription" as const, desc: "Organizer Pro plan - Monthly", isk: 4900, event: null },
  ];

  for (const t of txns) {
    const id = deterministicUuid(`txn-${t.user}-${t.desc}`);
    const { error } = await sb.from("transactions").upsert(
      {
        id,
        user_id: userIds[t.user],
        type: t.type,
        description: t.desc,
        amount_isk: t.isk,
        commission_amount: t.type === "ticket" ? Math.round(t.isk * 0.05) : 0,
        payment_provider: "paypal",
        status: "completed",
        related_event_id: t.event ? eventIds[t.event] : null,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ txn: ${error.message}`);
  }
  console.log(`  ✓ ${txns.length} transactions`);

  /* ── 11. Venue Bookings ────────────────────────────────────── */
  console.log("\nCreating venue bookings...");

  const bookings = [
    {
      venue: "lebowski-bar", organizer: "kari", event: "singles-night-25-35",
      date: "2026-03-15", start: "19:30", end: "23:30", attendance: 50, status: "accepted" as const,
    },
    {
      venue: "grandi-hub", organizer: "bjorn", event: "react-server-components-workshop",
      date: "2026-03-19", start: "17:30", end: "21:30", attendance: 70, status: "accepted" as const,
    },
    {
      venue: "kex-hostel", organizer: "marta", event: "speed-friending-newcomers",
      date: "2026-03-20", start: "19:00", end: "22:30", attendance: 60, status: "accepted" as const,
    },
    {
      venue: "hlemmur-square", organizer: "bjorn", event: "startup-pitch-night",
      date: "2026-04-02", start: "18:30", end: "22:00", attendance: 100, status: "pending" as const,
    },
  ];

  for (const b of bookings) {
    const id = deterministicUuid(`booking-${b.venue}-${b.date}`);
    const { error } = await sb.from("venue_bookings").upsert(
      {
        id,
        venue_id: venueIds[b.venue],
        organizer_id: userIds[b.organizer],
        event_id: eventIds[b.event] ?? null,
        requested_date: b.date,
        requested_start: b.start,
        requested_end: b.end,
        expected_attendance: b.attendance,
        status: b.status,
        message: `Booking request for ${b.venue.replace(/-/g, " ")}`,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ booking: ${error.message}`);
  }
  console.log(`  ✓ ${bookings.length} venue bookings`);

  /* ── 12. Venue Deals ───────────────────────────────────────── */
  console.log("\nCreating venue deals...");

  const deals = [
    { venue: "lebowski-bar", title: "Happy Hour", type: "happy_hour" as const, tier: "gold" as const, desc: "2-for-1 drinks until 21:00 for MeetupReykjavik hosts" },
    { venue: "kex-hostel", title: "Welcome Drink", type: "welcome_drink" as const, tier: "silver" as const, desc: "Welcome drink for approved organizers" },
    { venue: "grandi-hub", title: "Free Coffee", type: "free_item" as const, tier: "silver" as const, desc: "Free coffee service for workshop hosts" },
    { venue: "micro-bar", title: "Tasting Discount", type: "percentage" as const, tier: "bronze" as const, desc: "10% off tasting boards for groups of 10+" },
  ];

  for (const d of deals) {
    const id = deterministicUuid(`deal-${d.venue}-${d.title}`);
    const { error } = await sb.from("venue_deals").upsert(
      {
        id,
        venue_id: venueIds[d.venue],
        title: d.title,
        description: d.desc,
        deal_type: d.type,
        deal_tier: d.tier,
        is_active: true,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ deal: ${error.message}`);
  }
  console.log(`  ✓ ${deals.length} venue deals`);

  /* ── 13. Ticket Tiers ──────────────────────────────────────── */
  console.log("\nCreating ticket tiers...");

  const ticketEvents = [
    { event: "singles-night-25-35", name: "General", price: 750, qty: 60 },
    { event: "saturday-hike-mt-esja", name: "Standard", price: 500, qty: 35 },
    { event: "react-server-components-workshop", name: "Workshop", price: 950, qty: 80 },
    { event: "wine-tasting-volcanic-terroir", name: "Tasting", price: 3900, qty: 28 },
    { event: "speed-friending-newcomers", name: "Entry", price: 500, qty: 70 },
    { event: "harbor-jazz-social", name: "Live", price: 1500, qty: 90 },
    { event: "startup-pitch-night", name: "General", price: 1500, qty: 120 },
    { event: "morning-yoga-flow", name: "Class", price: 1200, qty: 30 },
    { event: "poetry-open-mic", name: "Entry", price: 800, qty: 50 },
    { event: "craft-beer-tasting-vesturgata", name: "Tasting", price: 2900, qty: 45 },
    { event: "friday-dinner-social", name: "Dinner", price: 4500, qty: 60 },
  ];

  for (const t of ticketEvents) {
    const id = deterministicUuid(`ticket-${t.event}-${t.name}`);
    const { error } = await sb.from("ticket_tiers").upsert(
      {
        id,
        event_id: eventIds[t.event],
        name: t.name,
        price_isk: t.price,
        price_usd: Math.round(t.price / 140),
        quantity: t.qty,
        sold_count: Math.min(Math.floor(t.qty * 0.6), t.qty),
        sort_order: 0,
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ ticket: ${error.message}`);
  }
  console.log(`  ✓ ${ticketEvents.length} ticket tiers`);

  /* ── 14. Admin Audit Log ───────────────────────────────────── */
  console.log("\nCreating audit log entries...");

  const auditEntries = [
    { action: "approve_venue", target: "venues", targetId: venueIds["lebowski-bar"] },
    { action: "feature_event", target: "events", targetId: eventIds["singles-night-25-35"] },
    { action: "approve_group", target: "groups", targetId: groupIds["reykjavik-hikers"] },
  ];

  for (const a of auditEntries) {
    const id = deterministicUuid(`audit-${a.action}-${a.target}`);
    const { error } = await sb.from("admin_audit_log").upsert(
      {
        id,
        admin_id: userIds.admin,
        action: a.action,
        target_type: a.target,
        target_id: a.targetId,
        details: { note: `Admin ${a.action}` },
      },
      { onConflict: "id" },
    );
    if (error) console.error(`  ✗ audit: ${error.message}`);
  }
  console.log(`  ✓ ${auditEntries.length} audit entries`);

  /* ── Done ──────────────────────────────────────────────────── */
  console.log("\n✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin:     admin@meetupreykjavik.is / Admin123!");
  console.log("  Organizer: kari@meetupreykjavik.is / Organizer123!");
  console.log("  Venue:     lebowski@meetupreykjavik.is / Venue123!");
  console.log("  Member:    anna@example.com / Member123!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
