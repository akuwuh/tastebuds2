"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeSearchResult } from "@/lib/types";
import { shimmerClassName } from "@/lib/ui";

interface RecipePanelProps {
  payload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
}

export function RecipePanel({ payload, setFeaturePayload }: RecipePanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("chef’s kiss meals");

  useEffect(() => {
    if (!payload || typeof payload.query !== "string") {
      setSearchTerm("comfort food");
      setIsLoading(false);
      return;
    }

    setSearchTerm(payload.query);

    const controller = new AbortController();

    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/search/recipes?dishName=${encodeURIComponent(payload.query as string)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = (await response.json()) as RecipeSearchResult[];
        setResults(data);
        setFeaturePayload({ query: payload.query, results: data });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRecipes();

    return () => {
      controller.abort();
    };
  }, [payload, setFeaturePayload]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.35em] text-white/40">
          Let’s Cook
        </p>
        <h3 className="text-2xl font-semibold text-white">
          Searching for the best {searchTerm} recipes…
        </h3>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5">
        {isLoading ? (
          <div className="space-y-6">
            <motion.div
              className={`h-12 w-3/4 rounded-full ${shimmerClassName}`}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-36 rounded-2xl ${shimmerClassName}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {results.map((recipe) => (
              <RecipeCard key={recipe.url} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

