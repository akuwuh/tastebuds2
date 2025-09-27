import { NextRequest, NextResponse } from "next/server";

export interface RestaurantResult {
  id?: string;
  name: string;
  rating: number;
  cuisine: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  image?: string;
  phone?: string;
  website?: string;
  priceLevel?: string;
}

export interface RestaurantDisplayRequest {
  restaurants: RestaurantResult[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  searchQuery?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RestaurantDisplayRequest = await request.json();

    // Validate the request
    if (!body.restaurants || !Array.isArray(body.restaurants)) {
      return NextResponse.json(
        { error: "Invalid request: restaurants array is required" },
        { status: 400 }
      );
    }

    // Validate each restaurant has required fields
    for (const restaurant of body.restaurants) {
      if (!restaurant.name || !restaurant.latitude || !restaurant.longitude) {
        return NextResponse.json(
          {
            error:
              "Invalid restaurant data: name, latitude, and longitude are required",
          },
          { status: 400 }
        );
      }
    }

    // Process restaurants and add default values
    const processedRestaurants = body.restaurants.map((restaurant, index) => ({
      ...restaurant,
      // Add ID if not provided
      id: restaurant.id || `restaurant-${index}`,
      // Add default image if none provided
      image:
        restaurant.image ||
        `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop`,
      // Ensure rating is a number
      rating: typeof restaurant.rating === "number" ? restaurant.rating : 4.0,
      // Add default cuisine if none provided
      cuisine: restaurant.cuisine || "Restaurant",
      // Add default distance if none provided
      distance: restaurant.distance || "Unknown distance",
    }));

    console.log("Received restaurant display request:", {
      restaurantCount: processedRestaurants.length,
      userLocation: body.userLocation,
      searchQuery: body.searchQuery,
    });

    // Store the restaurant data in a way the frontend can access it
    // In a production app, you'd use Redis, database, or WebSockets
    // For now, we'll use a simple in-memory store with timestamps
    const restaurantData = {
      restaurants: processedRestaurants,
      userLocation: body.userLocation,
      searchQuery: body.searchQuery,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    // Store in global memory (in production, use proper storage)
    if (!global.restaurantDisplayQueue) {
      global.restaurantDisplayQueue = [];
    }
    global.restaurantDisplayQueue.push(restaurantData);

    // Clean up old entries (keep only last 10)
    if (global.restaurantDisplayQueue.length > 10) {
      global.restaurantDisplayQueue = global.restaurantDisplayQueue.slice(-10);
    }

    console.log("Stored restaurant data for display:", {
      id: restaurantData.id,
      restaurantCount: processedRestaurants.length,
      searchQuery: body.searchQuery,
      userLocation: body.userLocation,
    });

    // Return success with the data ID
    return NextResponse.json({
      success: true,
      message: "Restaurant data received and queued for display",
      data: {
        id: restaurantData.id,
        restaurants: processedRestaurants,
        userLocation: body.userLocation,
        searchQuery: body.searchQuery,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing restaurant display request:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle CORS for ElevenLabs requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
