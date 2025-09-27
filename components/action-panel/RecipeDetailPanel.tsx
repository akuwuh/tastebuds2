"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface RecipeData {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cookTime: string;
  prepTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  tags?: string[];
}

interface RecipeDetailPanelProps {
  payload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
}

export function RecipeDetailPanel({ payload }: RecipeDetailPanelProps) {
  const recipes = (payload?.recipes as RecipeData[]) || [];
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(
    recipes[0] || null
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/40">
            Recipe Collection
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Let's start cooking!
          </h3>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recipe List */}
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${
                selectedRecipe === recipe
                  ? "bg-orange-500/20 border border-orange-500/40"
                  : "bg-white/5 hover:bg-white/10"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="flex gap-3">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 text-sm">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                    <span>🍽️ {recipe.cuisine}</span>
                    <span>⏱️ {recipe.cookTime}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        recipe.difficulty === "Easy"
                          ? "bg-green-500/20 text-green-400"
                          : recipe.difficulty === "Medium"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recipe Details */}
        <div className="rounded-2xl bg-white/5 p-6">
          {selectedRecipe ? (
            <div className="space-y-4">
              <div>
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-32 rounded-xl object-cover mb-3"
                />
                <h4 className="text-lg font-semibold text-white mb-2">
                  {selectedRecipe.title}
                </h4>

                {/* Recipe Info */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-white/40 uppercase tracking-wide">
                      Prep Time
                    </div>
                    <div className="text-white">{selectedRecipe.prepTime}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40 uppercase tracking-wide">
                      Cook Time
                    </div>
                    <div className="text-white">{selectedRecipe.cookTime}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40 uppercase tracking-wide">
                      Servings
                    </div>
                    <div className="text-white">{selectedRecipe.servings}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40 uppercase tracking-wide">
                      Difficulty
                    </div>
                    <div className="text-white">
                      {selectedRecipe.difficulty}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h5 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">
                  Ingredients
                </h5>
                <ul className="space-y-1 text-sm text-white/80">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-orange-500 text-xs">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nutrition */}
              {selectedRecipe.nutrition && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">
                    Nutrition
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/40">Calories</div>
                      <div className="text-white font-medium">
                        {selectedRecipe.nutrition.calories}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/40">Protein</div>
                      <div className="text-white font-medium">
                        {selectedRecipe.nutrition.protein}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <p className="text-white/60 text-sm">
                  Select a recipe to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
