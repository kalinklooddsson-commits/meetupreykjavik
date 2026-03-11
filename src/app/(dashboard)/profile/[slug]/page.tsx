import { MemberProfileScreen } from "@/components/dashboard/member-pages";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <MemberProfileScreen slug={slug} />;
}
