"use client";

import { startTransition, useDeferredValue, useState } from "react";
import {
  Ban,
  CalendarRange,
  CheckCheck,
  Clock3,
  CopyPlus,
  MailPlus,
  Minus,
  PencilLine,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { ToneBadge } from "@/components/dashboard/primitives";
import type { EmailTemplateDefinition } from "@/lib/email/template-catalog";
import { writeSessionDraft } from "@/lib/storage/session-drafts";
import { cn } from "@/lib/utils";

type OrganizerAttendee = {
  name: string;
  status: string;
  ticket: string;
  checkedIn: string;
  note: string;
};

type VenueBooking = {
  key: string;
  organizer: string;
  event: string;
  date: string;
  attendance: string;
  message: string;
  status: string;
};

type VenueAvailabilityDay = {
  day: string;
  blocks: string[];
};

type VenueDeal = {
  key: string;
  title: string;
  type: string;
  tier: string;
  status: string;
  redemption: string;
  note: string;
};

type VenueProfileSection = {
  key: string;
  title: string;
  items: Array<{ label: string; value: string }>;
};

type ContentSection = {
  key: string;
  title: string;
  status: string;
  note: string;
};

type ContentCategory = {
  key: string;
  name: string;
  count: string;
  tone: string;
};

type BlogQueueItem = {
  key: string;
  title: string;
  category: string;
  status: string;
};

type CommsDraft = {
  templateKey: string;
  subject: string;
  preview: string;
  preheader: string;
  headline: string;
  ctaLabel: string;
  footer: string;
};

type CommsHistoryItem = {
  key: string;
  title: string;
  audience: string;
  sent: string;
  result: string;
};

type MemberSettingsSection = {
  key: string;
  title: string;
  description: string;
  items: Array<{ label: string; value: string }>;
};

type OrganizerVenueMatch = {
  venue: {
    slug: string;
    name: string;
    area: string;
    art: string;
  };
  score: string;
  nextSlot: string;
  fit: string;
};

type OrganizerBookingPipelineItem = {
  key: string;
  organizer: string;
  venue: string;
  status: string;
  date: string;
  note: string;
};

const pillBase =
  "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold";

function toneForStatus(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("pending") ||
    normalized.includes("draft") ||
    normalized.includes("counter") ||
    normalized.includes("review") ||
    normalized.includes("wait")
  ) {
    return "coral" as const;
  }

  if (
    normalized.includes("accepted") ||
    normalized.includes("approved") ||
    normalized.includes("active") ||
    normalized.includes("published") ||
    normalized.includes("checked")
  ) {
    return "sage" as const;
  }

  return "indigo" as const;
}

