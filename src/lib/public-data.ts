import { categories as homepageCategories } from "@/lib/home-data";

export type PublicEvent = {
  slug: string;
  title: string;
  category: string;
  eventType: "in_person" | "online" | "hybrid";
  dateFilter: "Today" | "This Week" | "Weekend" | "Month";
  startsAt: string;
  endsAt: string;
  venueName: string;
  venueSlug: string;
  groupName: string;
  groupSlug: string;
  hostName: string;
  area: string;
  summary: string;
  description: string[];
  attendees: number;
  capacity: number;
  priceLabel: string;
  ageLabel: string;
  isFree: boolean;
  visibilityLabel: string;
  approvalLabel: string;
  reminderLabel: string;
  hostContact: string;
  shareLabel: string;
  art: string;
  gallery: string[];
  comments: Array<{ author: string; text: string; postedAt: string }>;
  ratings: Array<{ author: string; rating: number; text: string }>;
};

export type PublicGroup = {
  slug: string;
  name: string;
  category: string;
  members: number;
  activity: number;
  summary: string;
  description: string[];
  organizer: string;
  banner: string;
  tags: string[];
  upcomingEventSlugs: string[];
  pastEvents: string[];
  discussions: Array<{ title: string; replies: number; preview: string }>;
};

export type PublicVenue = {
  slug: string;
  name: string;
  type: string;
  area: string;
  capacity: number;
  rating: number;
  summary: string;
  description: string[];
  address: string;
  amenities: string[];
  hours: Array<{ day: string; open: string; highlighted?: boolean }>;
  deal: string;
  upcomingEventSlugs: string[];
  gallery: string[];
  art: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  readTime: string;
  hero: string;
  sections: Array<{ heading: string; body: string }>;
};

export const minimumTicketPriceIsk = 500;
export const ticketCommissionRate = 5;

