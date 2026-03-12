# Dashboard Rebuild — Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild all 4 dashboard portals (28 screens, 179 operations) with one-file-per-screen architecture, mock-data-first, using existing primitives and entitlements.

**Architecture:** Split the current 6 monolithic files into ~28 individual screen files organized by portal (`admin/`, `member/`, `organizer/`, `venue/`). Each screen is an async Next.js server component that calls fetchers, renders primitives, and delegates interactivity to client panel components. Screens render immediately from rich mock data in `dashboard-data.ts`. Real API endpoints get wired in a follow-up phase.

**Tech Stack:** Next.js 16 server components, Tailwind CSS v4, Lucide icons, existing primitives (18 components from `primitives.tsx`), entitlements system (`entitlements.ts`), analytics modules, PortalShell layout.

---

## File Structure (Target)

```
src/components/dashboard/
  primitives.tsx              ← KEEP (18 UI components)
  qr-checkin.tsx              ← KEEP

  admin/
    overview.tsx              ← AdminOverviewScreen
    users.tsx                 ← AdminUsersScreen
    events.tsx                ← AdminEventsScreen
    venues.tsx                ← AdminVenuesScreen
    groups.tsx                ← AdminGroupsScreen
    bookings.tsx              ← AdminBookingsScreen (NEW)
    revenue.tsx               ← AdminRevenueScreen
    settings.tsx              ← AdminSettingsScreen
    audit.tsx                 ← AdminAuditScreen (NEW)
    panels.tsx                ← 15 "use client" admin control panels

  member/
    overview.tsx              ← MemberOverviewScreen
    events.tsx                ← MemberEventsScreen (renamed from calendar)
    groups.tsx                ← MemberGroupsScreen (NEW)
    messages.tsx              ← MemberMessagesScreen
    profile.tsx               ← MemberProfileScreen
    transactions.tsx          ← MemberTransactionsScreen (NEW)
    panels.tsx                ← MemberSettingsStudio + future panels

  organizer/
    overview.tsx              ← OrganizerOverviewScreen
    events.tsx                ← OrganizerEventsScreen
    event-detail.tsx          ← OrganizerEventDetailScreen
    groups.tsx                ← OrganizerGroupsScreen
    bookings.tsx              ← OrganizerBookingsScreen (NEW)
    messages.tsx              ← OrganizerMessagesScreen
    panels.tsx                ← OrganizerAttendeeControlCenter, OrganizerVenueRequestStudio

  venue/
    overview.tsx              ← VenueDashboardScreen
    bookings.tsx              ← VenueBookingsScreen
    availability.tsx          ← VenueAvailabilityScreen
    deals.tsx                 ← VenueDealsScreen
    reviews.tsx               ← VenueReviewsScreen (NEW)
    events.tsx                ← VenueEventsScreen
    profile.tsx               ← VenueProfileScreen
    onboarding.tsx            ← VenueOnboardingScreen
    panels.tsx                ← VenueBookingCommandCenter, VenueAvailabilityStudio, etc.
```

**New route pages needed:**
- `src/app/(admin)/admin/bookings/page.tsx`
- `src/app/(admin)/admin/audit/page.tsx`
- `src/app/(dashboard)/dashboard/groups/page.tsx`
- `src/app/(dashboard)/dashboard/transactions/page.tsx`
- `src/app/(organizer)/organizer/bookings/page.tsx`
- `src/app/(venue)/venue/reviews/page.tsx`

**Route pages to update** (change import path from old monolith to new per-screen files):
All 35 existing route pages — import path changes from e.g.
`@/components/dashboard/admin-pages` → `@/components/dashboard/admin/overview`

---

## KEEP List (DO NOT DELETE until stubs are verified)

```
src/components/dashboard/primitives.tsx     ← 18 UI components
src/components/dashboard/qr-checkin.tsx     ← QR scanner
src/lib/dashboard-data.ts                   ← Mock data (all 5 portal datasets)
src/lib/dashboard-fetchers.ts               ← Fetcher pattern (6 functions)
src/lib/entitlements.ts                     ← 9 tiers, feature flags
src/lib/analytics/events.ts                 ← Event analytics
src/lib/analytics/venues.ts                 ← Venue analytics
src/lib/analytics/reporting.ts              ← Revenue + audience reports
src/lib/features/member-features.ts         ← Premium badge, filters, DM check
src/lib/features/venue-matching.ts          ← Priority venue search
All layout.tsx files                        ← Session guards
All page.tsx files (existing)               ← Route wrappers (updated, not deleted)
```

## DELETE List (after new files verified building)

```
src/components/dashboard/admin-pages.tsx         ← replaced by admin/*.tsx
src/components/dashboard/member-pages.tsx         ← replaced by member/*.tsx
src/components/dashboard/organizer-pages.tsx      ← replaced by organizer/*.tsx
src/components/dashboard/venue-pages.tsx          ← replaced by venue/*.tsx
src/components/dashboard/admin-control-panels.tsx ← replaced by admin/panels.tsx
src/components/dashboard/operations-panels.tsx    ← replaced by */panels.tsx
```

---

## Shared Patterns (every screen follows these)

### PortalShell Pattern
```tsx
import { PortalShell } from "@/components/layout/portal-shell";

function portalLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/admin" as Route, icon: LayoutDashboard },
    // ...
  ].map(link => ({ ...link, active: link.key === activeKey }));
}

export async function AdminOverviewScreen() {
  const data = await getAdminPortalData();
  return (
    <PortalShell roleMode="admin" sidebarLinks={portalLinks("overview")}>
      {/* screen content */}
    </PortalShell>
  );
}
```

### Status Tone Helper
```tsx
function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted/.test(s)) return "sage";
  if (/pending|draft|waitlisted/.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/.test(s)) return "coral";
  return "neutral";
}
```

### DecisionStrip Pattern (for read-before-act screens)
```tsx
<DecisionStrip
  tone="indigo"
  heading="What matters now"
  context="You have 3 pending venue applications and 2 flagged reports."
  actions={[
    { label: "Review venues", href: "/admin/venues" as Route },
    { label: "View reports", href: "/admin/moderation" as Route },
  ]}
/>
```

