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
    slug: "singles-night-25-35",
    title: "Singles Night - Ages 25-35",
    tag: "Social",
    day: "Thu 15 Mar",
    date: "15",
    time: "20:00",
    venue: "Lebowski Bar",
    venueSlug: "lebowski-bar",
    attendees: 43,
    deal: "2-for-1 drinks",
    photo: "/place-images/reykjavik/reykjavik-871-2-78434189.jpg",
  },
  {
    id: 2,
    slug: "saturday-hike-mt-esja",
    title: "Saturday Hike to Mt. Esja",
    tag: "Outdoors",
    day: "Sat 16 Mar",
    date: "16",
    time: "09:00",
    venue: "Esja Trailhead",
    venueSlug: "grandi-hub",
    attendees: 27,
    photo: "/place-images/reykjavik/hallgrimskirkja-60f147a6.jpg",
  },
  {
    id: 3,
    slug: "react-server-components-workshop",
    title: "React Server Components Workshop",
    tag: "Tech",
    day: "Tue 19 Mar",
    date: "19",
    time: "18:30",
    venue: "Grandi Hub",
    venueSlug: "grandi-hub",
    attendees: 61,
    deal: "Free coffee",
    photo: "/place-images/reykjavik/hof-i-deccf755.jpg",
  },
  {
    id: 4,
    slug: "reykjavik-street-food-crawl",
    title: "Reykjavik Street Food Crawl",
    tag: "Food",
    day: "Fri 20 Mar",
    date: "20",
    time: "18:00",
    venue: "Hlemmur Mathöll",
    venueSlug: "stofan-cafe",
    attendees: 35,
    deal: "10% off tastings",
    photo: "/place-images/reykjavik/dill-0aeca160.jpg",
  },
  {
    id: 5,
    slug: "live-jazz-and-sketch-night",
    title: "Live Jazz & Sketch Night",
    tag: "Music",
    day: "Sat 22 Mar",
    date: "22",
    time: "20:30",
    venue: "Iðnó Cultural House",
    venueSlug: "kex-hostel",
    attendees: 52,
    photo: "/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg",
  },
  {
    id: 6,
    slug: "icelandic-for-beginners-meetup",
    title: "Icelandic for Beginners Meetup",
    tag: "Language",
    day: "Wed 25 Mar",
    date: "25",
    time: "17:30",
    venue: "Stofan Café",
    venueSlug: "stofan-cafe",
    attendees: 29,
    deal: "Free coffee",
    photo: "/place-images/reykjavik/listasafn-einars-jonssonar-e07f8c3b.JPG",
  },
] as const;

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
    photo: "/place-images/reykjavik/reykjavik-871-2-78434189.jpg",
  },
  {
    slug: "tech-community-rvk",
    name: "Tech Community RVK",
    category: "Tech",
    members: 198,
    description: "Developers, founders, and designers sharing talks, demos, and open studio nights.",
    photo: "/place-images/reykjavik/hof-i-deccf755.jpg",
  },
  {
    slug: "creative-reykjavik",
    name: "Creative Reykjavik",
    category: "Arts",
    members: 203,
    description: "Gallery walks, sketchbook meetups, and after-hours openings around the city.",
    photo: "/place-images/reykjavik/jo-leikhusi-52f6c2dd.jpg",
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
    photo: "/place-images/reykjavik/ufa-40055fa7.jpg",
  },
  {
    slug: "kex-hostel",
    name: "Kex Hostel",
    type: "Bar & Venue",
    area: "Skulagata",
    rating: 4.8,
    events: 23,
    deal: "Welcome drink for hosts",
    photo: "/place-images/reykjavik/dill-0aeca160.jpg",
  },
  {
    slug: "stofan-cafe",
    name: "Stofan Cafe",
    type: "Cafe & Lounge",
    area: "Vesturgata",
    rating: 4.9,
    events: 18,
    deal: "Coffee bundle for groups",
    photo: "/place-images/reykjavik/hafnarborg-1be7b43b.jpg",
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
