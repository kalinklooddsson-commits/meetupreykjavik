import type { Metadata } from "next";
import { fetchEvents, fetchGroups } from "@/lib/data";
import { GroupsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "Find and join community groups in Reykjavik — from hiking and nightlife to tech meetups and language exchanges.",
};

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [groups, events] = await Promise.all([fetchGroups(), fetchEvents()]);

  let filteredGroups = groups;
  if (q) {
    const query = q.toLowerCase();
    filteredGroups = filteredGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.category.toLowerCase().includes(query) ||
        g.summary.toLowerCase().includes(query) ||
        g.tags.some((tag: string) => tag.toLowerCase().includes(query)) ||
        g.organizer.toLowerCase().includes(query),
    );
  }
  if (category) {
    filteredGroups = filteredGroups.filter(
      (g) => g.category.toLowerCase() === category.toLowerCase(),
    );
  }

  return (
    <GroupsIndexScreen
      groups={filteredGroups}
      eventCount={events.length}
      searchQuery={q}
      activeCategory={category}
    />
  );
}
