import { NextRequest, NextResponse } from "next/server";

// Test endpoint to demonstrate how ElevenLabs can trigger the restaurant popup
export async function POST(request: NextRequest) {
  try {
    // This endpoint returns HTML/JavaScript that can trigger the popup
    // ElevenLabs can call this endpoint and execute the returned script

    const mockRestaurants = [
      {
        id: "bella-vista-1",
        name: "Bella Vista Italian",
        rating: 4.5,
        cuisine: "Italian",
        address: "123 Main St, New York, NY 10001",
        distance: "0.3 miles",
        latitude: 40.7128,
        longitude: -74.006,
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop",
        phone: "(555) 123-4567",
        website: "https://bellavista-italian.com",
      },
      {
        id: "sakura-sushi-2",
        name: "Sakura Sushi",
        rating: 4.7,
        cuisine: "Japanese",
        address: "456 Oak Ave, New York, NY 10002",
        distance: "0.5 miles",
        latitude: 40.715,
        longitude: -74.007,
        image:
          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop",
        phone: "(555) 987-6543",
        website: "https://sakura-sushi.com",
      },
      {
        id: "taco-libre-3",
        name: "Taco Libre",
        rating: 4.3,
        cuisine: "Mexican",
        address: "789 Pine St, New York, NY 10003",
        distance: "0.7 miles",
        latitude: 40.71,
        longitude: -74.005,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
        phone: "(555) 456-7890",
        website: "https://taco-libre.com",
      },
    ];

    // Return JavaScript that will trigger the popup
    const script = `
      // Check if the displayRestaurants function is available
      if (typeof window.displayRestaurants === 'function') {
        window.displayRestaurants({
          restaurants: ${JSON.stringify(mockRestaurants)},
          searchQuery: "Italian restaurants nearby",
          userLocation: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        });
      } else if (typeof window.TasteBuds?.displayRestaurants === 'function') {
        window.TasteBuds.displayRestaurants({
          restaurants: ${JSON.stringify(mockRestaurants)},
          searchQuery: "Italian restaurants nearby",
          userLocation: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        });
      } else {
        console.error('TasteBuds restaurant display function not available');
      }
    `;

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in test display endpoint:", error);

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
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