---

## Task 1: Create Folder Structure + Stub Files

**Files:**
- Create: `src/components/dashboard/admin/` (directory)
- Create: `src/components/dashboard/member/` (directory)
- Create: `src/components/dashboard/organizer/` (directory)
- Create: `src/components/dashboard/venue/` (directory)
- Create: stub `.tsx` file for every screen (28 files + 4 panel files = 32 files)

**Step 1:** Create all directories and write stub files.

Each stub file exports a placeholder component matching the export name the route page expects. Example stub:

```tsx
// src/components/dashboard/admin/overview.tsx
import { PortalShell } from "@/components/layout/portal-shell";

export async function AdminOverviewScreen() {
  return (
    <PortalShell roleMode="admin" sidebarLinks={[]}>
      <div className="p-8 text-zinc-400">Admin Overview — rebuilding...</div>
    </PortalShell>
  );
}
```

Panel stubs export `"use client"` components with empty `<div>` returns.

**Step 2:** Create 6 new route pages:
- `src/app/(admin)/admin/bookings/page.tsx` → imports `AdminBookingsScreen`
- `src/app/(admin)/admin/audit/page.tsx` → imports `AdminAuditScreen`
- `src/app/(dashboard)/dashboard/groups/page.tsx` → imports `MemberGroupsScreen`
- `src/app/(dashboard)/dashboard/transactions/page.tsx` → imports `MemberTransactionsScreen`
- `src/app/(organizer)/organizer/bookings/page.tsx` → imports `OrganizerBookingsScreen`
- `src/app/(venue)/venue/reviews/page.tsx` → imports `VenueReviewsScreen`

**Step 3:** Update ALL 35 existing route pages to import from new paths.

Example changes:
```tsx
// BEFORE: src/app/(admin)/admin/page.tsx
import { AdminOverviewScreen } from "@/components/dashboard/admin-pages";
// AFTER:
import { AdminOverviewScreen } from "@/components/dashboard/admin/overview";
```

Full mapping:
| Route | Old Import | New Import |
|-------|-----------|------------|
| `(admin)/admin/page.tsx` | `admin-pages` → `AdminOverviewScreen` | `admin/overview` |
| `(admin)/admin/users/page.tsx` | `admin-pages` → `AdminUsersScreen` | `admin/users` |
| `(admin)/admin/events/page.tsx` | `admin-pages` → `AdminEventsScreen` | `admin/events` |
| `(admin)/admin/venues/page.tsx` | `admin-pages` → `AdminVenuesScreen` | `admin/venues` |
| `(admin)/admin/groups/page.tsx` | `admin-pages` → `AdminGroupsScreen` | `admin/groups` |
| `(admin)/admin/revenue/page.tsx` | `admin-pages` → `AdminRevenueScreen` | `admin/revenue` |
| `(admin)/admin/analytics/page.tsx` | `admin-pages` → `AdminAnalyticsScreen` | `admin/revenue` (merged) |
| `(admin)/admin/content/page.tsx` | `admin-pages` → `AdminContentScreen` | `admin/settings` (merged) |
| `(admin)/admin/moderation/page.tsx` | `admin-pages` → `AdminModerationScreen` | `admin/settings` (merged) |
| `(admin)/admin/comms/page.tsx` | `admin-pages` → `AdminCommsScreen` | `admin/settings` (merged) |
| `(admin)/admin/settings/page.tsx` | `admin-pages` → `AdminSettingsScreen` | `admin/settings` |
| `(dashboard)/dashboard/page.tsx` | `member-pages` → `MemberOverviewScreen` | `member/overview` |
| `(dashboard)/dashboard/calendar/page.tsx` | `member-pages` → `MemberCalendarScreen` | `member/events` (renamed) |
| `(dashboard)/dashboard/messages/page.tsx` | `member-pages` → `MemberMessagesScreen` | `member/messages` |
| `(dashboard)/dashboard/notifications/page.tsx` | `member-pages` → `MemberNotificationsScreen` | `member/overview` (merged) |
| `(dashboard)/settings/page.tsx` | `member-pages` → `MemberSettingsScreen` | `member/profile` (merged) |
| `(dashboard)/profile/[slug]/page.tsx` | `member-pages` → `MemberProfileScreen` | `member/profile` |
| `(organizer)/organizer/page.tsx` | `organizer-pages` → `OrganizerOverviewScreen` | `organizer/overview` |
| `(organizer)/organizer/events/page.tsx` | `organizer-pages` → `OrganizerEventsScreen` | `organizer/events` |
| `(organizer)/organizer/events/[slug]/page.tsx` | `organizer-pages` → `OrganizerEventDetailScreen` | `organizer/event-detail` |
| `(organizer)/organizer/groups/page.tsx` | `organizer-pages` → `OrganizerGroupsScreen` | `organizer/groups` |
| `(organizer)/organizer/venues/page.tsx` | `organizer-pages` → `OrganizerVenuesScreen` | `organizer/overview` (merged) |
| `(organizer)/organizer/messages/page.tsx` | `organizer-pages` → `OrganizerMessagesScreen` | `organizer/messages` |
| `(organizer)/organizer/notifications/page.tsx` | `organizer-pages` → `OrganizerNotificationsScreen` | `organizer/messages` (merged) |
| `(venue)/venue/dashboard/page.tsx` | `venue-pages` → `VenueDashboardScreen` | `venue/overview` |
| `(venue)/venue/bookings/page.tsx` | `venue-pages` → `VenueBookingsScreen` | `venue/bookings` |
| `(venue)/venue/availability/page.tsx` | `venue-pages` → `VenueAvailabilityScreen` | `venue/availability` |
| `(venue)/venue/deals/page.tsx` | `venue-pages` → `VenueDealsScreen` | `venue/deals` |
| `(venue)/venue/events/page.tsx` | `venue-pages` → `VenueEventsScreen` | `venue/events` |
| `(venue)/venue/analytics/page.tsx` | `venue-pages` → `VenueAnalyticsScreen` | `venue/overview` (merged) |
| `(venue)/venue/profile/page.tsx` | `venue-pages` → `VenueProfileScreen` | `venue/profile` |
| `(venue)/venue/messages/page.tsx` | `venue-pages` → `VenueMessagesScreen` | `venue/overview` (merged) |
| `(venue)/venue/notifications/page.tsx` | `venue-pages` → `VenueNotificationsScreen` | `venue/overview` (merged) |
| `(venue)/venue/onboarding/page.tsx` | Keep wizard import | Keep as-is |

