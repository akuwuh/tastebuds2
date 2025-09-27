"use client";

import { motion } from "framer-motion";
import type { RestaurantSearchResult } from "@/lib/types";

interface RestaurantCardProps {
  restaurant: RestaurantSearchResult;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <motion.article
      className="flex flex-col gap-2 rounded-2xl bg-white/5 p-5 shadow-lg"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">
          {restaurant.name}
        </h4>
        <span className="text-sm font-medium text-hungry-amber-300">
          ⭐ {restaurant.rating.toFixed(1)}
        </span>
      </div>
      <p className="text-sm text-white/60">{restaurant.address}</p>
      <p className="text-sm text-white/80">{restaurant.reviewSummary}</p>
      <a
        href={restaurant.placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-hungry-amber-300 transition hover:text-hungry-amber-100"
      >
        Get Directions
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            d="m11 17 5-5-5-5M6 12h10"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </motion.article>
  );
}

