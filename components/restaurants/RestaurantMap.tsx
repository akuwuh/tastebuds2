"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { RestaurantSearchResult } from "@/lib/types";
import type { LocationCoordinates } from "@/lib/location";

const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194];

interface MapProps {
  restaurants: RestaurantSearchResult[];
  isLoading?: boolean;
  userLocation?: LocationCoordinates | null;
}

function UpdateMapView({
  restaurants,
  userLocation,
}: {
  restaurants: RestaurantSearchResult[];
  userLocation?: LocationCoordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    const center = userLocation
      ? ([userLocation.latitude, userLocation.longitude] as [number, number])
      : DEFAULT_CENTER;

    if (!restaurants.length) {
      map.setView(center, 13);
      return;
    }

    const allPoints = [
      ...restaurants.map(
        (r) => [r.location.lat, r.location.lng] as [number, number]
      ),
      ...(userLocation
        ? [[userLocation.latitude, userLocation.longitude] as [number, number]]
        : []),
    ];

    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds.pad(0.3));
  }, [map, restaurants, userLocation]);

  return null;
}

export default function RestaurantMap({
  restaurants,
  isLoading,
  userLocation,
}: MapProps) {
  const radius = restaurants.length ? 1200 : 800;
  const center = userLocation
    ? ([userLocation.latitude, userLocation.longitude] as [number, number])
    : DEFAULT_CENTER;

  // Create custom icons
  const restaurantIcon = L.divIcon({
    html: `<div style="background: linear-gradient(135deg, #ff4757, #ff6b35); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);">🍽️</div>`,
    className: "custom-restaurant-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const userIcon = L.divIcon({
    html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);">📍</div>`,
    className: "custom-user-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-orange-500/20">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Search radius circle */}
        <Circle
          center={center}
          radius={radius}
          pathOptions={{
            color: "#ff6b35",
            fillColor: "#ff4757",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "5, 5",
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-sm font-medium text-green-600">
                📍 Your Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant markers */}
        {!isLoading &&
          restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.location.lat, restaurant.location.lng]}
              icon={restaurantIcon}
            >
              <Popup>
                <div className="space-y-2 text-sm min-w-[200px]">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🍽️</span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {restaurant.name}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {restaurant.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href={restaurant.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-red-600 hover:to-orange-600 transition-all"
                  >
                    Open in Maps 🗺️
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

        <UpdateMapView restaurants={restaurants} userLocation={userLocation} />
      </MapContainer>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-xl rounded-xl p-4 text-white text-center">
            <div className="text-2xl mb-2 bounce-gentle">🔍</div>
            <p className="font-medium">Finding delicious spots...</p>
          </div>
        </div>
      )}
    </div>
  );
}