**Step 4:** Run `npx next build` — all routes should compile (stubs return div placeholders).

**Step 5:** Delete old monolith files:
- `src/components/dashboard/admin-pages.tsx`
- `src/components/dashboard/member-pages.tsx`
- `src/components/dashboard/organizer-pages.tsx`
- `src/components/dashboard/venue-pages.tsx`
- `src/components/dashboard/admin-control-panels.tsx`
- `src/components/dashboard/operations-panels.tsx`

**Step 6:** Build again to confirm no stale imports.

**Step 7:** Commit: `chore: scaffold dashboard one-file-per-screen structure`

---

## Task 2: Build Member Dashboard (6 screens)

**Files:**
- Rewrite: `src/components/dashboard/member/overview.tsx`
- Rewrite: `src/components/dashboard/member/events.tsx`
- Create: `src/components/dashboard/member/groups.tsx`
- Rewrite: `src/components/dashboard/member/messages.tsx`
- Rewrite: `src/components/dashboard/member/profile.tsx`
- Create: `src/components/dashboard/member/transactions.tsx`
- Rewrite: `src/components/dashboard/member/panels.tsx`

**Data sources:** `getMemberPortalData()`, `getMemberProfile()` from `dashboard-fetchers.ts`
**Entitlements:** `resolveMemberTier()`, `memberHasFeature()` for tier badges and feature gates

### MemberOverviewScreen — `member/overview.tsx`
- **Shell:** `PortalShell roleMode="member"` with memberLinks("overview")
- **Welcome banner:** name from profile, tier badge via `resolveMemberTier()`, profile completion % from `memberProfile.completion`
- **Stats rail:** 4 `StatCard`s from `memberPortalData.metrics` (Upcoming RSVPs, Events attended, Groups joined, Messages unread)
- **Upcoming events:** `DashboardTable` from `memberPortalData.upcomingEvents` — columns: Event, Date, Venue, Status (with `ToneBadge`)
- **Activity feed:** `ActivityFeed` from `memberPortalData.inbox`
- **Quick actions:** 4 `QuickActionCard`s — Browse events, My calendar, Messages, Settings
- **Notifications:** `StreamCard` list from `memberPortalData.notifications` (last 5)

**Operations:** View dashboard, see upcoming, see groups, see notifications, view stats

### MemberEventsScreen — `member/events.tsx` (replaces old MemberCalendarScreen)
- **Calendar view:** `CalendarMatrix` from `memberPortalData.calendarDays`
- **Upcoming list:** Below calendar, `DashboardTable` from `memberPortalData.upcomingEvents` with columns: Event, Date, Venue, Status, Seat
- **Filter:** `FilterChips` for status (All, Going, Waitlisted, Past)
- **Past events:** When "Past" filter active, show events with rating prompt
- **QR ticket:** Inline QR code display for confirmed RSVPs

**Operations:** View calendar, filter by status, view QR ticket, rate past event, cancel RSVP

### MemberGroupsScreen — `member/groups.tsx` (NEW)
- **Groups list:** `DashboardTable` from `memberPortalData.groups` — columns: Group, Role, Next Event, Unread
- **Per-group expand:** Recent discussions, upcoming events
- **Leave group:** Action button per row

**Operations:** View groups, view discussions, leave group

### MemberMessagesScreen — `member/messages.tsx`
- **Thread list:** `DashboardTable` from `memberPortalData.messages` — columns: From, Subject, Preview, Channel, Status, Time
- **Tier gate:** If `!memberHasFeature(tier, "direct_messaging")` → show upgrade banner "Upgrade to Plus for direct messaging"
- **Empty state:** When no messages

**Operations:** View threads, read message, compose (tier-gated)

### MemberProfileScreen — `member/profile.tsx` (merges old profile + settings)
- **Profile card:** `Surface` with avatar (via `AvatarStamp`), name, bio, tier badge, member since, city, pronouns
- **Stats:** `StatCard` row from `memberProfile.stats`
- **Interests:** Tag pills from `memberProfile.interests`
- **Format affinities:** Progress bars from `memberProfile.formatAffinities` (score → width%)
- **Relationship timeline:** `ActivityFeed`-style from `memberProfile.relationshipTimeline`
- **Settings section:** `MemberSettingsStudio` (client component) — editable fields: name, bio, city, languages, interests, locale toggle, notification prefs
- **Account:** Email display, tier info with upgrade CTA, privacy toggles from `memberProfile.privacySnapshot`
- **Danger zone:** Delete account button (confirmation dialog)

**Operations:** View profile, edit fields, upload avatar, change password, set preferences, delete account

### MemberTransactionsScreen — `member/transactions.tsx` (NEW)
- **Transaction list:** `DashboardTable` — columns: Type, Description, Amount, Status, Date
- **Data source:** For now, mock array in component (no mock data exists yet in dashboard-data.ts). Add `memberTransactions` mock to dashboard-data.ts.
- **Filter:** `FilterChips` for type (All, Tickets, Subscriptions, Refunds)
- **Subscription info:** `Surface` with current tier, expiry date, benefits
- **Refund request:** Action button per transaction row

**Operations:** View transactions, filter, request refund, view subscription status