function ActionButton({
  label,
  onClick,
  tone = "indigo",
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  tone?: "indigo" | "coral" | "sage" | "basalt";
  icon?: typeof Search;
}) {
  const toneClass =
    tone === "coral"
      ? "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]"
      : tone === "sage"
        ? "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]"
        : tone === "basalt"
          ? "border-[rgba(30,27,46,0.16)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]"
          : "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ops-action-button inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
        toneClass,
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

export function OrganizerAttendeeControlCenter({
  attendees,
}: {
  attendees: readonly OrganizerAttendee[];
}) {
  const [directory, setDirectory] = useState(attendees);
  const [selectedName, setSelectedName] = useState(attendees[0]?.name ?? "");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = directory.filter((attendee) => {
    const haystack =
      `${attendee.name} ${attendee.status} ${attendee.ticket} ${attendee.note}`.toLowerCase();
    return haystack.includes(deferredSearch.toLowerCase());
  });

  const selected =
    directory.find((attendee) => attendee.name === selectedName) ?? filtered[0] ?? attendees[0];

  const approvedCount = directory.filter((item) =>
    item.status.toLowerCase().includes("approved"),
  ).length;
  const pendingCount = directory.filter((item) =>
    item.status.toLowerCase().includes("pending") ||
    item.status.toLowerCase().includes("wait"),
  ).length;
  const checkedInCount = directory.filter((item) =>
    item.checkedIn.toLowerCase().includes("yes"),
  ).length;

  function mutateSelected(next: Partial<OrganizerAttendee>) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setDirectory((current) =>
        current.map((attendee) =>
          attendee.name === selected.name ? { ...attendee, ...next } : attendee,
        ),
      );
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Approved", value: String(approvedCount), tone: "sage" as const },
          { label: "Pending", value: String(pendingCount), tone: "coral" as const },
          { label: "Checked in", value: String(checkedInCount), tone: "indigo" as const },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
              {item.label}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {item.value}
              </div>
              <ToneBadge tone={item.tone}>{item.label}</ToneBadge>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-4">
        <label className="ops-search-shell flex items-center gap-3 rounded-full border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--brand-text-light)]" />
          <input
            type="search"
            name="organizer-attendee-search"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              startTransition(() => setSearch(value));
            }}
            aria-label="Search attendees"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search attendee, status, ticket, or note"
            className="w-full border-none bg-transparent text-sm text-[var(--brand-text)] outline-none"
          />
        </label>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          {filtered.map((attendee) => (
            <button
              key={attendee.name}
              type="button"
              onClick={() => setSelectedName(attendee.name)}
              className={cn(
                "ops-selection-card block w-full rounded-md border p-4 text-left transition",
                attendee.name === selected?.name
                  ? "ops-selection-card-active border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{attendee.name}</div>
                <ToneBadge tone={toneForStatus(attendee.status)}>{attendee.status}</ToneBadge>
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">{attendee.ticket}</div>
              <div className="mt-3 text-xs text-[var(--brand-text-light)]">
                Check-in: {attendee.checkedIn}
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="ops-detail-panel rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {selected.name}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                  Ticket status and event-fit notes stay here so approvals do not happen blindly.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToneBadge tone={toneForStatus(selected.status)}>{selected.status}</ToneBadge>
                <ToneBadge tone="sand">{selected.ticket}</ToneBadge>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Ticket", value: selected.ticket },
                { label: "Check-in", value: selected.checkedIn },
                { label: "Status", value: selected.status },
                { label: "Door note", value: selected.note },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton
                label="Approve"
                tone="sage"
                icon={CheckCheck}
                onClick={() => mutateSelected({ status: "Approved" })}
              />
              <ActionButton
                label="Waitlist"
                tone="coral"
                icon={Clock3}
                onClick={() => mutateSelected({ status: "Waitlist" })}
              />
              <ActionButton
                label="Reject"
                tone="coral"
                icon={Ban}
                onClick={() => mutateSelected({ status: "Rejected" })}
              />
              <ActionButton
                label="Check in"
                tone="indigo"
                icon={Sparkles}
                onClick={() => mutateSelected({ checkedIn: "Yes" })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function VenueBookingCommandCenter({
  bookings,
}: {
  bookings: readonly VenueBooking[];
}) {
  const [queue, setQueue] = useState(bookings);
  const [selectedKey, setSelectedKey] = useState(bookings[0]?.key ?? "");
  const [replyDraft, setReplyDraft] = useState(
    "Counter with a clearer arrival window and staffing constraint.",
  );

  const selected = queue.find((booking) => booking.key === selectedKey) ?? queue[0];

  function mutateSelected(status: string, message?: string) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setQueue((current) =>
        current.map((booking) =>
          booking.key === selected.key
            ? {
                ...booking,
                status,
                message: message ?? booking.message,
              }
            : booking,
        ),
      );
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-3">
        {queue.map((booking) => (
          <button
            key={booking.key}
            type="button"
            onClick={() => setSelectedKey(booking.key)}
              className={cn(
                "ops-selection-card block w-full rounded-md border p-4 text-left transition",
                booking.key === selected?.key
                  ? "ops-selection-card-active border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
              )}
            >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{booking.event}</div>
              <ToneBadge tone={toneForStatus(booking.status)}>{booking.status}</ToneBadge>
            </div>
            <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {booking.organizer} · {booking.date}
            </div>
            <div className="mt-3 text-xs text-[var(--brand-text-light)]">
              {booking.attendance}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="ops-detail-panel rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {selected.event}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                {selected.organizer} wants {selected.attendance} on {selected.date}.
              </p>
            </div>
            <ToneBadge tone={toneForStatus(selected.status)}>{selected.status}</ToneBadge>
          </div>

          <div className="mt-5 rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
              Organizer note
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {selected.message}
            </p>
          </div>

          <label className="mt-5 block text-sm font-semibold text-[var(--brand-text)]">
            Venue reply draft
            <textarea
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton
              label="Accept booking"
              tone="sage"
              icon={CheckCheck}
              onClick={() => mutateSelected("Accepted", replyDraft)}
            />
            <ActionButton
              label="Send counter"
              tone="indigo"
              icon={PencilLine}
              onClick={() => mutateSelected("Counter sent", replyDraft)}
            />
            <ActionButton
              label="Hold for review"
              tone="basalt"
              icon={ShieldAlert}
              onClick={() => mutateSelected("Pending review", replyDraft)}
            />
            <ActionButton
              label="Decline"
              tone="coral"
              icon={X}
              onClick={() => mutateSelected("Declined", replyDraft)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VenueAvailabilityStudio({
  weeklyGrid,
  exceptions,
}: {
  weeklyGrid: readonly VenueAvailabilityDay[];
  exceptions: readonly string[];
}) {
  const [schedule, setSchedule] = useState(weeklyGrid);
  const [exceptionList, setExceptionList] = useState(exceptions);
  const [selectedDay, setSelectedDay] = useState(weeklyGrid[0]?.day ?? "");
  const [newException, setNewException] = useState("Fri 03 Apr blocked for private buyout");

  const selected = schedule.find((day) => day.day === selectedDay) ?? schedule[0];

  function addBlock(block: string) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setSchedule((current) =>
        current.map((day) =>
          day.day === selected.day && !day.blocks.includes(block)
            ? { ...day, blocks: [...day.blocks, block] }
            : day,
        ),
      );
    });
  }

  function removeBlock(block: string) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setSchedule((current) =>
        current.map((day) =>
          day.day === selected.day
            ? { ...day, blocks: day.blocks.filter((item) => item !== block) }
            : day,
        ),
      );
    });
  }

  function addException() {
    const trimmed = newException.trim();

    if (!trimmed) {
      return;
    }

    startTransition(() => {
      setExceptionList((current) => [trimmed, ...current]);
      setNewException("");
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        {schedule.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setSelectedDay(day.day)}
            className={cn(
              "block w-full rounded-md border p-4 text-left transition",
              day.day === selected?.day
                ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{day.day}</div>
              <ToneBadge tone="sand">{day.blocks.length} blocks</ToneBadge>
            </div>
            <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {day.blocks[0]}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="space-y-5 rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-lg font-semibold text-[var(--brand-text)]">
              {selected.day} availability
            </div>
            <ToneBadge tone="indigo">Editable locally</ToneBadge>
          </div>

          <div className="space-y-3">
            {selected.blocks.map((block) => (
              <div
                key={block}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3"
              >
                <div className="text-sm font-semibold text-[var(--brand-text)]">{block}</div>
                <button
                  type="button"
                  onClick={() => removeBlock(block)}
                  className="text-[var(--brand-coral)] transition hover:opacity-80"
                  aria-label={`Remove ${block}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Add community slot"
              tone="sage"
              icon={CalendarRange}
              onClick={() => addBlock("18:00-23:00 Community-preferred slot")}
            />
            <ActionButton
              label="Add premium window"
              tone="coral"
              icon={Sparkles}
              onClick={() => addBlock("19:00-02:00 Premium pricing")}
            />
            <ActionButton
              label="Add private hold"
              tone="basalt"
              icon={ShieldAlert}
              onClick={() => addBlock("Blocked for private booking")}
            />
          </div>

          <div className="rounded-md border border-[var(--brand-border-light)] bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
              Exceptions
            </div>
            <label className="mt-3 block text-sm font-semibold text-[var(--brand-text)]">
              Add one-off exception
              <input
                value={newException}
                onChange={(event) => setNewException(event.target.value)}
                className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                label="Add exception"
                tone="indigo"
                icon={CopyPlus}
                onClick={addException}
              />
            </div>
            <div className="mt-4 space-y-2">
              {exceptionList.map((item) => (
                <div
                  key={item}
                  className="rounded-full bg-[rgba(245,240,232,0.88)] px-3 py-2 text-sm text-[var(--brand-text-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VenueDealStudio({ deals }: { deals: readonly VenueDeal[] }) {
  const [inventory, setInventory] = useState(deals);
  const [selectedKey, setSelectedKey] = useState(deals[0]?.key ?? "");
  const selected = inventory.find((deal) => deal.key === selectedKey) ?? inventory[0];

  function mutateSelected(next: Partial<VenueDeal>) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setInventory((current) =>
        current.map((deal) => (deal.key === selected.key ? { ...deal, ...next } : deal)),
      );
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-3">
        {inventory.map((deal) => (
          <button
            key={deal.key}
            type="button"
            onClick={() => setSelectedKey(deal.key)}
            className={cn(
              "block w-full rounded-md border p-4 text-left transition",
              deal.key === selected?.key
                ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{deal.title}</div>
              <ToneBadge tone={toneForStatus(deal.status)}>{deal.status}</ToneBadge>
            </div>
            <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {deal.tier} · {deal.type}
            </div>
            <div className="mt-3 text-xs text-[var(--brand-text-light)]">
              {deal.redemption}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-lg font-semibold text-[var(--brand-text)]">
              {selected.title}
            </div>
            <div className="flex flex-wrap gap-2">
              <ToneBadge tone="sand">{selected.tier}</ToneBadge>
              <ToneBadge tone={toneForStatus(selected.status)}>{selected.status}</ToneBadge>
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold text-[var(--brand-text)]">
            Operational note
            <textarea
              value={selected.note}
              onChange={(event) => mutateSelected({ note: event.target.value })}
              rows={5}
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>

          <label className="mt-5 block text-sm font-semibold text-[var(--brand-text)]">
            Redemption summary
            <input
              value={selected.redemption}
              onChange={(event) => mutateSelected({ redemption: event.target.value })}
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton
              label="Activate"
              tone="sage"
              icon={CheckCheck}
              onClick={() => mutateSelected({ status: "Active" })}
            />
            <ActionButton
              label="Return to draft"
              tone="indigo"
              icon={PencilLine}
              onClick={() => mutateSelected({ status: "Draft" })}
            />
            <ActionButton
              label="Pause offer"
              tone="coral"
              icon={Ban}
              onClick={() => mutateSelected({ status: "Paused" })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VenueProfileSectionEditor({
  sections,
}: {
  sections: readonly VenueProfileSection[];
}) {
  const [editor, setEditor] = useState(sections);
  const [selectedKey, setSelectedKey] = useState(sections[0]?.key ?? "");
  const selected = editor.find((section) => section.key === selectedKey) ?? editor[0];

  function updateItem(label: string, value: string) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setEditor((current) =>
        current.map((section) =>
          section.key === selected.key
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.label === label ? { ...item, value } : item,
                ),
              }
            : section,
        ),
      );
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        {editor.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setSelectedKey(section.key)}
            className={cn(
              "block w-full rounded-md border p-4 text-left transition",
              section.key === selected?.key
                ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
            )}
          >
            <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
            <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {section.items.length} editable fields
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="space-y-4 rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            {selected.title}
          </div>
          {selected.items.map((item) => (
            <label
              key={item.label}
              className="block text-sm font-semibold text-[var(--brand-text)]"
            >
              {item.label}
              <input
                value={item.value}
                onChange={(event) => updateItem(item.label, event.target.value)}
                className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminContentControlCenter({
  sections,
  categories,
  blogQueue,
}: {
  sections: readonly ContentSection[];
  categories: readonly ContentCategory[];
  blogQueue: readonly BlogQueueItem[];
}) {
  const [sectionState, setSectionState] = useState(sections);
  const [featuredCategories, setFeaturedCategories] = useState<string[]>(
    categories.slice(0, 3).map((item) => item.key),
  );
  const [blogState, setBlogState] = useState(blogQueue);

  function updateSectionStatus(key: string, status: string) {
    startTransition(() => {
      setSectionState((current) =>
        current.map((section) =>
          section.key === key ? { ...section, status } : section,
        ),
      );
    });
  }

  function toggleCategory(key: string) {
    startTransition(() => {
      setFeaturedCategories((current) =>
        current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
      );
    });
  }

  function updatePostStatus(key: string, status: string) {
    startTransition(() => {
      setBlogState((current) =>
        current.map((post) => (post.key === key ? { ...post, status } : post)),
      );
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        {sectionState.map((section) => (
          <article
            key={section.key}
            className="rounded-lg border border-[var(--brand-border-light)] bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
              <ToneBadge tone={toneForStatus(section.status)}>{section.status}</ToneBadge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {section.note}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                label="Mark live"
                tone="sage"
                icon={CheckCheck}
                onClick={() => updateSectionStatus(section.key, "Live")}
              />
              <ActionButton
                label="Refresh"
                tone="indigo"
                icon={Sparkles}
                onClick={() => updateSectionStatus(section.key, "Needs refresh")}
              />
              <ActionButton
                label="Set draft"
                tone="coral"
                icon={PencilLine}
                onClick={() => updateSectionStatus(section.key, "Draft")}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            Featured categories
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
            Pick which categories should dominate the discovery and homepage rails.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => toggleCategory(category.key)}
                className={cn(
                  pillBase,
                  featuredCategories.includes(category.key)
                    ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                    : "border-[rgba(153,148,168,0.14)] bg-white text-[var(--brand-text-muted)]",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            Editorial queue actions
          </div>
          <div className="mt-4 space-y-3">
            {blogState.map((post) => (
              <div
                key={post.key}
                className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">{post.title}</div>
                    <div className="mt-1 text-sm text-[var(--brand-text-muted)]">
                      {post.category}
                    </div>
                  </div>
                  <ToneBadge tone={toneForStatus(post.status)}>{post.status}</ToneBadge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton
                    label="Publish"
                    tone="sage"
                    icon={CheckCheck}
                    onClick={() => updatePostStatus(post.key, "Published")}
                  />
                  <ActionButton
                    label="Queue review"
                    tone="indigo"
                    icon={ShieldAlert}
                    onClick={() => updatePostStatus(post.key, "Draft review")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCommsStudio({
  audiences,
  draft,
  templates,
  history,
}: {
  audiences: readonly string[];
  draft: CommsDraft;
  templates: readonly EmailTemplateDefinition[];
  history: readonly CommsHistoryItem[];
}) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([audiences[0] ?? ""]);
  const [composer, setComposer] = useState(draft);
  const [historyState, setHistoryState] = useState(history);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    draft.templateKey || templates[0]?.key || "",
  );

  const selectedTemplate =
    templates.find((template) => template.key === selectedTemplateKey) ?? templates[0];

  function toggleAudience(audience: string) {
    startTransition(() => {
      setSelectedAudiences((current) =>
        current.includes(audience)
          ? current.filter((item) => item !== audience)
          : [...current, audience],
      );
    });
  }

  function applyTemplate(template: EmailTemplateDefinition) {
    startTransition(() => {
      setSelectedTemplateKey(template.key);
      setComposer({
        templateKey: template.key,
        subject: template.subject,
        preview: template.intro,
        preheader: template.preheader,
        headline: template.headline,
        ctaLabel: template.ctaLabel,
        footer: template.footer,
      });
    });
  }

  function queueSend(mode: "test" | "live") {
    const audienceLabel =
      selectedAudiences.length > 0 ? selectedAudiences.join(", ") : "No audience selected";

    startTransition(() => {
      setHistoryState((current) => [
        {
          key: `queued-${current.length + 1}`,
          title: composer.subject || "Untitled message",
          audience: audienceLabel,
          sent: "Just now",
          result: mode === "test" ? "Queued test send" : "Queued live send",
        },
        ...current,
      ]);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5 rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
        <div className="text-lg font-semibold text-[var(--brand-text)]">
          Compose message
        </div>
        <div className="flex flex-wrap gap-2">
          {audiences.map((audience) => (
            <button
              key={audience}
              type="button"
              onClick={() => toggleAudience(audience)}
              className={cn(
                pillBase,
                selectedAudiences.includes(audience)
                  ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                  : "border-[rgba(153,148,168,0.14)] bg-white text-[var(--brand-text-muted)]",
              )}
            >
              {audience}
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-[var(--brand-text)]">
          Subject
          <input
            value={composer.subject}
            onChange={(event) =>
              setComposer((current) => ({ ...current, subject: event.target.value }))
            }
            className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--brand-text)]">
          Preheader
          <input
            value={composer.preheader}
            onChange={(event) =>
              setComposer((current) => ({ ...current, preheader: event.target.value }))
            }
            className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--brand-text)]">
          Headline
          <input
            value={composer.headline}
            onChange={(event) =>
              setComposer((current) => ({ ...current, headline: event.target.value }))
            }
            className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--brand-text)]">
          Intro / body opener
          <textarea
            value={composer.preview}
            onChange={(event) =>
              setComposer((current) => ({ ...current, preview: event.target.value }))
            }
            rows={6}
            className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[var(--brand-text)]">
            CTA label
            <input
              value={composer.ctaLabel}
              onChange={(event) =>
                setComposer((current) => ({ ...current, ctaLabel: event.target.value }))
              }
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--brand-text)]">
            Footer note
            <input
              value={composer.footer}
              onChange={(event) =>
                setComposer((current) => ({ ...current, footer: event.target.value }))
              }
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton
            label="Queue test send"
            tone="indigo"
            icon={MailPlus}
            onClick={() => queueSend("test")}
          />
          <ActionButton
            label="Queue live send"
            tone="sage"
            icon={CheckCheck}
            onClick={() => queueSend("live")}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            Templates
          </div>
          <div className="mt-4 grid gap-3">
            {templates.map((template) => (
              <button
                key={template.key}
                type="button"
                onClick={() => applyTemplate(template)}
                className={cn(
                  "rounded-md border px-4 py-3 text-left transition",
                  selectedTemplateKey === template.key
                    ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)]"
                    : "border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] hover:border-[rgba(79,70,229,0.16)]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[var(--brand-text)]">
                    {template.name}
                  </div>
                  <ToneBadge tone={template.tone}>{template.audience}</ToneBadge>
                </div>
                <div className="mt-2 text-xs leading-6 text-[var(--brand-text-muted)]">
                  {template.subject}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            Email preview
          </div>
          <div className="mt-4 rounded-lg border border-[var(--brand-border-light)] bg-[rgba(245,240,232,0.68)] p-4">
            <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
                {selectedTemplate?.audience ?? "Audience"}
              </div>
              <div className="mt-3 text-xs leading-6 text-[var(--brand-text-light)]">
                {composer.preheader}
              </div>
              <div className="mt-2 text-lg font-semibold text-[var(--brand-text)]">
                {composer.headline}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                {composer.preview}
              </p>
              <div className="mt-4 space-y-2">
                {(selectedTemplate?.bullets ?? []).map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-text-muted)]"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
              <div className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--brand-indigo)] px-5 py-3 text-sm font-bold text-white">
                {composer.ctaLabel}
              </div>
              <div className="mt-5 text-xs leading-6 text-[var(--brand-text-light)]">
                {composer.footer}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div className="text-lg font-semibold text-[var(--brand-text)]">
            Latest outbound
          </div>
          <div className="mt-4 space-y-3">
            {historyState.map((entry) => (
              <div
                key={entry.key}
                className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{entry.title}</div>
                  <ToneBadge tone="indigo">{entry.result}</ToneBadge>
                </div>
                <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  {entry.audience}
                </div>
                <div className="mt-2 text-xs text-[var(--brand-text-light)]">
                  {entry.sent}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemberSettingsStudio({
  sections,
}: {
  sections: readonly MemberSettingsSection[];
}) {
  const [editor, setEditor] = useState(sections);
  const [selectedKey, setSelectedKey] = useState(sections[0]?.key ?? "");
  const [message, setMessage] = useState("");

  const selected = editor.find((section) => section.key === selectedKey) ?? editor[0];

  function updateItem(label: string, value: string) {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setEditor((current) =>
        current.map((section) =>
          section.key === selected.key
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.label === label ? { ...item, value } : item,
                ),
              }
            : section,
        ),
      );
    });
  }

  function saveSection() {
    if (!selected) {
      return;
    }

    startTransition(() => {
      writeSessionDraft(
        `meetupreykjavik-member-settings-${selected.key}`,
        selected.items,
      );
      setMessage(`${selected.title} saved locally. No live account settings were changed.`);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        {editor.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setSelectedKey(section.key)}
            className={cn(
              "block w-full rounded-md border p-4 text-left transition",
              section.key === selected?.key
                ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
            )}
          >
            <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
            <div className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {section.description}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="space-y-5 rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div>
            <div className="text-lg font-semibold text-[var(--brand-text)]">
              {selected.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {selected.description}
            </p>
          </div>

          <div className="space-y-4">
            {selected.items.map((item) => (
              <label
                key={item.label}
                className="block text-sm font-semibold text-[var(--brand-text)]"
              >
                {item.label}
                <input
                  value={item.value}
                  onChange={(event) => updateItem(item.label, event.target.value)}
                  className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Save locally"
              tone="sage"
              icon={CheckCheck}
              onClick={saveSection}
            />
            <ActionButton
              label="Privacy-safe preset"
              tone="indigo"
              icon={ShieldAlert}
              onClick={() => updateItem("Profile visibility", "Members only")}
            />
          </div>

          {message ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-md border border-[rgba(124,154,130,0.2)] bg-[rgba(124,154,130,0.12)] px-4 py-3 text-sm text-[var(--brand-sage)]"
            >
              {message}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function OrganizerVenueRequestStudio({
  matches,
  pipeline,
}: {
  matches: readonly OrganizerVenueMatch[];
  pipeline: readonly OrganizerBookingPipelineItem[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(matches[0]?.venue.slug ?? "");
  const [requestDate, setRequestDate] = useState(matches[0]?.nextSlot ?? "");
  const [requestNote, setRequestNote] = useState(
    "Need a visible host arrival zone, strong seating flexibility, and a clean check-in area.",
  );
  const [pipelineState, setPipelineState] = useState(pipeline);

  const selected = matches.find((item) => item.venue.slug === selectedSlug) ?? matches[0];

  function queueRequest() {
    if (!selected) {
      return;
    }

    startTransition(() => {
      setPipelineState((current) => [
        {
          key: `req-local-${current.length + 1}`,
          organizer: "Current organizer",
          venue: selected.venue.name,
          status: "Pending",
          date: requestDate || selected.nextSlot,
          note: requestNote,
        },
        ...current,
      ]);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-3">
        {matches.map((match) => (
          <button
            key={match.venue.slug}
            type="button"
            onClick={() => {
              setSelectedSlug(match.venue.slug);
              setRequestDate(match.nextSlot);
            }}
            className={cn(
              "block w-full rounded-md border p-4 text-left transition",
              match.venue.slug === selected?.venue.slug
                ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                : "border-[var(--brand-border-light)] bg-white hover:border-[rgba(79,70,229,0.16)]",
            )}
          >
            <div className="h-24 rounded-md" style={{ background: match.venue.art }} />
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{match.venue.name}</div>
              <ToneBadge tone="sage">{match.score} fit</ToneBadge>
            </div>
            <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
              {match.venue.area} · {match.nextSlot}
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="space-y-5 rounded-lg border border-[var(--brand-border-light)] bg-white p-5">
          <div>
            <div className="text-lg font-semibold text-[var(--brand-text)]">
              {selected.venue.name}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
              {selected.fit}
            </p>
          </div>

          <label className="block text-sm font-semibold text-[var(--brand-text)]">
            Requested slot
            <input
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--brand-text)]">
            Booking request note
            <textarea
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Queue booking request"
              tone="sage"
              icon={MailPlus}
              onClick={queueRequest}
            />
          </div>

          <div className="rounded-md border border-[var(--brand-border-light)] bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--brand-text-light)]">
              Request pipeline
            </div>
            <div className="mt-3 space-y-3">
              {pipelineState.map((item) => (
                <div
                  key={item.key}
                  className="rounded-md border border-[var(--brand-border-light)] bg-[var(--brand-sand-light)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[var(--brand-text)]">{item.venue}</div>
                    <ToneBadge tone={toneForStatus(item.status)}>{item.status}</ToneBadge>
                  </div>
                  <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                    {item.date}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
