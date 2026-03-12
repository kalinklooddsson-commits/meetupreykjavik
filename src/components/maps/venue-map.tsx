"use client";
import dynamic from "next/dynamic";

const VenueMapInner = dynamic(
  () => import("@/components/maps/venue-map-inner"),
  { ssr: false },
);

type VenueMapProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

export function VenueMap({ latitude, longitude, name, address }: VenueMapProps) {
  return (
    <VenueMapInner
      latitude={latitude}
      longitude={longitude}
      name={name}
      address={address}
    />
  );
}