export const publicEvents: PublicEvent[] = [
  {
    slug: "singles-night-25-35",
    title: "Singles Night - Ages 25-35",
    category: "Social",
    eventType: "in_person",
    dateFilter: "Weekend",
    startsAt: "2026-03-15T20:00:00Z",
    endsAt: "2026-03-15T23:30:00Z",
    venueName: "Lebowski Bar",
    venueSlug: "lebowski-bar",
    groupName: "Nightlife Reykjavik",
    groupSlug: "nightlife-reykjavik",
    hostName: "Kari Sigurdsson",
    area: "Laugavegur",
    summary: "A warm, hosted social night with easy intros, small-group prompts, and a venue perk on arrival.",
    description: [
      "This format is built for people who want a social night that feels designed rather than chaotic. Hosts open with simple conversation prompts, table rotations stay light, and the pace is relaxed enough for newcomers.",
      "The venue partner supports the night with a member deal and a dedicated arrival area, which means the event feels intentional from the first minute instead of improvised at the bar counter.",
    ],
    attendees: 43,
    capacity: 60,
    priceLabel: "750 ISK",
    ageLabel: "25-35",
    isFree: false,
    visibilityLabel: "Public discovery with manual approval",
    approvalLabel: "Host-approved to keep the room balanced",
    reminderLabel: "24h and 2h reminders with arrival note",
    hostContact: "Kari Sigurdsson via host inbox",
    shareLabel: "Share with one friend before checkout",
    art: "linear-gradient(135deg, rgba(232,97,77,0.95), rgba(79,70,229,0.82))",
    gallery: [
      "linear-gradient(135deg, rgba(232,97,77,0.92), rgba(30,27,46,0.88))",
      "linear-gradient(135deg, rgba(245,240,232,0.85), rgba(79,70,229,0.78))",
      "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(232,97,77,0.74))",
    ],
    comments: [
      { author: "Anna", text: "Love that this one has a host and not just a crowd.", postedAt: "2 hours ago" },
      { author: "Marta", text: "The last edition felt welcoming even if you came alone.", postedAt: "Yesterday" },
    ],
    ratings: [
      { author: "Jon", rating: 5, text: "Good energy, well-paced, and the venue actually fit the format." },
      { author: "Sofia", rating: 4, text: "Would go again. The smaller group intros helped a lot." },
    ],
  },
  {
    slug: "saturday-hike-mt-esja",
    title: "Saturday Hike to Mt. Esja",
    category: "Outdoors",
    eventType: "in_person",
    dateFilter: "Weekend",
    startsAt: "2026-03-16T09:00:00Z",
    endsAt: "2026-03-16T13:30:00Z",
    venueName: "Esja Trailhead",
    venueSlug: "esja-trailhead",
    groupName: "Reykjavik Hikers",
    groupSlug: "reykjavik-hikers",
    hostName: "Helga Arnadottir",
    area: "Esja",
    summary: "A beginner-friendly mountain morning with route pacing, coffee after, and a proper meetup point.",
    description: [
      "The hike is designed for steady pacing rather than speed. Organizers split the group naturally based on comfort and make the route feel accessible to people who are still learning the local trails.",
      "What makes this format work is the social structure around it: clear arrival instructions, warm-up chat, and a simple cafe finish after the descent so the meetup does not end at the parking lot.",
    ],
    attendees: 27,
    capacity: 35,
    priceLabel: "500 ISK",
    ageLabel: "All ages",
    isFree: false,
    visibilityLabel: "Public listing with newcomer-friendly notes",
    approvalLabel: "Open booking with safety briefing required",
    reminderLabel: "24h reminder plus weather update at 07:00",
    hostContact: "Helga Arnadottir via organizer notes",
    shareLabel: "Share with your hiking pair or ride-share thread",
    art: "linear-gradient(135deg, rgba(124,154,130,0.95), rgba(42,38,56,0.82))",
    gallery: [
      "linear-gradient(135deg, rgba(124,154,130,0.95), rgba(245,240,232,0.9))",
      "linear-gradient(135deg, rgba(30,27,46,0.96), rgba(124,154,130,0.72))",
      "linear-gradient(135deg, rgba(79,70,229,0.72), rgba(124,154,130,0.92))",
    ],
    comments: [
      { author: "Brynjar", text: "Great host notes in advance. Easy to join solo.", postedAt: "5 hours ago" },
      { author: "Lina", text: "Happy this one keeps a no-drop pace.", postedAt: "1 day ago" },
    ],
    ratings: [
      { author: "Rakel", rating: 5, text: "Clear communication and a genuinely friendly group." },
    ],
  },
  {
    slug: "react-server-components-workshop",
    title: "React Server Components Workshop",
    category: "Tech",
    eventType: "in_person",
    dateFilter: "This Week",
    startsAt: "2026-03-19T18:30:00Z",
    endsAt: "2026-03-19T21:00:00Z",
    venueName: "Grandi Hub",
    venueSlug: "grandi-hub",
    groupName: "Tech Community RVK",
    groupSlug: "tech-community-rvk",
    hostName: "Bjorn Olafsson",
    area: "Grandi",
    summary: "Hands-on workshop covering data flow, streaming, and real app tradeoffs in modern React.",
    description: [
      "The session moves beyond slides and into implementation patterns. Participants work through a guided app slice, compare server and client boundaries, and walk away with a mental model rather than just a buzzword recap.",
      "This format also fits the broader platform vision: serious organizers, strong partner venues, and events that feel useful enough to justify a recurring community around them.",
    ],
    attendees: 61,
    capacity: 80,
    priceLabel: "950 ISK",
    ageLabel: "18+",
    isFree: false,
    visibilityLabel: "Public workshop with featured placement",
    approvalLabel: "Manual approval for strong attendee fit",
    reminderLabel: "24h, 2h, and post-event feedback prompt",
    hostContact: "Bjorn Olafsson via organizer inbox",
    shareLabel: "Share with your team before approval closes",
    art: "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(30,27,46,0.9))",
    gallery: [
      "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(245,240,232,0.26))",
      "linear-gradient(135deg, rgba(30,27,46,0.92), rgba(79,70,229,0.82))",
      "linear-gradient(135deg, rgba(232,97,77,0.7), rgba(55,48,163,0.96))",
    ],
    comments: [
      { author: "Aron", text: "Nice to see a technical event with real implementation time.", postedAt: "3 hours ago" },
      { author: "Mia", text: "Would love a follow-up on auth and caching patterns.", postedAt: "2 days ago" },
    ],
    ratings: [
      { author: "Einar", rating: 5, text: "Dense but practical. The venue setup also worked well." },
    ],
  },
  {
    slug: "wine-tasting-volcanic-terroir",
    title: "Wine Tasting - Volcanic Terroir",
    category: "Food",
    eventType: "in_person",
    dateFilter: "This Week",
    startsAt: "2026-03-19T19:00:00Z",
    endsAt: "2026-03-19T21:30:00Z",
    venueName: "Bryggjuhusid",
    venueSlug: "bryggjuhusid",
    groupName: "Reykjavik Foodies",
    groupSlug: "reykjavik-foodies",
    hostName: "Sara Magnusdottir",
    area: "Bankastraeti",
    summary: "A guided tasting focused on volcanic soils, storytelling, and a premium seated format.",
    description: [
      "The evening combines education and atmosphere. Each pour is paired with a short story, and the layout keeps the room intimate enough for questions without making it feel formal.",
      "This is the kind of venue-led format the product should eventually monetize well: premium inventory, limited capacity, and strong host credibility.",
    ],
    attendees: 24,
    capacity: 28,
    priceLabel: "3,900 ISK",
    ageLabel: "20+",
    isFree: false,
    visibilityLabel: "Public premium format with limited seating",
    approvalLabel: "Paid booking with host review for waitlist moves",
    reminderLabel: "48h menu note and same-day arrival briefing",
    hostContact: "Sara Magnusdottir via tasting concierge",
    shareLabel: "Share privately with your table or tasting partner",
    art: "linear-gradient(135deg, rgba(232,97,77,0.88), rgba(42,38,56,0.92))",
    gallery: [
      "linear-gradient(135deg, rgba(245,240,232,0.92), rgba(232,97,77,0.8))",
      "linear-gradient(135deg, rgba(42,38,56,0.96), rgba(232,97,77,0.66))",
      "linear-gradient(135deg, rgba(79,70,229,0.76), rgba(232,97,77,0.92))",
    ],
    comments: [
      { author: "Klara", text: "The seated format makes this feel premium, not rushed.", postedAt: "Today" },
    ],
    ratings: [
      { author: "Ivar", rating: 5, text: "Excellent host and the venue fit the concept perfectly." },
    ],
  },
  {
    slug: "speed-friending-newcomers",
    title: "Speed Friending - Newcomers Welcome",
    category: "Expat",
    eventType: "in_person",
    dateFilter: "This Week",
    startsAt: "2026-03-20T19:30:00Z",
    endsAt: "2026-03-20T22:00:00Z",
    venueName: "Kex Hostel",
    venueSlug: "kex-hostel",
    groupName: "Expats in Iceland",
    groupSlug: "expats-in-iceland",
    hostName: "Marta Polak",
    area: "Skulagata",
    summary: "A social format for newcomers who want structure, easier intros, and no awkward room-reading.",
    description: [
      "This event is designed around clarity. Timed rounds, host prompts, and a strong arrival flow mean people can settle in fast even if they just moved to the city last week.",
      "Because the format is repeatable, it gives the platform a strong example of how group identity, venue partnership, and event consistency can reinforce one another.",
    ],
    attendees: 58,
    capacity: 70,
    priceLabel: "500 ISK",
    ageLabel: "All ages",
    isFree: false,
    visibilityLabel: "Public newcomer format with trust-first hosting",
    approvalLabel: "Open ticketing with moderated host arrival lane",
    reminderLabel: "24h and 3h reminders with intro prompt",
    hostContact: "Marta Polak via newcomer host desk",
    shareLabel: "Share with other newcomers before seats fill",
    art: "linear-gradient(135deg, rgba(245,240,232,0.82), rgba(79,70,229,0.78))",
    gallery: [
      "linear-gradient(135deg, rgba(245,240,232,0.96), rgba(79,70,229,0.72))",
      "linear-gradient(135deg, rgba(232,97,77,0.84), rgba(245,240,232,0.8))",
      "linear-gradient(135deg, rgba(30,27,46,0.9), rgba(79,70,229,0.7))",
    ],
    comments: [
      { author: "Diego", text: "Exactly the kind of structure newcomers need.", postedAt: "4 hours ago" },
      { author: "Freya", text: "I like that the venue keeps space near the host desk for arrivals.", postedAt: "Yesterday" },
    ],
    ratings: [
      { author: "Lukas", rating: 4, text: "Friendly crowd, not too forced, good host energy." },
    ],
  },
  {
    slug: "harbor-jazz-social",
    title: "Harbor Jazz Social",
    category: "Arts",
    eventType: "hybrid",
    dateFilter: "Month",
    startsAt: "2026-03-28T20:30:00Z",
    endsAt: "2026-03-28T23:00:00Z",
    venueName: "Gaukurinn",
    venueSlug: "gaukurinn",
    groupName: "Creative Reykjavik",
    groupSlug: "creative-reykjavik",
    hostName: "Elin Thors",
    area: "Tryggvagata",
    summary: "A live jazz night with a hosted social layer and a streamed first set for remote members.",
    description: [
      "The event blends scene discovery with community hosting. Members can attend live for the full atmosphere or join the first set remotely before deciding to come to the next edition in person.",
      "The hybrid format shows how the product can support different event shapes without flattening everything into the same RSVP experience.",
    ],
    attendees: 34,
    capacity: 90,
    priceLabel: "1,500 ISK",
    ageLabel: "20+",
    isFree: false,
    visibilityLabel: "Public cultural event with hybrid first set",
    approvalLabel: "Ticketed access with host-curated room pacing",
    reminderLabel: "24h reminder and doors-open alert",
    hostContact: "Elin Thors via cultural host channel",
    shareLabel: "Share with your live or remote group",
    art: "linear-gradient(135deg, rgba(30,27,46,0.96), rgba(232,97,77,0.82))",
    gallery: [
      "linear-gradient(135deg, rgba(30,27,46,0.96), rgba(79,70,229,0.72))",
      "linear-gradient(135deg, rgba(232,97,77,0.88), rgba(30,27,46,0.92))",
      "linear-gradient(135deg, rgba(245,240,232,0.78), rgba(232,97,77,0.84))",
    ],
    comments: [
      { author: "Runa", text: "Love that the first set is streamable.", postedAt: "Today" },
    ],
    ratings: [
      { author: "Petur", rating: 5, text: "Great venue and strong curation." },
    ],
  },
] as const;

