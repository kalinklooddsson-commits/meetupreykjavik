import { env } from "@/lib/env";

type Locale = "en" | "is";

const SITE_URL = () => env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

const COLORS = {
  indigo: "#3730A3",
  coral: "#E8614D",
  sand: "#F5F0E8",
  white: "#FFFFFF",
  textDark: "#1F2937",
  textMuted: "#6B7280",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* -------------------------------------------------------------------------- */
/*  Translations                                                              */
/* -------------------------------------------------------------------------- */

const t = (locale: Locale, en: string, is: string) =>
  locale === "is" ? is : en;

/* -------------------------------------------------------------------------- */
/*  Shared wrapper                                                            */
/* -------------------------------------------------------------------------- */

function emailWrapper(locale: Locale, body: string): string {
  const unsubscribeUrl = `${SITE_URL()}/settings/notifications`;
  const unsubscribeLabel = t(locale, "Unsubscribe", "Afskraning");
  const tagline = t(
    locale,
    "MeetupReykjavik — Connecting Reykjavik's community",
    "MeetupReykjavik — Tengum samfelag Reykjavikur",
  );

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${COLORS.sand};font-family:${FONT_STACK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr>
    <td style="background-color:${COLORS.indigo};padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="color:${COLORS.white};font-size:22px;font-weight:700;font-family:${FONT_STACK};">MeetupReykjavik</span>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="background-color:${COLORS.white};padding:32px;border-radius:0 0 8px 8px;">
      ${body}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="padding:24px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:${COLORS.textMuted};font-family:${FONT_STACK};">${tagline}</p>
      <a href="${unsubscribeUrl}" style="font-size:12px;color:${COLORS.textMuted};font-family:${FONT_STACK};">${unsubscribeLabel}</a>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background-color:${COLORS.coral};border-radius:6px;padding:14px 28px;">
  <a href="${href}" style="color:${COLORS.white};font-size:16px;font-weight:700;text-decoration:none;font-family:${FONT_STACK};display:inline-block;">${label}</a>
</td></tr>
</table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${COLORS.textDark};font-family:${FONT_STACK};">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.textDark};font-family:${FONT_STACK};">${text}</p>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 0;font-size:14px;color:${COLORS.textMuted};font-family:${FONT_STACK};width:100px;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:14px;color:${COLORS.textDark};font-family:${FONT_STACK};font-weight:600;">${value}</td>
</tr>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">${rows}</table>`;
}

/* -------------------------------------------------------------------------- */
/*  1. Welcome email                                                          */
/* -------------------------------------------------------------------------- */

export function welcomeEmail(displayName: string, locale: Locale = "en") {
  const subject = t(locale, `Welcome to MeetupReykjavik, ${displayName}!`, `Velkomin/n i MeetupReykjavik, ${displayName}!`);

  const body = [
    heading(t(locale, `Welcome, ${displayName}!`, `Velkomin/n, ${displayName}!`)),
    paragraph(
      t(
        locale,
        "We're glad you've joined the community. MeetupReykjavik helps you discover events, meet new people, and explore everything Reykjavik has to offer.",
        "Vid erum annaegd ad thu hafir gengid i samfelagid. MeetupReykjavik hjalpardur ad finna vidburdi, hitta nytt folk og kanna allt sem Reykjavik hefur uppbod.",
      ),
    ),
    paragraph(
      t(
        locale,
        "Here are a few tips to get started:",
        "Her eru nokkur rad til ad byrja:",
      ),
    ),
    `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.8;color:${COLORS.textDark};font-family:${FONT_STACK};">
      <li>${t(locale, "Browse upcoming events and RSVP to the ones you like", "Skodadu komandi vidburdi og skraddu thig a tha sem thu hefur ahuga a")}</li>
      <li>${t(locale, "Join groups that match your interests", "Gastu i hopa sem passa vid ahugumal thin")}</li>
      <li>${t(locale, "Complete your profile to connect with others", "Klattu vid profil thitt til ad tengjast odrum")}</li>
    </ul>`,
    ctaButton(
      t(locale, "Explore Events", "Skoda vidburdi"),
      `${SITE_URL()}/events`,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  2. RSVP confirmation                                                      */
/* -------------------------------------------------------------------------- */

export function rsvpConfirmationEmail(
  displayName: string,
  eventTitle: string,
  eventDate: string,
  venueName: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `You're going! ${eventTitle}`,
    `Thu ert a leid! ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;
  const cancelUrl = `${eventUrl}?action=cancel`;

  const body = [
    heading(t(locale, "You're going!", "Thu ert a leid!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, your RSVP for the following event is confirmed:`,
        `Hae ${displayName}, skraning thin a eftirfarandi vidburdi er stadfest:`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Vidburdir"), eventTitle),
        detailRow(t(locale, "Date", "Dagsetning"), eventDate),
        detailRow(t(locale, "Venue", "Stadur"), venueName),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Event", "Skoda vidburd"),
      eventUrl,
    ),
    paragraph(
      `<a href="${cancelUrl}" style="color:${COLORS.textMuted};font-size:14px;font-family:${FONT_STACK};">${t(locale, "Cancel RSVP", "Afskra mig")}</a>`,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  3. Event reminder (24h)                                                   */
/* -------------------------------------------------------------------------- */

export function eventReminder24hEmail(
  displayName: string,
  eventTitle: string,
  eventDate: string,
  venueName: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `Reminder: ${eventTitle} is tomorrow`,
    `Aminning: ${eventTitle} er a morgun`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "Your event is tomorrow!", "Vidburdir thinn er a morgun!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, just a friendly reminder that you have an event coming up tomorrow.`,
        `Hae ${displayName}, vinsamleg aminning um ad thu ert med vidburd a morgun.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Vidburdir"), eventTitle),
        detailRow(t(locale, "Date", "Dagsetning"), eventDate),
        detailRow(t(locale, "Venue", "Stadur"), venueName),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Event & Directions", "Skoda vidburd og leidarvisir"),
      eventUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  4. Event reminder (2h)                                                    */
/* -------------------------------------------------------------------------- */

export function eventReminder2hEmail(
  displayName: string,
  eventTitle: string,
  eventTime: string,
  venueName: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `Starting soon: ${eventTitle}`,
    `Byrjar bradum: ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "Starting in 2 hours!", "Byrjar eftir 2 klukkustundir!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, ${eventTitle} starts at ${eventTime} at ${venueName}. See you there!`,
        `Hae ${displayName}, ${eventTitle} byrjar kl. ${eventTime} a ${venueName}. Sjaum thig thar!`,
      ),
    ),
    ctaButton(
      t(locale, "Get Directions", "Fa leidarvisir"),
      eventUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  5. Waitlist promoted                                                      */
/* -------------------------------------------------------------------------- */

export function waitlistPromotedEmail(
  displayName: string,
  eventTitle: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `You're in! A spot opened for ${eventTitle}`,
    `Thu ert kominn/komin inn! Saeti losadi a ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "You're in!", "Thu ert kominn/komin inn!")),
    paragraph(
      t(
        locale,
        `Great news, ${displayName}! A spot has opened up for ${eventTitle} and you've been moved off the waitlist. Your attendance is now confirmed.`,
        `Fraebaer frettir, ${displayName}! Saeti hefur losad a ${eventTitle} og thu hefur verid faerd af bidalista. Madmot thin er nu stadfest.`,
      ),
    ),
    ctaButton(
      t(locale, "View Event", "Skoda vidburd"),
      eventUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  6. Weekly digest                                                          */
/* -------------------------------------------------------------------------- */

export function weeklyDigestEmail(
  displayName: string,
  events: { title: string; slug: string; date: string }[],
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    "This week in Reykjavik",
    "Thessi vika i Reykjavik",
  );

  const eventListHtml = events
    .map(
      (event) =>
        `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;">
        <a href="${SITE_URL()}/events/${event.slug}" style="font-size:16px;font-weight:600;color:${COLORS.indigo};text-decoration:none;font-family:${FONT_STACK};">${event.title}</a>
        <br><span style="font-size:14px;color:${COLORS.textMuted};font-family:${FONT_STACK};">${event.date}</span>
      </td>
    </tr>`,
    )
    .join("");

  const body = [
    heading(t(locale, `Hi ${displayName}, here's your week`, `Hae ${displayName}, her er vikan thin`)),
    paragraph(
      t(
        locale,
        "Here are the top upcoming events we picked for you:",
        "Her eru efstu komandi vidburdirnir sem vid voldum fyrir thig:",
      ),
    ),
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;">${eventListHtml}</table>`,
    ctaButton(
      t(locale, "Explore All Events", "Skoda alla vidburdi"),
      `${SITE_URL()}/events`,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  7. Booking request (for venue)                                            */
/* -------------------------------------------------------------------------- */

export function bookingRequestEmail(
  venueName: string,
  organizerName: string,
  eventTitle: string,
  date: string,
  bookingId: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `New booking request for ${venueName}`,
    `Ny bokunarbeidni fyrir ${venueName}`,
  );

  const acceptUrl = `${SITE_URL()}/api/bookings/${bookingId}?action=accept`;
  const declineUrl = `${SITE_URL()}/api/bookings/${bookingId}?action=decline`;

  const body = [
    heading(t(locale, "New Booking Request", "Ny bokunarbeidni")),
    paragraph(
      t(
        locale,
        `${organizerName} has requested to book ${venueName} for an event.`,
        `${organizerName} hefur beitt um ad boka ${venueName} fyrir vidburd.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Vidburdir"), eventTitle),
        detailRow(t(locale, "Organizer", "Skipuleggjandi"), organizerName),
        detailRow(t(locale, "Date", "Dagsetning"), date),
      ].join(""),
    ),
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr>
  <td style="background-color:${COLORS.coral};border-radius:6px;padding:14px 28px;">
    <a href="${acceptUrl}" style="color:${COLORS.white};font-size:16px;font-weight:700;text-decoration:none;font-family:${FONT_STACK};">${t(locale, "Accept", "Samthykkja")}</a>
  </td>
  <td style="width:16px;"></td>
  <td style="background-color:${COLORS.textMuted};border-radius:6px;padding:14px 28px;">
    <a href="${declineUrl}" style="color:${COLORS.white};font-size:16px;font-weight:700;text-decoration:none;font-family:${FONT_STACK};">${t(locale, "Decline", "Hafna")}</a>
  </td>
</tr>
</table>`,
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  8. Booking accepted (for organizer)                                       */
/* -------------------------------------------------------------------------- */

export function bookingAcceptedEmail(
  organizerName: string,
  venueName: string,
  eventTitle: string,
  date: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `Booking confirmed: ${venueName} for ${eventTitle}`,
    `Bokun stadfest: ${venueName} fyrir ${eventTitle}`,
  );

  const body = [
    heading(t(locale, "Booking Confirmed!", "Bokun stadfest!")),
    paragraph(
      t(
        locale,
        `Great news, ${organizerName}! ${venueName} has accepted your booking request.`,
        `Fraebaer frettir, ${organizerName}! ${venueName} hefur samthykkt bokunarbeidni thina.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Vidburdir"), eventTitle),
        detailRow(t(locale, "Venue", "Stadur"), venueName),
        detailRow(t(locale, "Date", "Dagsetning"), date),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Booking Details", "Skoda bokunarupplysingar"),
      `${SITE_URL()}/dashboard/bookings`,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  9. New event in group                                                     */
/* -------------------------------------------------------------------------- */

export function newEventEmail(
  displayName: string,
  eventTitle: string,
  groupName: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `New event in ${groupName}: ${eventTitle}`,
    `Nyr vidburdir i ${groupName}: ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "New Event", "Nyr vidburdir")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, a new event has been posted in ${groupName}:`,
        `Hae ${displayName}, nyr vidburdir hefur verid birt i ${groupName}:`,
      ),
    ),
    paragraph(
      `<strong style="font-size:18px;color:${COLORS.indigo};">${eventTitle}</strong>`,
    ),
    ctaButton(
      t(locale, "Attend This Event", "Maeta a vidburd"),
      eventUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  10. Post-event rating                                                     */
/* -------------------------------------------------------------------------- */

export function postEventRatingEmail(
  displayName: string,
  eventTitle: string,
  eventSlug: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `How was ${eventTitle}?`,
    `Hvernig var ${eventTitle}?`,
  );

  const rateUrl = `${SITE_URL()}/events/${eventSlug}?action=rate`;

  const starsHtml = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<a href="${rateUrl}&rating=${n}" style="font-size:28px;text-decoration:none;padding:0 4px;color:${COLORS.coral};">${n <= 0 ? "&#9734;" : "&#9733;"}</a>`,
    )
    .join("");

  const body = [
    heading(t(locale, "How was it?", "Hvernig var thad?")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, we'd love to hear how ${eventTitle} went. Your feedback helps the community!`,
        `Hae ${displayName}, vid myndum gjarna heyra hvernig ${eventTitle} gekk. Endurgjof thin hjalparsafillag inu!`,
      ),
    ),
    `<div style="text-align:center;margin:24px 0;">${starsHtml}</div>`,
    ctaButton(
      t(locale, "Leave a Review", "Skrifa umsogn"),
      rateUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  11. Account upgrade                                                       */
/* -------------------------------------------------------------------------- */

export function accountUpgradeEmail(
  displayName: string,
  planName: string,
  features: string[],
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `Welcome to ${planName}!`,
    `Velkomin/n i ${planName}!`,
  );

  const featureList = features
    .map(
      (f) =>
        `<li style="padding:4px 0;font-size:16px;color:${COLORS.textDark};font-family:${FONT_STACK};">${f}</li>`,
    )
    .join("");

  const body = [
    heading(t(locale, `Welcome to ${planName}!`, `Velkomin/n i ${planName}!`)),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, your account has been upgraded. Here's what you now have access to:`,
        `Hae ${displayName}, reikningur thinn hefur verid uppfaerdur. Her er hvad thu hefur nu adgang ad:`,
      ),
    ),
    `<ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;">${featureList}</ul>`,
    ctaButton(
      t(locale, "Go to Dashboard", "Fara i yfirlit"),
      `${SITE_URL()}/dashboard`,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}

/* -------------------------------------------------------------------------- */
/*  12. Venue approved                                                        */
/* -------------------------------------------------------------------------- */

export function venueApprovedEmail(
  venueName: string,
  dashboardUrl: string,
  locale: Locale = "en",
) {
  const subject = t(
    locale,
    `${venueName} is approved on MeetupReykjavik`,
    `${venueName} hefur verid samthykkt a MeetupReykjavik`,
  );

  const body = [
    heading(t(locale, "Your venue is approved!", "Stadur thinn hefur verid samthykktur!")),
    paragraph(
      t(
        locale,
        `Congratulations! ${venueName} has been verified and is now live on MeetupReykjavik. Organizers can now discover and book your space.`,
        `Til hamingju! ${venueName} hefur verid stadfestur og er nu i lufithi a MeetupReykjavik. Skipuleggjendur geta nu fundid og bokad rumid thitt.`,
      ),
    ),
    paragraph(
      t(
        locale,
        "From your dashboard you can manage bookings, set availability, create deals, and update your venue profile.",
        "Fra yfirlitinu thinu geturdu stjornad bokunum, stillt frambodstimaoghalda thurft ad, buid til tilbod og uppfaert stadssnid.",
      ),
    ),
    ctaButton(
      t(locale, "Open Venue Dashboard", "Opna yfirlit stadar"),
      dashboardUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}
