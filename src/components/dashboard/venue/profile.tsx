import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  ToneBadge,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { resolveVenueTier } from "@/lib/entitlements";
import { VenueProfileSectionEditor, VenueImageEditor } from "./panels";

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

/* ── Helpers: extract a clean image URL from the venue data ─── */

function cleanImageUrl(raw: string): string {
  // The mock data stores images as css url() values like "url('/path.jpg')"
  // while DB data stores plain URLs. Normalise both to a plain string.
  const match = /^url\(['"]?(.*?)['"]?\)$/.exec(raw);
  return match ? match[1] : raw;
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueProfileScreen() {
  const data = await getVenuePortalData();
  const tier = resolveVenueTier(data.partnershipTier);

  // Resolve image fields from the venue object.
  // DB venues use hero_photo_url / photos; mock data uses art / gallery.
  const venue = data.venue as Record<string, unknown>;
  const heroImage = cleanImageUrl(
    String(
      venue.hero_photo_url ??
        venue.heroPhotoUrl ??
        venue.art ??
        "",
    ),
  );
  const galleryRaw = (
    (venue.photos as string[]) ??
    (venue.gallery as string[]) ??
    []
  );
  const gallery = galleryRaw.map(cleanImageUrl);

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Venue Profile"
      description="Public profile information visible to organizers and attendees."
      links={venueLinks("profile")}
      roleMode="venue"
    >
      {/* ── Tier badge ───────────────────────────────────── */}
      <Surface
        eyebrow="Partnership"
        title={data.venue.name}
        description="Your venue listing and partnership details."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ToneBadge tone={tier === "premium" ? "indigo" : tier === "partner" ? "sage" : "neutral"}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </ToneBadge>
          <span className="text-sm text-brand-text-muted">
            Onboarding: {data.onboarding.completion}
          </span>
        </div>
      </Surface>

      {/* ── Venue images (hero + gallery) ─────────────────── */}
      <Surface
        eyebrow="Media"
        title="Venue photos"
        description="Manage the cover image and photo gallery shown on your public listing."
      >
        <VenueImageEditor
          venueSlug={data.venue.slug}
          heroImage={heroImage}
          gallery={gallery}
        />
      </Surface>

      {/* ── Profile sections (editable) ──────────────────── */}
      <VenueProfileSectionEditor sections={data.profileSections} />
    </PortalShell>
  );
}
