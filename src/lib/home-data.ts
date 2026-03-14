export type HomeEvent = {
  id: number;
  slug: string;
  title: string;
  tag: string;
  day: string;
  date: string;
  time: string;
  venue: string;
  venueSlug: string;
  attendees: number;
  deal?: string;
  photo: string;
};

export type HomeGroup = {
  slug: string;
  name: string;
  category: string;
  members: number;
  description: string;
  photo: string;
};

export type HomeVenue = {
  slug: string;
  name: string;
  type: string;
  area: string;
  rating: number;
  events: number;
  deal?: string;
  photo: string;
};

export const heroStats = [
  { value: "19", label: "Members" },
  { value: "8", label: "Groups" },
  { value: "12", label: "This Week" },
  { value: "12", label: "Venue Partners" },
] as const;

export const categories = [
  { name: "Nightlife & Social", count: 24, letter: "N", tone: "coral" },
  { name: "Outdoors & Hiking", count: 18, letter: "O", tone: "sage" },
  { name: "Tech & Startups", count: 14, letter: "T", tone: "indigo" },
  { name: "Music & Arts", count: 11, letter: "M", tone: "sand" },
  { name: "Food & Drink", count: 16, letter: "F", tone: "coral" },
  { name: "Sports & Fitness", count: 13, letter: "S", tone: "sage" },
  { name: "Language Exchange", count: 9, letter: "L", tone: "indigo" },
  { name: "Expat Community", count: 15, letter: "E", tone: "coral" },
  { name: "Books & Culture", count: 7, letter: "B", tone: "sand" },
  { name: "Professional", count: 10, letter: "P", tone: "indigo" },
] as const;

/* Compute day-of-week from an ISO date so we never hardcode wrong days */
function formatHomeDay(isoDate: string): { day: string; date: string } {
  const d = new Date(isoDate);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Atlantic/Reykjavik" });
  const dayNum = d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Atlantic/Reykjavik" });
  const month = d.toLocaleDateString("en-GB", { month: "short", timeZone: "Atlantic/Reykjavik" });
  return { day: `${weekday} ${dayNum} ${month}`, date: dayNum };
}

const e1 = formatHomeDay("2026-03-15T20:00:00Z");
const e2 = formatHomeDay("2026-03-21T09:00:00Z"); // changed to Sat 21 Mar so name matches "Saturday Hike"
const e3 = formatHomeDay("2026-03-19T18:30:00Z");
const e4 = formatHomeDay("2026-04-02T19:00:00Z"); // matches public-data.ts date (Thu 2 Apr)
const e5 = formatHomeDay("2026-03-28T20:30:00Z"); // changed to Sat 28 Mar to match /events listing
const e6 = formatHomeDay("2026-03-19T17:30:00Z"); // matches public-data.ts date (Thu 19 Mar)

