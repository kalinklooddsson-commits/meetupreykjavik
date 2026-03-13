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
  latitude?: number;
  longitude?: number;
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
      "The venue partner supports the night with a member deal and a dedicated arrival area, which means the event feels intentional from the first minute instead of improvised at the bar counter."
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
    art: "url('/place-images/reykjavik/venues/lebowski-bar.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/lebowski-bar.jpg')"
    ],
    comments: [
      { author: "Anna", text: "Love that this one has a host and not just a crowd.", postedAt: "2 hours ago" },
      { author: "Marta", text: "The last edition felt welcoming even if you came alone.", postedAt: "Yesterday" }
    ],
    ratings: [
      { author: "Jon", rating: 5, text: "Good energy, well-paced, and the venue actually fit the format." },
      { author: "Sofia", rating: 4, text: "Would go again. The smaller group intros helped a lot." }
    ],
  },
  {
    slug: "saturday-hike-mt-esja",
    title: "Saturday Hike to Mt. Esja",
    category: "Outdoors",
    eventType: "in_person",
    dateFilter: "Weekend",
    startsAt: "2026-03-21T09:00:00Z",
    endsAt: "2026-03-21T13:30:00Z",
    venueName: "Esja Trailhead",
    venueSlug: "esja-trailhead",
    groupName: "Reykjavik Hikers",
    groupSlug: "reykjavik-hikers",
    hostName: "Helga Arnadottir",
    area: "Esja",
    summary: "A beginner-friendly mountain morning with route pacing, coffee after, and a proper meetup point.",
    description: [
      "The hike is designed for steady pacing rather than speed. Organizers split the group naturally based on comfort and make the route feel accessible to people who are still learning the local trails.",
      "What makes this format work is the social structure around it: clear arrival instructions, warm-up chat, and a simple cafe finish after the descent so the meetup does not end at the parking lot."
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
    art: "linear-gradient(135deg, rgba(45,80,22,0.2), rgba(120,160,80,0.15)), url('/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg')",
    gallery: [
    ],
    comments: [
      { author: "Brynjar", text: "Great host notes in advance. Easy to join solo.", postedAt: "5 hours ago" },
      { author: "Lina", text: "Happy this one keeps a no-drop pace.", postedAt: "1 day ago" }
    ],
    ratings: [
      { author: "Rakel", rating: 5, text: "Clear communication and a genuinely friendly group." }
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
      "This format also fits the broader platform vision: serious organizers, strong partner venues, and events that feel useful enough to justify a recurring community around them."
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
    art: "url('/place-images/reykjavik/venues/grandi-hub.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/grandi-hub.jpg')"
    ],
    comments: [
      { author: "Aron", text: "Nice to see a technical event with real implementation time.", postedAt: "3 hours ago" },
      { author: "Mia", text: "Would love a follow-up on auth and caching patterns.", postedAt: "2 days ago" }
    ],
    ratings: [
      { author: "Einar", rating: 5, text: "Dense but practical. The venue setup also worked well." }
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
      "This is the kind of venue-led format the product should eventually monetize well: premium inventory, limited capacity, and strong host credibility."
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
    art: "url('/place-images/reykjavik/venues/apotek.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/apotek.jpg')"
    ],
    comments: [
      { author: "Klara", text: "The seated format makes this feel premium, not rushed.", postedAt: "Today" }
    ],
    ratings: [
      { author: "Ivar", rating: 5, text: "Excellent host and the venue fit the concept perfectly." }
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
      "Because the format is repeatable, it gives the platform a strong example of how group identity, venue partnership, and event consistency can reinforce one another."
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
    art: "url('/place-images/reykjavik/venues/kex-hostel.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/kex-hostel.jpg')"
    ],
    comments: [
      { author: "Diego", text: "Exactly the kind of structure newcomers need.", postedAt: "4 hours ago" },
      { author: "Freya", text: "I like that the venue keeps space near the host desk for arrivals.", postedAt: "Yesterday" }
    ],
    ratings: [
      { author: "Lukas", rating: 4, text: "Friendly crowd, not too forced, good host energy." }
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
      "The hybrid format shows how the product can support different event shapes without flattening everything into the same RSVP experience."
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
    art: "url('/place-images/reykjavik/venues/dillon.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/dillon.jpg')"
    ],
    comments: [
      { author: "Runa", text: "Love that the first set is streamable.", postedAt: "Today" }
    ],
    ratings: [
      { author: "Petur", rating: 5, text: "Great venue and strong curation." }
    ],
  },
  {
    slug: "craft-beer-tasting-vesturgata",
    title: "Craft Beer Tasting - Vesturgata",
    category: "Food",
    eventType: "in_person",
    dateFilter: "Weekend",
    startsAt: "2026-03-21T18:00:00Z",
    endsAt: "2026-03-21T20:30:00Z",
    venueName: "Micro Bar",
    venueSlug: "micro-bar",
    groupName: "Reykjavik Foodies",
    groupSlug: "reykjavik-foodies",
    hostName: "Sara Magnusdottir",
    area: "Vesturgata",
    summary: "A guided walk through six Icelandic craft beers with tasting notes, food pairings, and candid brewer stories.",
    description: [
      "This tasting is built for curiosity rather than expertise. Each pour comes with a short introduction from the host, covering ingredients, brewing approach, and the local story behind the label. The pace is relaxed and questions are welcome throughout.",
      "The intimate room at Micro Bar means conversations happen naturally between pours. The format works well for both solo attendees and small groups, and the food pairing keeps things grounded across the evening."
    ],
    attendees: 35,
    capacity: 45,
    priceLabel: "2,900 ISK",
    ageLabel: "20+",
    isFree: false,
    visibilityLabel: "Public tasting with limited seating",
    approvalLabel: "Paid booking with host confirmation",
    reminderLabel: "24h reminder with tasting preview and arrival note",
    hostContact: "Sara Magnusdottir via host inbox",
    shareLabel: "Share with a friend who appreciates good craft beer",
    art: "url('/place-images/reykjavik/venues/micro-bar.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/micro-bar.jpg')"
    ],
    comments: [
      { author: "Gunnar", text: "The brewer stories made this way more interesting than a standard tasting.", postedAt: "3 hours ago" },
      { author: "Helga", text: "Small venue, big flavor. Perfect Saturday evening.", postedAt: "Yesterday" }
    ],
    ratings: [
      { author: "Kristin", rating: 5, text: "Intimate, well-paced, and the food pairings were spot on." },
      { author: "Olafur", rating: 4, text: "Great selection. Would love a seasonal follow-up." }
    ],
  },
  {
    slug: "morning-yoga-flow",
    title: "Morning Yoga Flow",
    category: "Sports",
    eventType: "hybrid",
    dateFilter: "This Week",
    startsAt: "2026-03-18T07:30:00Z",
    endsAt: "2026-03-18T08:45:00Z",
    venueName: "Loft Hostel",
    venueSlug: "loft-hostel",
    groupName: "Wellness Reykjavik",
    groupSlug: "wellness-reykjavik",
    hostName: "Johanna Petursdottir",
    area: "Bankastraeti",
    summary: "A welcoming morning flow class with a live-streamed option for remote participants who prefer to practice at home.",
    description: [
      "The class is designed for all levels, with modifications offered throughout. The instructor keeps the energy grounded and the cues clear, making it easy for beginners to follow along without feeling lost in a room full of experienced practitioners.",
      "The hybrid format means you can join from home if the weather is rough or you prefer a quiet start. The live stream captures the instructor and the room ambiance, so remote participants still feel part of the group energy."
    ],
    attendees: 22,
    capacity: 30,
    priceLabel: "1,200 ISK",
    ageLabel: "All ages",
    isFree: false,
    visibilityLabel: "Public class with hybrid access",
    approvalLabel: "Open booking with mat reservation",
    reminderLabel: "Evening-before reminder with stream link and arrival note",
    hostContact: "Johanna Petursdottir via wellness inbox",
    shareLabel: "Share with a friend who needs a calmer morning routine",
    art: "url('/place-images/reykjavik/venues/loft-hostel.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/loft-hostel.jpg')"
    ],
    comments: [
      { author: "Lilja", text: "The hybrid option is a lifesaver on dark mornings.", postedAt: "5 hours ago" },
      { author: "Tomoko", text: "Really thoughtful modifications for beginners. I felt included.", postedAt: "2 days ago" }
    ],
    ratings: [
      { author: "Anna", rating: 5, text: "Best morning routine I have found in Reykjavik. Calm, clear, consistent." },
      { author: "Markus", rating: 4, text: "Good energy and the stream quality was surprisingly solid." }
    ],
  },
  {
    slug: "startup-pitch-night",
    title: "Startup Pitch Night",
    category: "Tech",
    eventType: "in_person",
    dateFilter: "Month",
    startsAt: "2026-04-02T19:00:00Z",
    endsAt: "2026-04-02T21:30:00Z",
    venueName: "Hlemmur Square",
    venueSlug: "hlemmur-square",
    groupName: "Tech Community RVK",
    groupSlug: "tech-community-rvk",
    hostName: "Bjorn Olafsson",
    area: "Hlemmur",
    summary: "Five early-stage founders pitch to a room of builders, operators, and curious locals in a structured but informal format.",
    description: [
      "Each founder gets eight minutes to present and four minutes for questions. The format keeps things tight without making it feel like a competition. The audience includes developers, designers, and people from outside tech who bring fresh perspective.",
      "After the pitches, the room opens up for food and conversation. Hlemmur Square provides a good mix of energy and space, and the bar menu keeps the social half grounded in something more than networking platitudes."
    ],
    attendees: 78,
    capacity: 120,
    priceLabel: "1,500 ISK",
    ageLabel: "18+",
    isFree: false,
    visibilityLabel: "Public pitch event with featured placement",
    approvalLabel: "Open ticketing with founder application for pitch slots",
    reminderLabel: "48h reminder with pitch lineup and 2h doors-open alert",
    hostContact: "Bjorn Olafsson via organizer inbox",
    shareLabel: "Share with founders and curious builders in your network",
    art: "url('/place-images/reykjavik/venues/hlemmur-square.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/hlemmur-square.jpg')"
    ],
    comments: [
      { author: "Dagny", text: "The format is tight. Eight minutes forces clarity.", postedAt: "Today" },
      { author: "Siggi", text: "Good mix of technical and non-technical audience. Makes the Q&A better.", postedAt: "3 hours ago" }
    ],
    ratings: [
      { author: "Hanna", rating: 5, text: "One of the best startup events in the city. No fluff." },
      { author: "Einar", rating: 4, text: "Strong lineup. The food hall setting keeps it relaxed after the pitches." }
    ],
  },
  {
    slug: "poetry-open-mic",
    title: "Poetry Open Mic",
    category: "Arts",
    eventType: "in_person",
    dateFilter: "This Week",
    startsAt: "2026-03-19T20:00:00Z",
    endsAt: "2026-03-19T22:30:00Z",
    venueName: "Cafe Rosenberg",
    venueSlug: "cafe-rosenberg",
    groupName: "Creative Reykjavik",
    groupSlug: "creative-reykjavik",
    hostName: "Elin Thors",
    area: "Klapparstígur",
    summary: "An open mic night for poetry, spoken word, and short prose in a live music cafe with warm acoustics and attentive listeners.",
    description: [
      "The format alternates between featured readers and open slots. Sign-up happens at the door and each performer gets five minutes. The host keeps the pacing warm and the transitions smooth, so even first-time readers feel supported.",
      "Cafe Rosenberg brings natural atmosphere to the evening. The room is small enough that every voice carries, and the audience tends to be attentive and generous. It is one of the best rooms in Reykjavik for this kind of event."
    ],
    attendees: 28,
    capacity: 50,
    priceLabel: "800 ISK",
    ageLabel: "All ages",
    isFree: false,
    visibilityLabel: "Public cultural event with open sign-up",
    approvalLabel: "Open entry with sign-up sheet at door",
    reminderLabel: "24h reminder with featured reader lineup",
    hostContact: "Elin Thors via cultural host channel",
    shareLabel: "Share with a friend who writes or wants to listen",
    art: "url('/place-images/reykjavik/venues/cafe-rosenberg.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/cafe-rosenberg.jpg')"
    ],
    comments: [
      { author: "Bjork", text: "The room is perfect for this. Every word lands.", postedAt: "4 hours ago" },
      { author: "Jonas", text: "First time reading in front of people. The host made it easy.", postedAt: "Yesterday" }
    ],
    ratings: [
      { author: "Ragnhildur", rating: 5, text: "Warm crowd, beautiful venue, and the pacing never dragged." },
      { author: "David", rating: 5, text: "This is exactly the kind of event Reykjavik needs more of." }
    ],
  },
  {
    slug: "language-exchange-thursday",
    title: "Language Exchange Thursday",
    category: "Expat",
    eventType: "in_person",
    dateFilter: "This Week",
    startsAt: "2026-03-19T17:30:00Z",
    endsAt: "2026-03-19T19:30:00Z",
    venueName: "Mokka Kaffi",
    venueSlug: "mokka",
    groupName: "Language Exchange RVK",
    groupSlug: "language-exchange-rvk",
    hostName: "Pierre Dupont",
    area: "Skólavörðustígur",
    summary: "A structured language table where Icelandic learners and native speakers practice together over coffee in a historic cafe.",
    description: [
      "The format uses timed conversation rounds with topic cards. Each table has a mix of skill levels and the host rotates participants every fifteen minutes. This keeps conversations fresh and gives everyone exposure to different speaking styles.",
      "Mokka Kaffi provides the ideal setting: quiet enough for conversation, central enough for easy access, and historically significant enough that even the venue becomes a talking point. Coffee is self-serve and the atmosphere does the rest."
    ],
    attendees: 18,
    capacity: 25,
    priceLabel: "Free",
    ageLabel: "All ages",
    isFree: true,
    visibilityLabel: "Public language event with newcomer priority",
    approvalLabel: "Open RSVP with language level survey",
    reminderLabel: "24h reminder with table assignment and topic preview",
    hostContact: "Pierre Dupont via language exchange inbox",
    shareLabel: "Share with someone learning Icelandic or wanting to help",
    art: "url('/place-images/reykjavik/venues/mokka.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/mokka.jpg')"
    ],
    comments: [
      { author: "Margret", text: "The topic cards are a clever touch. No awkward silences.", postedAt: "2 hours ago" },
      { author: "Ahmed", text: "I have been coming every week. My Icelandic has improved noticeably.", postedAt: "3 days ago" }
    ],
    ratings: [
      { author: "Katrin", rating: 5, text: "Best language practice format in the city. The cafe is lovely too." },
      { author: "Liam", rating: 4, text: "Well-organized and very welcoming to beginners." }
    ],
  },
  {
    slug: "friday-dinner-social",
    title: "Friday Dinner Social",
    category: "Social",
    eventType: "in_person",
    dateFilter: "Weekend",
    startsAt: "2026-03-20T19:30:00Z",
    endsAt: "2026-03-20T22:30:00Z",
    venueName: "Snaps Bistro Bar",
    venueSlug: "snaps",
    groupName: "Nightlife Reykjavik",
    groupSlug: "nightlife-reykjavik",
    hostName: "Kari Sigurdsson",
    area: "Þórsgata",
    summary: "A hosted dinner night with communal seating, a set menu, and a social format that makes meeting people over food feel natural.",
    description: [
      "The evening starts with a welcome drink and a brief host introduction. Guests are seated at communal tables with a rotating conversation format during the first course. By the second course, the table has settled into its own rhythm.",
      "Snaps Bistro Bar handles the food side beautifully. The set menu removes decision fatigue and the wine pairing option keeps the evening cohesive. This is one of those events where the venue and the format genuinely reinforce each other."
    ],
    attendees: 42,
    capacity: 60,
    priceLabel: "4,500 ISK",
    ageLabel: "20+",
    isFree: false,
    visibilityLabel: "Public dinner event with communal format",
    approvalLabel: "Paid booking with dietary preference form",
    reminderLabel: "48h menu preview and same-day table assignment",
    hostContact: "Kari Sigurdsson via social host inbox",
    shareLabel: "Share with someone who enjoys a good dinner conversation",
    art: "url('/place-images/reykjavik/venues/hlemmur-square.jpg')",
    gallery: [
      "url('/place-images/reykjavik/venues/hlemmur-square.jpg')"
    ],
    comments: [
      { author: "Vala", text: "The communal table format works so well here. Met great people.", postedAt: "Today" },
      { author: "Sven", text: "Set menu was excellent. The wine pairing elevated the whole evening.", postedAt: "Yesterday" }
    ],
    ratings: [
      { author: "Gudrun", rating: 5, text: "This is how dinner socials should be done. Food, people, and pacing all aligned." },
      { author: "Leo", rating: 5, text: "Best Friday night event I have attended in Reykjavik." }
    ],
  }
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
      "It is exactly the kind of durable local group the platform should spotlight: easy to understand, high trust, and strongly tied to place."
    ],
    organizer: "Helga Arnadottir",
    banner: "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
    tags: ["Hikes", "Day trips", "Coffee after"],
    upcomingEventSlugs: ["saturday-hike-mt-esja"],
    pastEvents: ["Sunset walk at Grotta", "Hot spring day trip", "Midweek valley loop"],
    discussions: [
      { title: "Best boots for March conditions?", replies: 18, preview: "Members are comparing waterproof options and traction tips." },
      { title: "Ride share thread for Esja", replies: 9, preview: "Coordinating pickup spots from central Reykjavik." }
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
      "As a platform anchor, this group demonstrates how onboarding, recurring events, and profile identity can work together."
    ],
    organizer: "Marta Polak",
    banner: "/place-images/reykjavik/venues/lebowski-bar.jpg",
    tags: ["New in town", "Social", "Resources"],
    upcomingEventSlugs: ["speed-friending-newcomers"],
    pastEvents: ["Sunday bakery crawl", "Language exchange intro", "Local rent Q and A"],
    discussions: [
      { title: "Best neighborhoods for first-year living", replies: 34, preview: "Members are comparing commute, noise, and rent tradeoffs." },
      { title: "What should every newcomer know before winter?", replies: 21, preview: "Gear, routines, and social tips from long-time members." }
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
      "This is also one of the strongest cases for the organizer dashboard: recurring templates, attendee management, and analytics all matter here."
    ],
    organizer: "Bjorn Olafsson",
    banner: "linear-gradient(135deg, rgba(55,48,163,0.2), rgba(232,97,77,0.4)), url('/place-images/reykjavik/generated/grandi-hub.svg')",
    tags: ["Workshops", "Founders", "Product"],
    upcomingEventSlugs: ["react-server-components-workshop", "startup-pitch-night"],
    pastEvents: ["Edge functions deep dive", "Startup operator breakfast", "Design systems night"],
    discussions: [
      { title: "Who wants a follow-up on auth architecture?", replies: 12, preview: "Members are proposing a smaller working session." },
      { title: "Good coworking spaces for evening meetups", replies: 7, preview: "Venue recommendations and setup tradeoffs." }
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
      "Its events also show how venue partnerships can serve culture without making the product feel corporate or generic."
    ],
    organizer: "Elin Thors",
    banner: "/place-images/reykjavik/venues/kex-hostel.jpg",
    tags: ["Gallery walks", "Music", "Culture"],
    upcomingEventSlugs: ["harbor-jazz-social", "poetry-open-mic"],
    pastEvents: ["After-hours exhibition visit", "Sketchbook cafe session", "Studio open evening"],
    discussions: [
      { title: "Best small venues for creative formats", replies: 11, preview: "Members are sharing spaces that feel intimate without being cramped." },
      { title: "Who is going to the jazz social?", replies: 6, preview: "Coordinating arrivals and post-set drinks." }
    ],
  },
  {
    slug: "reykjavik-foodies",
    name: "Reykjavik Foodies",
    category: "Food",
    members: 167,
    activity: 71,
    summary: "Tastings, food walks, and kitchen culture events for people who take eating in Reykjavik seriously.",
    description: [
      "The group is built around discovery. Each event explores a different corner of the local food scene, from craft beer and natural wine to seasonal Icelandic ingredients. The format keeps things social and accessible rather than pretentious.",
      "Members range from home cooks to hospitality professionals, and the discussions often surface restaurant tips, seasonal recommendations, and behind-the-scenes stories from the local food world."
    ],
    organizer: "Sara Magnusdottir",
    banner: "/place-images/reykjavik/venues/hlemmur-square.jpg",
    tags: ["Tastings", "Food walks", "Wine", "Craft beer"],
    upcomingEventSlugs: ["wine-tasting-volcanic-terroir", "craft-beer-tasting-vesturgata"],
    pastEvents: ["Fermented food workshop", "Bakery crawl downtown", "Seasonal lamb tasting"],
    discussions: [
      { title: "Best bakeries for weekend pastries?", replies: 23, preview: "Members are comparing Sandholt, Braud, and the newer spots on Skolavordustigur." },
      { title: "Natural wine worth trying this month", replies: 14, preview: "A few bottles from the latest imports are getting attention." }
    ],
  },
  {
    slug: "nightlife-reykjavik",
    name: "Nightlife Reykjavik",
    category: "Social",
    members: 389,
    activity: 85,
    summary: "Social nights, dinner events, and weekend gatherings for people who want more than random bar hopping.",
    description: [
      "The group organizes structured social formats that make going out feel intentional. Dinner socials, hosted bar nights, and seasonal parties are designed with arrival flow, conversation structure, and venue partnerships that raise the quality above typical weekend plans.",
      "It is one of the most active groups on the platform and a strong example of how nightlife formats can be community-driven without losing spontaneity."
    ],
    organizer: "Kari Sigurdsson",
    banner: "/place-images/reykjavik/venues/lebowski-bar.jpg",
    tags: ["Social nights", "Dinner parties", "Weekend events", "Hosted bars"],
    upcomingEventSlugs: ["singles-night-25-35", "friday-dinner-social"],
    pastEvents: ["New Year rooftop social", "Valentine wine and dine", "Spring equinox gathering"],
    discussions: [
      { title: "Best venues for a 40-person dinner?", replies: 19, preview: "Members are comparing Snaps, Grillid, and Forrettabarinn for group bookings." },
      { title: "Should we do a monthly theme night?", replies: 27, preview: "Strong interest in rotating cuisine or cocktail themes each month." }
    ],
  },
  {
    slug: "wellness-reykjavik",
    name: "Wellness Reykjavik",
    category: "Sports",
    members: 142,
    activity: 64,
    summary: "Yoga, breathwork, and mindful movement events for people who want a calmer start to the day or week.",
    description: [
      "The group focuses on accessible wellness formats. Classes are designed for mixed levels, locations are chosen for atmosphere and calm, and the community tone stays grounded rather than performative.",
      "Members join for the consistency as much as the content. Weekly morning sessions, seasonal retreats, and honest discussions about wellness in Reykjavik keep the group engaged beyond individual events."
    ],
    organizer: "Johanna Petursdottir",
    banner: "/place-images/reykjavik/venues/loft-hostel.jpg",
    tags: ["Yoga", "Breathwork", "Morning sessions", "Mindfulness"],
    upcomingEventSlugs: ["morning-yoga-flow"],
    pastEvents: ["Sunset breathwork at Grotta", "New moon meditation circle", "Winter solstice yoga"],
    discussions: [
      { title: "Favorite spots for outdoor practice in spring?", replies: 11, preview: "Members are sharing sheltered spots near the shore and in Laugardalur." },
      { title: "Interest check: weekend retreat in April", replies: 16, preview: "Gauging numbers for a cabin retreat with yoga and hot pot sessions." }
    ],
  },
  {
    slug: "language-exchange-rvk",
    name: "Language Exchange RVK",
    category: "Language",
    members: 231,
    activity: 78,
    summary: "Weekly conversation tables for Icelandic learners, native speakers, and multilingual residents who want structured practice.",
    description: [
      "The group runs regular language tables with timed rotations, topic cards, and a mix of skill levels at each session. The format is designed to feel social rather than academic, and the host keeps the energy warm and the transitions smooth.",
      "It has become one of the most reliable weekly meetups in the city. Members come for the practice and stay for the community. The discussions often extend into grammar tips, resource sharing, and cultural context that textbooks miss."
    ],
    organizer: "Pierre Dupont",
    banner: "/place-images/reykjavik/venues/stofan-cafe.jpg",
    tags: ["Icelandic", "Language tables", "Conversation practice", "Multilingual"],
    upcomingEventSlugs: ["language-exchange-thursday"],
    pastEvents: ["Icelandic movie night with subtitles", "Grammar workshop for beginners", "Holiday vocabulary session"],
    discussions: [
      { title: "Best apps for Icelandic vocabulary?", replies: 31, preview: "Members are comparing Drops, Memrise, and custom Anki decks." },
      { title: "Tips for understanding spoken Icelandic faster", replies: 22, preview: "Podcast recommendations and shadowing techniques from advanced learners." }
    ],
  }
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
      "For the platform, it is a strong example of a venue partner that benefits from recurring formats and member-only deals."
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
      { day: "Sun", open: "16:00-00:00" }
    ],
    deal: "2-for-1 welcome drink for MeetupReykjavik hosts before 21:00",
    upcomingEventSlugs: ["singles-night-25-35"],
    gallery: [
      "url('/place-images/reykjavik/venues/lebowski-bar.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/lebowski-bar.jpg')",
    latitude: 64.1475,
    longitude: -21.9256,
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
      "It is especially good for social formats that depend on a strong arrival flow and a forgiving environment for first-time attendees."
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
      { day: "Sun", open: "12:00-22:00" }
    ],
    deal: "Welcome drink for approved organizers and discounted group platters",
    upcomingEventSlugs: ["speed-friending-newcomers"],
    gallery: [
      "url('/place-images/reykjavik/venues/kex-hostel.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/kex-hostel.jpg')",
    latitude: 64.1499,
    longitude: -21.9319,
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
      "This is where the platform can demonstrate that venue partnerships are not just nightlife. Utility matters too."
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
      { day: "Sun", open: "Closed" }
    ],
    deal: "Free coffee service for workshop hosts on standard and premium plans",
    upcomingEventSlugs: ["react-server-components-workshop"],
    gallery: [
      "url('/place-images/reykjavik/venues/grandi-hub.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/grandi-hub.jpg')",
    latitude: 64.1562,
    longitude: -21.9558,
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
      "As the product matures, this type of venue is where margin, reviews, and recurring quality can compound."
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
      { day: "Sun", open: "Closed" }
    ],
    deal: "Hosted tasting add-on menu for venue premium partners",
    upcomingEventSlugs: ["wine-tasting-volcanic-terroir"],
    gallery: [
    ],
    art: "linear-gradient(135deg, rgba(30,30,60,0.2), rgba(80,40,20,0.15)), url('/place-images/reykjavik/generated/bryggjan-brugghus.svg')",
  },
  {
    slug: "loft-hostel",
    name: "Loft Hostel",
    type: "Bar & Social Space",
    area: "Bankastraeti",
    capacity: 100,
    rating: 4.5,
    summary: "A central social space with a rooftop terrace and a relaxed ground floor that works well for casual meetups and morning events.",
    description: [
      "Loft Hostel sits right on Bankastraeti with one of the better rooftop views in downtown Reykjavik. The ground floor bar doubles as a social hub with flexible seating that can accommodate everything from yoga mats to speed friending tables.",
      "For the platform, it represents a versatile venue partner. The morning availability makes it unusual among bar-first venues, and the hostel crowd adds a natural international energy to any event held here."
    ],
    address: "Bankastraeti 7a, 101 Reykjavik",
    amenities: ["Rooftop terrace", "Flexible ground floor", "Morning availability", "International crowd"],
    hours: [
      { day: "Mon", open: "08:00-23:00" },
      { day: "Tue", open: "08:00-23:00" },
      { day: "Wed", open: "08:00-00:00" },
      { day: "Thu", open: "08:00-00:00" },
      { day: "Fri", open: "08:00-01:00", highlighted: true },
      { day: "Sat", open: "09:00-01:00" },
      { day: "Sun", open: "09:00-22:00" }
    ],
    deal: "Free room setup for morning wellness events booked through MeetupReykjavik",
    upcomingEventSlugs: ["morning-yoga-flow"],
    gallery: [
      "url('/place-images/reykjavik/venues/loft-hostel.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/loft-hostel.jpg')",
    latitude: 64.1471,
    longitude: -21.9331,
  },
  {
    slug: "micro-bar",
    name: "Micro Bar",
    type: "Craft Beer Bar",
    area: "Vesturgata",
    capacity: 45,
    rating: 4.8,
    summary: "An intimate craft beer bar with a curated tap list and a room that turns every tasting into a conversation.",
    description: [
      "Micro Bar is one of the best small venues in the city for events that thrive on proximity. The tap list rotates with Icelandic and Nordic craft breweries, and the staff genuinely know the product, which elevates any hosted tasting format.",
      "The tight room means events here feel like gatherings rather than performances. For organizers who want quality over headcount, this is one of the strongest venue options in downtown Reykjavik."
    ],
    address: "Vesturgata 2, 101 Reykjavik",
    amenities: ["Rotating tap list", "Tasting boards", "Knowledgeable staff", "Intimate seating"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "16:00-23:00" },
      { day: "Wed", open: "16:00-23:00" },
      { day: "Thu", open: "16:00-00:00" },
      { day: "Fri", open: "15:00-01:00", highlighted: true },
      { day: "Sat", open: "14:00-01:00" },
      { day: "Sun", open: "15:00-22:00" }
    ],
    deal: "Tasting board discount for MeetupReykjavik hosted events of 10+ guests",
    upcomingEventSlugs: ["craft-beer-tasting-vesturgata"],
    gallery: [
      "url('/place-images/reykjavik/venues/micro-bar.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/micro-bar.jpg')",
  },
  {
    slug: "hlemmur-square",
    name: "Hlemmur Square",
    type: "Food Hall & Bar",
    area: "Hlemmur",
    capacity: 200,
    rating: 4.4,
    summary: "A food hall and bar venue with high ceilings, multiple zones, and enough capacity for large community events and pitch nights.",
    description: [
      "Hlemmur Square occupies the former bus station at the east end of Laugavegur. The space has been converted into a food hall with multiple kitchen stalls, a central bar, and enough open floor to host events from fifty to two hundred people.",
      "For larger formats like pitch nights and community showcases, this is one of the few downtown venues that handles scale without losing atmosphere. The food stalls also mean attendees can eat during the event rather than scrambling for dinner plans afterward."
    ],
    address: "Laugavegur 105, 105 Reykjavik",
    amenities: ["Multiple food stalls", "Central bar", "High ceilings", "Stage area", "Flexible layout"],
    hours: [
      { day: "Mon", open: "11:00-22:00" },
      { day: "Tue", open: "11:00-22:00" },
      { day: "Wed", open: "11:00-23:00" },
      { day: "Thu", open: "11:00-23:00" },
      { day: "Fri", open: "11:00-01:00", highlighted: true },
      { day: "Sat", open: "11:00-01:00" },
      { day: "Sun", open: "11:00-22:00" }
    ],
    deal: "Reserved section and sound system access for events booked 2+ weeks in advance",
    upcomingEventSlugs: ["startup-pitch-night"],
    gallery: [
      "url('/place-images/reykjavik/venues/hlemmur-square.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/hlemmur-square.jpg')",
    latitude: 64.1443,
    longitude: -21.9148,
  },
  {
    slug: "cafe-rosenberg",
    name: "Cafe Rosenberg",
    type: "Live Music Cafe",
    area: "Klapparstígur",
    capacity: 60,
    rating: 4.7,
    summary: "A live music cafe with warm acoustics, candlelit tables, and a room that gives every performer and speaker a proper audience.",
    description: [
      "Cafe Rosenberg has been part of the Reykjavik music and cultural scene for years. The room is built for listening: the acoustics carry voices well, the seating draws attention forward, and the atmosphere is warm without being precious.",
      "For community events like open mics, readings, and small cultural nights, this venue adds something that most bars cannot: genuine attention. The audience here tends to be engaged and generous, which makes it a strong fit for creative formats."
    ],
    address: "Klapparstígur 25-27, 101 Reykjavik",
    amenities: ["Stage with sound system", "Candlelit tables", "Good acoustics", "Bar service"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "17:00-23:00" },
      { day: "Wed", open: "17:00-23:00" },
      { day: "Thu", open: "17:00-00:00", highlighted: true },
      { day: "Fri", open: "17:00-01:00" },
      { day: "Sat", open: "17:00-01:00" },
      { day: "Sun", open: "Closed" }
    ],
    deal: "Free sound check and stage setup for MeetupReykjavik cultural events",
    upcomingEventSlugs: ["poetry-open-mic"],
    gallery: [
      "url('/place-images/reykjavik/venues/cafe-rosenberg.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/cafe-rosenberg.jpg')",
  },
  {
    slug: "snaps",
    name: "Snaps Bistro Bar",
    type: "Restaurant & Bar",
    area: "Þórsgata",
    capacity: 80,
    rating: 4.6,
    summary: "A neighborhood bistro with communal table options, a strong kitchen, and a format that turns dinner into a social event.",
    description: [
      "Snaps sits on Thorsgata in a quieter part of downtown and runs a kitchen that locals return to regularly. The communal table setup makes it naturally suited to dinner socials, and the set menu option simplifies logistics for group events.",
      "The wine list is well-curated and the staff understand how to pace a multi-course evening for a group. For organizers running dinner formats, Snaps offers reliable quality and an atmosphere that feels convivial without being loud."
    ],
    address: "Þórsgata 1, 101 Reykjavik",
    amenities: ["Communal tables", "Set menu option", "Wine pairing", "Private dining area"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "17:30-22:30" },
      { day: "Wed", open: "17:30-22:30" },
      { day: "Thu", open: "17:30-23:00" },
      { day: "Fri", open: "17:30-00:00", highlighted: true },
      { day: "Sat", open: "17:00-00:00" },
      { day: "Sun", open: "17:00-22:00" }
    ],
    deal: "Complimentary welcome drink for MeetupReykjavik dinner groups of 8+",
    upcomingEventSlugs: ["friday-dinner-social"],
    gallery: [
      "linear-gradient(135deg, rgba(190,140,100,0.2), rgba(42,38,56,0.4)), url('/place-images/reykjavik/generated/snaps.svg')"
    ],
    art: "linear-gradient(135deg, rgba(190,140,100,0.2), rgba(42,38,56,0.4)), url('/place-images/reykjavik/generated/snaps.svg')",
  },
  {
    slug: "mokka",
    name: "Mokka Kaffi",
    type: "Historic Cafe",
    area: "Skólavörðustígur",
    capacity: 35,
    rating: 4.9,
    summary: "The oldest cafe in Reykjavik, with a timeless interior, strong coffee, and the kind of quiet atmosphere that suits book clubs and language tables.",
    description: [
      "Mokka Kaffi has been open since 1958 and still feels like a genuine Reykjavik institution. The interior is small, warm, and free from the self-conscious design of newer cafes. It is the kind of place where conversation happens naturally and quietly.",
      "For small-format events like language exchanges, book discussions, and writing meetups, Mokka offers something rare: a venue where the atmosphere does the hosting. The coffee is strong, the waffles are legendary, and the room rewards intimacy over volume."
    ],
    address: "Skólavörðustígur 3a, 101 Reykjavik",
    amenities: ["Historic interior", "Strong coffee", "Quiet atmosphere", "Waffle menu"],
    hours: [
      { day: "Mon", open: "09:00-18:00" },
      { day: "Tue", open: "09:00-18:00" },
      { day: "Wed", open: "09:00-18:00" },
      { day: "Thu", open: "09:00-18:00", highlighted: true },
      { day: "Fri", open: "09:00-18:00" },
      { day: "Sat", open: "10:00-18:00" },
      { day: "Sun", open: "10:00-17:00" }
    ],
    deal: "Reserved corner table for MeetupReykjavik language and book events on weekday afternoons",
    upcomingEventSlugs: ["language-exchange-thursday"],
    gallery: [
      "url('/place-images/reykjavik/venues/mokka.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/mokka.jpg')",
  },
  {
    slug: "dillon",
    name: "Dillon",
    type: "Bar",
    area: "Laugavegur",
    capacity: 80,
    rating: 4.5,
    summary: "A rock bar with a dive-bar soul. Great for low-key socials where the crowd does the work.",
    description: [
      "Dillon is loud, dark, and authentic. It works for casual meetups where people need an excuse to be in the same room, not a perfect venue experience.",
      "Rock posters on the walls, cheap beer, and a crowd that skews creative. Hosts use it for no-frills socials."
    ],
    address: "Laugavegur 30, 101 Reykjavik",
    amenities: ["Live music stage", "Late hours", "Affordable drinks", "Standing room"],
    hours: [
      { day: "Mon", open: "17:00-01:00" },
      { day: "Tue", open: "17:00-01:00" },
      { day: "Wed", open: "17:00-01:00" },
      { day: "Thu", open: "17:00-01:00" },
      { day: "Fri", open: "16:00-04:30", highlighted: true },
      { day: "Sat", open: "16:00-04:30" },
      { day: "Sun", open: "17:00-01:00" }
    ],
    deal: "Free entry for MeetupReykjavik group socials on weeknights",
    upcomingEventSlugs: [],
    gallery: [
      "url('/place-images/reykjavik/venues/dillon.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/dillon.jpg')",
  },
  {
    slug: "reykjavik-roasters",
    name: "Reykjavik Roasters",
    type: "Coffee Shop",
    area: "Brautarholt",
    capacity: 35,
    rating: 4.8,
    summary: "The best specialty coffee in Reykjavik. Intimate space for small groups and morning meetups.",
    description: [
      "Small, warm, and focused. Reykjavik Roasters is ideal for intimate morning sessions, creative workshops of 8–15 people, or one-on-one mentor meetups.",
      "The coffee is world-class and the atmosphere encourages real conversation over background noise."
    ],
    address: "Brautarholt 2, 105 Reykjavik",
    amenities: ["Specialty coffee", "Wi-Fi", "Morning hours", "Quiet seating"],
    hours: [
      { day: "Mon", open: "08:00-17:00" },
      { day: "Tue", open: "08:00-17:00" },
      { day: "Wed", open: "08:00-17:00" },
      { day: "Thu", open: "08:00-17:00" },
      { day: "Fri", open: "08:00-17:00" },
      { day: "Sat", open: "09:00-17:00", highlighted: true },
      { day: "Sun", open: "09:00-17:00" }
    ],
    deal: "10% off group orders for MeetupReykjavik morning sessions",
    upcomingEventSlugs: ["morning-yoga-flow"],
    gallery: [
      "url('/place-images/reykjavik/venues/reykjavik-roasters.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/reykjavik-roasters.jpg')",
  },
  {
    slug: "apotek",
    name: "Apotek",
    type: "Restaurant & Bar",
    area: "Austurstræti",
    capacity: 100,
    rating: 4.6,
    summary: "Upscale dining and cocktails in a former pharmacy. Premium venue for curated dinners and launches.",
    description: [
      "Apotek operates at a higher tier. The space is polished, the cocktail menu is serious, and the dining room can be sectioned for private events.",
      "Best for organizers running premium formats — curated dinners, tasting events, or sponsor-backed launches."
    ],
    address: "Austurstræti 16, 101 Reykjavik",
    amenities: ["Private dining", "Cocktail bar", "Central location", "Event coordination"],
    hours: [
      { day: "Mon", open: "11:30-23:00" },
      { day: "Tue", open: "11:30-23:00" },
      { day: "Wed", open: "11:30-23:00" },
      { day: "Thu", open: "11:30-23:00" },
      { day: "Fri", open: "11:30-01:00", highlighted: true },
      { day: "Sat", open: "11:30-01:00" },
      { day: "Sun", open: "11:30-22:00" }
    ],
    deal: "Complimentary welcome cocktail for premium MeetupReykjavik dinner events",
    upcomingEventSlugs: ["wine-tasting-volcanic-terroir"],
    gallery: [
      "url('/place-images/reykjavik/venues/apotek.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/apotek.jpg')",
  },
  {
    slug: "stofan-cafe",
    name: "Stofan Café",
    type: "Café",
    area: "Vesturgata",
    capacity: 50,
    rating: 4.7,
    summary: "A cozy living-room café with mismatched furniture. Perfect for book clubs and casual meetups.",
    description: [
      "Stofan feels like someone's living room — old couches, warm lighting, and an honest menu. It draws a mix of locals, students, and travelers.",
      "Organizers use it for book clubs, casual language exchanges, and creative writing sessions. The vibe does the hosting."
    ],
    address: "Vesturgata 3, 101 Reykjavik",
    amenities: ["Cozy seating", "Coffee & cake", "Board games", "Quiet daytime"],
    hours: [
      { day: "Mon", open: "10:00-22:00" },
      { day: "Tue", open: "10:00-22:00" },
      { day: "Wed", open: "10:00-22:00" },
      { day: "Thu", open: "10:00-23:00" },
      { day: "Fri", open: "10:00-01:00", highlighted: true },
      { day: "Sat", open: "10:00-01:00" },
      { day: "Sun", open: "11:00-22:00" }
    ],
    deal: "Free board game access for MeetupReykjavik hosted sessions",
    upcomingEventSlugs: [],
    gallery: [
      "url('/place-images/reykjavik/venues/stofan-cafe.jpg')"
    ],
    art: "url('/place-images/reykjavik/venues/stofan-cafe.jpg')",
    latitude: 64.1483,
    longitude: -21.9411,
  },
  {
    slug: "messinn",
    name: "Messinn",
    type: "Restaurant",
    area: "Grandi",
    capacity: 60,
    rating: 4.8,
    summary: "Famous for sizzling fish pans. A seafood institution perfect for group dining events.",
    description: [
      "Messinn serves Icelandic fish in cast-iron skillets. The communal energy and simple menu make it ideal for foodie meetups and group dinners.",
      "Tables can be combined for larger groups. The food is honest and the portions are generous — exactly what a dinner meetup needs."
    ],
    address: "Grandi, Grandagarður 8, 101 Reykjavik",
    amenities: ["Group seating", "Seafood focus", "Casual dining", "Walk-in friendly"],
    hours: [
      { day: "Mon", open: "11:30-14:00, 17:00-22:00" },
      { day: "Tue", open: "11:30-14:00, 17:00-22:00" },
      { day: "Wed", open: "11:30-14:00, 17:00-22:00" },
      { day: "Thu", open: "11:30-14:00, 17:00-22:00" },
      { day: "Fri", open: "11:30-14:00, 17:00-22:00", highlighted: true },
      { day: "Sat", open: "12:00-22:00" },
      { day: "Sun", open: "12:00-22:00" }
    ],
    deal: "Reserved group table for MeetupReykjavik dinner socials, pre-order available",
    upcomingEventSlugs: ["friday-dinner-social"],
    gallery: [
      "linear-gradient(135deg, rgba(60,90,120,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/messinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(60,90,120,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/messinn.svg')",
  },
  {
    slug: "tapas-barinn",
    name: "Tapas Barinn",
    type: "Restaurant & Bar",
    area: "Vesturgata",
    capacity: 70,
    rating: 4.5,
    summary: "Icelandic tapas with a social format built for sharing. Great for food-forward group events.",
    description: [
      "The small-plates format is inherently social — people share food, pass dishes, and talk across the table. That makes Tapas Barinn a natural fit for food meetups.",
      "The downstairs space can be reserved for groups and the menu covers everything from whale to lamb."
    ],
    address: "Vesturgata 3b, 101 Reykjavik",
    amenities: ["Tapas format", "Downstairs event space", "Full bar", "Group reservations"],
    hours: [
      { day: "Mon", open: "17:00-23:00" },
      { day: "Tue", open: "17:00-23:00" },
      { day: "Wed", open: "17:00-23:00" },
      { day: "Thu", open: "17:00-23:30" },
      { day: "Fri", open: "17:00-01:00", highlighted: true },
      { day: "Sat", open: "17:00-01:00" },
      { day: "Sun", open: "17:00-23:00" }
    ],
    deal: "Complimentary appetizer platter for MeetupReykjavik tasting groups of 8+",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(200,80,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/tapas-barinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(200,80,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/tapas-barinn.svg')",
  },
  {
    slug: "islenski-barinn",
    name: "Íslenski Barinn",
    type: "Bar & Restaurant",
    area: "Ingólfsstræti",
    capacity: 90,
    rating: 4.4,
    summary: "Traditional Icelandic bar with a tourist-friendly atmosphere. Good for themed cultural meetups.",
    description: [
      "Íslenski Barinn leans into the Icelandic identity — fermented shark on the menu, traditional decor, and a crowd that mixes locals with visitors.",
      "Works well for cultural meetups, expat welcome nights, and 'Taste of Iceland' themed events."
    ],
    address: "Ingólfsstræti 1a, 101 Reykjavik",
    amenities: ["Traditional menu", "Central location", "Group friendly", "Cultural atmosphere"],
    hours: [
      { day: "Mon", open: "11:00-23:00" },
      { day: "Tue", open: "11:00-23:00" },
      { day: "Wed", open: "11:00-23:00" },
      { day: "Thu", open: "11:00-23:00" },
      { day: "Fri", open: "11:00-01:00", highlighted: true },
      { day: "Sat", open: "11:00-01:00" },
      { day: "Sun", open: "12:00-22:00" }
    ],
    deal: "Hákarl tasting included for MeetupReykjavik cultural experience groups",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(30,27,46,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/islenski-barinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(30,27,46,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/islenski-barinn.svg')",
  },
  {
    slug: "cafe-babalu",
    name: "Café Babalu",
    type: "Café",
    area: "Skólavörðustígur",
    capacity: 30,
    rating: 4.6,
    summary: "A quirky, colorful café on the main shopping street. Intimate and personal.",
    description: [
      "Babalu is tiny and full of character — vintage decor, painted walls, and homemade cakes. The upstairs seating is cozy enough for 10-person creative sessions.",
      "Works best for small groups who want personality over polish."
    ],
    address: "Skólavörðustígur 22a, 101 Reykjavik",
    amenities: ["Homemade cakes", "Upstairs seating", "Wi-Fi", "Coffee & crepes"],
    hours: [
      { day: "Mon", open: "10:00-21:00" },
      { day: "Tue", open: "10:00-21:00" },
      { day: "Wed", open: "10:00-21:00" },
      { day: "Thu", open: "10:00-21:00" },
      { day: "Fri", open: "10:00-22:00", highlighted: true },
      { day: "Sat", open: "10:00-22:00" },
      { day: "Sun", open: "10:00-21:00" }
    ],
    deal: "Free slice of cake with coffee for MeetupReykjavik small group bookings",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(220,180,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/cafe-babalu.svg')"
    ],
    art: "linear-gradient(135deg, rgba(220,180,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/cafe-babalu.svg')",
  },
  {
    slug: "cafe-loki",
    name: "Café Loki",
    type: "Café & Restaurant",
    area: "Hallgrímskirkja",
    capacity: 45,
    rating: 4.7,
    summary: "Traditional Icelandic food right by the church. A go-to for cultural and food meetups.",
    description: [
      "Café Loki sits across from Hallgrímskirkja and serves traditional Icelandic fare — rye bread, dried fish, and meat soup. The view and the menu give organizers a unique format hook.",
      "Perfect for food tours, cultural introduction events, and newcomer welcome lunches."
    ],
    address: "Lokastígur 28, 101 Reykjavik",
    amenities: ["Traditional food", "Hallgrímskirkja view", "Group seating", "Daytime focus"],
    hours: [
      { day: "Mon", open: "08:00-21:00" },
      { day: "Tue", open: "08:00-21:00" },
      { day: "Wed", open: "08:00-21:00" },
      { day: "Thu", open: "08:00-21:00" },
      { day: "Fri", open: "08:00-21:00" },
      { day: "Sat", open: "09:00-21:00", highlighted: true },
      { day: "Sun", open: "09:00-21:00" }
    ],
    deal: "Group tasting platter at a fixed rate for MeetupReykjavik food events",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(90,70,50,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/cafe-loki.svg')"
    ],
    art: "linear-gradient(135deg, rgba(90,70,50,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/cafe-loki.svg')",
  },
  {
    slug: "skuli-craft-bar",
    name: "Skúli Craft Bar",
    type: "Craft Beer Bar",
    area: "Aðalstræti",
    capacity: 60,
    rating: 4.6,
    summary: "The craft beer spot downtown. 14 rotating taps and a knowledgeable crowd.",
    description: [
      "Skúli is where Reykjavik's craft beer community gathers. 14 taps rotating Icelandic and international brews. The bar staff know their stuff.",
      "Ideal for beer tastings, casual Friday meetups, and social groups that want a relaxed, quality-focused venue."
    ],
    address: "Aðalstræti 9, 101 Reykjavik",
    amenities: ["14 craft taps", "Beer flights", "Knowledgeable staff", "Central location"],
    hours: [
      { day: "Mon", open: "14:00-23:00" },
      { day: "Tue", open: "14:00-23:00" },
      { day: "Wed", open: "14:00-23:00" },
      { day: "Thu", open: "14:00-23:30" },
      { day: "Fri", open: "14:00-01:00", highlighted: true },
      { day: "Sat", open: "12:00-01:00" },
      { day: "Sun", open: "14:00-23:00" }
    ],
    deal: "Guided beer flight for MeetupReykjavik tasting events at a group rate",
    upcomingEventSlugs: ["craft-beer-tasting-vesturgata"],
    gallery: [
      "linear-gradient(135deg, rgba(180,140,40,0.2), rgba(30,27,46,0.15)), url('/place-images/reykjavik/generated/skuli-craft-bar.svg')"
    ],
    art: "linear-gradient(135deg, rgba(180,140,40,0.2), rgba(30,27,46,0.15)), url('/place-images/reykjavik/generated/skuli-craft-bar.svg')",
  },
  {
    slug: "slippbarinn",
    name: "Slippbarinn",
    type: "Cocktail Bar",
    area: "Mýrargata (Icelandair Marina)",
    capacity: 85,
    rating: 4.7,
    summary: "Award-winning cocktail bar inside the Marina hotel. Sleek, social, and versatile.",
    description: [
      "Slippbarinn is one of the best cocktail bars in Iceland. The space is large enough for events, the drinks are creative, and the atmosphere is upscale-casual.",
      "Works for networking nights, launch parties, and premium social formats. Weekend brunch also draws a good crowd."
    ],
    address: "Mýrargata 2, 101 Reykjavik",
    amenities: ["Cocktail menu", "DJ nights", "Weekend brunch", "Event space"],
    hours: [
      { day: "Mon", open: "16:00-23:00" },
      { day: "Tue", open: "16:00-23:00" },
      { day: "Wed", open: "16:00-23:00" },
      { day: "Thu", open: "16:00-23:30" },
      { day: "Fri", open: "15:00-01:00", highlighted: true },
      { day: "Sat", open: "11:00-01:00" },
      { day: "Sun", open: "11:00-22:00" }
    ],
    deal: "Signature cocktail on the house for MeetupReykjavik networking events of 15+",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(30,27,46,0.4)), url('/place-images/reykjavik/generated/slippbarinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(30,27,46,0.4)), url('/place-images/reykjavik/generated/slippbarinn.svg')",
  },
  {
    slug: "forrettabarinn",
    name: "Forréttabarinn",
    type: "Tapas Bar",
    area: "Nýlendugata",
    capacity: 55,
    rating: 4.5,
    summary: "Small-plates bar with a creative menu. Excellent for intimate food meetups.",
    description: [
      "Forréttabarinn is all about sharing plates. The menu is inventive, the portions are designed for groups, and the atmosphere is warm without being stuffy.",
      "Great for foodie meetups, double dates, and tasting-format events where the food is the conversation starter."
    ],
    address: "Nýlendugata 14, 101 Reykjavik",
    amenities: ["Sharing plates", "Creative menu", "Full bar", "Intimate space"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "17:00-23:00" },
      { day: "Wed", open: "17:00-23:00" },
      { day: "Thu", open: "17:00-23:00" },
      { day: "Fri", open: "17:00-01:00", highlighted: true },
      { day: "Sat", open: "17:00-01:00" },
      { day: "Sun", open: "Closed" }
    ],
    deal: "Chef's selection tasting menu at group rate for MeetupReykjavik food events",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(200,80,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/forrettabarinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(200,80,60,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/forrettabarinn.svg')",
  },
  {
    slug: "rok",
    name: "ROK",
    type: "Restaurant & Bar",
    area: "Frakkastígur",
    capacity: 50,
    rating: 4.6,
    summary: "Creative Icelandic small plates in a moody downtown space. Great for curated dinners.",
    description: [
      "ROK focuses on fresh, seasonal Icelandic ingredients served as small plates. The space is dark, moody, and intimate — it feels like a secret.",
      "Perfect for smaller curated dinner events, foodie groups, and anyone who wants quality over quantity."
    ],
    address: "Frakkastígur 26a, 101 Reykjavik",
    amenities: ["Seasonal menu", "Intimate space", "Natural wines", "Reservations"],
    hours: [
      { day: "Mon", open: "11:30-23:00" },
      { day: "Tue", open: "11:30-23:00" },
      { day: "Wed", open: "11:30-23:00" },
      { day: "Thu", open: "11:30-23:00" },
      { day: "Fri", open: "11:30-01:00", highlighted: true },
      { day: "Sat", open: "11:30-01:00" },
      { day: "Sun", open: "11:30-22:00" }
    ],
    deal: "Seasonal tasting board for MeetupReykjavik dinner groups of 6+",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(50,50,50,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/rok.svg')"
    ],
    art: "linear-gradient(135deg, rgba(50,50,50,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/rok.svg')",
  },
  {
    slug: "the-laundromat-cafe",
    name: "The Laundromat Café",
    type: "Café & Restaurant",
    area: "Austurstræti",
    capacity: 80,
    rating: 4.4,
    summary: "Family-friendly café with a playful interior. Great for daytime community events.",
    description: [
      "The Laundromat Café is spacious, colorful, and welcoming. It has a kids' corner, a large upstairs area, and a menu that works all day.",
      "Ideal for parent meetups, community brunches, and daytime social events that need accessible, comfortable space."
    ],
    address: "Austurstræti 9, 101 Reykjavik",
    amenities: ["Kids corner", "Large upstairs", "All-day menu", "Central location"],
    hours: [
      { day: "Mon", open: "08:00-23:00" },
      { day: "Tue", open: "08:00-23:00" },
      { day: "Wed", open: "08:00-23:00" },
      { day: "Thu", open: "08:00-23:00" },
      { day: "Fri", open: "08:00-01:00" },
      { day: "Sat", open: "09:00-01:00", highlighted: true },
      { day: "Sun", open: "09:00-23:00" }
    ],
    deal: "Free coffee refills for MeetupReykjavik community brunch events",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(100,160,200,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/the-laundromat-cafe.svg')"
    ],
    art: "linear-gradient(135deg, rgba(100,160,200,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/the-laundromat-cafe.svg')",
  },
  {
    slug: "bergsson-mathus",
    name: "Bergsson Mathús",
    type: "Restaurant & Bakery",
    area: "Templarasund",
    capacity: 55,
    rating: 4.7,
    summary: "Clean, modern brunch spot with Scandinavian design. Ideal for professional morning meetups.",
    description: [
      "Bergsson is bright, minimal, and calm. The food is healthy, the coffee is strong, and the space attracts a professional crowd.",
      "Perfect for morning networking breakfasts, startup coffee meetups, and professional development sessions."
    ],
    address: "Templarasund 3, 101 Reykjavik",
    amenities: ["Brunch menu", "Fresh bakery", "Clean design", "Morning hours"],
    hours: [
      { day: "Mon", open: "07:00-21:00" },
      { day: "Tue", open: "07:00-21:00" },
      { day: "Wed", open: "07:00-21:00" },
      { day: "Thu", open: "07:00-21:00" },
      { day: "Fri", open: "07:00-21:00" },
      { day: "Sat", open: "08:00-21:00", highlighted: true },
      { day: "Sun", open: "08:00-21:00" }
    ],
    deal: "Group breakfast platter for MeetupReykjavik morning sessions",
    upcomingEventSlugs: ["startup-pitch-night"],
    gallery: [
      "linear-gradient(135deg, rgba(245,240,232,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/bergsson-mathus.svg')"
    ],
    art: "linear-gradient(135deg, rgba(245,240,232,0.2), rgba(124,154,130,0.15)), url('/place-images/reykjavik/generated/bergsson-mathus.svg')",
  },
  {
    slug: "sushi-social",
    name: "Sushi Social",
    type: "Restaurant & Bar",
    area: "Þingholtsstræti",
    capacity: 65,
    rating: 4.5,
    summary: "Japanese-Icelandic fusion with a social dining concept. Built for group experiences.",
    description: [
      "Sushi Social mixes South American and Japanese flavors with Icelandic ingredients. The format is built around sharing — omakase platters and group-style ordering.",
      "Ideal for foodie events, celebration dinners, and groups that want an experience, not just a meal."
    ],
    address: "Þingholtsstræti 5, 101 Reykjavik",
    amenities: ["Omakase option", "Cocktail menu", "Group dining", "Reservations"],
    hours: [
      { day: "Mon", open: "17:30-23:00" },
      { day: "Tue", open: "17:30-23:00" },
      { day: "Wed", open: "17:30-23:00" },
      { day: "Thu", open: "17:30-23:00" },
      { day: "Fri", open: "17:30-01:00", highlighted: true },
      { day: "Sat", open: "17:30-01:00" },
      { day: "Sun", open: "17:30-22:00" }
    ],
    deal: "Group omakase menu at a fixed rate for MeetupReykjavik dining events",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(30,27,46,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/sushi-social.svg')"
    ],
    art: "linear-gradient(135deg, rgba(30,27,46,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/sushi-social.svg')",
  },
  {
    slug: "sumac",
    name: "Sumac",
    type: "Restaurant & Grill",
    area: "Laugavegur",
    capacity: 50,
    rating: 4.6,
    summary: "Middle Eastern-inspired grill with bold flavors. Lively and shareable.",
    description: [
      "Sumac brings Middle Eastern flavors to downtown Reykjavik. The menu is designed for sharing, and the portions are generous.",
      "Works well for foodie meetups, cultural dining events, and groups that want bold, flavorful food at reasonable prices."
    ],
    address: "Laugavegur 18, 101 Reykjavik",
    amenities: ["Sharing format", "Grill menu", "Full bar", "Laugavegur location"],
    hours: [
      { day: "Mon", open: "17:00-22:00" },
      { day: "Tue", open: "17:00-22:00" },
      { day: "Wed", open: "17:00-22:00" },
      { day: "Thu", open: "17:00-22:30" },
      { day: "Fri", open: "17:00-23:30", highlighted: true },
      { day: "Sat", open: "12:00-23:30" },
      { day: "Sun", open: "17:00-22:00" }
    ],
    deal: "Mezze platter on the house for MeetupReykjavik groups of 10+",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(200,140,60,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/sumac.svg')"
    ],
    art: "linear-gradient(135deg, rgba(200,140,60,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/sumac.svg')",
  },
  {
    slug: "glo-reykjavik",
    name: "Gló",
    type: "Health Restaurant",
    area: "Laugavegur",
    capacity: 50,
    rating: 4.5,
    summary: "Healthy, organic, and vegetarian-friendly. The wellness crowd's go-to lunch spot.",
    description: [
      "Gló is where Reykjavik's health-conscious crowd eats. The menu is organic, seasonal, and mostly plant-based. The space is bright and clean.",
      "Great for wellness meetups, yoga group lunches, and anyone running events where dietary flexibility matters."
    ],
    address: "Laugavegur 20b, 101 Reykjavik",
    amenities: ["Organic menu", "Vegan options", "Bright space", "Lunchtime focus"],
    hours: [
      { day: "Mon", open: "11:00-21:00" },
      { day: "Tue", open: "11:00-21:00" },
      { day: "Wed", open: "11:00-21:00" },
      { day: "Thu", open: "11:00-21:00" },
      { day: "Fri", open: "11:00-21:00" },
      { day: "Sat", open: "11:30-21:00", highlighted: true },
      { day: "Sun", open: "11:30-21:00" }
    ],
    deal: "10% group discount for MeetupReykjavik wellness community lunches",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(124,154,130,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/glo-reykjavik.svg')"
    ],
    art: "linear-gradient(135deg, rgba(124,154,130,0.2), rgba(245,240,232,0.15)), url('/place-images/reykjavik/generated/glo-reykjavik.svg')",
  },
  {
    slug: "shalimar",
    name: "Shalimar",
    type: "Restaurant",
    area: "Austurstræti",
    capacity: 40,
    rating: 4.4,
    summary: "Authentic Pakistani and Indian food. A downtown budget-friendly gem for group dinners.",
    description: [
      "Shalimar serves generous portions of South Asian comfort food at prices that make group dinners easy to organize. The food is honest and the service is fast.",
      "Works well for casual community dinners, student meetups, and groups that want good food without a big bill."
    ],
    address: "Austurstræti 4, 101 Reykjavik",
    amenities: ["Budget-friendly", "Generous portions", "Central location", "Fast service"],
    hours: [
      { day: "Mon", open: "11:30-22:00" },
      { day: "Tue", open: "11:30-22:00" },
      { day: "Wed", open: "11:30-22:00" },
      { day: "Thu", open: "11:30-22:00" },
      { day: "Fri", open: "11:30-23:00", highlighted: true },
      { day: "Sat", open: "12:00-23:00" },
      { day: "Sun", open: "12:00-22:00" }
    ],
    deal: "Group dinner discount for MeetupReykjavik community meals of 6+",
    upcomingEventSlugs: [],
    gallery: [
      "linear-gradient(135deg, rgba(200,140,30,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/shalimar.svg')"
    ],
    art: "linear-gradient(135deg, rgba(200,140,30,0.2), rgba(232,97,77,0.15)), url('/place-images/reykjavik/generated/shalimar.svg')",
  },
  {
    slug: "esja-trailhead",
    name: "Esja Trailhead Basecamp",
    type: "Outdoor Venue",
    area: "Mosfellsbaer",
    capacity: 50,
    rating: 4.7,
    summary: "The starting point for Reykjavik's most popular hike, with outdoor meeting space and parking for group adventures.",
    description: [
      "Esja Trailhead serves as the natural gathering point for the hiking community. The basecamp area has covered shelter, restrooms, and enough flat ground to brief a group of thirty before heading up.",
      "Groups regularly use this as a meetup point for Saturday morning hikes. The mountain itself offers routes for all fitness levels, from the easy 'Steinn' path to the challenging summit."
    ],
    address: "Esjurætur, 270 Mosfellsbaer",
    amenities: ["Free parking", "Restrooms", "Trail markers", "Shelter area"],
    hours: [
      { day: "Mon", open: "Open 24h" },
      { day: "Tue", open: "Open 24h" },
      { day: "Wed", open: "Open 24h" },
      { day: "Thu", open: "Open 24h" },
      { day: "Fri", open: "Open 24h" },
      { day: "Sat", open: "Open 24h", highlighted: true },
      { day: "Sun", open: "Open 24h", highlighted: true }
    ],
    deal: "Free group photos for MeetupReykjavik hiking events",
    upcomingEventSlugs: ["saturday-hike-mt-esja"],
    gallery: [
      "linear-gradient(135deg, rgba(124,154,130,0.2), rgba(45,95,58,0.4)), url('/place-images/reykjavik/generated/esja.svg')"
    ],
    art: "linear-gradient(135deg, rgba(124,154,130,0.2), rgba(45,95,58,0.4)), url('/place-images/reykjavik/generated/esja.svg')",
    latitude: 64.2017,
    longitude: -21.8167,
  },
  {
    slug: "gaukurinn",
    name: "Gaukurinn",
    type: "Live Music Bar",
    area: "Tryggvagata",
    capacity: 120,
    rating: 4.5,
    summary: "Reykjavik's beloved live music venue and bar, perfect for social events with character and a great sound system.",
    description: [
      "Gaukurinn is a cornerstone of Reykjavik's live music scene. The venue hosts everything from jazz sessions to punk shows, and its relaxed atmosphere makes it ideal for social meetups that benefit from a cultural backdrop.",
      "The space divides naturally into a stage area and a bar section, which means events can blend live performance with social mixing without forcing either one."
    ],
    address: "Tryggvagata 22, 101 Reykjavik",
    amenities: ["PA system", "Stage lighting", "Full bar", "Outdoor smoking area"],
    hours: [
      { day: "Mon", open: "Closed" },
      { day: "Tue", open: "16:00-01:00" },
      { day: "Wed", open: "16:00-01:00" },
      { day: "Thu", open: "16:00-01:00", highlighted: true },
      { day: "Fri", open: "16:00-04:30", highlighted: true },
      { day: "Sat", open: "16:00-04:30", highlighted: true },
      { day: "Sun", open: "16:00-01:00" }
    ],
    deal: "Happy hour extended to 20:00 for MeetupReykjavik events",
    upcomingEventSlugs: ["harbor-jazz-social"],
    gallery: [
      "linear-gradient(135deg, rgba(91,33,182,0.2), rgba(30,27,46,0.4)), url('/place-images/reykjavik/generated/gaukurinn.svg')"
    ],
    art: "linear-gradient(135deg, rgba(91,33,182,0.2), rgba(30,27,46,0.4)), url('/place-images/reykjavik/generated/gaukurinn.svg')",
    latitude: 64.1488,
    longitude: -21.9408,
  }
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "why-reykjavik-needs-a-better-meetup-layer",
    title: "Why Reykjavik Needs a Better Meetup Layer",
    category: "Product",
    publishedAt: "March 10, 2026",
    excerpt: "A closer look at why local discovery should feel warmer, calmer, and more venue-aware than the generic event feed.",
    readTime: "6 min read",
    hero: "/place-images/reykjavik/venues/kex-hostel.jpg",
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
      }
    ],
  },
  {
    slug: "designing-events-for-newcomers",
    title: "Designing Events for Newcomers",
    category: "Community",
    publishedAt: "March 8, 2026",
    excerpt: "The best social formats reduce friction on arrival, use host structure well, and make the first five minutes feel safe.",
    readTime: "4 min read",
    hero: "/place-images/reykjavik/venues/stofan-cafe.jpg",
    sections: [
      {
        heading: "Arrival is the product",
        body: "For new attendees, the emotional journey starts before the event itself. Clear instructions, visible hosts, and simple first steps change retention more than flashy branding.",
      },
      {
        heading: "Structured social beats unstructured crowds",
        body: "Light prompts, timed intros, and easy group formats help people settle faster. This matters even more in a city where many attendees are new to the country.",
      }
    ],
  },
  {
    slug: "how-venue-partnerships-improve-community-quality",
    title: "How Venue Partnerships Improve Community Quality",
    category: "Venues",
    publishedAt: "March 4, 2026",
    excerpt: "Strong venues do more than host events. They shape the trust, pace, and repeatability of the community itself.",
    readTime: "5 min read",
    hero: "/place-images/reykjavik/venues/lebowski-bar.jpg",
    sections: [
      {
        heading: "The venue is part of the format",
        body: "A good venue supports the event logic. The room layout, service model, and arrival experience all affect whether an event feels premium, relaxed, or chaotic.",
      },
      {
        heading: "Partnerships can benefit everyone",
        body: "When venues get better visibility and organizers get better tooling, members get a better night out. The best marketplace products align those incentives instead of forcing them apart.",
      }
    ],
  },
  {
    slug: "the-organizer-toolkit-explained",
    title: "The Organizer Toolkit Explained",
    category: "Product",
    publishedAt: "March 2, 2026",
    excerpt: "A walkthrough of the dashboard tools that help organizers publish, manage, and grow recurring community events.",
    readTime: "7 min read",
    hero: "/place-images/reykjavik/venues/grandi-hub.jpg",
    sections: [
      {
        heading: "Why organizers need more than a form",
        body: "Publishing an event is only the first step. Managing attendees, handling approvals, coordinating with venues, and iterating on formats all require tools that most platforms either ignore or bury behind enterprise pricing.",
      },
      {
        heading: "Event templates and recurring series",
        body: "The organizer dashboard supports reusable event templates so that a recurring format like a weekly language table or monthly dinner social can be republished with updated dates, capacities, and descriptions without starting from scratch.",
      },
      {
        heading: "Attendee management and approvals",
        body: "For events that benefit from curation, organizers can enable manual approval workflows. This means the host reviews each RSVP before confirming a spot, which keeps the room balanced and the format protected.",
      },
      {
        heading: "Venue coordination built in",
        body: "Rather than managing venue logistics over email, the dashboard lets organizers submit booking requests directly to partner venues. Availability, capacity, and deal terms are visible upfront, which reduces back-and-forth and avoids last-minute surprises.",
      }
    ],
  },
  {
    slug: "five-venues-worth-knowing",
    title: "Five Venues Worth Knowing in Reykjavik",
    category: "Venues",
    publishedAt: "March 3, 2026",
    excerpt: "A spotlight on five venues across the city that show how different spaces shape different kinds of community events.",
    readTime: "5 min read",
    hero: "/place-images/reykjavik/venues/hlemmur-square.jpg",
    sections: [
      {
        heading: "Mokka Kaffi for intimate conversation",
        body: "The oldest cafe in Reykjavik has a quiet warmth that makes it ideal for language tables and book clubs. The room is small, the coffee is strong, and the atmosphere does most of the hosting work for you.",
      },
      {
        heading: "Hlemmur Square for scale and energy",
        body: "When an event needs room to breathe, the former bus station turned food hall delivers. Multiple food stalls, a central bar, and high ceilings make it one of the few downtown venues that handles large crowds without sacrificing atmosphere.",
      },
      {
        heading: "Micro Bar for craft and closeness",
        body: "Craft beer tastings thrive in tight spaces where the bartender can tell the story behind each pour. Micro Bar on Vesturgata does this better than anywhere else in the city, with a rotating tap list and staff who genuinely care about the product.",
      },
      {
        heading: "Cafe Rosenberg for the stage",
        body: "A live music cafe with proper acoustics and attentive audiences. Open mic nights and poetry readings here feel like events rather than background noise, which is rarer than it should be.",
      },
      {
        heading: "Snaps for dinner that becomes a party",
        body: "A neighborhood bistro with communal tables and a kitchen that handles group dinners with ease. The set menu removes decision fatigue and the wine pairing turns an ordinary Friday into something worth remembering.",
      }
    ],
  }
] as const;

export const aboutStats = [
  { label: "Members", value: "19" },
  { label: "Groups", value: "8" },
  { label: "Venue partners", value: "20" },
  { label: "Weekly events", value: "5" }
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
  }
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
  }
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
      "Basic event analytics"
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
      "Audience and revenue reporting"
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
      "Advanced audience segmentation"
    ],
  }
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
      "Organizer-fit insights"
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
      "Sponsored inventory support"
    ],
  }
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
  }
] as const;

export const publicCategoryOptions = [
  ...homepageCategories.map((category) => category.name.split(" & ")[0])
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
