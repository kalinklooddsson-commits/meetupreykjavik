import type { Metadata } from "next";
import { fetchEvents, fetchGroups } from "@/lib/data";
import { GroupsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "Find and join community groups in Reykjavik — from hiking and nightlife to tech meetups and language exchanges.",
};

export default async function GroupsPage() {
  const [groups, events] = await Promise.all([fetchGroups(), fetchEvents()]);

  return <GroupsIndexScreen groups={groups} eventCount={events.length} />;
}
