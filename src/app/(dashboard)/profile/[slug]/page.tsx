import { MemberProfileScreen } from "@/components/dashboard/member/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <MemberProfileScreen slug={slug} />;
}
