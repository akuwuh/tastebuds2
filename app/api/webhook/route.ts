import { NextRequest, NextResponse } from "next/server";

// Interface for simplified restaurant data from ElevenLabs
// This matches the key-value pairs: cuisine, address, distance
export interface SimpleRestaurantData {
  name: string;
  cuisine: string;
  address: string;
  distance: string;
  rating?: number;
  phone?: string;
  website?: string;
  image?: string;
}

export interface WebhookRestaurantRequest {
  restaurants: SimpleRestaurantData[];
  searchQuery?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  // Support for raw array format
  data?: SimpleRestaurantData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookRestaurantRequest = await request.json();
    console.log("Webhook received:", body);

    // Support both 'restaurants' and 'data' fields for flexibility
    const restaurantsArray = body.restaurants || body.data || [];

    // Validate that we have restaurants array
    if (!Array.isArray(restaurantsArray) || restaurantsArray.length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid request: restaurants array is required (use 'restaurants' or 'data' field)",
        },
        { status: 400 }
      );
    }

    // Validate each restaurant has required fields (cuisine, address, distance)
    for (const restaurant of restaurantsArray) {
      if (
        !restaurant.name ||
        !restaurant.cuisine ||
        !restaurant.address ||
        !restaurant.distance
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid restaurant data: name, cuisine, address, and distance are required",
          },
          { status: 400 }
        );
      }
    }

    // Process restaurants and add missing data
    const processedRestaurants = await Promise.all(
      restaurantsArray.map(async (restaurant, index) => {
        // Try to geocode the address to get coordinates
        let latitude = 40.7128; // Default to NYC
        let longitude = -74.006;

        try {
          // Simple geocoding using Nominatim (OpenStreetMap)
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              restaurant.address
            )}&limit=1`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData && geocodeData[0]) {
            latitude = parseFloat(geocodeData[0].lat);
            longitude = parseFloat(geocodeData[0].lon);
          }
        } catch (error) {
          console.warn("Geocoding failed for:", restaurant.address, error);
        }

        return {
          id: `restaurant-${index}`,
          name: restaurant.name,
          rating: restaurant.rating || 4.0,
          cuisine: restaurant.cuisine,
          address: restaurant.address,
          distance: restaurant.distance,
          latitude,
          longitude,
          image:
            restaurant.image ||
            `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop`,
          phone: restaurant.phone,
          website: restaurant.website,
          location: {
            lat: latitude,
            lng: longitude,
          },
          placeUrl:
            restaurant.website ||
            `https://maps.google.com/?q=${encodeURIComponent(
              restaurant.address
            )}`,
        };
      })
    );

    // Generate JavaScript to trigger the restaurant display
    const triggerScript = `
      if (typeof window !== 'undefined' && window.displayRestaurants) {
        window.displayRestaurants({
          restaurants: ${JSON.stringify(processedRestaurants)},
          searchQuery: ${JSON.stringify(
            body.searchQuery || "Restaurant search results"
          )},
          userLocation: ${JSON.stringify(body.userLocation)}
        });
      }
    `;

    console.log("Processed restaurants:", {
      count: processedRestaurants.length,
      searchQuery: body.searchQuery,
      userLocation: body.userLocation,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant data processed successfully",
        data: {
          restaurants: processedRestaurants,
          searchQuery: body.searchQuery,
          userLocation: body.userLocation,
          triggerScript,
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);

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