### MemberSettingsStudio — `member/panels.tsx`
- `"use client"` component
- Form fields: display name, bio, city, languages (multi-select), interests (category chips), locale toggle (EN/IS)
- Notification preferences: checkboxes for event updates, messages, system
- Save button with optimistic state
- Carried over from current operations-panels.tsx logic

**Step 1:** Write all 6 screens + panels file
**Step 2:** Add `memberTransactions` mock array to `dashboard-data.ts`
**Step 3:** Build verify
**Step 4:** Commit: `feat: rebuild member dashboard (6 screens)`

---

## Task 3: Build Organizer Dashboard (6 screens)

**Files:**
- Rewrite: `src/components/dashboard/organizer/overview.tsx`
- Rewrite: `src/components/dashboard/organizer/events.tsx`
- Rewrite: `src/components/dashboard/organizer/event-detail.tsx`
- Rewrite: `src/components/dashboard/organizer/groups.tsx`
- Create: `src/components/dashboard/organizer/bookings.tsx`
- Rewrite: `src/components/dashboard/organizer/messages.tsx`
- Rewrite: `src/components/dashboard/organizer/panels.tsx`

**Data sources:** `getOrganizerPortalData()` from `dashboard-fetchers.ts`
**Entitlements:** `resolveOrganizerTier()`, `organizerHasFeature()`, `getMaxActiveEvents()`

### OrganizerOverviewScreen — `organizer/overview.tsx`
- **DecisionStrip:** "What matters now" — count of pending bookings, pending RSVPs, unread messages
- **Stats rail:** 6 `StatCard`s from `organizerPortalData.metrics` (Live Events, Total RSVPs, Attendance Rate, Revenue, Pending Bookings, My Groups)
- **Active events:** `DashboardTable` from `organizerPortalData.nextEvents` — Title, Date, Venue, RSVPs/Capacity, Status
- **RSVP trend:** `TrendChart` from `organizerPortalData.rsvpTrend`
- **Activity feed:** `ActivityFeed` from `organizerPortalData.activityFeed`
- **Quick actions:** `QuickActionCard`s from `organizerPortalData.quickActions` — Create event, View analytics, Venue requests, Messages
- **Tier info:** `Surface` showing current tier features, upgrade CTA if not Studio

**Operations:** View summary, see pending actions, navigate to screens

### OrganizerEventsScreen — `organizer/events.tsx`
- **Filter bar:** `FilterChips` for status (All, Draft, Published, Completed, Cancelled), search box
- **Event table:** `DashboardTable` from `organizerPortalData.events` — Image, Title, Status (ToneBadge), Date, RSVPs/Capacity, Revenue, Actions dropdown
- **Tier limit banner:** If `organizerPortalData.events.length >= getMaxActiveEvents(tier)` → "3 of 3 active events — Upgrade to Pro for unlimited"
- **Recurring badge:** `ToneBadge` with "Recurring" for events with recurrence
- **Create button:** Link to `/organizer/events/new`
- **Per-event actions:** Edit, Publish/Unpublish, Cancel, Duplicate, Manage attendees, Check-in mode, View revenue, Delete

**Operations:** List events, filter, create, edit, publish, cancel, duplicate, delete, check-in mode

### OrganizerEventDetailScreen — `organizer/event-detail.tsx`
- **Props:** Receives `slug` param, calls `getManagedOrganizerEvent(slug)`
- **Event header:** Title, status badge, date, venue name
- **Stats:** 4 `StatCard`s — RSVPs, Waitlist, Attendance/Check-ins, Rating
- **Attendee table:** `DashboardTable` from event.attendees — Name, Status (ToneBadge), Ticket, Checked In, Note, Actions
- **Attendee actions:** Approve RSVP, Reject, Check in, Mark attended/no-show, Remove
- **QR Check-in link:** Button to launch QR scanner (imports from `qr-checkin.tsx`)
- **RSVP trend:** `TrendChart` (if rsvpTrend data available)
- **Revenue:** If paid event, `Surface` with ticket sales and commission breakdown
- **Timeline:** `ActivityFeed`-style from event.timeline
- **Co-organizers:** List from event.coOrganizers
- **Comments summary:** `StreamCard` from event.commentsSummary
- **OrganizerAttendeeControlCenter:** Client panel for interactive attendee management

**Operations:** View detail, approve/reject RSVPs, check in, mark attendance, remove attendee, send invite, export list, QR check-in, view revenue

### OrganizerGroupsScreen — `organizer/groups.tsx`
- **Groups table:** `DashboardTable` from `organizerPortalData.groups` — Name, Join Mode, Status, Pending Members, Co-Hosts, Health, Next Event
- **Create group:** CTA button
- **Per-group actions:** Edit, View members, Manage discussions, Archive
- **Pending members:** Inline count with expand to approve/reject

**Operations:** List groups, create, edit, manage members, manage discussions, archive

### OrganizerBookingsScreen — `organizer/bookings.tsx` (NEW)
- **Booking pipeline:** `DashboardTable` from `organizerPortalData.bookingPipeline` — Venue, Status (ToneBadge), Date, Note
- **Filter:** `FilterChips` for status (All, Pending, Accepted, Counter-offered, Declined, Cancelled)
- **Per-booking actions:** View details, Accept counter-offer, Decline, Cancel, Message venue
- **New booking:** CTA → venue search (uses `searchVenuesWithPriority()`)
- **Venue matches:** `DashboardTable` from `organizerPortalData.venueMatches` — Venue, Score, Next Slot, Fit
- **OrganizerVenueRequestStudio:** Client panel for creating booking requests
- **Tier gate:** If `!organizerHasFeature(tier, "venue_request_workflows")` → upgrade prompt

**Operations:** View bookings, filter, accept/decline counter-offer, cancel, create new, search venues

### OrganizerMessagesScreen — `organizer/messages.tsx` (merges messages + notifications)
- **Messages table:** `DashboardTable` from `organizerPortalData.messages` — Counterpart, Role, Subject, Channel, Status, Time
- **Filter:** `FilterChips` for All, Venues, Attendees, System
- **Notifications section:** `ActivityFeed` from `organizerPortalData.notifications` with type filters
- **Bulk notify:** Button to compose notification to all attendees of an event

