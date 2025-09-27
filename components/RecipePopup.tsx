"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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

interface RecipePopupProps {
  recipes: RecipeData[];
  searchQuery?: string;
  dietary?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function RecipePopup({
  recipes,
  searchQuery,
  dietary,
  isOpen,
  onClose,
}: RecipePopupProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeData | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <span className="text-orange-500">👨‍🍳</span>
                  Recipe Collection
                </h2>
                <p className="text-slate-400 mt-1">
                  {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[600px]">
              {/* Recipe List */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {recipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedRecipe === recipe
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70"
                      }`}
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex gap-4">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {recipe.title}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                            {recipe.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              🍽️ {recipe.cuisine}
                            </span>
                            <span className="flex items-center gap-1">
                              ⏱️ {recipe.cookTime}
                            </span>
                            <span className="flex items-center gap-1">
                              👥 {recipe.servings}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full ${
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
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recipe Details */}
              <div className="w-1/2 border-l border-slate-700 p-6 overflow-y-auto">
                {selectedRecipe ? (
                  <div className="space-y-6">
                    <div>
                      <img
                        src={selectedRecipe.image}
                        alt={selectedRecipe.title}
                        className="w-full h-48 rounded-lg object-cover mb-4"
                      />
                      <h3 className="text-2xl font-semibold text-white mb-2">
                        {selectedRecipe.title}
                      </h3>
                      <p className="text-slate-300 mb-4">
                        {selectedRecipe.description}
                      </p>

                      {/* Recipe Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">⏱️ Prep:</span>
                            <span className="text-white">
                              {selectedRecipe.prepTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">🔥 Cook:</span>
                            <span className="text-white">
                              {selectedRecipe.cookTime}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">👥 Serves:</span>
                            <span className="text-white">
                              {selectedRecipe.servings}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">📊 Level:</span>
                            <span className="text-white">
                              {selectedRecipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Ingredients
                      </h4>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <span className="text-orange-500">•</span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Instructions
                      </h4>
                      <ol className="space-y-3">
                        {selectedRecipe.instructions.map((instruction, idx) => (
                          <li
                            key={idx}
                            className="flex gap-3 text-sm text-slate-300"
                          >
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Nutrition */}
                    {selectedRecipe.nutrition && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Nutrition (per serving)
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-slate-400">Calories</div>
                            <div className="text-white font-medium">
                              {selectedRecipe.nutrition.calories}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-slate-400">Protein</div>
                            <div className="text-white font-medium">
                              {selectedRecipe.nutrition.protein}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-slate-400">Carbs</div>
                            <div className="text-white font-medium">
                              {selectedRecipe.nutrition.carbs}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-slate-400">Fat</div>
                            <div className="text-white font-medium">
                              {selectedRecipe.nutrition.fat}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">👨‍🍳</span>
                      </div>
                      <p className="text-slate-400">
                        Select a recipe to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