export const publicGroups: PublicGroup[] = [
  {
    slug: "reykjavik-hikers",
    name: "Reykjavik Hikers",
    category: "Outdoors",
    members: 284,
    activity: 81,
    summary: "Weekly hikes around Iceland with welcoming pacing and strong repeat attendance.",
    description: [
      "This group is built around consistency. The organizer posts clear route notes, weather context, and meetup logistics early so first-timers can join without guessing how serious the pace will be.",
      "It is exactly the kind of durable local group the platform should spotlight: easy to understand, high trust, and strongly tied to place.",
    ],
    organizer: "Helga Arnadottir",
    banner: "linear-gradient(135deg, rgba(124,154,130,0.95), rgba(79,70,229,0.72))",
    tags: ["Hikes", "Day trips", "Coffee after"],
    upcomingEventSlugs: ["saturday-hike-mt-esja"],
    pastEvents: ["Sunset walk at Grotta", "Hot spring day trip", "Midweek valley loop"],
    discussions: [
      { title: "Best boots for March conditions?", replies: 18, preview: "Members are comparing waterproof options and traction tips." },
      { title: "Ride share thread for Esja", replies: 9, preview: "Coordinating pickup spots from central Reykjavik." },
    ],
  },
  {
    slug: "expats-in-iceland",
    name: "Expats in Iceland",
    category: "Expat",
    members: 512,
    activity: 92,
    summary: "A broad social landing place for newcomers building a real life in Reykjavik.",
    description: [
      "The group works because it balances practical life and social life. New members discover events, ask local questions, and get a first sense of rhythm in the city without needing three separate communities.",
      "As a platform anchor, this group demonstrates how onboarding, recurring events, and profile identity can work together.",
    ],
    organizer: "Marta Polak",
    banner: "linear-gradient(135deg, rgba(232,97,77,0.92), rgba(245,240,232,0.88))",
    tags: ["New in town", "Social", "Resources"],
    upcomingEventSlugs: ["speed-friending-newcomers"],
    pastEvents: ["Sunday bakery crawl", "Language exchange intro", "Local rent Q and A"],
    discussions: [
      { title: "Best neighborhoods for first-year living", replies: 34, preview: "Members are comparing commute, noise, and rent tradeoffs." },
      { title: "What should every newcomer know before winter?", replies: 21, preview: "Gear, routines, and social tips from long-time members." },
    ],
  },
  {
    slug: "tech-community-rvk",
    name: "Tech Community RVK",
    category: "Tech",
    members: 198,
    activity: 76,
    summary: "Developers, founders, and operators who prefer practical sessions over vague networking.",
    description: [
      "The community centers on applied learning. Workshops, demos, and founder sessions are usually small enough to stay useful and social enough to still generate good post-event conversation.",
      "This is also one of the strongest cases for the organizer dashboard: recurring templates, attendee management, and analytics all matter here.",
    ],
    organizer: "Bjorn Olafsson",
    banner: "linear-gradient(135deg, rgba(55,48,163,0.94), rgba(232,97,77,0.78))",
    tags: ["Workshops", "Founders", "Product"],
    upcomingEventSlugs: ["react-server-components-workshop"],
    pastEvents: ["Edge functions deep dive", "Startup operator breakfast", "Design systems night"],
    discussions: [
      { title: "Who wants a follow-up on auth architecture?", replies: 12, preview: "Members are proposing a smaller working session." },
      { title: "Good coworking spaces for evening meetups", replies: 7, preview: "Venue recommendations and setup tradeoffs." },
    ],
  },
  {
    slug: "creative-reykjavik",
    name: "Creative Reykjavik",
    category: "Arts",
    members: 203,
    activity: 63,
    summary: "Art nights, gallery walks, and small format culture events with a social core.",
    description: [
      "The group makes the arts scene feel approachable. Events are designed to reduce the barrier to entry, whether you come from the creative industries or simply want better ways to experience the city.",
      "Its events also show how venue partnerships can serve culture without making the product feel corporate or generic.",
    ],
    organizer: "Elin Thors",
    banner: "linear-gradient(135deg, rgba(245,240,232,1), rgba(232,97,77,0.78))",
    tags: ["Gallery walks", "Music", "Culture"],
    upcomingEventSlugs: ["harbor-jazz-social"],
    pastEvents: ["After-hours exhibition visit", "Sketchbook cafe session", "Studio open evening"],
    discussions: [
      { title: "Best small venues for creative formats", replies: 11, preview: "Members are sharing spaces that feel intimate without being cramped." },
      { title: "Who is going to the jazz social?", replies: 6, preview: "Coordinating arrivals and post-set drinks." },
    ],
  },
] as const;

