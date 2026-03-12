"use client";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

type VenueMapInnerProps = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

const DEFAULT_CENTER: [number, number] = [64.1466, -21.9426];

export default function VenueMapInner({ latitude, longitude, name, address }: VenueMapInnerProps) {
  const center = useMemo<[number, number]>(
    () =>
      latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER,
    [latitude, longitude],
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              <strong>{name}</strong>
              <br />
              {address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </>
  );
}