**Operations:** View messages, filter, reply, view notifications, send bulk notification

### Organizer Panels — `organizer/panels.tsx`
- `OrganizerAttendeeControlCenter` — Client component for interactive attendee management (approve, check-in, mark attendance)
- `OrganizerVenueRequestStudio` — Client component for venue booking request form

**Step 1:** Write all 6 screens + panels file
**Step 2:** Build verify
**Step 3:** Commit: `feat: rebuild organizer dashboard (6 screens)`

---

## Task 4: Build Venue Dashboard (7 screens + onboarding)

**Files:**
- Rewrite: `src/components/dashboard/venue/overview.tsx`
- Rewrite: `src/components/dashboard/venue/bookings.tsx`
- Rewrite: `src/components/dashboard/venue/availability.tsx`
- Rewrite: `src/components/dashboard/venue/deals.tsx`
- Create: `src/components/dashboard/venue/reviews.tsx`
- Rewrite: `src/components/dashboard/venue/events.tsx`
- Rewrite: `src/components/dashboard/venue/profile.tsx`
- Rewrite: `src/components/dashboard/venue/onboarding.tsx`
- Rewrite: `src/components/dashboard/venue/panels.tsx`

**Data sources:** `getVenuePortalData()` from `dashboard-fetchers.ts`
**Entitlements:** `resolveVenueTier()`, `venueHasFeature()`

### VenueDashboardScreen — `venue/overview.tsx` (merges overview + analytics + messages + notifications)
- **Stats rail:** 6 `StatCard`s from `venuePortalData.metrics` (Active Bookings, Events This Month, Average Rating, Total Reviews, Revenue, Capacity Utilization)
- **Incoming bookings:** `Surface` with `DashboardTable` from `venuePortalData.bookings.incoming` — Organizer, Event, Date, Attendance, Status, Actions (Accept/Decline/Counter)
- **Upcoming events:** `DashboardTable` from `venuePortalData.upcomingEvents` — Event, Organizer, Status, Note
- **Analytics section:** `TrendChart` from `venuePortalData.analytics.funnel`, pie chart from `venuePortalData.analytics.eventTypes`
- **Recent messages:** `StreamCard` list from `venuePortalData.messages` (last 5)
- **Notifications:** `ActivityFeed` from `venuePortalData.notifications` (last 5)
- **Quick actions:** `QuickActionCard`s — Manage bookings, Set availability, Edit profile, View deals

**Operations:** View summary, quick-respond to bookings, view messages/notifications

### VenueBookingsScreen — `venue/bookings.tsx`
- **Filter:** `FilterChips` for status (All, Pending, Accepted, Declined, Counter-offered, Completed, Cancelled)
- **Pending bookings:** Large cards from `venuePortalData.bookings.incoming`:
  - Organizer name, event description, date, expected attendance vs capacity
  - Accept → sets status accepted
  - Decline → requires reason
  - Counter-offer → form with suggested date/time/price
- **Booking history:** `DashboardTable` from `venuePortalData.bookings.history` — Venue, Organizer, Result, Note
- **Guest fit:** `Surface` from `venuePortalData.bookings.guestFit` — summary, signals, arrival notes, room guidance
- **Tier gate:** If `!venueHasFeature(tier, "booking_inbox")` → "Upgrade to Partner for booking management"
- **VenueBookingCommandCenter:** Client panel for interactive booking actions

**Operations:** View bookings, accept, decline with reason, counter-offer, view history, view guest fit

### VenueAvailabilityScreen — `venue/availability.tsx`
- **Calendar view:** `CalendarMatrix` derived from `venuePortalData.availability.weeklyGrid` and exceptions
- **Weekly schedule:** `KeyValueList` from `venuePortalData.availability.recurring` — per-day blocks
- **Exceptions:** `DashboardTable` from `venuePortalData.availability.exceptions` — Date, Reason
- **Tier gate:** If `!venueHasFeature(tier, "availability_planning")` → upgrade prompt
- **VenueAvailabilityStudio:** Client panel for editing slots, adding blocks

**Operations:** View calendar, set recurring availability, add specific dates, block dates, edit/delete slots

### VenueDealsScreen — `venue/deals.tsx`
- **Active deals:** `DashboardTable` from `venuePortalData.deals` — Title, Type (ToneBadge), Tier, Status, Redemption, Note
- **Create deal:** CTA button
- **Per-deal actions:** Edit, Deactivate, Delete
- **Tier gate:** If `!venueHasFeature(tier, "deal_management")` → upgrade prompt
- **VenueDealStudio:** Client panel for deal CRUD form

**Operations:** View deals, create, edit, deactivate, delete

### VenueReviewsScreen — `venue/reviews.tsx` (NEW)
- **Rating summary:** Large stat display with average rating, total reviews
- **Rating distribution:** `TrendChart` (bar) or custom 5-star bar chart
- **Reviews list:** `DashboardTable` — Reviewer, Rating (stars), Text preview, Date, Event, Response
- **Respond:** Button per review → opens `VenueProfileSectionEditor` for venue_response
- **Flag:** Button per review → sends to admin
- **Data source:** Mock array in `venuePortalData` (add `reviews` array to mock data)

**Operations:** View reviews, respond, flag inappropriate

### VenueEventsScreen — `venue/events.tsx`
- **Calendar view:** `CalendarMatrix` showing events at venue
- **Events table:** `DashboardTable` from `venuePortalData.upcomingEvents` — Event, Organizer, Date, Attendance, Status
- **Historical stats:** `Surface` with total events hosted, total attendees, average rating

**Operations:** View events calendar/table, view stats

### VenueProfileScreen — `venue/profile.tsx`
- **Profile sections:** Multiple `Surface` blocks from `venuePortalData.profileSections`
  - Basic info: Name, type, description, address
  - Capacity: Seated, standing, total
  - Contact: Website, phone, email, socials
  - Hours: Opening hours per day
  - Amenities: Checklist
