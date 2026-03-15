"use client";

import { ExternalLink } from "lucide-react";

type VenueMapInnerProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

export default function VenueMapInner({ name, address }: VenueMapInnerProps) {
  const locationParts = [name, address, "Reykjavik, Iceland"].filter(Boolean);
  const searchQuery = encodeURIComponent(locationParts.join(", "));
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  const googleMapsEmbedSrc = `https://maps.google.com/maps?q=${searchQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-2">
      <div style={{ height: 300, borderRadius: 12, overflow: "hidden" }} className="border border-gray-200">
        <iframe
          title={`Map of ${name}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={googleMapsEmbedSrc}
          allowFullScreen
        />
      </div>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-indigo hover:text-brand-indigo-light transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open in Google Maps
      </a>
    </div>
  );
}