export const events: HomeEvent[] = [
  {
    id: 1,
    slug: "singles-night-25-35",
    title: "Singles Night - Ages 25-35",
    tag: "Social",
    day: e1.day,
    date: e1.date,
    time: "20:00",
    venue: "Lebowski Bar",
    venueSlug: "lebowski-bar",
    attendees: 43,
    deal: "2-for-1 drinks",
    photo: "/place-images/reykjavik/venues/lebowski-bar.jpg",
  },
  {
    id: 2,
    slug: "saturday-hike-mt-esja",
    title: "Saturday Hike to Mt. Esja",
    tag: "Outdoors",
    day: e2.day,
    date: e2.date,
    time: "09:00",
    venue: "Esja Trailhead",
    venueSlug: "esja-trailhead",
    attendees: 27,
    photo: "/place-images/reykjavik/generated/esja.svg",
  },
  {
    id: 3,
    slug: "react-server-components-workshop",
    title: "React Server Components Workshop",
    tag: "Tech",
    day: e3.day,
    date: e3.date,
    time: "18:30",
    venue: "Grandi Hub",
    venueSlug: "grandi-hub",
    attendees: 61,
    deal: "Free coffee",
    photo: "/place-images/reykjavik/venues/grandi-hub.jpg",
  },
  {
    id: 4,
    slug: "startup-pitch-night",
    title: "Startup Pitch Night",
    tag: "Tech",
    day: e4.day,
    date: e4.date,
    time: "18:00",
    venue: "Lebowski Bar",
    venueSlug: "lebowski-bar",
    attendees: 35,
    deal: "",
    photo: "/place-images/reykjavik/venues/lebowski-bar.jpg",
  },
  {
    id: 5,
    slug: "harbor-jazz-social",
    title: "Harbor Jazz Social",
    tag: "Music",
    day: e5.day,
    date: e5.date,
    time: "20:30",
    venue: "Gaukurinn",
    venueSlug: "gaukurinn",
    attendees: 52,
    photo: "/place-images/reykjavik/generated/gaukurinn.svg",
  },
  {
    id: 6,
    slug: "language-exchange-thursday",
    title: "Language Exchange Thursday",
    tag: "Language",
    day: e6.day,
    date: e6.date,
    time: "17:30",
    venue: "Mokka Kaffi",
    venueSlug: "mokka",
    attendees: 29,
    deal: "Free coffee",
    photo: "/place-images/reykjavik/venues/mokka.jpg",
  },
];

export const groups: HomeGroup[] = [
  {
    slug: "reykjavik-hikers",
    name: "Reykjavik Hikers",
    category: "Outdoors",
    members: 284,
    description: "Weekly hikes around Iceland with welcoming hosts and low-pressure signups.",
    photo: "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
  },
  {
    slug: "expats-in-iceland",
    name: "Expats in Iceland",
    category: "Expat",
    members: 512,
    description: "A landing spot for newcomers finding events, friends, and practical city tips.",
    photo: "/place-images/reykjavik/venues/lebowski-bar.jpg",
  },
  {
    slug: "tech-community-rvk",
    name: "Tech Community RVK",
    category: "Tech",
    members: 198,
    description: "Developers, founders, and designers sharing talks, demos, and open studio nights.",
    photo: "/place-images/reykjavik/venues/grandi-hub.jpg",
  },
  {
    slug: "creative-reykjavik",
    name: "Creative Reykjavik",
    category: "Arts",
    members: 203,
    description: "Gallery walks, sketchbook meetups, and after-hours openings around the city.",
    photo: "/place-images/reykjavik/venues/kex-hostel.jpg",
  },
] as const;

export const venues: HomeVenue[] = [
  {
    slug: "lebowski-bar",
    name: "Lebowski Bar",
    type: "Bar & Grill",
    area: "Laugavegur",
    rating: 4.7,
    events: 31,
    deal: "Happy hour until 21:00",
    photo: "/place-images/reykjavik/venues/lebowski-bar.jpg",
  },
  {
    slug: "kex-hostel",
    name: "Kex Hostel",
    type: "Bar & Venue",
    area: "Skulagata",
    rating: 4.8,
    events: 23,
    deal: "Welcome drink for hosts",
    photo: "/place-images/reykjavik/venues/kex-hostel.jpg",
  },
  {
    slug: "reykjavik-roasters",
    name: "Reykjavik Roasters",
    type: "Coffee House",
    area: "Brautarholt",
    rating: 4.8,
    events: 15,
    deal: "",
    photo: "/place-images/reykjavik/venues/reykjavik-roasters.jpg",
  },
] as const;

export const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Browse events and groups by interest, date, and neighborhood.",
  },
  {
    number: "02",
    title: "Join",
    description: "RSVP in one click, follow a group, and skip the algorithmic feed noise.",
  },
  {
    number: "03",
    title: "Connect",
    description: "Show up, meet real people, and support local Reykjavik venues at the same time.",
  },
] as const;
