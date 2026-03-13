import type { Route } from "next";
import { Star } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { venueReviews } from "@/lib/dashboard-data";
import { VenueReviewReply } from "./panels";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-brand-coral text-brand-coral"
              : "text-brand-border"
          }`}
        />
      ))}
    </div>
  );
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueReviewsScreen() {
  const data = await getVenuePortalData();

  const avgRating =
    venueReviews.length > 0
      ? (
          venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length
        ).toFixed(1)
      : "0";

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Reviews"
      description="See what organizers and attendees are saying about your venue."
      links={venueLinks("reviews")}
      roleMode="venue"
    >
      {/* ── Rating summary ───────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Average rating"
          value={avgRating}
          detail={`Based on ${venueReviews.length} reviews.`}
          icon={Star}
          tone="coral"
        />
        <StatCard
          label="Total reviews"
          value={String(venueReviews.length)}
          detail="Reviews from event attendees and organizers."
          icon={Star}
          tone="indigo"
        />
        <StatCard
          label="5-star reviews"
          value={String(venueReviews.filter((r) => r.rating === 5).length)}
          detail={`${Math.round((venueReviews.filter((r) => r.rating === 5).length / venueReviews.length) * 100)}% of all reviews`}
          icon={Star}
          tone="sage"
        />
      </div>

      {/* ── Reviews table ────────────────────────────────── */}
      <Surface
        eyebrow="Feedback"
        title="All reviews"
        description="Reviews left by attendees after events at your venue."
      >
        <DashboardTable
          columns={["Reviewer", "Rating", "Review", "Event", "Date", "Response"]}
          rows={venueReviews.map((r) => ({
            key: r.key,
            cells: [
              <div key="reviewer" className="flex items-center gap-2">
                <AvatarStamp name={r.reviewer} size="sm" />
                <span className="font-medium">{r.reviewer}</span>
              </div>,
              <div key="rating">{renderStars(r.rating)}</div>,
              <span key="text" className="max-w-xs text-sm text-brand-text-muted line-clamp-2">
                {r.text}
              </span>,
              <ToneBadge key="event" tone="neutral">{r.eventName}</ToneBadge>,
              <span key="date" className="text-sm text-brand-text-muted">{r.date}</span>,
              <VenueReviewReply
                key="response"
                reviewKey={r.key}
                existingResponse={"venueResponse" in r ? (r.venueResponse as string) : undefined}
              />,
            ],
          }))}
          caption="Venue reviews"
        />
      </Surface>
    </PortalShell>
  );
}
