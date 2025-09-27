import { NextResponse } from "next/server";
import { classifyIntent } from "@/lib/chat";
import type {
  ChatApiResponse,
  FeatureIntent,
  FeaturePayload,
  RecipeFeaturePayload,
  RestaurantFeaturePayload,
  OrderFeaturePayload,
} from "@/lib/types";

interface ChatRequestBody {
  message?: string;
  currentIntent?: FeatureIntent | null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;

  const userMessage = String(body.message ?? "").trim();

  if (!userMessage) {
    return NextResponse.json(
      {
        reply:
          "I’m all ears when you are! Tell me what you’re hungry for and we’ll dive in.",
      },
      { status: 200 },
    );
  }

  const classified = classifyIntent(userMessage);

  let reply =
    "That sounds delicious! What are you thinking of? I can help you cook, dine out, or even mock an order.";
  let intent = classified;
  let featurePayload: FeaturePayload | undefined;

  if (intent?.feature === "recipe") {
    reply = `Yum! What kind of dish are we dreaming up? I can search recipes for “${userMessage}.”`;
    featurePayload = {
      type: "recipe",
      query: userMessage,
    } satisfies RecipeFeaturePayload;
  } else if (intent?.feature === "maps") {
    // Determine stage based on clarifying questions
    if (!body.currentIntent || body.currentIntent === "restaurant:prompt") {
      reply =
        "Got it! What cuisine are you craving? I’ll pin some spots on the map for you.";
      intent = { intent: "restaurant:cuisine", feature: "maps" };
    } else if (body.currentIntent === "restaurant:cuisine") {
      reply =
        "Great choice! How far are you willing to go? For example, say ‘10-minute walk.’";
      intent = { intent: "restaurant:radius", feature: "maps" };
      featurePayload = {
        type: "maps",
        stage: "prompt",
        cuisine: userMessage,
      } satisfies RestaurantFeaturePayload;
    } else if (
      body.currentIntent === "restaurant:radius" ||
      body.currentIntent === "restaurant:results"
    ) {
      reply =
        "Perfect! Give me a moment to explore nearby gems and I’ll drop pins on the map.";
      intent = { intent: "restaurant:results", feature: "maps" };
      featurePayload = {
        type: "maps",
        stage: "searching",
        radius: parseRadius(userMessage),
      } satisfies RestaurantFeaturePayload;
    }
  } else if (intent?.feature === "order") {
    if (!body.currentIntent || body.currentIntent === "order:prompt") {
      reply =
        "Delivery mode activated! Tell me what cuisine you want and I’ll connect to our mock partners.";
      intent = { intent: "order:select", feature: "order" };
      featurePayload = {
        type: "order",
        stage: "prompt",
      } satisfies OrderFeaturePayload;
    } else if (body.currentIntent === "order:select") {
      reply =
        "Nice! I’ll fetch delivery-friendly spots. Just say the one that looks tasty.";
      intent = { intent: "order:menu", feature: "order" };
      featurePayload = {
        type: "order",
        stage: "restaurants",
      } satisfies OrderFeaturePayload;
    } else if (body.currentIntent === "order:menu") {
      reply =
        "Sounds good! Tell me what items catch your eye and I’ll add them to your cart.";
      intent = { intent: "order:cart", feature: "order" };
      featurePayload = {
        type: "order",
        stage: "menu",
      } satisfies OrderFeaturePayload;
    } else if (body.currentIntent === "order:cart") {
      reply =
        "Cart updated! Anything else before we wrap this mock order? Just say 'checkout' when you're ready.";
      intent = { intent: "order:cart", feature: "order" };
    }
  }

  const payload: ChatApiResponse = {
    reply,
    intent,
    featurePayload,
  };

  return NextResponse.json(payload, { status: 200 });
}

function parseRadius(input: string) {
  const matches = input.match(/(\d+)(?:\s*-?\s*(minute|min|mi|m|km|kilometer|kilometre|mile))/i);
  if (!matches) return 1609 * 0.5; // default ~0.5 miles
  const value = Number.parseInt(matches[1] ?? "10", 10);

  if (/km|kilometer|kilometre/i.test(matches[2] ?? "")) {
    return value * 1000;
  }

  return value * 1609; // convert minutes walking to meters approximately
}

