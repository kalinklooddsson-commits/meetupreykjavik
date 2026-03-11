export type HomeEvent = {
  id: number;
  title: string;
  tag: string;
  day: string;
  date: string;
  time: string;
  venue: string;
  attendees: number;
  deal?: string;
  art: string;
};

export type HomeGroup = {
  name: string;
  category: string;
  members: number;
  description: string;
  art: string;
};

export type HomeVenue = {
  name: string;
  type: string;
  area: string;
  rating: number;
  events: number;
  deal?: string;
  art: string;
};

export const heroStats = [
  { value: "2,847", label: "Members" },
  { value: "156", label: "Groups" },
  { value: "89", label: "This Week" },
  { value: "34", label: "Venue Partners" },
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

export const events: HomeEvent[] = [
  {
    id: 1,
    title: "Singles Night - Ages 25-35",
    tag: "Social",
    day: "Thu 15 Mar",
    date: "15",
    time: "20:00",
    venue: "Lebowski Bar",
    attendees: 43,
    deal: "2-for-1 drinks",
    art: "linear-gradient(135deg, rgba(232,97,77,0.6), rgba(79,70,229,0.5)), url('/place-images/reykjavik/generated/lebowski-bar.svg')",
  },
  {
    id: 2,
    title: "Saturday Hike to Mt. Esja",
    tag: "Outdoors",
    day: "Sat 16 Mar",
    date: "16",
    time: "09:00",
    venue: "Esja Trailhead",
    attendees: 27,
    art: "linear-gradient(135deg, rgba(124,154,130,0.55), rgba(42,38,56,0.5)), url('/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg')",
  },
  {
    id: 3,
    title: "React Server Components Workshop",
    tag: "Tech",
    day: "Tue 19 Mar",
    date: "19",
    time: "18:30",
    venue: "Grandi Hub",
    attendees: 61,
    deal: "Free coffee",
    art: "linear-gradient(135deg, rgba(55,48,163,0.6), rgba(30,27,46,0.5)), url('/place-images/reykjavik/generated/grandi101.svg')",
  },
] as const;

export const groups: HomeGroup[] = [
  {
    name: "Reykjavik Hikers",
    category: "Outdoors",
    members: 284,
    description: "Weekly hikes around Iceland with welcoming hosts and low-pressure signups.",
    art: "linear-gradient(135deg, rgba(124,154,130,0.5), rgba(79,70,229,0.4)), url('/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg')",
  },
  {
    name: "Expats in Iceland",
    category: "Expat",
    members: 512,
    description: "A landing spot for newcomers finding events, friends, and practical city tips.",
    art: "linear-gradient(135deg, rgba(232,97,77,0.5), rgba(245,240,232,0.3)), url('/place-images/reykjavik/reykjavik-871-2-78434189.jpg')",
  },
  {
    name: "Tech Community RVK",
    category: "Tech",
    members: 198,
    description: "Developers, founders, and designers sharing talks, demos, and open studio nights.",
    art: "linear-gradient(135deg, rgba(55,48,163,0.55), rgba(232,97,77,0.4)), url('/place-images/reykjavik/generated/grandi101.svg')",
  },
  {
    name: "Creative Reykjavik",
    category: "Arts",
    members: 203,
    description: "Gallery walks, sketchbook meetups, and after-hours openings around the city.",
    art: "linear-gradient(135deg, rgba(245,240,232,0.4), rgba(232,97,77,0.4)), url('/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg')",
  },
] as const;

export const venues: HomeVenue[] = [
  {
    name: "Lebowski Bar",
    type: "Bar & Grill",
    area: "Laugavegur",
    rating: 4.7,
    events: 31,
    deal: "Happy hour until 21:00",
    art: "linear-gradient(135deg, rgba(30,27,46,0.5), rgba(232,97,77,0.4)), url('/place-images/reykjavik/generated/lebowski-bar.svg')",
  },
  {
    name: "Kex Hostel",
    type: "Bar & Venue",
    area: "Skulagata",
    rating: 4.8,
    events: 23,
    deal: "Welcome drink for hosts",
    art: "linear-gradient(135deg, rgba(245,240,232,0.4), rgba(55,48,163,0.4)), url('/place-images/reykjavik/generated/kex-hostel.svg')",
  },
  {
    name: "Stofan Cafe",
    type: "Cafe & Lounge",
    area: "Vesturgata",
    rating: 4.9,
    events: 18,
    deal: "Coffee bundle for groups",
    art: "linear-gradient(135deg, rgba(124,154,130,0.5), rgba(245,240,232,0.4)), url('/place-images/reykjavik/generated/litla-kaffistofan.svg')",
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
