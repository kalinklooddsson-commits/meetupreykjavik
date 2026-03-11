import type { Metadata } from "next";
import { GroupsIndexScreen } from "@/components/public/public-pages";

export const metadata: Metadata = {
  title: "Groups",
  description: "Find and join community groups in Reykjavik — from hiking and nightlife to tech meetups and language exchanges.",
};

export default function GroupsPage() {
  return <GroupsIndexScreen />;
}
