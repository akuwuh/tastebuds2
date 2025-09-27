"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { RecipeSearchResult } from "@/lib/types";

interface RecipeCardProps {
  recipe: RecipeSearchResult;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <motion.article
      className="flex h-full flex-col overflow-hidden rounded-2xl bg-neutral-900/80 shadow-lg shadow-black/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={recipe.image || "/vercel.svg"}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
        <h4 className="text-base font-semibold text-white line-clamp-2">
          {recipe.title}
        </h4>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          {recipe.source}
        </p>
        <div className="mt-auto">
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
          >
            View Recipe
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                d="M9 6h9m0 0v9m0-9L5 19"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

