"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { RestaurantSearchResult } from "@/lib/types";

const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194];

interface MapProps {
  restaurants: RestaurantSearchResult[];
  isLoading?: boolean;
}

function UpdateMapView({ restaurants }: { restaurants: RestaurantSearchResult[] }) {
  const map = useMap();

  useEffect(() => {
    if (!restaurants.length) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }
    const bounds = L.latLngBounds(
      restaurants.map((r) => [r.location.lat, r.location.lng] as [number, number]),
    );
    map.fitBounds(bounds.pad(0.3));
  }, [map, restaurants]);

  return null;
}

export default function RestaurantMap({ restaurants, isLoading }: MapProps) {
  const radius = restaurants.length ? 1200 : 800;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <Circle
        center={DEFAULT_CENTER}
        radius={radius}
        pathOptions={{ color: "#ff9f34", fillColor: "#ff9f34", fillOpacity: 0.1 }}
      />

      {!isLoading &&
        restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.location.lat, restaurant.location.lng]}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{restaurant.name}</p>
                <p className="text-neutral-600">{restaurant.address}</p>
                <p>⭐ {restaurant.rating.toFixed(1)}</p>
                <a
                  href={restaurant.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hungry-amber-700"
                >
                  Open in Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

      <UpdateMapView restaurants={restaurants} />
    </MapContainer>
  );
}

