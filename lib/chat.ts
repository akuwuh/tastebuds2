import type { ChatApiResponse, ChatIntentResponse, FeatureIntent } from "@/lib/types";

const recipeKeywords = ["cook", "recipe", "make", "bake", "meal", "dish"];
const restaurantKeywords = [
  "eat out",
  "restaurant",
  "dinner",
  "place to eat",
  "spot",
  "go out",
];
const deliveryKeywords = ["order in", "delivery", "uber eats", "doordash", "grubhub"];

export async function fetchChatResponse(
  message: string,
  currentIntent: FeatureIntent | null,
): Promise<ChatApiResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, currentIntent }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const data = (await response.json()) as ChatApiResponse;
  return data;
}

export function classifyIntent(message: string): ChatIntentResponse | undefined {
  const lower = message.toLowerCase();

  if (recipeKeywords.some((keyword) => lower.includes(keyword))) {
    return { intent: "recipe:suggest", feature: "recipe" };
  }

  if (restaurantKeywords.some((keyword) => lower.includes(keyword))) {
    return { intent: "restaurant:prompt", feature: "maps" };
  }

  if (deliveryKeywords.some((keyword) => lower.includes(keyword))) {
    return { intent: "order:prompt", feature: "order" };
  }

  return undefined;
}

