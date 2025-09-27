import { NextRequest, NextResponse } from "next/server";
import type {
  DeliveryRestaurant,
  RestaurantSearchResult,
} from "@/lib/types";
import { summarizeReviewSnippets } from "@/lib/summarize";
import { randomBetween } from "@/lib/utils";

const PLACES_API = "https://maps.googleapis.com/maps/api/place/textsearch/json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cuisine = searchParams.get("cuisine") ?? "restaurant";
  const location = searchParams.get("location") ?? "San Francisco";
  const radius = searchParams.get("radius") ?? "1500";
  const delivery = searchParams.get("delivery") === "true";

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Google Maps API key is not configured. Set GOOGLE_MAPS_API_KEY.",
      },
      { status: 500 },
    );
  }

  try {
    const textQuery = `${cuisine} restaurants ${location}`;
    const response = await fetch(
      `${PLACES_API}?query=${encodeURIComponent(textQuery)}&radius=${radius}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Places API failed with status ${response.status}`);
    }

    const places = (await response.json()) as {
      results?: Array<{
        place_id?: string;
        name?: string;
        formatted_address?: string;
        rating?: number;
        user_ratings_total?: number;
        geometry?: { location?: { lat?: number; lng?: number } };
        photos?: Array<{ photo_reference?: string }>;
      }>;
    };

    const topResults = (places.results ?? []).slice(0, 5);

    const enrichedResults: RestaurantSearchResult[] = [];

    for (const result of topResults) {
      const reviewQuery = `${result.name ?? "restaurant"} reviews reddit`;
      const reviewResponse = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(reviewQuery)}&key=${apiKey}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID ?? ""}`,
      );

      let reviewSummary = "Reviews coming right up!";

      if (reviewResponse.ok) {
        const reviewData = (await reviewResponse.json()) as {
          items?: Array<{ snippet?: string }>;
        };

        const snippets = (reviewData.items ?? [])
          .slice(0, 4)
          .map((item) => item.snippet ?? "");

        reviewSummary = summarizeReviewSnippets(snippets);
      }

      enrichedResults.push({
        id: result.place_id ?? crypto.randomUUID(),
        name: result.name ?? "Unknown Restaurant",
        address: result.formatted_address ?? "Address unavailable",
        rating: result.rating ?? 4.2,
        userRatingsTotal: result.user_ratings_total ?? 100,
        location: {
          lat: result.geometry?.location?.lat ?? 37.7749,
          lng: result.geometry?.location?.lng ?? -122.4194,
        },
        reviewSummary,
        placeUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
      });
    }

    if (delivery) {
      const deliveryResults: DeliveryRestaurant[] = enrichedResults.map((restaurant) => ({
        ...restaurant,
        etaMinutes: randomBetween(20, 55),
        deliveryFee: `$${(randomBetween(0, 599) / 100).toFixed(2)}`,
      }));

      return NextResponse.json(deliveryResults, { status: 200 });
    }

    console.log(enrichedResults);
    return NextResponse.json(enrichedResults, { status: 200 });
  } catch (error) {
    console.error("Restaurant search error", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant results" },
      { status: 500 },
    );
  }
}