export const publicVenues: PublicVenue[] = [
  {
    slug: "lebowski-bar",
    name: "Lebowski Bar",
    type: "Bar & Grill",
    area: "Laugavegur",
    capacity: 120,
    rating: 4.7,
    summary: "A lively central venue that works especially well for hosted social nights and structured mixers.",
    description: [
      "Lebowski works because the room is flexible. Hosts can reserve a clear meetup zone, the bar supports quick arrivals, and the energy is social without becoming too loud too early.",
      "For the platform, it is a strong example of a venue partner that benefits from recurring formats and member-only deals.",
    ],
    address: "Laugavegur 20b, 101 Reykjavik",
    amenities: ["Hosted meetup area", "Cocktail menu", "Late hours", "Group seating"],
    hours: [
      { day: "Mon", open: "16:00-00:00" },
      { day: "Tue", open: "16:00-00:00" },
      { day: "Wed", open: "16:00-01:00" },
      { day: "Thu", open: "16:00-01:00" },
      { day: "Fri", open: "15:00-02:00", highlighted: true },
      { day: "Sat", open: "15:00-02:00" },
      { day: "Sun", open: "16:00-00:00" },
    ],
    deal: "2-for-1 welcome drink for MeetupReykjavik hosts before 21:00",
    upcomingEventSlugs: ["singles-night-25-35"],
    gallery: [
      "linear-gradient(135deg, rgba(30,27,46,1), rgba(232,97,77,0.88))",
      "linear-gradient(135deg, rgba(232,97,77,0.88), rgba(245,240,232,0.82))",
      "linear-gradient(135deg, rgba(79,70,229,0.86), rgba(30,27,46,0.94))",
    ],
    art: "linear-gradient(135deg, rgba(30,27,46,1), rgba(232,97,77,0.88))",
  },
  {
    slug: "kex-hostel",
    name: "Kex Hostel",
    type: "Bar & Venue",
    area: "Skulagata",
    capacity: 150,
    rating: 4.8,
    summary: "A flexible social venue with strong newcomer energy and space for host-led community formats.",
    description: [
      "Kex handles mixed crowds well. It has enough movement to feel alive, but enough structure to give an event a visible center and a good host station.",
      "It is especially good for social formats that depend on a strong arrival flow and a forgiving environment for first-time attendees.",
    ],
    address: "Skulagata 28, 101 Reykjavik",
    amenities: ["Arrival desk", "Food service", "Flexible tables", "Harbor access"],
    hours: [
      { day: "Mon", open: "12:00-23:00" },
      { day: "Tue", open: "12:00-23:00" },
      { day: "Wed", open: "12:00-23:00" },
      { day: "Thu", open: "12:00-00:00" },
      { day: "Fri", open: "12:00-01:00", highlighted: true },
      { day: "Sat", open: "12:00-01:00" },
      { day: "Sun", open: "12:00-22:00" },
    ],
    deal: "Welcome drink for approved organizers and discounted group platters",
    upcomingEventSlugs: ["speed-friending-newcomers"],
    gallery: [
      "linear-gradient(135deg, rgba(245,240,232,0.82), rgba(79,70,229,0.82))",
      "linear-gradient(135deg, rgba(79,70,229,0.78), rgba(245,240,232,0.88))",
      "linear-gradient(135deg, rgba(232,97,77,0.82), rgba(245,240,232,0.92))",
    ],
    art: "linear-gradient(135deg, rgba(245,240,232,0.82), rgba(79,70,229,0.82))",
  },
  {
    slug: "grandi-hub",
    name: "Grandi Hub",
    type: "Coworking",
    area: "Grandi",
    capacity: 90,
    rating: 4.6,
    summary: "A practical venue for workshops, founder sessions, and technical community programming.",
    description: [
      "The venue suits events where clarity matters more than atmosphere alone. Seating, projection, wifi, and layout all support education-driven formats that still want some social tail after the session.",
      "This is where the platform can demonstrate that venue partnerships are not just nightlife. Utility matters too.",
    ],
    address: "Grandagardur 16, 101 Reykjavik",
    amenities: ["Projector", "Fast wifi", "Stage zone", "Coffee setup"],
    hours: [
      { day: "Mon", open: "08:00-21:00", highlighted: true },
      { day: "Tue", open: "08:00-21:00" },
      { day: "Wed", open: "08:00-21:00" },
      { day: "Thu", open: "08:00-21:00" },
      { day: "Fri", open: "08:00-18:00" },
      { day: "Sat", open: "Closed" },
      { day: "Sun", open: "Closed" },
    ],
    deal: "Free coffee service for workshop hosts on standard and premium plans",
    upcomingEventSlugs: ["react-server-components-workshop"],
    gallery: [
      "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(30,27,46,0.92))",
      "linear-gradient(135deg, rgba(245,240,232,0.92), rgba(55,48,163,0.62))",
      "linear-gradient(135deg, rgba(232,97,77,0.74), rgba(55,48,163,0.9))",
    ],
    art: "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(30,27,46,0.92))",
  },
  {
    slug: "bryggjuhusid",
    name: "Bryggjuhusid",
    type: "Wine Bar",
    area: "Bankastraeti",
    capacity: 40,
    rating: 4.9,
    summary: "A premium small-format wine venue suited to guided tastings and intimate hosted events.",
    description: [
      "Bryggjuhusid is one of the strongest examples of premium inventory in the venue network. Its seating, pacing, and staff support make it ideal for limited-capacity events that should feel worth paying for.",
      "As the product matures, this type of venue is where margin, reviews, and recurring quality can compound.",
    ],
    address: "Bankastraeti 9, 101 Reykjavik",
    amenities: ["Seated tasting", "Curated menu", "Premium service", "Quiet format"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "17:00-23:00" },
      { day: "Wed", open: "17:00-23:00", highlighted: true },
      { day: "Thu", open: "17:00-00:00" },
      { day: "Fri", open: "17:00-01:00" },
      { day: "Sat", open: "17:00-01:00" },
      { day: "Sun", open: "Closed" },
    ],
    deal: "Hosted tasting add-on menu for venue premium partners",
    upcomingEventSlugs: ["wine-tasting-volcanic-terroir"],
    gallery: [
      "linear-gradient(135deg, rgba(232,97,77,0.86), rgba(42,38,56,0.94))",
      "linear-gradient(135deg, rgba(245,240,232,0.9), rgba(232,97,77,0.76))",
      "linear-gradient(135deg, rgba(79,70,229,0.72), rgba(232,97,77,0.84))",
    ],
    art: "linear-gradient(135deg, rgba(232,97,77,0.86), rgba(42,38,56,0.94))",
  },
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "why-reykjavik-needs-a-better-meetup-layer",
    title: "Why Reykjavik Needs a Better Meetup Layer",
    category: "Product",
    publishedAt: "March 10, 2026",
    excerpt: "A closer look at why local discovery should feel warmer, calmer, and more venue-aware than the generic event feed.",
    readTime: "6 min read",
    hero: "linear-gradient(135deg, rgba(55,48,163,0.96), rgba(232,97,77,0.84))",
    sections: [
      {
        heading: "The problem with generic event products",
        body: "Most products flatten the experience into a feed. Discovery becomes noisy, quality becomes inconsistent, and the burden shifts to users to work out which hosts and venues are actually trustworthy.",
      },
      {
        heading: "Why local venues matter",
        body: "The best city communities are not abstract. They happen in places. A venue-aware platform can support organizers, improve event quality, and create a healthier local loop for both social life and small businesses.",
      },
      {
        heading: "What MeetupReykjavik is trying to do differently",
        body: "The ambition is not to become a noisy marketplace. It is to build an editorial, trustworthy, city-specific layer for people, groups, and venues that actually belong together.",
      },
    ],
  },
  {
    slug: "designing-events-for-newcomers",
    title: "Designing Events for Newcomers",
    category: "Community",
    publishedAt: "March 8, 2026",
    excerpt: "The best social formats reduce friction on arrival, use host structure well, and make the first five minutes feel safe.",
    readTime: "4 min read",
    hero: "linear-gradient(135deg, rgba(245,240,232,0.9), rgba(79,70,229,0.82))",
    sections: [
      {
        heading: "Arrival is the product",
        body: "For new attendees, the emotional journey starts before the event itself. Clear instructions, visible hosts, and simple first steps change retention more than flashy branding.",
      },
      {
        heading: "Structured social beats unstructured crowds",
        body: "Light prompts, timed intros, and easy group formats help people settle faster. This matters even more in a city where many attendees are new to the country.",
      },
    ],
  },
  {
    slug: "how-venue-partnerships-improve-community-quality",
    title: "How Venue Partnerships Improve Community Quality",
    category: "Venues",
    publishedAt: "March 4, 2026",
    excerpt: "Strong venues do more than host events. They shape the trust, pace, and repeatability of the community itself.",
    readTime: "5 min read",
    hero: "linear-gradient(135deg, rgba(232,97,77,0.84), rgba(42,38,56,0.94))",
    sections: [
      {
        heading: "The venue is part of the format",
        body: "A good venue supports the event logic. The room layout, service model, and arrival experience all affect whether an event feels premium, relaxed, or chaotic.",
      },
      {
        heading: "Partnerships can benefit everyone",
        body: "When venues get better visibility and organizers get better tooling, members get a better night out. The best marketplace products align those incentives instead of forcing them apart.",
      },
    ],
  },
] as const;

