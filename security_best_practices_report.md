# Security Best Practices Report

## Executive Summary

The app is materially safer than it was at the start of this pass. I fixed three high-impact issues in the local auth and request layer:

1. Mock session cookies are now signed instead of being plain base64 role blobs.
2. Mock signup no longer self-assigns the `admin` role unless explicitly enabled.
3. Cookie-setting and state-changing POST/PATCH/DELETE routes now reject cross-site requests based on origin.

The highest-impact local app-layer issues are now closed. The main remaining production security work is replacing mock auth/session behavior with real Supabase-backed auth and wiring production integrations like payments and email securely.

## Fixed Findings

### F1. Unsigned mock session cookie allowed role forgery

- Rule ID: `NEXT-SESS-001`
- Severity: High
- Location: [src/lib/auth/mock-auth.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/auth/mock-auth.ts#L12), [src/lib/auth/mock-auth.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/auth/mock-auth.ts#L18), [src/lib/auth/mock-auth.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/auth/mock-auth.ts#L106)
- Evidence: the session cookie is now HMAC-signed and verified before use.
- Impact: previously, anyone who could set a cookie could have forged an `admin` or other privileged session by editing a base64 payload.
- Fix: added HMAC signing and timing-safe verification around the mock session cookie.

### F2. Mock signup could mint admin users directly

- Rule ID: `NEXT-AUTH-001`
- Severity: High
- Location: [src/app/api/[...path]/route.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/app/api/[...path]/route.ts#L155)
- Evidence: `requestedAccountType === "admin"` is now downgraded to `user` unless `ALLOW_MOCK_ADMIN_SIGNUP=true`.
- Impact: previously, any visitor could create a local admin session through the signup API.
- Fix: restricted mock admin signup behind an explicit environment flag.

### F3. Cookie-authenticated state changes lacked CSRF-style origin protection

- Rule ID: `NEXT-CSRF-001`
- Severity: High
- Location: [src/app/api/[...path]/route.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/app/api/[...path]/route.ts#L220), [src/app/api/locale/route.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/app/api/locale/route.ts#L9), [src/lib/security/request.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/security/request.ts#L9)
- Evidence: non-GET API calls and locale changes now require a trusted same-origin `Origin` header.
- Impact: previously, browser-based cross-site POST requests could trigger cookie-authenticated local state changes.
- Fix: added a trusted-origin gate for state-changing requests and verified it blocks missing-origin requests while allowing same-origin requests.

### F4. Baseline browser security headers were missing in app code

- Rule ID: `NEXT-HEADERS-001`
- Severity: Medium
- Location: [middleware.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/middleware.ts#L9)
- Evidence: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` are now set in middleware.
- Impact: without these headers, the app had a weaker default browser security posture.
- Fix: added baseline headers in middleware for all non-static page traffic.

### F5. No Content Security Policy was configured

- Rule ID: `NEXT-CSP-001`
- Severity: Medium
- Location: [middleware.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/middleware.ts#L5)
- Evidence: middleware now sets a header-delivered `Content-Security-Policy`.
- Impact: without CSP, any future XSS bug would have had no browser-enforced containment layer.
- Fix: added a middleware CSP with explicit script, style, font, image, connect, frame, object, base-uri, and form-action directives.

### F6. Draft forms persisted business data in localStorage

- Rule ID: `REACT-AUTH-001`
- Severity: Medium
- Location: [src/components/public/contact-form.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/public/contact-form.tsx#L45), [src/components/forms/organizer-event-wizard.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/forms/organizer-event-wizard.tsx#L174), [src/components/forms/venue-onboarding-wizard.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/forms/venue-onboarding-wizard.tsx#L150), [src/components/forms/organizer-group-form.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/forms/organizer-group-form.tsx#L84), [src/components/auth/onboarding-flow.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/auth/onboarding-flow.tsx#L112), [src/components/dashboard/operations-panels.tsx](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/components/dashboard/operations-panels.tsx#L1311)
- Evidence: draft persistence now goes through [session-drafts.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/storage/session-drafts.ts#L1) and uses `sessionStorage` instead of `localStorage`.
- Impact: persistent browser storage made draft business data survive longer than necessary and increased exposure if an XSS bug were introduced later.
- Fix: moved local draft persistence to session-scoped browser storage.

## Remaining Findings

### R1. Mock auth is still the active security boundary

- Rule ID: `NEXT-AUTH-001`
- Severity: Medium
- Location: [src/lib/auth/mock-auth.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/auth/mock-auth.ts#L12), [src/lib/auth/guards.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/auth/guards.ts#L5), [src/app/api/[...path]/route.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/app/api/[...path]/route.ts#L239)
- Evidence: the app still uses mock session construction and mock auth fallback when Supabase env is absent.
- Impact: this is acceptable for local build work, but it is not a production-grade identity boundary.
- Fix: replace mock auth/session handling with real Supabase auth before any public deployment.

### R2. Business-critical integrations are still scaffolded, not hardened

- Rule ID: `NEXT-AUTH-001`
- Severity: Medium
- Location: [src/lib/api/spec-routes.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/api/spec-routes.ts#L95), [src/lib/api/spec-routes.ts](/Users/baldvinoddsson/Desktop/Meetupreykjavik/src/lib/api/spec-routes.ts#L106)
- Evidence: payments, webhooks, notifications, messages, and cron routes are still marked `scaffold`.
- Impact: the local UI is deep, but the production trust boundary for payments, reminders, and message delivery does not exist yet.
- Fix: implement those routes against real providers with signature validation, authorization, rate limiting, and audit logging.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Runtime check: `POST /api/locale` returns `403` without an `Origin` header and `200` with a same-origin `Origin` header.
