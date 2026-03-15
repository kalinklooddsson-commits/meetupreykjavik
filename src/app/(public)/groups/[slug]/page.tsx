import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupDetailScreen } from "@/components/public/public-pages";
import { fetchGroupBySlug, fetchEvents } from "@/lib/data";
import { getUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = await fetchGroupBySlug(slug);

  if (!group) {
    return { title: "Group Not Found" };
  }

  const title = group.name;
  const description =
    group.summary ||
    `${group.name} — a ${group.category} group with ${group.members} members in Reykjavik`;
  const canonicalUrl = `/groups/${group.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile",
      images: group.banner
        ? [{ url: group.banner, alt: group.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: group.banner ? [group.banner] : undefined,
    },
  };
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [group, events, session] = await Promise.all([
    fetchGroupBySlug(slug),
    fetchEvents(),
    getUser().catch(() => null),
  ]);

  if (!group) {
    notFound();
  }

  // Check if current user is a member of this group
  let isMember = false;
  if (session?.id) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        // Get the group UUID from slug, then check membership
        const { data: groupRow } = await db
          .from("groups")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        const { data: membership } = groupRow
          ? await db
              .from("group_members")
              .select("id")
              .eq("user_id", session.id)
              .eq("group_id", groupRow.id)
              .maybeSingle()
          : { data: null };
        isMember = !!membership;
      }
    } catch {
      // Non-critical — default to not a member
    }
  }

  return <GroupDetailScreen group={group} events={events} isMember={isMember} />;
}