- **Photos:** Gallery display (hero + gallery grid)
- **VenueProfileSectionEditor:** Client panel for editing each section

**Operations:** Edit all fields, manage photos, update amenities

### VenueOnboardingScreen — `venue/onboarding.tsx`
- **Progress wizard:** `ProgressSteps` from `venuePortalData.onboarding.steps` (4 steps: Profile basics, Photos, Availability, Review & submit)
- **Per-step content:** Conditional rendering based on active step
- **Completion bar:** From `venuePortalData.onboarding.completion`
- **Submit for review:** CTA when all steps done
- **Required docs:** Checklist from `venuePortalData.onboarding.requiredDocs`

**Operations:** Step through wizard, submit for review

### Venue Panels — `venue/panels.tsx`
- `VenueBookingCommandCenter` — Accept/decline/counter-offer booking
- `VenueAvailabilityStudio` — Date picker + time slot editor
- `VenueDealStudio` — Deal create/edit form
- `VenueProfileSectionEditor` — Profile field editor

**Step 1:** Write all 8 screens + panels
**Step 2:** Add `venueReviews` mock array to `dashboard-data.ts`
**Step 3:** Build verify
**Step 4:** Commit: `feat: rebuild venue dashboard (7 screens + onboarding)`

---

## Task 5: Build Admin Dashboard — Overview + Users + Groups + Bookings (4 of 9)

**Files:**
- Rewrite: `src/components/dashboard/admin/overview.tsx`
- Rewrite: `src/components/dashboard/admin/users.tsx`
- Rewrite: `src/components/dashboard/admin/groups.tsx`
- Create: `src/components/dashboard/admin/bookings.tsx`

**Data sources:** `getAdminPortalData()` from `dashboard-fetchers.ts`

### AdminOverviewScreen — `admin/overview.tsx`
- **DecisionStrip:** Pending approvals count, flagged reports count, urgent items
- **Stats rail:** 8 `StatCard`s from `adminPortalData.metrics` (Total Users, Total Events, Active Venues, Active Groups, Pending Approvals, Revenue This Month, RSVPs This Week, Active Bookings)
- **Urgent queue:** `Surface` + `StreamCard` list from `adminPortalData.urgentQueues` — pending venue apps, pending group approvals, unread admin messages. Each with inline Approve/Reject buttons.
- **Growth chart:** `TrendChart` from `adminPortalData.growthChart`
- **Category mix:** `TrendChart` (bar) from `adminPortalData.categoryMix`
- **Activity feed:** `ActivityFeed` from `adminPortalData.handoffLog`
- **Quick actions:** `QuickActionCard`s — Create Event, Approve Venues, Send Announcement, Platform Settings, Audit Log
- **Signal rail:** `SignalRail` from `adminPortalData.opsInbox` — ops items needing attention

**Operations:** 8 (view stats, approve/reject venue, approve/reject group, navigate, view activity, quick-create)

### AdminUsersScreen — `admin/users.tsx`
- **Search + filters:** Search bar + `FilterChips` for role (All, Admin, Organizer, Venue, User), status (All, Verified, Unverified, Premium, Suspended)
- **User table:** `DashboardTable` from `adminPortalData.users` — Name, Email, Type (ToneBadge), Status, Joined, Last Active, Groups, Events, Revenue, Actions
- **Per-user actions dropdown:** View profile, Change role, Toggle verified, Toggle premium (tier + expiry), Suspend/Unsuspend, Force password reset, Impersonate, Send message, View activity, Export data
- **Selected user panel:** `Surface` showing `adminPortalData.selectedUser` details — role, bio, locale, trust signals, interests, badges, items
- **Client dossier:** `Surface` from `adminPortalData.clientDossier` — deep user profile with fit breakdown, access rules, curation timeline, admin notes, playbook
- **Bulk actions bar:** Checkboxes + bulk role change, suspend, verify
- **AdminUserCommandCenter:** Client panel for per-user operations

**Operations:** 12 (list, search, filter, change role, verify, premium, suspend, unsuspend, force reset, impersonate, message, export, bulk ops)

### AdminGroupsScreen — `admin/groups.tsx`
- **Pending queue:** `Surface` from `adminPortalData.groups.queue` — group name, organizer, status, note with Approve/Reject buttons
- **Groups table:** `DashboardTable` from `adminPortalData.groups.table` — Name, Members, Status (ToneBadge), Health, Action
- **Per-group actions:** Edit, Change status (pending/active/archived), Feature/unfeature, View members, Add/remove member, Change member role, Ban member, Transfer ownership, Delete, View discussions
- **AdminGroupOperationsDesk:** Client panel for group management

**Operations:** 10 (list, approve, reject, feature, archive, edit, manage members, transfer ownership, delete, manage discussions)

### AdminBookingsScreen — `admin/bookings.tsx` (NEW)
- **Filter:** `FilterChips` for status (All, Pending, Accepted, Declined, Counter-offered, Cancelled, Completed)
- **Bookings table:** `DashboardTable` — Organizer, Venue, Date, Time, Attendance, Status, Actions
- **Per-booking actions:** Override status, View details, Message organizer, Message venue, Create booking on behalf
- **Data source:** Add `adminBookings` mock array to `dashboard-data.ts`

**Operations:** 4 (list with filters, override status, create on behalf, message parties)

**Step 1:** Write all 4 screens
**Step 2:** Add `adminBookings` mock to `dashboard-data.ts`
**Step 3:** Build verify
**Step 4:** Commit: `feat: rebuild admin — overview, users, groups, bookings`

---

## Task 6: Build Admin Dashboard — Events + Venues + Revenue (3 more)

**Files:**
- Rewrite: `src/components/dashboard/admin/events.tsx`
- Rewrite: `src/components/dashboard/admin/venues.tsx`
- Rewrite: `src/components/dashboard/admin/revenue.tsx`

