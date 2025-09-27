// Client-side function to trigger restaurant popup
// This can be called by ElevenLabs or other external services

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

export interface RestaurantDisplayData {
  restaurants: RestaurantResult[];
  searchQuery?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Trigger the restaurant popup display
 * This function can be called from ElevenLabs or other external sources
 */
export function displayRestaurants(data: RestaurantDisplayData) {
  // Dispatch a custom event that the Layout component listens for
  const event = new CustomEvent("showRestaurants", {
    detail: {
      restaurants: data.restaurants,
      searchQuery: data.searchQuery,
      userLocation: data.userLocation,
    },
  });

  window.dispatchEvent(event);
}

/**
 * Global function that ElevenLabs can call directly
 * This makes the function available on the window object
 */
if (typeof window !== "undefined") {
  (window as any).displayRestaurants = displayRestaurants;

  // Also make it available under a more specific namespace
  (window as any).TasteBuds = {
    displayRestaurants,
    // Add other functions here as needed
  };
}

/**
 * Example usage from ElevenLabs or external service:
 *
 * // Option 1: Direct call
 * window.displayRestaurants({
 *   restaurants: [
 *     {
 *       id: "bella-vista-1",
 *       name: "Bella Vista Italian",
 *       rating: 4.5,
 *       cuisine: "Italian",
 *       address: "123 Main St, New York, NY",
 *       distance: "0.3 miles",
 *       latitude: 40.7128,
 *       longitude: -74.0060,
 *       image: "https://example.com/image.jpg",
 *       phone: "(555) 123-4567",
 *       website: "https://bellavista.com"
 *     }
 *   ],
 *   searchQuery: "Italian restaurants nearby"
 * });
 *
 * // Option 2: Using namespace
 * window.TasteBuds.displayRestaurants({ ... });
 */
