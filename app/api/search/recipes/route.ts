import { NextRequest, NextResponse } from "next/server";
import type { RecipeSearchResult } from "@/lib/types";

const GOOGLE_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

export async function GET(request: NextRequest) {
  const dishName = request.nextUrl.searchParams.get("dishName");

  if (!dishName) {
    return NextResponse.json(
      { error: "Missing dishName parameter" },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    return NextResponse.json(
      {
        error:
          "Google Search API credentials are not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID.",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${GOOGLE_SEARCH_URL}?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(`${dishName} recipe`)}&num=5`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error(`Google Search API failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      items?: Array<{
        title?: string;
        link?: string;
        snippet?: string;
        pagemap?: {
          cse_image?: Array<{ src?: string }>;
          metatags?: Array<Record<string, string>>;
        };
      }>;
    };

    const results: RecipeSearchResult[] = (data.items ?? [])
      .slice(0, 3)
      .map((item) => ({
        title: item.title ?? "Delicious Recipe",
        url: item.link ?? "https://www.google.com/search?q=recipes",
        image:
          item.pagemap?.cse_image?.[0]?.src ??
          item.pagemap?.metatags?.[0]?.["og:image"] ??
          "/vercel.svg",
        source: new URL(item.link ?? "https://example.com").hostname.replace("www.", ""),
      }));

    console.log(results);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Recipe search error", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe results" },
      { status: 500 },
    );
  }
}

