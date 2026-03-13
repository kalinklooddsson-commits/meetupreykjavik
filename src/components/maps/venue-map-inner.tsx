"use client";

import { ExternalLink } from "lucide-react";

type VenueMapInnerProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

const DEFAULT_CENTER: [number, number] = [64.1466, -21.9426];

export default function VenueMapInner({ latitude, longitude, name, address }: VenueMapInnerProps) {
  const lat = latitude || DEFAULT_CENTER[0];
  const lng = longitude || DEFAULT_CENTER[1];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, Reykjavik, Iceland`)}`;
  const osmEmbedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006}%2C${lat - 0.004}%2C${lng + 0.006}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lng}`;

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
          src={osmEmbedSrc}
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
