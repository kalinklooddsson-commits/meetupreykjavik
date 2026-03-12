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
  const unsubscribeLabel = t(locale, "Unsubscribe", "Afskráning");
  const tagline = t(
    locale,
    "MeetupReykjavik — Connecting Reykjavik's community",
    "MeetupReykjavik — Tengum samfélag Reykjavíkur",
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
  const subject = t(locale, `Welcome to MeetupReykjavik, ${displayName}!`, `Velkomin/n í MeetupReykjavik, ${displayName}!`);

  const body = [
    heading(t(locale, `Welcome, ${displayName}!`, `Velkomin/n, ${displayName}!`)),
    paragraph(
      t(
        locale,
        "We're glad you've joined the community. MeetupReykjavik helps you discover events, meet new people, and explore everything Reykjavik has to offer.",
        "Við erum ánægð að þú hafir gengið í samfélagið. MeetupReykjavik hjálpar þér að finna viðburði, hitta nýtt fólk og kanna allt sem Reykjavík hefur uppá að bjóða.",
      ),
    ),
    paragraph(
      t(
        locale,
        "Here are a few tips to get started:",
        "Hér eru nokkur ráð til að byrja:",
      ),
    ),
    `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.8;color:${COLORS.textDark};font-family:${FONT_STACK};">
      <li>${t(locale, "Browse upcoming events and RSVP to the ones you like", "Skoðaðu komandi viðburði og skráðu þig á þá sem þú hefur áhuga á")}</li>
      <li>${t(locale, "Join groups that match your interests", "Gakktu í hópa sem passa við áhugamál þín")}</li>
      <li>${t(locale, "Complete your profile to connect with others", "Ljúktu við prófílið þitt til að tengjast öðrum")}</li>
    </ul>`,
    ctaButton(
      t(locale, "Explore Events", "Skoða viðburði"),
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
    `Þú ert á leið! ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;
  const cancelUrl = `${eventUrl}?action=cancel`;

  const body = [
    heading(t(locale, "You're going!", "Þú ert á leið!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, your RSVP for the following event is confirmed:`,
        `Hæ ${displayName}, skráning þín á eftirfarandi viðburði er staðfest:`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Viðburður"), eventTitle),
        detailRow(t(locale, "Date", "Dagsetning"), eventDate),
        detailRow(t(locale, "Venue", "Staður"), venueName),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Event", "Skoða viðburð"),
      eventUrl,
    ),
    paragraph(
      `<a href="${cancelUrl}" style="color:${COLORS.textMuted};font-size:14px;font-family:${FONT_STACK};">${t(locale, "Cancel RSVP", "Afskrá mig")}</a>`,
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
    `Áminning: ${eventTitle} er á morgun`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "Your event is tomorrow!", "Viðburðurinn þinn er á morgun!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, just a friendly reminder that you have an event coming up tomorrow.`,
        `Hæ ${displayName}, vinsamleg áminning um að þú ert með viðburð á morgun.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Viðburður"), eventTitle),
        detailRow(t(locale, "Date", "Dagsetning"), eventDate),
        detailRow(t(locale, "Venue", "Staður"), venueName),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Event & Directions", "Skoða viðburð og leiðarvísi"),
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
    `Byrjar bráðum: ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "Starting in 2 hours!", "Byrjar eftir 2 klukkustundir!")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, ${eventTitle} starts at ${eventTime} at ${venueName}. See you there!`,
        `Hæ ${displayName}, ${eventTitle} byrjar kl. ${eventTime} á ${venueName}. Sjáum þig þar!`,
      ),
    ),
    ctaButton(
      t(locale, "Get Directions", "Fá leiðarvísi"),
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
    `Þú ert kominn/komin inn! Sæti losnaði á ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "You're in!", "Þú ert kominn/komin inn!")),
    paragraph(
      t(
        locale,
        `Great news, ${displayName}! A spot has opened up for ${eventTitle} and you've been moved off the waitlist. Your attendance is now confirmed.`,
        `Frábærar fréttir, ${displayName}! Sæti hefur losað á ${eventTitle} og þú hefur verið færð af biðlista. Mætting þín er nú staðfest.`,
      ),
    ),
    ctaButton(
      t(locale, "View Event", "Skoða viðburð"),
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
    "Þessi vika í Reykjavík",
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
    heading(t(locale, `Hi ${displayName}, here's your week`, `Hæ ${displayName}, hér er vikan þín`)),
    paragraph(
      t(
        locale,
        "Here are the top upcoming events we picked for you:",
        "Hér eru efstu komandi viðburðirnir sem við völdum fyrir þig:",
      ),
    ),
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;">${eventListHtml}</table>`,
    ctaButton(
      t(locale, "Explore All Events", "Skoða alla viðburði"),
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
    `Ný bókunarbeiðni fyrir ${venueName}`,
  );

  const acceptUrl = `${SITE_URL()}/api/bookings/${bookingId}?action=accept`;
  const declineUrl = `${SITE_URL()}/api/bookings/${bookingId}?action=decline`;

  const body = [
    heading(t(locale, "New Booking Request", "Ný bókunarbeiðni")),
    paragraph(
      t(
        locale,
        `${organizerName} has requested to book ${venueName} for an event.`,
        `${organizerName} hefur beðið um að bóka ${venueName} fyrir viðburð.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Viðburður"), eventTitle),
        detailRow(t(locale, "Organizer", "Skipuleggjandi"), organizerName),
        detailRow(t(locale, "Date", "Dagsetning"), date),
      ].join(""),
    ),
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr>
  <td style="background-color:${COLORS.coral};border-radius:6px;padding:14px 28px;">
    <a href="${acceptUrl}" style="color:${COLORS.white};font-size:16px;font-weight:700;text-decoration:none;font-family:${FONT_STACK};">${t(locale, "Accept", "Samþykkja")}</a>
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
    `Bókun staðfest: ${venueName} fyrir ${eventTitle}`,
  );

  const body = [
    heading(t(locale, "Booking Confirmed!", "Bókun staðfest!")),
    paragraph(
      t(
        locale,
        `Great news, ${organizerName}! ${venueName} has accepted your booking request.`,
        `Frábærar fréttir, ${organizerName}! ${venueName} hefur samþykkt bókunarbeiðni þína.`,
      ),
    ),
    detailTable(
      [
        detailRow(t(locale, "Event", "Viðburður"), eventTitle),
        detailRow(t(locale, "Venue", "Staður"), venueName),
        detailRow(t(locale, "Date", "Dagsetning"), date),
      ].join(""),
    ),
    ctaButton(
      t(locale, "View Booking Details", "Skoða bókunarupplýsingar"),
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
    `Nýr viðburður í ${groupName}: ${eventTitle}`,
  );

  const eventUrl = `${SITE_URL()}/events/${eventSlug}`;

  const body = [
    heading(t(locale, "New Event", "Nýr viðburður")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, a new event has been posted in ${groupName}:`,
        `Hæ ${displayName}, nýr viðburður hefur verið birtur í ${groupName}:`,
      ),
    ),
    paragraph(
      `<strong style="font-size:18px;color:${COLORS.indigo};">${eventTitle}</strong>`,
    ),
    ctaButton(
      t(locale, "Attend This Event", "Mæta á viðburð"),
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
    heading(t(locale, "How was it?", "Hvernig var það?")),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, we'd love to hear how ${eventTitle} went. Your feedback helps the community!`,
        `Hæ ${displayName}, við myndum gjarna heyra hvernig ${eventTitle} gekk. Endurgjöf þín hjálpar samfélaginu!`,
      ),
    ),
    `<div style="text-align:center;margin:24px 0;">${starsHtml}</div>`,
    ctaButton(
      t(locale, "Leave a Review", "Skrifa umsögn"),
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
    `Velkomin/n í ${planName}!`,
  );

  const featureList = features
    .map(
      (f) =>
        `<li style="padding:4px 0;font-size:16px;color:${COLORS.textDark};font-family:${FONT_STACK};">${f}</li>`,
    )
    .join("");

  const body = [
    heading(t(locale, `Welcome to ${planName}!`, `Velkomin/n í ${planName}!`)),
    paragraph(
      t(
        locale,
        `Hi ${displayName}, your account has been upgraded. Here's what you now have access to:`,
        `Hæ ${displayName}, reikningur þinn hefur verið uppfærður. Hér er hvað þú hefur nú aðgang að:`,
      ),
    ),
    `<ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;">${featureList}</ul>`,
    ctaButton(
      t(locale, "Go to Dashboard", "Fara í yfirlit"),
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
    `${venueName} hefur verið samþykkt á MeetupReykjavik`,
  );

  const body = [
    heading(t(locale, "Your venue is approved!", "Staður þinn hefur verið samþykktur!")),
    paragraph(
      t(
        locale,
        `Congratulations! ${venueName} has been verified and is now live on MeetupReykjavik. Organizers can now discover and book your space.`,
        `Til hamingju! ${venueName} hefur verið staðfestur og er nú í lofti á MeetupReykjavik. Skipuleggjendur geta nú fundið og bókað rýmið þitt.`,
      ),
    ),
    paragraph(
      t(
        locale,
        "From your dashboard you can manage bookings, set availability, create deals, and update your venue profile.",
        "Frá yfirlitinu þínu geturðu stjórnað bókunum, stillt framboðstíma, búið til tilboð og uppfært staðarsnið.",
      ),
    ),
    ctaButton(
      t(locale, "Open Venue Dashboard", "Opna yfirlit staðar"),
      dashboardUrl,
    ),
  ].join("");

  return { subject, html: emailWrapper(locale, body) };
}
