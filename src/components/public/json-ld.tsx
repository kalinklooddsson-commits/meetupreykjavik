// Event JSON-LD (Schema.org Event)
export function EventJsonLd({
  event,
}: {
  event: {
    title: string;
    summary: string;
    startsAt: string;
    endsAt: string;
    venueName: string;
    art: string;
    slug: string;
    priceLabel: string;
    isFree: boolean;
  };
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.startsAt,
    endDate: event.endsAt,
    image: event.art,
    url: `https://meetupreykjavik.vercel.app/events/${event.slug}`,
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Reykjavik",
        addressCountry: "IS",
      },
    },
    offers: {
      "@type": "Offer",
      price: event.isFree ? "0" : event.priceLabel,
      priceCurrency: "ISK",
      availability: "https://schema.org/InStock",
    },
    organizer: { "@type": "Organization", name: "MeetupReykjavik" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Venue JSON-LD (Schema.org LocalBusiness)
export function VenueJsonLd({
  venue,
}: {
  venue: {
    name: string;
    summary: string;
    type: string;
    area: string;
    art: string;
    slug: string;
    rating: number;
    address: string;
  };
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: venue.name,
    description: venue.summary,
    image: venue.art,
    url: `https://meetupreykjavik.vercel.app/venues/${venue.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: "Reykjavik",
      addressCountry: "IS",
    },
    aggregateRating: venue.rating
      ? { "@type": "AggregateRating", ratingValue: venue.rating, bestRating: 5 }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Organization JSON-LD for the site itself
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MeetupReykjavik",
    url: "https://meetupreykjavik.vercel.app",
    logo: "https://meetupreykjavik.vercel.app/icon.png",
    sameAs: [
      "https://instagram.com/meetupreykjavik",
      "https://facebook.com/meetupreykjavik",
      "https://x.com/meetupreykjavik",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