export const aboutStats = [
  { label: "Members", value: "2,847" },
  { label: "Groups", value: "156" },
  { label: "Venue partners", value: "34" },
  { label: "Weekly events", value: "89" },
] as const;

export const aboutTeam = [
  {
    name: "Baldvin",
    role: "Platform owner",
    note: "Setting the product direction, partnerships, and community tone.",
  },
  {
    name: "Community hosts",
    role: "Local curators",
    note: "Helping event formats stay welcoming, structured, and worth repeating.",
  },
  {
    name: "Venue partners",
    role: "City network",
    note: "Providing the rooms, deals, and operational backbone for better local events.",
  },
] as const;

export const userTiers = [
  {
    name: "Free",
    price: "0 ISK",
    description: "Join the network, browse the city, and buy tickets when a format is worth showing up for.",
    features: ["Unlimited browsing", "Ticket checkout", "Standard RSVP"],
  },
  {
    name: "Plus",
    price: "2,250 ISK / mo",
    description: "Priority waitlists, cleaner discovery, and stronger access to premium community formats.",
    features: ["Priority waitlist", "Direct messaging", "Premium badge"],
  },
  {
    name: "Pro",
    price: "5,250 ISK / mo",
    description: "Advanced tools for power members, community regulars, and people who want the strongest event signal.",
    features: ["Everything in Plus", "Advanced filters", "Early access features"],
  },
] as const;