### AdminEventsScreen — `admin/events.tsx`
- **Search + filters:** Search + `FilterChips` for status, Featured/Sponsored/Free/Paid, date range
- **Event table:** `DashboardTable` from `adminPortalData.events.table` — Title, Status (ToneBadge), Category, Venue, Date, Action
- **Event calendar:** `CalendarMatrix` from `adminPortalData.events.calendar`
- **Per-event actions:** View/Edit, Change status, Feature/Unfeature, Sponsor/Unsponsor, Override RSVP mode, Change attendee limit, Manage attendees (RSVP Control Panel), Delete, View comments, View ratings, Send notification to attendees
- **RSVP Control Panel** (inline expand): Attendee table with — Name, Status, Ticket, Checked In, Actions (Move to going, Waitlist, Cancel, Check-in, Mark attended/no-show, Transfer RSVP). Plus: Force-add user, Bypass restrictions, Bulk check-in, Export list.
- **Audience picker:** `Surface` from `adminPortalData.events.audiencePicker` — candidate list with fit scores
- **AdminEventOperationsDesk:** Client panel for event management
- **AdminEventAudiencePicker:** Client panel for audience selection
- **AdminClientCurationWorkbench:** Client panel for curation

**Operations:** 15 (list, edit, status, feature, sponsor, RSVP mode, limit, force-add, remove, move status, attendance, transfer, delete, comments/ratings, notify)

### AdminVenuesScreen — `admin/venues.tsx`
- **Filter:** `FilterChips` for status (Pending, Active, Waitlisted, Suspended, Rejected), type, partnership tier, verified
- **Pending approval queue:** Large cards from `adminPortalData.venues.applications` with Approve/Reject/Waitlist/Request-info buttons
- **Active venues table:** `DashboardTable` from `adminPortalData.venues.active` — Name, Area, Type, Rating, Note
- **Per-venue actions:** Edit, Change status, Verify/unverify, Change partnership tier, Transfer ownership, View bookings, View/delete reviews, Respond to review, View revenue, Delete
- **AdminVenueOperationsDesk:** Client panel
- **AdminVenueApprovalConsole:** Client panel for batch approval workflow

**Operations:** 12 (list, approve, reject, waitlist, suspend, verify, tier change, transfer, edit, reviews, revenue, delete)

### AdminRevenueScreen — `admin/revenue.tsx`
- **Top stats:** 5 `StatCard`s — Total Revenue, Revenue This Month, Total Commission, Active Subscriptions, Pending Refunds
- **Revenue sources chart:** `TrendChart` from `adminPortalData.revenue.sources`
- **Transactions table:** `DashboardTable` from `adminPortalData.revenue.transactions` — Source, Amount, Status, When
- **Revenue policies:** `KeyValueList` from `adminPortalData.revenue.policies`
- **Per-transaction actions:** View details, Issue refund, Export CSV
- **AdminRevenueControlDesk:** Client panel for refund actions
- **AdminRevenueOperationsDesk:** Client panel for revenue operations

**Operations:** 5 (view transactions, analytics, refund, export, per-source breakdown)

**Step 1:** Write all 3 screens
**Step 2:** Build verify
**Step 3:** Commit: `feat: rebuild admin — events, venues, revenue`

---

## Task 7: Build Admin Dashboard — Settings + Audit (2 remaining)

**Files:**
- Rewrite: `src/components/dashboard/admin/settings.tsx`
- Create: `src/components/dashboard/admin/audit.tsx`

### AdminSettingsScreen — `admin/settings.tsx` (merges old settings + content + moderation + comms)

This screen becomes the admin mega-settings with tabs/sections:

**Settings section:** `Surface` blocks from `adminPortalData.settings` with `KeyValueList` for platform settings
- General: Platform name, locale, maintenance mode, registration toggle
- Fees: Commission %, min/max ticket price, venue partnership fees
- Feature flags: Toggle key-value pairs

**Content section:** From `adminPortalData.content`
- Content sections table, categories, blog queue
- `AdminContentControlCenter` client panel for approve/flag/remove

**Moderation section:** From `adminPortalData.moderation`
- Reports table with priority/status
- Pending approvals, auto-flagged items
- Banned users list with appeal status
- Audit log preview (last 10 entries)
- `AdminModerationOperationsDesk`, `AdminModerationConsole` client panels

**Comms section:** From `adminPortalData.comms`
- Template list, broadcast composer, notification history
- `AdminCommsStudio` client panel (from operations panels, now in admin panels)
- `AdminOpsInboxDesk` client panel

**Incident section:** From `adminPortalData.incidentConsole`
- Incident list with severity/status
- `AdminIncidentCommandDesk` client panel

**Analytics section:** From `adminPortalData.analyticsDeck` and `adminPortalData.heatGrid`
- `CommandCenterDeck` or custom analytics cards
- `HeatGrid` from primitives
- Geography stats from `adminPortalData.geography`
- `AdminAnalyticsOperationsDesk` client panel

**AdminSettingsControlCenter:** Client panel for settings editor

**Operations:** 6 + content ops + moderation ops + comms ops = ~20 total across sub-sections

### AdminAuditScreen — `admin/audit.tsx` (NEW)
- **Filter:** Admin user filter, action type, target type, date range
- **Audit table:** `DashboardTable` from `adminPortalData.moderation.auditLog` — Action, Actor, When
- **Expanded view:** Detail panel with before/after diff
- **Export:** CSV download button
- **Data source:** Add richer `adminAuditLog` mock to `dashboard-data.ts`

**Operations:** 3 (view log, filter/search, export)

**Step 1:** Write both screens
**Step 2:** Add `adminAuditLog` mock to `dashboard-data.ts`
**Step 3:** Build verify
**Step 4:** Commit: `feat: rebuild admin — settings (mega) + audit trail`

---

## Task 8: Build Admin Panels (15 client components)

**Files:**
- Rewrite: `src/components/dashboard/admin/panels.tsx`

All 15 components are `"use client"` interactive panels. They receive data as props from their parent server components and provide:
- Forms for editing (status changes, role changes, etc.)
- Action buttons with `startTransition` + `useDeferredValue` patterns
- Local state management with `useState`
- No direct data fetching (data comes from props)

