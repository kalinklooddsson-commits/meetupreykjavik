# MeetupReykjavik — Full Launch Prep Design

**Date:** 2026-03-11
**Approach:** Option A (bottom-up) — Foundation → Polish → Wire up

---

## Scope

Full MVP launch prep: Supabase backend integration, auth, PayPal payment scaffolding (env-var gated), frontend polish (Tailwind fixes, Leaflet maps, i18n, mobile responsive), data wiring, email system, SEO/sitemap.

## Constraints

- Supabase project exists and is accessible via Chrome
- PayPal credentials provided later — build integration, gate with env vars
- Resend email credentials provided later — same pattern
- Keep mock data fallback when env vars missing
- No breaking changes to existing working pages

---

## Phase 1: Foundation — Supabase + Auth

### Database
- Deploy existing `supabase/schema.sql` (24 tables) to live Supabase project
- Verify RLS policies and security functions
- Seed initial data (categories, platform_settings)

### Data Access Layer
```
src/lib/db/
  client.ts        — Supabase server/browser clients
  events.ts        — CRUD + queries for events
  groups.ts        — CRUD + queries for groups
  venues.ts        — CRUD + queries for venues
  profiles.ts      — Profile management
  rsvps.ts         — RSVP operations
  bookings.ts      — Venue booking operations
  transactions.ts  — Payment/transaction records
  notifications.ts — Notification queries
  messages.ts      — Direct messaging
```

### Auth
- Wire login/signup to Supabase Auth (email + password)
- Session management via @supabase/ssr middleware
- Role-based route guards (admin, organizer, venue, user)
- Onboarding flow writes to profiles table
- Protected API routes check auth

---

## Phase 2: PayPal Payments (env-var gated)

### Integration
- PayPal JS SDK for client-side checkout
- Subscription flows for organizer tiers (Plus, Pro) and venue tiers
- Ticket purchasing for paid events
- Webhook handler at /api/paypal/webhook

### Commission Engine
- 5% ticket commission on paid events
- Track in transactions table
- Organizer payout calculation

### Env Vars Required
- PAYPAL_CLIENT_ID
- PAYPAL_SECRET
- PAYPAL_WEBHOOK_ID
- When missing: payment buttons show "Payments coming soon"

---

## Phase 3: Email System (env-var gated)

### Resend Integration
- Welcome email on signup
- RSVP confirmation
- Event reminders (24h before)
- Weekly digest
- Password reset

### Env Vars Required
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- When missing: emails logged to console instead of sent

---

## Phase 4: Frontend Polish

### Tailwind v4 Fix
- Audit all arbitrary brand color classes across codebase
- Replace with inline `style={{ color: "..." }}`

### Leaflet Maps
- Add OpenStreetMap to venue detail pages
- Use existing react-leaflet dependency
- Show venue location pin with popup

### Icelandic Translations
- Complete messages/is.json for all UI strings
- Verify locale switcher works

### Mobile Responsive
- Audit all pages at mobile/tablet breakpoints
- Fix layout issues

### Loading States
- Skeleton components for data-fetching pages
- Suspense boundaries where needed

---

## Phase 5: Wire Everything Up

### Public Pages
- Replace static data imports with Supabase queries
- Events, groups, venues, blog pages use live data

### Dashboard Pages
- User dashboard shows real user data
- Organizer portal manages real events/groups
- Venue portal shows real bookings/availability
- Admin dashboard shows real platform data

### Interactive Features
- RSVP system (create/cancel)
- Group join/leave
- Venue booking requests
- Comments and ratings
- Notifications

---

## Phase 6: SEO & Final

- Generate sitemap.xml dynamically
- Add robots.txt
- Verify OG metadata with real data
- Accessibility pass on interactive elements
