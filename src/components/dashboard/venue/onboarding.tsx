import type { Route } from "next";
import { AlertCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  ProgressSteps,
  ToneBadge,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "messages", label: "Messages", href: "/venue/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/venue/notifications" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueOnboardingScreen() {
  const data = await getVenuePortalData();
  const { onboarding } = data;

  const completedSteps = onboarding.steps.filter((s) => s.status === "done").length;
  const totalSteps = onboarding.steps.length;
  const completionPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Onboarding"
      description="Complete your venue setup to get verified and start receiving bookings."
      links={venueLinks("overview")}
      roleMode="venue"
    >
      {/* ── Completion overview ───────────────────────────── */}
      <Surface
        eyebrow="Progress"
        title="Venue setup progress"
        description={`${onboarding.completion} — Reviewed by ${onboarding.reviewer}.`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-sand">
              <div
                className="h-full rounded-full bg-brand-indigo transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-brand-text tabular-nums">
              {completionPct}%
            </span>
          </div>

          {/* Step count badges */}
          <div className="flex flex-wrap gap-2">
            <ToneBadge tone="sage">
              {completedSteps} done
            </ToneBadge>
            <ToneBadge tone="indigo">
              {onboarding.steps.filter((s) => s.status === "active").length} in progress
            </ToneBadge>
            <ToneBadge tone="neutral">
              {onboarding.steps.filter((s) => s.status === "upcoming").length} remaining
            </ToneBadge>
          </div>
        </div>
      </Surface>

      {/* ── Steps ─────────────────────────────────────────── */}
      <Surface
        eyebrow="Checklist"
        title="Onboarding steps"
        description="Complete each step to unlock full venue features and earn your verified badge."
      >
        <ProgressSteps steps={onboarding.steps} />
      </Surface>

      {/* ── Required documents ────────────────────────────── */}
      <Surface
        eyebrow="Documents"
        title="Required documents"
        description="These items must be submitted before your venue can be fully verified."
      >
        <div className="space-y-2">
          {onboarding.requiredDocs.map((doc) => (
            <div
              key={doc}
              className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white p-3"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-brand-coral" />
              <span className="text-sm text-brand-text">{doc}</span>
              <ToneBadge tone="sand">Pending</ToneBadge>
            </div>
          ))}
        </div>
      </Surface>
    </PortalShell>
  );
}
