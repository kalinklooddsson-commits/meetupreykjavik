import {
  blogPosts,
  getEventBySlug,
  getGroupBySlug,
  getVenueBySlug,
  minimumTicketPriceIsk,
  organizerTiers,
  publicEvents,
  publicVenues,
  ticketCommissionRate,
  userTiers,
  venueTiers,
} from "@/lib/public-data";
import { categories } from "@/lib/home-data";
import { emailTemplateCatalog } from "@/lib/email/template-catalog";

function must<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing dashboard seed: ${label}`);
  }

  return value;
}

const singlesNight = must(
  getEventBySlug("singles-night-25-35"),
  "singles-night-25-35",
);
const saturdayHike = must(
  getEventBySlug("saturday-hike-mt-esja"),
  "saturday-hike-mt-esja",
);
const reactWorkshop = must(
  getEventBySlug("react-server-components-workshop"),
  "react-server-components-workshop",
);
const wineTasting = must(
  getEventBySlug("wine-tasting-volcanic-terroir"),
  "wine-tasting-volcanic-terroir",
);
const newcomersNight = must(
  getEventBySlug("speed-friending-newcomers"),
  "speed-friending-newcomers",
);
const hikersGroup = must(getGroupBySlug("reykjavik-hikers"), "reykjavik-hikers");
const expatsGroup = must(getGroupBySlug("expats-in-iceland"), "expats-in-iceland");
const techGroup = must(getGroupBySlug("tech-community-rvk"), "tech-community-rvk");
const creativeGroup = must(
  getGroupBySlug("creative-reykjavik"),
  "creative-reykjavik",
);
const lebowski = must(getVenueBySlug("lebowski-bar"), "lebowski-bar");
const kex = must(getVenueBySlug("kex-hostel"), "kex-hostel");
const grandiHub = must(getVenueBySlug("grandi-hub"), "grandi-hub");
const bryggjuhusid = must(getVenueBySlug("bryggjuhusid"), "bryggjuhusid");

const dashboardAvatarByName: Record<string, string> = {
  "Kari Sigurdsson": "/demo-images/people/kari.jpg",
  "Bjorn Olafsson": "/demo-images/people/bjorn.jpg",
  "Marta Polak": "/demo-images/people/marta.jpg",
  "Anna Sigga": "/demo-images/people/anna.jpg",
  "Anna Jonsdottir": "/demo-images/people/anna.jpg",
  "Helga Arnadottir": "/demo-images/people/helga.jpg",
  "Sara Magnusdottir": "/demo-images/people/sara.jpg",
  "Freya Lund": "/demo-images/people/freya.jpg",
  "Diego Alvarez": "/demo-images/people/diego.jpg",
  "Lebowski Bar": "/demo-images/venues/lebowski-bar.jpg",
  "Kex Hostel": "/demo-images/venues/kex-hostel.jpg",
};

export function getDashboardAvatar(name: string) {
  return dashboardAvatarByName[name];
}

export const memberProfile = {
  slug: "kari-sigurdsson",
  name: "Kari Sigurdsson",
  email: "kari@meetupreykjavik.is",
  initials: "KS",
  tier: "plus",
  city: "Reykjavik",
  memberSince: "January 2024",
  bio: "Product-minded local who prefers hosted formats, small technical gatherings, and venue-backed events over noisy open feeds.",
  completion: "92%",
  pronouns: "he / him",
  languages: ["English", "Icelandic"],
  interests: ["Tech", "Social", "Food", "Outdoors", "Expat community"],
  badges: ["Early member", "Reliable RSVP", "Workshop regular"],
  stats: [
    { key: "events", label: "Events attended", value: "41" },
    { key: "groups", label: "Groups joined", value: "8" },
    { key: "reviews", label: "Venue reviews", value: "12" },
    { key: "streak", label: "Monthly streak", value: "6 months" },
  ],
  highlights: [
    "Consistently attends hosted tech and social formats.",
    "Frequently leaves venue ratings and event feedback after attending.",
    "Uses English by default but keeps Icelandic notifications enabled.",
  ],
  recentAttendance: [
    {
      title: reactWorkshop.title,
      venue: reactWorkshop.venueName,
      note: "Stayed for the full Q and A and left detailed feedback afterward.",
    },
    {
      title: "Edge Functions Deep Dive",
      venue: grandiHub.name,
      note: "Joined from the Tech Community RVK recurring workshop track.",
    },
    {
      title: "Sunday Bakery Crawl",
      venue: kex.name,
      note: "Cross-community social format with newcomer-friendly pacing.",
    },
  ],
  venuePreferences: [
    {
      venue: grandiHub.name,
      reason: "Best fit for practical technical sessions with strong seating and coffee support.",
    },
    {
      venue: kex.name,
      reason: "Warmest arrival flow for social formats where newcomers need visible hosting.",
    },
    {
      venue: bryggjuhusid.name,
      reason: "Strong preference for premium small-format events with calmer room energy.",
    },
  ],
  privacySnapshot: [
    { label: "Profile visibility", value: "Members only" },
    { label: "Attendance history", value: "Visible to joined groups" },
    { label: "Messages", value: "Organizers only" },
    { label: "Weekly digest", value: "Enabled" },
  ],
  formatAffinities: [
    {
      key: "workshops",
      label: "Hosted workshops",
      score: 96,
      note: "Best fit when the room has a clear host, practical agenda, and smaller breakout moments.",
    },
    {
      key: "socials",
      label: "Structured socials",
      score: 84,
      note: "Likes social formats when intros are guided and the arrival flow feels intentional.",
    },
    {
      key: "premium",
      label: "Premium tastings",
      score: 88,
      note: "Strong fit for seated, lower-volume events with a calmer room and a clear host.",
    },
    {
      key: "late-night",
      label: "Late-night nightlife",
      score: 42,
      note: "Lower fit unless the event has visible hosting and defined conversation anchors.",
    },
  ],
  communityStyle: [
    { label: "Arrival preference", value: "Warm host intro before open mingling" },
    { label: "Conversation style", value: "Smaller circles over big-room networking" },
    { label: "Language comfort", value: "English first, Icelandic welcome copy helps" },
    { label: "Best seating", value: "Table clusters, not bar-standing formats" },
  ],
  relationshipTimeline: [
    {
      key: "rel-1",
      title: "Joined Tech Community RVK",
      meta: "Jan 2024",
      detail: "Entered through a practical workshop and became a repeat attendee within two weeks.",
    },
    {
      key: "rel-2",
      title: "Promoted from a waitlist",
      meta: "Sep 2025",
      detail: "Accepted a short-notice workshop seat and still arrived early, which improved trust scoring.",
    },
    {
      key: "rel-3",
      title: "Left high-signal venue feedback",
      meta: "Jan 2026",
      detail: "Shared specific host-arrival notes that were later used by organizers and venue partners.",
    },
  ],
  organizerGuidance: [
    "Best in formats where the host names the purpose of the room early.",
    "Good fit for expert roundtables if the group stays under 20 and seating is structured.",
    "Avoid pushing into fully open nightlife formats unless there is a visible welcome team.",
  ],
};

export const memberPortalData = {
  metrics: [
    {
      label: "Upcoming RSVPs",
      value: "3",
      delta: "+1 this week",
      detail: "Two confirmed seats and one waitlist are live on the calendar.",
    },
    {
      label: "Groups joined",
      value: "8",
      delta: "4 highly active",
      detail: "Most activity is in tech, expat, and outdoors circles.",
    },
    {
      label: "Recommendations",
      value: "9",
      delta: "86% fit score",
      detail: "The feed is leaning toward workshops, socials, and newcomer-friendly formats.",
    },
    {
      label: "Profile strength",
      value: memberProfile.completion,
      delta: "2 items left",
      detail: "Adding a short intro and billing method unlocks the last profile actions.",
    },
  ],
  upcomingEvents: [
    {
      event: reactWorkshop,
      status: "Approved",
      note: "Bring laptop. Coffee service opens at 18:00.",
      seat: "Seat 24 / 80",
    },
    {
      event: wineTasting,
      status: "Waitlist",
      note: "Priority waitlist will auto-promote if two seats open.",
      seat: "3 ahead",
    },
    {
      event: saturdayHike,
      status: "Confirmed",
      note: "Pickup chat is live inside the group discussion thread.",
      seat: "27 / 35",
    },
  ],
  groups: [
    {
      group: techGroup,
      role: "Member",
      unread: "2 new threads",
      nextEvent: reactWorkshop.title,
    },
    {
      group: expatsGroup,
      role: "Core member",
      unread: "5 new intros",
      nextEvent: newcomersNight.title,
    },
    {
      group: hikersGroup,
      role: "Weekend regular",
      unread: "1 route update",
      nextEvent: saturdayHike.title,
    },
  ],
  recommendations: [
    {
      event: singlesNight,
      reason: "Strong match for hosted social formats and previous attendance at structured newcomer events.",
      score: "91%",
    },
    {
      event: newcomersNight,
      reason: "Your expat-community activity and reliable RSVP history push this to the top of the queue.",
      score: "88%",
    },
    {
      event: wineTasting,
      reason: "Premium small-group experiences map well to your saved venue preferences.",
      score: "84%",
    },
  ],
  inbox: [
    {
      key: "waitlist",
      title: "You moved up the waitlist",
      detail: "Volcanic Terroir now has only three people ahead of you. Upgrade window stays open until 18:00.",
      meta: "25 min ago",
      tone: "coral" as const,
    },
    {
      key: "group",
      title: "Tech Community RVK posted a follow-up thread",
      detail: "Members are proposing a smaller auth architecture working session after the React workshop.",
      meta: "Today",
      tone: "indigo" as const,
    },
    {
      key: "venue",
      title: "Lebowski updated its host perk",
      detail: "MeetupReykjavik organizers now get a dedicated arrival area plus a two-for-one host welcome drink.",
      meta: "Yesterday",
      tone: "sage" as const,
    },
  ],
  messages: [
    {
      key: "msg-1",
      counterpart: "Helga Arnadottir",
      role: "Organizer",
      subject: "React workshop seating request",
      preview: "Can you take the front-left table? We are grouping returning attendees there.",
      channel: "Direct message",
      status: "Unread",
      meta: "8 min ago",
    },
    {
      key: "msg-2",
      counterpart: "Expats in Iceland",
      role: "Group thread",
      subject: "Newcomer arrivals on Friday",
      preview: "Thread is collecting who wants to join the 19:10 walking group from Hlemmur.",
      channel: "Group thread",
      status: "Pinned",
      meta: "Today",
    },
    {
      key: "msg-3",
      counterpart: "Lebowski Bar",
      role: "Venue partner",
      subject: "Host perk details",
      preview: "Welcome drink is active. Arrive 15 minutes early and ask for the meetup lead desk.",
      channel: "Venue note",
      status: "Read",
      meta: "Yesterday",
    },
  ],
  notifications: [
    {
      key: "notif-1",
      title: "Waitlist auto-promotion window opened",
      detail: "You have 45 minutes to claim a newly opened seat for Volcanic Terroir.",
      channel: "Booking",
      status: "Action required",
      meta: "Now",
      tone: "coral" as const,
    },
    {
      key: "notif-2",
      title: "Weekly recommendations refreshed",
      detail: "Three newcomer-safe paid events and two member-deal venues were added to your feed.",
      channel: "Discovery",
      status: "New",
      meta: "2 h ago",
      tone: "indigo" as const,
    },
    {
      key: "notif-3",
      title: "Profile visibility changed",
      detail: "Your profile is currently visible to joined groups and approved organizers only.",
      channel: "Privacy",
      status: "Info",
      meta: "Yesterday",
      tone: "sage" as const,
    },
  ],
  calendarDays: [
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 },
    { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 },
    { day: 15, emphasis: true, items: [singlesNight.title] },
    { day: 16 },
    { day: 17 },
    { day: 18 },
    { day: 19, emphasis: true, items: [reactWorkshop.title, wineTasting.title] },
    { day: 20, emphasis: true, items: [newcomersNight.title] },
    { day: 21, emphasis: true, items: [saturdayHike.title] },
    { day: 22 },
    { day: 23 },
    { day: 24 },
    { day: 25 },
    { day: 26 },
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 31 },
    { day: 1, outside: true },
    { day: 2, outside: true },
    { day: 3, outside: true },
    { day: 4, outside: true },
  ],
  settingsSections: [
    {
      key: "profile",
      title: "Profile",
      description: "Display identity, languages, interests, and profile completion.",
      items: [
        { label: "Display name", value: memberProfile.name },
        { label: "Bio length", value: "238 / 300 characters" },
        { label: "Interests", value: "5 active tags" },
      ],
    },
    {
      key: "account",
      title: "Account",
      description: "Email, password hygiene, connected auth providers, and billing identity.",
      items: [
        { label: "Primary email", value: "kari@meetupreykjavik.is" },
        { label: "2-step auth", value: "Recommended" },
        { label: "Account tier", value: memberProfile.tier },
      ],
    },
    {
      key: "notifications",
      title: "Notifications",
      description: "Reminder windows, group digests, approval alerts, and weekly recommendations.",
      items: [
        { label: "Event reminders", value: "24h and 2h before" },
        { label: "Weekly digest", value: "Enabled" },
        { label: "Waitlist alerts", value: "Push + email" },
      ],
    },
    {
      key: "language",
      title: "Language",
      description: "Primary locale, bilingual copy fallback, and content translation preference.",
      items: [
        { label: "Primary locale", value: "English" },
        { label: "Secondary locale", value: "Icelandic" },
        { label: "Event copy fallback", value: "Show both if available" },
      ],
    },
    {
      key: "privacy",
      title: "Privacy",
      description: "Profile visibility, attendance history exposure, and messaging controls.",
      items: [
        { label: "Profile visibility", value: "Members only" },
        { label: "Attendance history", value: "Visible to joined groups" },
        { label: "Direct messages", value: "Allow organizers only" },
      ],
    },
    {
      key: "billing",
      title: "Billing",
      description: "Subscription status, invoices, credits, and premium renewal behavior.",
      items: [
        { label: "Current plan", value: "Plus monthly" },
        { label: "Renewal date", value: "April 10, 2026" },
        { label: "Stored invoices", value: "6 available" },
      ],
    },
  ],
};

const organizerManagedEvents = [
  {
    slug: reactWorkshop.slug,
    title: reactWorkshop.title,
    groupName: techGroup.name,
    dateLabel: "Thu 19 Mar, 18:30",
    venueName: reactWorkshop.venueName,
    status: "Published",
    approvalMode: "Manual approval",
    rsvps: 61,
    capacity: 80,
    waitlist: 9,
    ticketsSold: 44,
    revenue: "41,800 ISK",
    checkIns: "0 / 61",
    notes:
      "Laptop-heavy workshop. Keep seating in classroom mode and open coffee service early.",
    timeline: [
      { time: "17:45", label: "Doors and coffee" },
      { time: "18:30", label: "Workshop opens" },
      { time: "19:40", label: "Break and venue networking" },
      { time: "21:00", label: "Close and feedback prompt" },
    ],
    attendees: [
      { name: "Anna S.", status: "Approved", ticket: "Paid", checkedIn: "No", note: "Requested front-row seating." },
      { name: "Einar K.", status: "Approved", ticket: "Paid", checkedIn: "No", note: "Returning attendee from last workshop." },
      { name: "Marta P.", status: "Pending", ticket: "Invoice pending", checkedIn: "No", note: "Asked to bring a junior teammate." },
      { name: "Diego L.", status: "Waitlist", ticket: "Hold", checkedIn: "No", note: "Will auto-promote if payment clears." },
      { name: "Helga A.", status: "Approved", ticket: "Paid", checkedIn: "No", note: "Co-host for post-event Q and A." },
      { name: "Nora T.", status: "Rejected", ticket: "Refunded", checkedIn: "No", note: "Duplicate registration from personal + work email." },
    ],
    coOrganizers: ["Bjorn Olafsson", "Helga Arnadottir"],
    commentsSummary: "14 comments, 2 pinned organizer notes, 1 venue logistics thread.",
  },
  {
    slug: newcomersNight.slug,
    title: newcomersNight.title,
    groupName: expatsGroup.name,
    dateLabel: "Fri 20 Mar, 19:30",
    venueName: newcomersNight.venueName,
    status: "Published",
    approvalMode: "Open RSVP",
    rsvps: 58,
    capacity: 70,
    waitlist: 0,
    ticketsSold: 58,
    revenue: "29,000 ISK",
    checkIns: "0 / 58",
    notes:
      "Host desk must stay visible. Arrival prompts are more important than decorations for this format.",
    timeline: [
      { time: "19:00", label: "Host setup" },
      { time: "19:30", label: "Arrival and intros" },
      { time: "20:00", label: "Timed rounds" },
      { time: "21:15", label: "Open mingle" },
    ],
    attendees: [
      { name: "Freya N.", status: "Approved", ticket: "500 ISK", checkedIn: "No", note: "First event in Reykjavik." },
      { name: "Lukas G.", status: "Approved", ticket: "500 ISK", checkedIn: "No", note: "Requested Icelandic-language circle." },
      { name: "Sara B.", status: "Approved", ticket: "500 ISK", checkedIn: "No", note: "Will bring one guest if space allows." },
      { name: "Jon M.", status: "Waitlist", ticket: "Hold", checkedIn: "No", note: "Waiting on extra host capacity." },
    ],
    coOrganizers: ["Marta Polak", "Freya N."],
    commentsSummary: "22 comments, 4 newcomer intro threads, 1 rideshare sub-thread.",
  },
  {
    slug: singlesNight.slug,
    title: singlesNight.title,
    groupName: "Nightlife Reykjavik",
    dateLabel: "Sun 15 Mar, 20:00",
    venueName: singlesNight.venueName,
    status: "Draft refresh",
    approvalMode: "Manual approval",
    rsvps: 43,
    capacity: 60,
    waitlist: 5,
    ticketsSold: 31,
    revenue: "23,250 ISK",
    checkIns: "0 / 43",
    notes:
      "Next edition should test age-band segmentation and smaller opening circles before the paid social block opens.",
    timeline: [
      { time: "19:30", label: "Host briefing" },
      { time: "20:00", label: "Opening welcome" },
      { time: "20:20", label: "Round tables" },
      { time: "22:00", label: "Open social" },
    ],
    attendees: [
      { name: "Sofia R.", status: "Approved", ticket: "750 ISK", checkedIn: "No", note: "Attended last edition and rated it highly." },
      { name: "Aron K.", status: "Pending", ticket: "750 ISK", checkedIn: "No", note: "Profile still incomplete." },
      { name: "Mia J.", status: "Approved", ticket: "750 ISK", checkedIn: "No", note: "Asked for quieter arrival area." },
    ],
    coOrganizers: ["Kari Sigurdsson"],
    commentsSummary: "9 comments, mostly venue arrival logistics and age-range questions.",
  },
] as const;

export const organizerPortalData = {
  metrics: [
    {
      label: "Live RSVPs",
      value: "164",
      delta: "+18 this week",
      detail: "Across published events with a 78% average fill rate.",
    },
    {
      label: "Pending approvals",
      value: "9",
      delta: "Needs today",
      detail: "Manual-approval formats are the main queue driver right now.",
    },
    {
      label: "Recurring templates",
      value: "6",
      delta: "2 new drafts",
      detail: "The social and workshop formats are now stable enough to clone.",
    },
    {
      label: "Venue relationships",
      value: "4",
      delta: "2 premium partners",
      detail: "Kex and Grandi Hub are the highest-trust venue partners in this cycle.",
    },
  ],
  rsvpTrend: [
    { label: "Mon", value: 18 },
    { label: "Tue", value: 24 },
    { label: "Wed", value: 21 },
    { label: "Thu", value: 28 },
    { label: "Fri", value: 34 },
    { label: "Sat", value: 17 },
    { label: "Sun", value: 22 },
  ],
  nextEvents: organizerManagedEvents,
  quickActions: [
    {
      title: "Create new event",
      description: "Open the seven-step wizard and start from a proven template.",
      href: "/events/new",
    },
    {
      title: "Review approvals",
      description: "Work through pending attendees before reminder emails go out.",
      href: "/organizer/events",
    },
    {
      title: "Send venue request",
      description: "Browse partner venues and start a booking request with context.",
      href: "/organizer/venues",
    },
    {
      title: "Tune group settings",
      description: "Adjust join mode, moderators, and archive rules for your groups.",
      href: "/organizer/groups",
    },
  ],
  activityFeed: [
    {
      key: "approval",
      title: "4 attendee approvals waiting on React Workshop",
      detail: "Two profiles need manual review and two are pending payment confirmation.",
      meta: "Now",
      tone: "coral" as const,
    },
    {
      key: "venue",
      title: "Kex Hostel countered your Friday booking",
      detail: "They can do the room at 19:30 if attendance stays under 75 and arrival desk remains staffed.",
      meta: "2 h ago",
      tone: "indigo" as const,
    },
    {
      key: "template",
      title: "Workshop template cloned successfully",
      detail: "Your RSC format is now saved as a reusable event template with ticket defaults.",
      meta: "Yesterday",
      tone: "sage" as const,
    },
  ],
  messages: [
    {
      key: "org-msg-1",
      counterpart: "Kex Hostel",
      role: "Venue partner",
      subject: "Counter offer for Friday newcomer social",
      preview: "We can hold the upstairs room at 19:30 if you confirm staffed arrivals and headcount by Wednesday.",
      channel: "Venue negotiation",
      status: "Needs reply",
      meta: "22 min ago",
    },
    {
      key: "org-msg-2",
      counterpart: "Anna S.",
      role: "Approved attendee",
      subject: "Can I bring a teammate?",
      preview: "Asks whether one extra seat can be manually approved if payment clears today.",
      channel: "Attendee message",
      status: "Unread",
      meta: "Today",
    },
    {
      key: "org-msg-3",
      counterpart: "Tech Community RVK co-hosts",
      role: "Internal host thread",
      subject: "Reminder timing",
      preview: "Co-hosts want the second reminder pushed to 2 hours before doors instead of 4.",
      channel: "Host ops",
      status: "Open",
      meta: "Yesterday",
    },
  ],
  notifications: [
    {
      key: "org-notif-1",
      title: "Manual approvals crossed SLA",
      detail: "Four attendee approvals have been open for more than 90 minutes on React Workshop.",
      channel: "Approvals",
      status: "Urgent",
      meta: "Now",
      tone: "coral" as const,
    },
    {
      key: "org-notif-2",
      title: "Paid ticket revenue hit target",
      detail: "React Workshop has crossed the 40,000 ISK target set in the event plan.",
      channel: "Revenue",
      status: "Good",
      meta: "1 h ago",
      tone: "sage" as const,
    },
    {
      key: "org-notif-3",
      title: "Template clone completed",
      detail: "Hosted social template is ready with reminder cadence, pricing floor, and venue ask preserved.",
      channel: "Templates",
      status: "Info",
      meta: "Today",
      tone: "indigo" as const,
    },
  ],
  groups: [
    {
      group: techGroup,
      joinMode: "Approval",
      status: "Active",
      pendingMembers: 5,
      coHosts: 2,
      health: "Excellent",
      nextEvent: reactWorkshop.title,
    },
    {
      group: expatsGroup,
      joinMode: "Open",
      status: "Featured",
      pendingMembers: 1,
      coHosts: 3,
      health: "Strong",
      nextEvent: newcomersNight.title,
    },
    {
      group: creativeGroup,
      joinMode: "Open",
      status: "Reviewing event cadence",
      pendingMembers: 0,
      coHosts: 1,
      health: "Needs more recurring rhythm",
      nextEvent: "Harbor Jazz Social",
    },
  ],
  events: organizerManagedEvents,
  templates: [
    "Workshop + ticketing",
    "Hosted social night",
    "Newcomer round-robin",
    "Small venue tasting",
  ],
  venueMatches: [
    {
      venue: grandiHub,
      score: "96%",
      nextSlot: "Thu 19 Mar, 18:00-21:30",
      fit: "Best for technical workshops, projector-first sessions, and repeat founder events.",
    },
    {
      venue: kex,
      score: "92%",
      nextSlot: "Fri 20 Mar, 19:00-23:00",
      fit: "Best for newcomer socials and formats that depend on warm arrivals and flexible seating.",
    },
    {
      venue: lebowski,
      score: "88%",
      nextSlot: "Sun 15 Mar, 19:30-23:30",
      fit: "Best for structured social formats with host-led table rotations.",
    },
    {
      venue: bryggjuhusid,
      score: "84%",
      nextSlot: "Wed 19 Mar, 18:30-21:30",
      fit: "Best for paid premium formats with limited seating and stronger per-ticket margin.",
    },
  ],
  bookingPipeline: [
    { key: "req-1", organizer: techGroup.name, venue: grandiHub.name, status: "Accepted", date: "19 Mar", note: "Workshop format confirmed with coffee add-on." },
    { key: "req-2", organizer: expatsGroup.name, venue: kex.name, status: "Countered", date: "20 Mar", note: "Venue wants confirmed headcount 48h before event." },
    { key: "req-3", organizer: "Nightlife Reykjavik", venue: lebowski.name, status: "Pending", date: "22 Mar", note: "Waiting on preferred area assignment near host desk." },
  ],
  attendeeIntelligence: {
    featuredProfile: memberProfile.name,
    summary:
      "Representative high-trust attendee profile organizers can use as a model when thinking about room fit, arrival flow, and seating strategy.",
    fitSignals: memberProfile.formatAffinities,
    arrivalProfile: memberProfile.communityStyle,
    hostingNotes: memberProfile.organizerGuidance,
  },
};

export function getManagedOrganizerEvent(slug: string) {
  return organizerManagedEvents.find((event) => event.slug === slug);
}

export const venueReviews = [
  { key: "vr-1", reviewer: "Anna Sigurdsson", rating: 5, text: "Amazing atmosphere and perfect for our group event.", date: "2026-03-02", eventName: "Singles Night 25–35", venueResponse: "Thank you, Anna! We loved hosting your group." },
  { key: "vr-2", reviewer: "Jón Árnason", rating: 4, text: "Great space, sound system could be better for larger groups.", date: "2026-02-20", eventName: "React Workshop" },
  { key: "vr-3", reviewer: "Helga Björnsdóttir", rating: 5, text: "The staff were incredibly accommodating for our wine event.", date: "2026-02-14", eventName: "Wine Tasting", venueResponse: "Glad you enjoyed it, Helga!" },
  { key: "vr-4", reviewer: "Sigurdur Ólafsson", rating: 3, text: "Decent venue but parking was tricky and the entrance was hard to find.", date: "2026-01-30", eventName: "Saturday Hike Meetup" },
  { key: "vr-5", reviewer: "María Jónsdóttir", rating: 4, text: "Cozy and warm. Perfect for our small creative gathering.", date: "2026-01-15", eventName: "Creative Workshop" },
];

export const venuePortalData = {
  venue: lebowski,
  partnershipTier: "premium",
  onboarding: {
    completion: "8 / 10 complete",
    reviewer: "Partnerships team",
    steps: [
      { key: "terms", title: "Account + agreement", detail: "Business account, terms, and venue partner summary accepted.", status: "done" as const },
      { key: "business", title: "Business identity", detail: "Kennitala, legal business name, and VAT status verified.", status: "done" as const },
      { key: "location", title: "Address + map pin", detail: "Pin is confirmed and matches public venue detail routing.", status: "done" as const },
      { key: "capacity", title: "Capacity + layout", detail: "Main room and flexible host area are documented.", status: "done" as const },
      { key: "hours", title: "Hours + availability", detail: "Weekly service hours are live but recurring event blocks need one final pass.", status: "active" as const },
      { key: "gallery", title: "Photo gallery", detail: "Five public images are approved. Add two daytime shots for profile balance.", status: "active" as const },
      { key: "deals", title: "Member deal setup", detail: "Host welcome drink deal is active. Group platter offer still draft.", status: "upcoming" as const },
      { key: "contact", title: "Venue contacts", detail: "Ops lead and booking phone line are confirmed.", status: "done" as const },
      { key: "pricing", title: "Partnership tier", detail: "Premium tier is selected but billing method is not yet linked.", status: "upcoming" as const },
      { key: "review", title: "Final review", detail: "Admin will issue the verified badge when the last two media items are uploaded.", status: "upcoming" as const },
    ],
    requiredDocs: [
      "Daytime exterior photo",
      "Menu / service PDF",
      "Billing contact confirmation",
    ],
  },
  metrics: [
    {
      label: "Events this month",
      value: "12",
      delta: "+3 vs Feb",
      detail: "Hosted socials are driving repeat bookings more than one-off venue-only formats.",
    },
    {
      label: "Attendees served",
      value: "438",
      delta: "74% repeat hosts",
      detail: "Most organizer partners return within 30 days when arrival logistics stay smooth.",
    },
    {
      label: "Venue rating",
      value: "4.8",
      delta: "31 reviews",
      detail: "Arrival clarity and host support remain the most-mentioned positives.",
    },
    {
      label: "Pending bookings",
      value: "4",
      delta: "2 urgent",
      detail: "One Friday and one Saturday slot need responses before end of day.",
    },
  ],
  upcomingEvents: [
    {
      event: singlesNight,
      organizer: "Nightlife Reykjavik",
      status: "Confirmed",
      note: "Host desk near front booth. Welcome drink perk enabled.",
    },
    {
      event: wineTasting,
      organizer: "Reykjavik Foodies",
      status: "Transferred to premium room",
      note: "Small-format layout requires seated service adjustment.",
    },
    {
      event: newcomersNight,
      organizer: expatsGroup.name,
      status: "Counter sent",
      note: "Need final headcount and staffing level before approval.",
    },
    {
      event: { slug: "friday-jazz-night", title: "Friday Jazz Night" },
      organizer: "Lebowski Bar",
      status: "Pending review",
      note: "Submitted by venue — awaiting admin approval.",
    },
  ],
  messages: [
    {
      key: "ven-msg-1",
      counterpart: "Expats in Iceland",
      role: "Organizer",
      subject: "Need flexible entry flow",
      preview: "Organizer wants the host desk visible from the front door and a short arrivals queue split.",
      channel: "Booking thread",
      status: "Needs reply",
      meta: "14 min ago",
    },
    {
      key: "ven-msg-2",
      counterpart: "MeetupReykjavik Admin",
      role: "Platform",
      subject: "Gallery policy follow-up",
      preview: "Two daylight venue photos are still needed before verification can be upgraded.",
      channel: "Compliance",
      status: "Unread",
      meta: "Today",
    },
    {
      key: "ven-msg-3",
      counterpart: "Nightlife Reykjavik",
      role: "Repeat organizer",
      subject: "Can we lock the same host zone?",
      preview: "Wants the prior booth cluster reserved again for Sunday's 30-40 edition.",
      channel: "Repeat booking",
      status: "Open",
      meta: "Yesterday",
    },
  ],
  notifications: [
    {
      key: "ven-notif-1",
      title: "Friday slot needs response",
      detail: "One premium Friday booking will expire if no reply is sent before 17:00.",
      channel: "Bookings",
      status: "Urgent",
      meta: "Now",
      tone: "coral" as const,
    },
    {
      key: "ven-notif-2",
      title: "Deal redemption climbing",
      detail: "Host welcome drink redemption is up 11 points on structured social formats this week.",
      channel: "Revenue",
      status: "Good",
      meta: "3 h ago",
      tone: "sage" as const,
    },
    {
      key: "ven-notif-3",
      title: "Profile visibility boosted",
      detail: "Your venue appears in 2 featured recommendation lanes on the public marketplace.",
      channel: "Visibility",
      status: "Info",
      meta: "Today",
      tone: "indigo" as const,
    },
  ],
  bookings: {
    incoming: [
      {
        key: "bk-1",
        organizer: expatsGroup.name,
        event: newcomersNight.title,
        date: "Fri 20 Mar",
        attendance: "70 expected",
        message: "Need visible host desk and flexible seating for timed rounds.",
        status: "Counter offer",
      },
      {
        key: "bk-2",
        organizer: techGroup.name,
        event: "Founder Social x Demo Night",
        date: "Thu 26 Mar",
        attendance: "55 expected",
        message: "Looking for projector support and early coffee setup.",
        status: "Pending review",
      },
      {
        key: "bk-3",
        organizer: "Nightlife Reykjavik",
        event: "Singles Night - 30-40 Edition",
        date: "Sun 22 Mar",
        attendance: "60 expected",
        message: "Prefer same host zone as previous edition.",
        status: "Accepted",
      },
    ],
    history: [
      { key: "hist-1", venue: lebowski.name, organizer: "Nightlife Reykjavik", result: "Accepted", note: "Repeat booking with better host signage." },
      { key: "hist-2", venue: lebowski.name, organizer: techGroup.name, result: "Declined", note: "Format fit was weak for loud Saturday service." },
      { key: "hist-3", venue: lebowski.name, organizer: expatsGroup.name, result: "Countered", note: "Moved to earlier slot for better arrival flow." },
    ],
    guestFit: {
      summary:
        "Venue operators need a quick guest-behavior view so they can decide whether the room, staffing, and arrival plan actually match the requested event.",
      signals: memberProfile.formatAffinities,
      arrivalNotes: memberProfile.communityStyle,
      roomGuidance: [
        "For newcomer-heavy nights, keep the host desk visible from the entrance and avoid dead arrival corners.",
        "For workshop rooms, prioritize seated clusters and quieter service over bar-energy spillover.",
        "If the audience leans premium or feedback-heavy, protect table service speed and post-event linger space.",
      ],
    },
  },
  availability: {
    recurring: [
      "Every Monday 17:00-22:00 available for workshops and tastings",
      "Every Wednesday 18:00-23:00 reserved for hosted community formats",
      "Sunday 19:00-23:30 optimized for social formats under 70 attendees",
    ],
    exceptions: [
      "Fri 13 Mar blocked for private corporate booking",
      "Sat 21 Mar half capacity due to live sports setup",
      "Sun 29 Mar unavailable after 21:00 for staff training",
    ],
    weeklyGrid: [
      { day: "Mon", blocks: ["17:00-22:00 Open", "22:00-00:00 Service only"] },
      { day: "Tue", blocks: ["18:00-22:00 Open", "Private dining possible"] },
      { day: "Wed", blocks: ["18:00-23:00 Community-preferred slot"] },
      { day: "Thu", blocks: ["18:00-23:30 Open", "Counter offers likely after 21:30"] },
      { day: "Fri", blocks: ["15:00-19:00 Small formats only", "19:00-02:00 Premium pricing"] },
      { day: "Sat", blocks: ["15:00-19:00 Open", "20:00-02:00 Limited event fit"] },
      { day: "Sun", blocks: ["19:00-23:30 Hosted social slot"] },
    ],
  },
  deals: [
    {
      key: "deal-1",
      title: "Host welcome drink",
      type: "Free item",
      tier: "Gold",
      status: "Active",
      redemption: "72% of eligible hosts",
      note: "Drives host satisfaction and faster event setup.",
    },
    {
      key: "deal-2",
      title: "2-for-1 arrival round",
      type: "% off",
      tier: "Silver",
      status: "Active",
      redemption: "31 uses this month",
      note: "Performs best on structured social formats before 21:00.",
    },
    {
      key: "deal-3",
      title: "Group platter bundle",
      type: "Fixed discount",
      tier: "Bronze",
      status: "Draft",
      redemption: "Not live",
      note: "Pending menu finalization and cost check.",
    },
  ],
  analytics: {
    funnel: [
      { label: "Profile views", value: 820 },
      { label: "Booking inquiries", value: 147 },
      { label: "Confirmed bookings", value: 61 },
      { label: "Repeat organizers", value: 27 },
      { label: "Public reviews", value: 31 },
    ],
    eventTypes: [
      { label: "Social", value: 34 },
      { label: "Tech", value: 21 },
      { label: "Food", value: 18 },
      { label: "Expat", value: 26 },
      { label: "Arts", value: 11 },
      { label: "Other", value: 8 },
    ],
    topReferrers: [
      "MeetupReykjavik homepage feature",
      "Organizer direct links",
      "Venue detail page recommendations",
      "Weekly digest",
    ],
  },
  profileSections: [
    {
      key: "general",
      title: "General info",
      items: [
        { label: "Public summary", value: lebowski.summary },
        { label: "Address", value: lebowski.address },
        { label: "Capacity", value: `${lebowski.capacity} standing / mixed` },
      ],
    },
    {
      key: "amenities",
      title: "Amenities",
      items: lebowski.amenities.map((amenity) => ({ label: amenity, value: "Included" })),
    },
    {
      key: "hours",
      title: "Hours",
      items: lebowski.hours.map((hour) => ({ label: hour.day, value: hour.open })),
    },
    {
      key: "socials",
      title: "Social links",
      items: [
        { label: "Instagram", value: "@lebowski_rvk" },
        { label: "Website", value: "lebowski.is" },
        { label: "Booking phone", value: "+354 555 1234" },
      ],
    },
  ],
  reviews: venueReviews.map((r) => ({ ...r })),
};

export const adminPortalData = {
  metrics: [
    { label: "Users", value: "8,412", delta: "+4.8% MoM", detail: "Verified members and premium tiers continue to grow steadily." },
    { label: "Active users", value: "3,924", delta: "46.6% active", detail: "DAU/WAU ratio is strongest in the expat and tech segments." },
    { label: "Events", value: "1,284", delta: "+96 this month", detail: "Most growth came from recurring organizer templates going live." },
    { label: "RSVPs", value: "19,882", delta: "+12.1% MoM", detail: "Approval-mode events are still converting slightly better than open RSVP formats." },
    { label: "Revenue", value: "12.4M ISK", delta: "$85.4k USD eq.", detail: "Mix includes subscriptions, ticket commission, and promoted placements." },
    { label: "Venues", value: String(publicVenues.length + 17), delta: "34 verified", detail: "Application volume remains healthy across nightlife and workshop spaces." },
    { label: "Pending queues", value: "23", delta: "Needs triage", detail: "Venue applications and flagged reports are the biggest queue contributors." },
    { label: "System health", value: "99.96%", delta: "2 degraded checks", detail: "Reminder cron latency is slightly elevated but within tolerance." },
  ],
  growthChart: [
    { label: "Oct", value: 980 },
    { label: "Nov", value: 1120 },
    { label: "Dec", value: 1310 },
    { label: "Jan", value: 1540 },
    { label: "Feb", value: 1775 },
    { label: "Mar", value: 1940 },
  ],
  categoryMix: categories.slice(0, 6).map((category) => ({
    label: category.name,
    value: category.count,
  })),
  urgentQueues: [
    {
      key: "venue-review",
      title: "7 venue applications need a decision",
      detail: "Three have complete media and documents. Two are waiting on billing contact confirmation.",
      meta: "Admin queue",
      tone: "coral" as const,
    },
    {
      key: "reports",
      title: "5 high-priority moderation reports",
      detail: "Two harassment reports and three repeated spam-promoter cases need review.",
      meta: "Moderation",
      tone: "basalt" as const,
    },
    {
      key: "content",
      title: "Homepage feature rail expires tomorrow",
      detail: "Swap in March cultural picks and refresh the editorial banner before the weekly digest sends.",
      meta: "Content",
      tone: "indigo" as const,
    },
  ],
  opsInbox: [
    {
      key: "ops-1",
      lane: "Revenue",
      title: "Review wine tasting payout hold",
      owner: "Super admin",
      due: "Today 11:30",
      status: "Needs decision",
      note: "Fee capture landed, but payout should stay on manual review until refund exposure is checked.",
    },
    {
      key: "ops-2",
      lane: "Supply",
      title: "Approve two venue applications before weekend demand push",
      owner: "Venue ops",
      due: "Today 13:00",
      status: "Queued",
      note: "Harbor Loft and Mokka Social Room are blocking event placement options for Friday and Saturday.",
    },
    {
      key: "ops-3",
      lane: "Trust",
      title: "Resolve harassment report cluster tied to one organizer cohort",
      owner: "Moderation",
      due: "Today 14:00",
      status: "Escalated",
      note: "Three related reports need one coherent decision and a clean audit trail.",
    },
    {
      key: "ops-4",
      lane: "Growth",
      title: "Refresh homepage feature rail before digest send",
      owner: "Editorial",
      due: "Today 15:30",
      status: "In progress",
      note: "Current banner expires tomorrow and should be replaced with one premium paid event and one newcomer-safe social.",
    },
  ],
  handoffLog: [
    {
      key: "handoff-1",
      lane: "Moderation",
      actor: "Moderator",
      when: "Today 09:18",
      summary: "Escalated three connected harassment reports into one admin decision bundle.",
    },
    {
      key: "handoff-2",
      lane: "Revenue",
      actor: "Finance review",
      when: "Today 08:42",
      summary: "Marked one paid event fee for payout watch pending refund-risk confirmation.",
    },
    {
      key: "handoff-3",
      lane: "Supply",
      actor: "Venue ops",
      when: "Yesterday 18:06",
      summary: "Left notes on two venue applications that are close to approval but missing final compliance details.",
    },
  ],
  incidentConsole: [
    {
      key: "incident-1",
      title: "Reminder cron latency above target",
      severity: "Medium",
      owner: "Platform ops",
      status: "Investigating",
      note: "Two scheduled reminder waves were delayed enough to affect same-day event confidence.",
    },
    {
      key: "incident-2",
      title: "Venue gallery policy scan failures",
      severity: "Low",
      owner: "Supply ops",
      status: "Queued",
      note: "One new partner upload failed automated checks and needs human review plus uploader guidance.",
    },
    {
      key: "incident-3",
      title: "Linked harassment reports around one host cohort",
      severity: "High",
      owner: "Trust and safety",
      status: "Escalated",
      note: "A single admin decision should cover the whole cluster to keep communication and audit trails consistent.",
    },
  ],
  ownershipBoard: [
    {
      key: "owner-1",
      lane: "Revenue",
      lead: "Super admin",
      coverage: "Payout watch, subscription captures, anomaly review",
      load: "High",
    },
    {
      key: "owner-2",
      lane: "Supply",
      lead: "Venue ops",
      coverage: "Venue approvals, matching notes, partner onboarding",
      load: "Medium",
    },
    {
      key: "owner-3",
      lane: "Trust",
      lead: "Moderator",
      coverage: "Harassment, spam, report escalation, appeals",
      load: "High",
    },
    {
      key: "owner-4",
      lane: "Growth",
      lead: "Editorial",
      coverage: "Homepage rail, digest timing, featured inventory",
      load: "Medium",
    },
  ],
  users: [
    {
      key: "u1",
      name: "Kari Sigurdsson",
      email: "kari@meetupreykjavik.is",
      type: "Organizer",
      status: "Active",
      joined: "Jan 2024",
      lastActive: "8 min ago",
      groups: "8",
      events: "41",
      revenue: "Plus",
    },
    {
      key: "u2",
      name: "Bjorn Olafsson",
      email: "bjorn@techrvk.is",
      type: "Organizer",
      status: "Verified",
      joined: "May 2024",
      lastActive: "23 min ago",
      groups: "3",
      events: "27",
      revenue: "Pro",
    },
    {
      key: "u3",
      name: "Marta Polak",
      email: "marta@expats.is",
      type: "Organizer",
      status: "Active",
      joined: "Jun 2024",
      lastActive: "1 h ago",
      groups: "2",
      events: "18",
      revenue: "Free",
    },
    {
      key: "u4",
      name: "Lebowski Bar",
      email: "ops@lebowski.is",
      type: "Venue",
      status: "Verified",
      joined: "Sep 2024",
      lastActive: "Today",
      groups: "0",
      events: "31",
      revenue: "Premium",
    },
    {
      key: "u5",
      name: "Anna Sigga",
      email: "anna@northshore.is",
      type: "User",
      status: "Flagged",
      joined: "Dec 2025",
      lastActive: "Yesterday",
      groups: "5",
      events: "14",
      revenue: "Free",
    },
  ],
  selectedUser: {
    name: "Bjorn Olafsson",
    role: "Organizer Pro",
    notes: "High-quality technical organizer with strong repeat attendance and low moderation load.",
    bio: "Experienced organizer focused on practical technical events, small-group learning, and high-trust attendee curation.",
    locale: "English primary, Icelandic fallback",
    trustSignals: ["Reliable check-in rate", "No moderation strikes", "High attendee retention"],
    interests: ["React", "Architecture", "Founder sessions", "Product systems"],
    badges: ["Verified organizer", "Top-rated host", "Recurring template owner"],
    items: [
      { key: "l1", label: "Groups", value: "3 active" },
      { key: "l2", label: "Published events", value: "27" },
      { key: "l3", label: "Revenue generated", value: "1.9M ISK" },
      { key: "l4", label: "Last moderation touch", value: "None in 90 days" },
    ],
  },
  clientDossier: {
    name: memberProfile.name,
    tier: memberProfile.tier,
    summary:
      "Reliable client profile with strong hosted-event attendance, premium small-format affinity, and a low-friction moderation history.",
    items: [
      { key: "cd1", label: "Invite priority", value: "High" },
      { key: "cd2", label: "No-show risk", value: "Low" },
      { key: "cd3", label: "Approval hint", value: "Strong fit for hosted tech and premium seated formats" },
      { key: "cd4", label: "Messaging access", value: "Organizers only" },
    ],
    interests: memberProfile.interests,
    badges: memberProfile.badges,
    recentAttendance: memberProfile.recentAttendance,
    venuePreferences: memberProfile.venuePreferences,
    privacySnapshot: memberProfile.privacySnapshot,
    fitBreakdown: memberProfile.formatAffinities,
    accessRules: [
      { label: "Messaging lane", value: "Organizer-led only" },
      { label: "Waitlist handling", value: "Safe to fast-track for hosted formats" },
      { label: "Arrival support", value: "Prefers a visible host handoff" },
      { label: "Venue bias", value: "Seated, calmer, premium-leaning rooms" },
    ],
    curationTimeline: [
      {
        key: "ct-1",
        title: "Flagged for premium roundtables",
        meta: "Nov 2025",
        detail: "Added to the admin shortlist after three high-quality workshop check-ins in a row.",
      },
      {
        key: "ct-2",
        title: "Held from one nightlife format",
        meta: "Jan 2026",
        detail: "Admin avoided auto-matching because the event had no visible welcome flow and poor room zoning.",
      },
      {
        key: "ct-3",
        title: "Protected messaging preference honored",
        meta: "Feb 2026",
        detail: "A direct outreach request was rerouted through the organizer because profile messaging access is constrained.",
      },
    ],
    adminNotes: [
      "Promote quickly from waitlists when the event depends on reliable check-in.",
      "Good candidate for curated workshop roundtables and premium partner tastings.",
      "Keep direct messaging within organizer-led flows because profile preference is constrained.",
    ],
    playbook: [
      "Use this client to stabilize rooms that need dependable arrivals and thoughtful post-event feedback.",
      "Prioritize where the host and venue both benefit from a high-trust attendee rather than a pure seat-filler.",
      "If the room is noisy or open-floor, pair the invite with a warm intro note so expectations stay clear.",
    ],
  },
  groups: {
    queue: [
      { key: "gq1", name: "Nordic Film Circle", organizer: "Elin Thors", status: "Pending approval", note: "Strong concept, needs banner cleanup." },
      { key: "gq2", name: "Women in Product RVK", organizer: "Sara M.", status: "Feature candidate", note: "Excellent engagement in first two weeks." },
      { key: "gq3", name: "Late Night Runners", organizer: "Arnar J.", status: "Health flag", note: "No events in 45 days despite 120 members." },
    ],
    table: [
      { key: techGroup.slug, name: techGroup.name, members: techGroup.members, status: "Active", health: "Excellent", action: "Feature" },
      { key: expatsGroup.slug, name: expatsGroup.name, members: expatsGroup.members, status: "Featured", health: "Excellent", action: "Monitor" },
      { key: creativeGroup.slug, name: creativeGroup.name, members: creativeGroup.members, status: "Active", health: "Needs cadence", action: "Prompt organizer" },
      { key: hikersGroup.slug, name: hikersGroup.name, members: hikersGroup.members, status: "Active", health: "Healthy", action: "Archive" },
    ],
  },
  events: {
    table: [
      { key: reactWorkshop.slug, title: reactWorkshop.title, status: "Approved", category: reactWorkshop.category, venue: reactWorkshop.venueName, date: "19 Mar", action: "Feature candidate" },
      { key: newcomersNight.slug, title: newcomersNight.title, status: "Approved", category: newcomersNight.category, venue: newcomersNight.venueName, date: "20 Mar", action: "Monitor waitlist" },
      { key: wineTasting.slug, title: wineTasting.title, status: "Paid", category: wineTasting.category, venue: wineTasting.venueName, date: "19 Mar", action: "Check payout" },
      { key: singlesNight.slug, title: singlesNight.title, status: "Approval mode", category: singlesNight.category, venue: singlesNight.venueName, date: "15 Mar", action: "Review attendee ratio" },
      { key: "friday-jazz-night", title: "Friday Jazz Night", status: "Pending Review", category: "Nightlife & Social", venue: "Lebowski Bar", date: "22 Mar", action: "Venue-submitted — needs approval" },
    ],
    calendar: [
      { day: "15", label: singlesNight.title },
      { day: "16", label: saturdayHike.title },
      { day: "19", label: reactWorkshop.title },
      { day: "19", label: wineTasting.title },
      { day: "20", label: newcomersNight.title },
    ],
    audiencePicker: {
      eventTitle: reactWorkshop.title,
      eventSlug: reactWorkshop.slug,
      target: "Curated admin invitations for a 20-seat expert roundtable inside the workshop",
      seatsRemaining: 8,
      selectedIds: ["c2", "c4", "c7"],
      candidates: [
        {
          id: "c1",
          name: "Anna Jonsdottir",
          tier: "Plus",
          status: "Reliable attendee",
          fitScore: 94,
          lastActive: "12 min ago",
          tags: ["Tech", "Workshops", "React"],
          reason:
            "Attended the previous architecture night, left strong feedback, and usually checks in early.",
        },
        {
          id: "c2",
          name: "Einar Karlsson",
          tier: "Pro",
          status: "Organizer crossover",
          fitScore: 98,
          lastActive: "Now",
          tags: ["Tech", "Founders", "RSC"],
          reason:
            "Strong technical fit and likely to generate high-value discussion during the roundtable segment.",
        },
        {
          id: "c3",
          name: "Freya Nielsen",
          tier: "Free",
          status: "Newcomer",
          fitScore: 78,
          lastActive: "1 h ago",
          tags: ["Career switch", "Frontend", "Community"],
          reason:
            "Lower experience level but highly engaged in community threads and workshop prep discussions.",
        },
        {
          id: "c4",
          name: "Diego Lopez",
          tier: "Plus",
          status: "Waitlist priority",
          fitScore: 91,
          lastActive: "28 min ago",
          tags: ["Tech", "Auth", "Caching"],
          reason:
            "Requested exactly the follow-up topics this event covers and already sits near the top of the waitlist.",
        },
        {
          id: "c5",
          name: "Marta Polak",
          tier: "Free",
          status: "Community lead",
          fitScore: 82,
          lastActive: "Today",
          tags: ["Expat", "Operator", "Host"],
          reason:
            "Useful cross-community invite when admin wants stronger organizer-to-organizer knowledge sharing.",
        },
        {
          id: "c6",
          name: "Nora T.",
          tier: "Plus",
          status: "Needs review",
          fitScore: 69,
          lastActive: "Yesterday",
          tags: ["Duplicate signup", "Tech"],
          reason:
            "Fit is decent, but this account previously registered twice and should only be approved if details are clean.",
        },
        {
          id: "c7",
          name: "Helga Arnadottir",
          tier: "Pro",
          status: "Trusted host",
          fitScore: 89,
          lastActive: "2 h ago",
          tags: ["Outdoors", "Ops", "Co-host"],
          reason:
            "Less technical than the top picks, but very strong as a facilitation and community-bridging participant.",
        },
        {
          id: "c8",
          name: "Sara Magnusdottir",
          tier: "Premium venue contact",
          status: "Venue crossover",
          fitScore: 76,
          lastActive: "Today",
          tags: ["Venue", "Food", "Partnerships"],
          reason:
            "Useful when admin wants a venue-side lens in the room, but not a pure subject-matter fit.",
        },
      ],
    },
    audienceStrategy: {
      brief: [
        { key: "goal", label: "Room goal", value: "Blend deep technical voices with a few high-trust community bridge builders." },
        { key: "shape", label: "Desired room shape", value: "12 practitioners, 4 operator/host voices, 4 emerging attendees." },
        { key: "constraint", label: "Primary constraint", value: "Keep duplicate-company representation low and avoid cold arrivals." },
        { key: "host", label: "Host instruction", value: "Seat trusted returners near newcomers so the roundtable warms up fast." },
      ],
      segments: [
        {
          key: "experts",
          label: "Deep technical voices",
          target: 4,
          current: 3,
          note: "People who can materially raise discussion quality in the RSC and architecture blocks.",
        },
        {
          key: "operators",
          label: "Community operators",
          target: 4,
          current: 2,
          note: "Trusted hosts and organizers who improve pacing, facilitation, and room energy.",
        },
        {
          key: "emerging",
          label: "Emerging practitioners",
          target: 4,
          current: 3,
          note: "Attendees who are newer to the topic but engaged enough to benefit from careful placement.",
        },
        {
          key: "venue",
          label: "Venue and partner crossover",
          target: 2,
          current: 1,
          note: "Non-core seats reserved for strategic partner presence when the conversation benefits from it.",
        },
      ],
      rules: [
        "Do not let more than two seats come from the same company or organizer team.",
        "Keep at least two high-trust attendees in the first arrival wave so the room settles quickly.",
        "If a newcomer is selected, pair them with a host or returning attendee who can create a warm entry point.",
        "Use hold status instead of rejection whenever the fit is good but the room shape is already full.",
      ],
    },
  },
  venues: {
    applications: [
      { key: "va1", name: "Mokka Social Room", type: "Cafe", status: "Pending", note: "Strong fit for daytime community formats." },
      { key: "va2", name: "Harbor Loft", type: "Event loft", status: "Waitlist", note: "Good fit but weekend pricing currently too aggressive." },
      { key: "va3", name: "Sundholl Club Room", type: "Wellness", status: "Request info", note: "Need fire capacity clarification." },
    ],
    active: publicVenues.map((venue) => ({
      key: venue.slug,
      name: venue.name,
      area: venue.area,
      type: venue.type,
      rating: venue.rating,
      note: venue.deal,
    })),
    matching: [
      "Pair tech organizers with Grandi Hub by default for workshops over 40 attendees.",
      "Recommend Kex first for newcomer formats that require arrival hosting and flexible seating.",
      "Push Bryggjuhusid to premium paid events where capacity is low but per-seat value is high.",
    ],
  },
  revenue: {
    sources: [
      { label: "Organizer SaaS", value: 34 },
      { label: "Ticket commission", value: 31 },
      { label: "Venue SaaS", value: 22 },
      { label: "Promoted listings", value: 13 },
    ],
    transactions: [
      { key: "txn-1", source: "Organizer Pro", amount: "9,900 ISK", status: "Captured", when: "Today 09:14" },
      { key: "txn-2", source: wineTasting.title, amount: "4,680 ISK fee", status: "Pending payout", when: "Today 08:42" },
      { key: "txn-3", source: "Venue Premium", amount: "19,900 ISK", status: "Captured", when: "Yesterday" },
      { key: "txn-4", source: reactWorkshop.title, amount: "2,090 ISK fee", status: "Captured", when: "Yesterday" },
    ],
    plans: [...organizerTiers, ...venueTiers, ...userTiers],
    policies: [
      { label: "Minimum public ticket", value: `${minimumTicketPriceIsk} ISK` },
      { label: "Ticket commission", value: `${ticketCommissionRate}%` },
      { label: "Organizer publishing", value: "Paid plan for recurring / paid public events" },
      { label: "Venue workflow access", value: "Paid plan for bookings, deals, and analytics" },
    ],
  },
  analyticsDeck: [
    { key: "a1", title: "User growth", tone: "indigo" as const, data: [11, 16, 19, 22, 27, 31, 33] },
    { key: "a2", title: "DAU", tone: "sage" as const, data: [41, 45, 44, 48, 53, 56, 58] },
    { key: "a3", title: "WAU", tone: "coral" as const, data: [57, 60, 64, 66, 70, 72, 74] },
    { key: "a4", title: "MAU", tone: "basalt" as const, data: [71, 74, 75, 78, 82, 86, 89] },
    { key: "a5", title: "Event creation", tone: "indigo" as const, data: [8, 11, 12, 10, 15, 14, 16] },
    { key: "a6", title: "RSVP conversion", tone: "sage" as const, data: [42, 45, 47, 46, 51, 54, 56] },
    { key: "a7", title: "Category spread", tone: "coral" as const, data: [20, 16, 14, 12, 10, 9, 7] },
    { key: "a8", title: "Geo pull", tone: "indigo" as const, data: [14, 17, 19, 18, 22, 24, 21] },
    { key: "a9", title: "Time heat", tone: "sage" as const, data: [9, 11, 15, 18, 20, 24, 21] },
    { key: "a10", title: "Venue ranking", tone: "basalt" as const, data: [68, 71, 72, 76, 79, 81, 83] },
    { key: "a11", title: "Revenue mix", tone: "coral" as const, data: [33, 35, 36, 40, 43, 44, 46] },
    { key: "a12", title: "Ticket funnel", tone: "indigo" as const, data: [74, 63, 59, 51, 48, 42, 39] },
  ],
  heatGrid: {
    columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rows: [
      { label: "Morning", values: [1, 2, 2, 2, 3, 1, 1] },
      { label: "Afternoon", values: [2, 3, 3, 4, 4, 3, 2] },
      { label: "Evening", values: [4, 5, 6, 7, 7, 6, 4] },
      { label: "Late", values: [1, 1, 2, 4, 6, 6, 2] },
    ],
  },
  geography: [
    { label: "101 Reykjavik", value: "44%" },
    { label: "Vesturbær", value: "16%" },
    { label: "Laugardalur", value: "13%" },
    { label: "Kópavogur", value: "9%" },
    { label: "Remote / abroad", value: "18%" },
  ],
  content: {
    sections: [
      { key: "hero", title: "Hero", status: "Live", note: "Current homepage hero still matches the editorial direction from the Indigo/Coral reference." },
      { key: "featured-events", title: "Featured events", status: "Needs refresh", note: "Swap in one premium paid event and one newcomer-safe social." },
      { key: "editor-picks", title: "Editor picks", status: "Draft", note: "Awaiting March culture shortlist." },
      { key: "groups", title: "Featured groups", status: "Live", note: "Tech + expat pairing is performing well." },
      { key: "banner", title: "Promo banner", status: "Expiring", note: "Venue premium callout expires tomorrow." },
    ],
    categories: categories.map((category) => ({
      key: category.name,
      name: category.name,
      count: String(category.count),
      tone: category.tone,
    })),
    blogQueue: blogPosts.map((post) => ({
      key: post.slug,
      title: post.title,
      category: post.category,
      status: post.slug === blogPosts[0]?.slug ? "Published" : "Draft review",
    })),
  },
  moderation: {
    reports: [
      { key: "r1", subject: "Direct message harassment", priority: "High", status: "Open", note: "Multiple reports from same organizer cohort." },
      { key: "r2", subject: "Spam venue promotion", priority: "Medium", status: "Investigating", note: "Repeated cross-posting into unrelated groups." },
      { key: "r3", subject: "Fake RSVP pattern", priority: "High", status: "Escalated", note: "Possible ticket scalping attempt." },
    ],
    pendingApproval: [
      "2 venues awaiting verified badge review",
      "3 groups pending moderation approval",
      "4 events held for payment / content checks",
    ],
    autoFlagged: [
      "8 comments matched spam heuristics",
      "2 accounts triggered rapid-RSVP anomaly detection",
      "1 venue gallery upload failed policy scan",
    ],
    banned: [
      { key: "b1", name: "Tomas V.", reason: "Harassment", appeal: "Pending" },
      { key: "b2", name: "PromoHub Reykjavik", reason: "Commercial spam", appeal: "None" },
    ],
    auditLog: [
      { key: "a1", action: "Approved venue application", actor: "Admin", when: "Today 10:12" },
      { key: "a2", action: "Featured Tech Community RVK", actor: "Admin", when: "Today 09:04" },
      { key: "a3", action: "Suspended user for repeated spam", actor: "Moderator", when: "Yesterday" },
    ],
  },
  comms: {
    audiences: ["All users", "Premium users", "Organizers", "Venue partners", "New members"],
    draft: {
      templateKey: emailTemplateCatalog[0]?.key ?? "weekly-digest",
      subject: "This week in Reykjavik",
      preview:
        "Highlight one newcomer-safe social, one paid premium event, and one venue-partner story with clean city-specific copy.",
      preheader:
        "Three city-shaped picks, one newcomer-safe social, and one venue partner worth noticing.",
      headline: "A warmer week of events across Reykjavik",
      ctaLabel: "Explore this week's events",
      footer: "Sent as part of your MeetupReykjavik digest preferences.",
    },
    templates: emailTemplateCatalog,
    history: [
      { key: "c1", title: "Weekly digest", audience: "All users", sent: "Monday 09:00", result: "41% open rate" },
      { key: "c2", title: "Organizer feature announcement", audience: "Organizers", sent: "Friday 13:00", result: "58% open rate" },
      { key: "c3", title: "Venue upgrade prompt", audience: "Venue partners", sent: "Last week", result: "19 conversions" },
    ],
  },
  settings: [
    {
      key: "general",
      title: "General",
      items: [
        { label: "Default locale", value: "English" },
        { label: "Primary city", value: "Reykjavik" },
        { label: "Homepage maintenance banner", value: "Off" },
      ],
    },
    {
      key: "registration",
      title: "Registration",
      items: [
        { label: "Open signup", value: "Enabled" },
        { label: "Organizer manual review", value: "Enabled" },
        { label: "Venue application gate", value: "Enabled" },
      ],
    },
    {
      key: "events",
      title: "Events",
      items: [
        { label: "Approval-mode default", value: "Off" },
        { label: "Waitlist auto-promote", value: "Enabled" },
        { label: "Reminder cron", value: "24h + 2h" },
      ],
    },
    {
      key: "venues",
      title: "Venues",
      items: [
        { label: "Verified badge requirement", value: "Admin review" },
        { label: "Venue matching boost", value: "Premium weighted" },
        { label: "Deal approval", value: "Auto for verified venues" },
      ],
    },
    {
      key: "payments",
      title: "Payments",
      items: [
        { label: "Minimum public ticket", value: `${minimumTicketPriceIsk} ISK` },
        { label: "Ticket commission", value: `${ticketCommissionRate}%` },
        { label: "Subscription provider", value: "PayPal" },
        { label: "Payout review threshold", value: "50,000 ISK" },
      ],
    },
    {
      key: "email",
      title: "Email",
      items: [
        { label: "Provider", value: "Resend" },
        { label: "Weekly digest", value: "Enabled" },
        { label: "Transactional logging", value: "7 days" },
      ],
    },
    {
      key: "privacy",
      title: "Privacy",
      items: [
        { label: "Profile default", value: "Members only" },
        { label: "Analytics retention", value: "12 months" },
        { label: "Export requests", value: "Manual review" },
      ],
    },
    {
      key: "maintenance",
      title: "Maintenance",
      items: [
        { label: "Read-only mode", value: "Off" },
        { label: "Background jobs", value: "Healthy" },
        { label: "Incident banner", value: "Off" },
      ],
    },
    {
      key: "feature-flags",
      title: "Feature flags",
      items: [
        { label: "Venue matching beta", value: "On" },
        { label: "Bilingual onboarding", value: "On" },
        { label: "Organizer template cloning", value: "On" },
      ],
    },
  ],
};

/* ── New mock data for dashboard rebuild ─────────────────────── */

export const memberTransactions = [
  { key: "tx-1", type: "ticket", description: "Singles Night 25–35 — General", amount: "3 500 ISK", status: "completed", date: "2026-02-28", eventSlug: "singles-night-25-35" },
  { key: "tx-2", type: "ticket", description: "Wine Tasting — VIP", amount: "8 900 ISK", status: "completed", date: "2026-02-15", eventSlug: "wine-tasting-volcanic-terroir" },
  { key: "tx-3", type: "subscription", description: "Plus membership — monthly", amount: "1 990 ISK", status: "completed", date: "2026-03-01" },
  { key: "tx-4", type: "refund", description: "Saturday Hike — cancelled", amount: "-2 500 ISK", status: "completed", date: "2026-03-05", eventSlug: "saturday-hike-mt-esja" },
  { key: "tx-5", type: "ticket", description: "React Workshop — Early Bird", amount: "4 500 ISK", status: "completed", date: "2026-01-20", eventSlug: "react-server-components-workshop" },
] as const;

export const adminBookings = [
  { key: "ab-1", organizer: "Anna Sigurdsson", venue: "Kex Hostel", date: "2026-03-20", time: "18:00–22:00", attendance: "40", status: "pending", message: "Looking for a cozy space for our singles mixer." },
  { key: "ab-2", organizer: "Einar Jónsson", venue: "Loft Hostel", date: "2026-03-25", time: "14:00–18:00", attendance: "25", status: "accepted" },
  { key: "ab-3", organizer: "Jón Árnason", venue: "Iðnó", date: "2026-04-01", time: "19:00–23:00", attendance: "80", status: "counter_offered", message: "Can we also use the upstairs room?" },
  { key: "ab-4", organizer: "Helga Björnsdóttir", venue: "Kex Hostel", date: "2026-03-15", time: "10:00–14:00", attendance: "15", status: "completed" },
  { key: "ab-5", organizer: "María Jónsdóttir", venue: "Hlemmur Mathöll", date: "2026-03-28", time: "17:00–21:00", attendance: "50", status: "declined", message: "Food hall event for expat community" },
] as const;

export const adminAuditLog = [
  { key: "au-1", admin: "Platform Admin", action: "venue_approved", targetType: "venue" as const, targetId: "kex-hostel", details: "status: pending → active", timestamp: "2026-03-12T14:30:00Z" },
  { key: "au-2", admin: "Platform Admin", action: "user_role_changed", targetType: "user" as const, targetId: "jon-arnason", details: "role: user → organizer", timestamp: "2026-03-12T12:15:00Z" },
  { key: "au-3", admin: "Platform Admin", action: "event_featured", targetType: "event" as const, targetId: "singles-night-25-35", details: "is_featured: false → true", timestamp: "2026-03-11T18:00:00Z" },
  { key: "au-4", admin: "Platform Admin", action: "group_approved", targetType: "group" as const, targetId: "reykjavik-hikers", details: "status: pending → active", timestamp: "2026-03-11T10:30:00Z" },
  { key: "au-5", admin: "Platform Admin", action: "user_suspended", targetType: "user" as const, targetId: "spam-account-1", details: "reason: spam reports (3)", timestamp: "2026-03-10T09:00:00Z" },
  { key: "au-6", admin: "Platform Admin", action: "setting_changed", targetType: "setting" as const, targetId: "commission_rate", details: "value: 3% → 5%", timestamp: "2026-03-09T16:45:00Z" },
  { key: "au-7", admin: "Platform Admin", action: "venue_rejected", targetType: "venue" as const, targetId: "unknown-bar", details: "reason: incomplete application", timestamp: "2026-03-08T11:20:00Z" },
  { key: "au-8", admin: "Platform Admin", action: "refund_issued", targetType: "transaction" as const, targetId: "tx-4", details: "amount: 2,500 ISK — event cancelled", timestamp: "2026-03-05T14:00:00Z" },
] as const;

export const dashboardReferenceData = {
  publicEvents,
  publicVenues,
};