**Components to build:**

| # | Component | Purpose | Key Props |
|---|-----------|---------|-----------|
| 1 | `AdminUserCommandCenter` | User detail with role/tier/status actions | `users: AdminUser[]` |
| 2 | `AdminEventAudiencePicker` | Audience selection with fit scores | `audience: AudiencePicker` |
| 3 | `AdminClientCurationWorkbench` | Deep user curation with dossier | `dossier: ClientDossier` |
| 4 | `AdminGroupOperationsDesk` | Group approve/archive/feature | `groups: GroupQueue[]` |
| 5 | `AdminEventOperationsDesk` | Event status/feature/RSVP management | `events: EventRow[]` |
| 6 | `AdminRevenueControlDesk` | Revenue detail + refund actions | `transactions: Transaction[]` |
| 7 | `AdminRevenueOperationsDesk` | Revenue operations + reporting | `sources: RevenueSource[]` |
| 8 | `AdminAnalyticsOperationsDesk` | Analytics views + export | `deck: AnalyticsDeck[]` |
| 9 | `AdminOpsInboxDesk` | Operations inbox items | `inbox: OpsItem[]` |
| 10 | `AdminIncidentCommandDesk` | Incident management | `incidents: Incident[]` |
| 11 | `AdminVenueOperationsDesk` | Venue status/edit/transfer | `venues: VenueRow[]` |
| 12 | `AdminModerationOperationsDesk` | Report handling | `reports: Report[]` |
| 13 | `AdminVenueApprovalConsole` | Batch venue approval | `applications: VenueApp[]` |
| 14 | `AdminModerationConsole` | Moderation queue | `items: ModItem[]` |
| 15 | `AdminSettingsControlCenter` | Settings editor | `settings: SettingSection[]` |

Each panel follows this pattern:
```tsx
"use client";
import { startTransition, useState } from "react";
import { Surface, DashboardTable, FilterChips, ToneBadge } from "@/components/dashboard/primitives";

export function AdminUserCommandCenter({ users }: { users: AdminUser[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  // ... interactive state management
  return (
    <Surface title="User Management">
      {/* interactive content */}
    </Surface>
  );
}
```

**Step 1:** Write all 15 panel components
**Step 2:** Build verify
**Step 3:** Commit: `feat: rebuild admin control panels (15 components)`

---

## Task 9: Add Missing Mock Data

**Files:**
- Modify: `src/lib/dashboard-data.ts`

Add these mock data arrays that new screens need:

1. **`memberTransactions`** — Array of `{key, type, description, amount, status, date, eventSlug?}`
2. **`venueReviews`** — Array of `{key, reviewer, rating, text, date, eventName, venueResponse?}`
3. **`adminBookings`** — Array of `{key, organizer, venue, date, time, attendance, status, message?}`
4. **`adminAuditLog`** — Richer array of `{key, admin, action, targetType, targetId, details, before?, after?, timestamp}`

Wire these into the respective portal data objects:
- `memberPortalData.transactions = memberTransactions`
- `venuePortalData.reviews = venueReviews`
- `adminPortalData.bookings = adminBookings`
- `adminPortalData.audit = adminAuditLog`

**Step 1:** Add all 4 mock arrays
**Step 2:** Wire into portal data objects
**Step 3:** Build verify
**Step 4:** Commit: `feat: add mock data for new dashboard screens`

---

## Task 10: Update Route Pages + Sidebar Links

**Files:**
- Update: All ~35 route page.tsx files (import path changes)
- Update: Sidebar link arrays in each portal's screens

Ensure every screen's `portalLinks()` function includes links to the new screens:
- Admin sidebar: + Bookings, + Audit
- Member sidebar: + Groups, + Transactions
- Organizer sidebar: + Bookings
- Venue sidebar: + Reviews

Sidebar link arrays should use `Route` type from `next` for type-safe hrefs.

**Step 1:** Update all route imports
**Step 2:** Update sidebar links in every screen
**Step 3:** Build verify
**Step 4:** Commit: `feat: update all routes and sidebar navigation`

---

## Task 11: Final Build Verification + Cleanup

**Step 1:** Run `npx next build` — must compile clean (0 errors)
**Step 2:** Delete old monolith files if not already deleted:
- `admin-pages.tsx`, `member-pages.tsx`, `organizer-pages.tsx`, `venue-pages.tsx`
- `admin-control-panels.tsx`, `operations-panels.tsx`
**Step 3:** Run build again to confirm no stale imports
**Step 4:** Check all 41 route pages render (no runtime crashes)
**Step 5:** Commit: `chore: delete old dashboard monoliths, final verification`

---

## Execution Strategy

| Phase | Tasks | Screens | Parallel Agents? |
|-------|-------|---------|-----------------|
| 1 — Scaffold | Task 1 | 0 (stubs) | No (sequential, foundational) |
| 2 — Mock data | Task 9 | 0 (data) | No (needed by screens) |
| 3 — Member | Task 2 | 6 | Agent 1 |
| 3 — Organizer | Task 3 | 6 | Agent 2 (parallel) |
| 3 — Venue | Task 4 | 7+1 | Agent 3 (parallel) |
| 4 — Admin screens | Tasks 5-7 | 9 | Agent 1 (sequential, biggest) |
| 4 — Admin panels | Task 8 | 15 panels | Agent 2 (parallel with screens) |
| 5 — Routes + nav | Task 10 | 0 | No (sequential) |
| 6 — Verify | Task 11 | 0 | No (sequential) |

**Total:** 28 screens + 19 client panels + 6 new routes + 35 route updates + 4 mock data additions

---

## Summary

| Portal | Screens | Operations | Panel Components |
|--------|---------|------------|-----------------|
| Admin | 9 | 75 | 15 |
| Member | 6 | 35 | 1 |
| Organizer | 6 | 42 | 2 |
| Venue | 8 | 27 | 4 |
| **TOTAL** | **29** | **179** | **22** |