export const organizerTiers = [
  {
    name: "Organizer Starter",
    price: "4,900 ISK / mo",
    description: "Launch public events with structured publishing, payments, and basic audience controls.",
    features: [
      "Up to 3 active public events",
      `Public ticketing from ${minimumTicketPriceIsk} ISK`,
      `${ticketCommissionRate}% ticket commission`,
      "Basic event analytics",
    ],
  },
  {
    name: "Organizer Pro",
    price: "9,900 ISK / mo",
    description: "Run recurring formats with attendee approvals, venue workflows, and stronger conversion tooling.",
    features: [
      "Unlimited recurring events",
      "Approval and waitlist controls",
      "Venue request workflows",
      "Audience and revenue reporting",
    ],
  },
  {
    name: "Organizer Studio",
    price: "19,900 ISK / mo",
    description: "Built for serious hosts running premium formats, sponsor inventory, and multiple recurring series.",
    features: [
      "Priority support and launch reviews",
      "Featured placement eligibility",
      "Sponsor and partner inventory",
      "Advanced audience segmentation",
    ],
  },
] as const;

export const venueTiers = [
  {
    name: "Venue Listing",
    price: "0 ISK",
    description: "Basic listing visibility and review access before a venue starts using the workflow product.",
    features: ["Basic public listing", "Application review", "No booking workflow"],
  },
  {
    name: "Venue Partner",
    price: "9,900 ISK / mo",
    description: "Operational booking tools, availability management, and commercial partner workflows.",
    features: [
      "Booking inbox and responses",
      "Availability planning",
      "Partner deal management",
      "Organizer-fit insights",
    ],
  },
  {
    name: "Venue Premium",
    price: "19,900 ISK / mo",
    description: "Featured placement, premium analytics, and higher-leverage inventory for serious venue operators.",
    features: [
      "Featured placement",
      "Premium analytics and trend views",
      "Priority venue matching",
      "Sponsored inventory support",
    ],
  },
] as const;

