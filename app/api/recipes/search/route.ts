import { NextRequest, NextResponse } from "next/server";

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

export interface RecipeSearchRequest {
  recipes: RecipeData[];
  searchQuery?: string;
  dietary?: string[]; // ["vegetarian", "gluten-free", etc.]
}

export async function POST(request: NextRequest) {
  try {
    const body: RecipeSearchRequest = await request.json();
    console.log("Recipe search request received:", body);

    // Validate the request
    if (!body.recipes || !Array.isArray(body.recipes)) {
      return NextResponse.json(
        { error: "Invalid request: recipes array is required" },
        { status: 400 }
      );
    }

    // Validate each recipe has required fields
    for (const recipe of body.recipes) {
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        return NextResponse.json(
          {
            error:
              "Invalid recipe data: title, ingredients, and instructions are required",
          },
          { status: 400 }
        );
      }
    }

    // Process recipes and add missing data
    const processedRecipes = body.recipes.map((recipe, index) => ({
      ...recipe,
      id: recipe.id || `recipe-${index}`,
      description: recipe.description || "Delicious homemade recipe",
      cuisine: recipe.cuisine || "International",
      difficulty: recipe.difficulty || "Medium",
      cookTime: recipe.cookTime || "30 mins",
      prepTime: recipe.prepTime || "15 mins",
      servings: recipe.servings || 4,
      image:
        recipe.image ||
        `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop`,
      nutrition: recipe.nutrition || {
        calories: 350,
        protein: "15g",
        carbs: "45g",
        fat: "12g",
      },
      tags: recipe.tags || ["homemade", "comfort-food"],
    }));

    // Store the recipe data
    const recipeData = {
      recipes: processedRecipes,
      searchQuery: body.searchQuery,
      dietary: body.dietary,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    // Store in global memory
    if (!global.recipeDisplayQueue) {
      global.recipeDisplayQueue = [];
    }
    global.recipeDisplayQueue.push(recipeData);

    // Clean up old entries
    if (global.recipeDisplayQueue.length > 10) {
      global.recipeDisplayQueue = global.recipeDisplayQueue.slice(-10);
    }

    console.log("Stored recipe data for display:", {
      id: recipeData.id,
      recipeCount: processedRecipes.length,
      searchQuery: body.searchQuery,
      dietary: body.dietary,
    });

    return NextResponse.json({
      success: true,
      message: "Recipe data received and queued for display",
      data: {
        id: recipeData.id,
        recipes: processedRecipes,
        searchQuery: body.searchQuery,
        dietary: body.dietary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing recipe search request:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
