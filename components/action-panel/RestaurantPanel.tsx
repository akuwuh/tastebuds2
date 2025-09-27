"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  RestaurantFeaturePayload,
  RestaurantSearchResult,
} from "@/lib/types";
import type { LocationCoordinates } from "@/lib/location";
import { shimmerClassName } from "@/lib/ui";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";

const Map = dynamic(() => import("@/components/restaurants/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div
      className={`h-64 w-full rounded-2xl ${shimmerClassName}`}
      aria-hidden
    />
  ),
});

interface RestaurantPanelProps {
  payload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
  userLocation?: LocationCoordinates | null;
}

export function RestaurantPanel({
  payload,
  setFeaturePayload,
  userLocation,
}: RestaurantPanelProps) {
  const featurePayload = payload as RestaurantFeaturePayload | undefined;
  const [results, setResults] = useState<RestaurantSearchResult[]>(
    featurePayload?.results ?? []
  );
  const [isLoading, setIsLoading] = useState(
    featurePayload ? featurePayload.stage !== "results" : true
  );

  const cuisine = featurePayload?.cuisine ?? "food";
  const radiusMeters = featurePayload?.radius ?? 1609;

  const radiusText = useMemo(() => {
    const miles = radiusMeters / 1609;
    const formattedMiles = Number.isFinite(miles)
      ? Number.parseFloat(miles.toFixed(1))
      : 1;
    const clampedMiles = Math.max(0.25, formattedMiles);
    return `${clampedMiles.toFixed(1)} mi radius`;
  }, [radiusMeters]);

  useEffect(() => {
    if (!featurePayload || featurePayload.stage !== "searching") return;

    const controller = new AbortController();

    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);

        // Use user location if available, otherwise default to San Francisco
        const locationParam = userLocation
          ? `${userLocation.latitude},${userLocation.longitude}`
          : "San Francisco";

        const response = await fetch(
          `/api/search/restaurants?cuisine=${encodeURIComponent(
            cuisine
          )}&radius=${radiusMeters}&location=${encodeURIComponent(
            locationParam
          )}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch restaurant results");
        }
        const data = (await response.json()) as RestaurantSearchResult[];
        setResults(data);
        setFeaturePayload({
          ...featurePayload,
          stage: "results",
          results: data,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRestaurants();

    return () => {
      controller.abort();
    };
  }, [featurePayload, cuisine, radiusMeters, setFeaturePayload, userLocation]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/40">
            Let’s Eat Out
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Mapping {cuisine} spots nearby
          </h3>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">
          {radiusText}
        </span>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          className="h-64 overflow-hidden rounded-2xl bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Map
            restaurants={results}
            isLoading={isLoading}
            userLocation={userLocation}
          />
        </motion.div>

        <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-24 rounded-2xl ${shimmerClassName}`}
                />
              ))}
            </div>
          ) : (
            results.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