export const pricingFaq = [
  {
    question: "Do events need to be paid?",
    answer: `Public paid events should start at ${minimumTicketPriceIsk} ISK. Free events are reserved for sponsor-backed launches, invite-only sessions, or admin-approved community exceptions.`,
  },
  {
    question: "What do organizers pay?",
    answer: "Organizers pay a monthly creator plan once they want to publish public events at scale, run recurring series, or use approval, analytics, and venue workflows as real operating tools.",
  },
  {
    question: "What do venues pay?",
    answer: "Venues can start as a basic listing, but the actual booking, deal, and analytics product is paid. Serious partner venues move onto monthly plans because the workflow value is part of the business, not free exposure.",
  },
  {
    question: "How are tickets and commission handled?",
    answer: `Paid ticketing is designed around a ${ticketCommissionRate}% platform commission, later wired to PayPal. That keeps the platform earning on successful events, not only on subscriptions.`,
  },
] as const;

export const publicCategoryOptions = [
  "All",
  ...homepageCategories.map((category) => category.name.split(" & ")[0]),
] as const;

export function getEventBySlug(slug: string) {
  return publicEvents.find((event) => event.slug === slug);
}

export function getGroupBySlug(slug: string) {
  return publicGroups.find((group) => group.slug === slug);
}

export function getVenueBySlug(slug: string) {
  return publicVenues.find((venue) => venue.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
