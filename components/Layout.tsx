"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionPanel } from "@/components/action-panel/ActionPanel";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { UnifiedVoiceChat } from "@/components/UnifiedVoiceChat";
import { useLocationPermission } from "@/lib/location";
import "@/lib/restaurant-display"; // This makes the global functions available
import {
  type ActiveFeature,
  type ChatMessage,
  FeatureIntent,
} from "@/lib/types";

type ConversationState = "idle" | "listening" | "processing" | "speaking";

export default function Layout() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hey there, I'm TasteBuds! 🍽️ Tell me what you're craving and we'll figure out something delicious together!",
      timestamp: Date.now(),
    },
  ]);
  const [conversationState, setConversationState] =
    useState<ConversationState>("idle");
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
  const [activeIntent, setActiveIntent] = useState<FeatureIntent | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const {
    permission: locationPermission,
    coordinates,
    requestPermission: requestLocation,
  } = useLocationPermission();

  const [featurePayload, setFeaturePayload] = useState<
    Record<string, unknown> | undefined
  >(undefined);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setActiveFeature(null);
  }, []);

  // Handle search results from voice chat
  const handleSearchResults = useCallback((results: any[]) => {
    setSearchResults(results);
    if (results.length > 0) {
      setActiveFeature("maps");
      setPanelOpen(true);
    }
  }, []);

  // Function to trigger restaurant panel (can be called by ElevenLabs webhook)
  const showRestaurantPanel = useCallback(
    (restaurants: any[], searchQuery?: string) => {
      // Convert restaurants to the format expected by RestaurantPanel
      const restaurantResults = restaurants.map((restaurant, index) => ({
        id: restaurant.id || `restaurant-${index}`,
        name: restaurant.name,
        rating: restaurant.rating || 4.0,
        cuisine: restaurant.cuisine || "Restaurant",
        address: restaurant.address,
        distance: restaurant.distance || "Unknown distance",
        location: {
          lat: restaurant.latitude,
          lng: restaurant.longitude,
        },
        placeUrl:
          restaurant.website ||
          `https://maps.google.com/?q=${encodeURIComponent(
            restaurant.address
          )}`,
        image: restaurant.image,
      }));

      // Set up the restaurant panel
      setFeaturePayload({
        type: "maps",
        stage: "results",
        results: restaurantResults,
        cuisine: searchQuery || "restaurants",
      });
      setActiveFeature("maps");
      setActiveIntent("restaurant:results");
      setPanelOpen(true);
    },
    []
  );

  // Listen for restaurant display events (for ElevenLabs integration)
  useEffect(() => {
    const handleRestaurantDisplay = (event: CustomEvent) => {
      const { restaurants, searchQuery } = event.detail;
      showRestaurantPanel(restaurants, searchQuery);
    };

    window.addEventListener("showRestaurants" as any, handleRestaurantDisplay);

    return () => {
      window.removeEventListener(
        "showRestaurants" as any,
        handleRestaurantDisplay
      );
    };
  }, [showRestaurantPanel]);

  // Poll for restaurant data from the display endpoint
  useEffect(() => {
    let lastRestaurantTimestamp = 0;
    let lastBookingTimestamp = 0;
    let lastRecipeTimestamp = 0;
    let pollInterval: NodeJS.Timeout;

    const pollForData = async () => {
      try {
        // Poll for restaurant data
        const restaurantResponse = await fetch(
          `/api/restaurants/poll?since=${lastRestaurantTimestamp}`
        );
        const restaurantResult = await restaurantResponse.json();

        if (
          restaurantResult.success &&
          restaurantResult.hasNewData &&
          restaurantResult.data
        ) {
          const { restaurants, searchQuery, timestamp } = restaurantResult.data;
          lastRestaurantTimestamp = timestamp;
          showRestaurantPanel(restaurants, searchQuery);
        }

        // Poll for booking data
        const bookingResponse = await fetch(
          `/api/restaurants/booking/poll?since=${lastBookingTimestamp}`
        );
        const bookingResult = await bookingResponse.json();

        if (
          bookingResult.success &&
          bookingResult.hasNewData &&
          bookingResult.data
        ) {
          const { bookings, timestamp, searchQuery } = bookingResult.data;
          lastBookingTimestamp = timestamp;

          // Set up the booking panel using ActionPanel
          setFeaturePayload({
            type: "booking",
            bookings: bookings,
            searchQuery: searchQuery || "Restaurant booking",
          });
          setActiveFeature("booking");
          setPanelOpen(true);
        }

        // Poll for recipe data
        const recipeResponse = await fetch(
          `/api/recipes/poll?since=${lastRecipeTimestamp}`
        );
        const recipeResult = await recipeResponse.json();

        if (
          recipeResult.success &&
          recipeResult.hasNewData &&
          recipeResult.data
        ) {
          const { recipes, timestamp, searchQuery } = recipeResult.data;
          lastRecipeTimestamp = timestamp;

          // Set up the recipe panel using ActionPanel
          setFeaturePayload({
            type: "recipe-detail",
            recipes: recipes,
            searchQuery: searchQuery || "Recipe search",
          });
          setActiveFeature("recipe-detail");
          setPanelOpen(true);
        }
      } catch (error) {
        console.error("Error polling for data:", error);
      }
    };

    // Start polling every 2 seconds
    pollInterval = setInterval(pollForData, 2000);

    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [showRestaurantPanel]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-1/4 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-orange-600/30 to-red-600/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-red-500/20 to-orange-400/15 blur-3xl" />
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        messages={messages}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Brand */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-white">
                      TasteBuds
                    </h1>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Location Status */}
                <div className="hidden items-center gap-2 rounded-md bg-slate-800/60 px-2.5 py-1.5 text-xs md:flex">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      locationPermission === "granted"
                        ? "bg-emerald-400"
                        : locationPermission === "loading"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-slate-300">
                    {locationPermission === "granted"
                      ? "Located"
                      : locationPermission === "loading"
                      ? "Locating..."
                      : "No location"}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="inline-flex items-center gap-2 rounded-md bg-slate-800/60 px-3 py-2 text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      conversationState === "listening"
                        ? "bg-red-400 animate-pulse"
                        : conversationState === "processing"
                        ? "bg-amber-400 animate-pulse"
                        : conversationState === "speaking"
                        ? "bg-blue-400 animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-slate-300 text-xs">
                    {conversationState === "listening"
                      ? "Listening..."
                      : conversationState === "processing"
                      ? "Processing..."
                      : conversationState === "speaking"
                      ? "Speaking..."
                      : "Ready"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <div className="h-full p-6">
                  <UnifiedVoiceChat
                    messages={messages}
                    setMessages={setMessages}
                    setConversationState={setConversationState}
                    conversationState={conversationState}
                    onSearchResults={handleSearchResults}
                  />
                </div>
              </div>
            </div>

            {/* Side Panel - Tips & Features */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5">
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <span className="text-orange-500">💡</span>
                  Try saying...
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🌮</span>
                    <span className="text-sm text-slate-300">
                      "Let's cook tacos tonight!"
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm text-slate-300">
                      "Find Italian restaurants nearby"
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <span className="text-xl">🛵</span>
                    <span className="text-sm text-slate-300">
                      "Order pizza for delivery"
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Request Card */}
              {locationPermission !== "granted" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-5"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📍</span>
                    </div>
                    <h3 className="font-medium text-white mb-2">
                      Enable Location
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Get personalized restaurant recommendations based on your
                      location
                    </p>
                    <button
                      onClick={requestLocation}
                      disabled={locationPermission === "loading"}
                      className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 px-4 py-2.5 text-sm font-medium text-white transition-colors"
                    >
                      {locationPermission === "loading"
                        ? "Requesting..."
                        : "Allow Location"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Action Panel */}
      <ActionPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        activeFeature={activeFeature}
        featurePayload={featurePayload}
        setFeaturePayload={setFeaturePayload}
        setActiveIntent={setActiveIntent}
        userLocation={coordinates}
      />
    </div>
  );
}
