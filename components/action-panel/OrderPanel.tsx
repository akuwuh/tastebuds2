"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type {
  DeliveryRestaurant,
  MockCartItem,
  MockMenuItem,
  OrderFeaturePayload,
} from "@/lib/types";
import { shimmerClassName } from "@/lib/ui";
import { formatCurrency } from "@/lib/utils";

interface OrderPanelProps {
  payload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
}

const mockMenu: MockMenuItem[] = [
  {
    id: "app-1",
    name: "Crispy Gyoza",
    description: "Golden potstickers with chili-soy dipping sauce",
    price: 9,
    category: "Small Plates",
  },
  {
    id: "main-1",
    name: "Miso Glazed Salmon",
    description: "Grilled salmon, jasmine rice, charred broccolini",
    price: 18,
    category: "Mains",
  },
  {
    id: "main-2",
    name: "Truffle Mushroom Ramen",
    description: "Shoyu broth, wild mushrooms, soft-boiled egg",
    price: 16,
    category: "Mains",
  },
  {
    id: "dessert-1",
    name: "Matcha Cheesecake",
    description: "Silky matcha cheesecake with sesame brittle",
    price: 8,
    category: "Desserts",
  },
];

export function OrderPanel({ payload, setFeaturePayload }: OrderPanelProps) {
  const featurePayload = payload as OrderFeaturePayload | undefined;

  const [restaurants, setRestaurants] = useState<DeliveryRestaurant[]>(
    featurePayload?.restaurants ?? [],
  );
  const [selectedRestaurant, setSelectedRestaurant] = useState<DeliveryRestaurant | undefined>(
    featurePayload?.selectedRestaurant,
  );
  const [cart, setCart] = useState<MockCartItem[]>(featurePayload?.cart ?? []);
  const [stage, setStage] = useState<OrderFeaturePayload["stage"]>(
    featurePayload?.stage ?? "prompt",
  );
  const [isLoading, setIsLoading] = useState(stage === "prompt");

  useEffect(() => {
    if (!featurePayload || featurePayload.stage !== "restaurants") return;

    const controller = new AbortController();

    const fetchDeliveryRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/search/restaurants?delivery=true&cuisine=${encodeURIComponent(
            featurePayload.selectedRestaurant?.name ?? "delivery",
          )}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch delivery options");
        }
        const data = (await response.json()) as DeliveryRestaurant[];
        setRestaurants(data);
        setFeaturePayload({
          type: "order",
          stage: "restaurants",
          restaurants: data,
        });
        setStage("restaurants");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDeliveryRestaurants();

    return () => {
      controller.abort();
    };
  }, [featurePayload, setFeaturePayload]);

  useEffect(() => {
    if (!featurePayload || featurePayload.stage !== "menu") return;
    setStage("menu");
    setSelectedRestaurant(featurePayload.selectedRestaurant);
    setRestaurants(featurePayload.restaurants ?? []);
    setIsLoading(false);
  }, [featurePayload]);

  useEffect(() => {
    if (!featurePayload || featurePayload.stage !== "cart") return;
    setStage("cart");
    setCart(featurePayload.cart ?? []);
  }, [featurePayload]);

  useEffect(() => {
    if (!featurePayload || featurePayload.stage !== "confirmation") return;
    setStage("confirmation");
    confetti({ zIndex: 200, particleCount: 120, spread: 60, origin: { y: 0.9 } });
  }, [featurePayload]);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-white/40">
          Let’s Order In
        </p>
        <h3 className="text-2xl font-semibold text-white">
          {stage === "prompt"
            ? "Connecting to delivery partners…"
            : stage === "restaurants"
              ? "Delivery-ready restaurants"
              : stage === "menu"
                ? selectedRestaurant?.name ?? "Select a restaurant"
                : stage === "cart"
                  ? "Your mock order"
                  : "Mock Order Complete!"}
        </h3>
      </header>

      {stage === "prompt" && (
        <motion.div
          className="rounded-2xl bg-white/5 p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-white/70">
              Connecting to <span className="text-white">Uber Eats</span> and
              <span className="text-white"> DoorDash</span>…
            </p>
            <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
              <span>Uber Eats</span>
              <span>DoorDash</span>
            </div>
          </div>
        </motion.div>
      )}

      {stage === "restaurants" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={`h-24 rounded-2xl ${shimmerClassName}`} />
              ))}
            </div>
          ) : (
            restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setStage("menu");
                  setFeaturePayload({
                    type: "order",
                    stage: "menu",
                    selectedRestaurant: restaurant,
                    restaurants,
                  });
                }}
                className="w-full rounded-2xl bg-white/10 p-5 text-left text-white transition hover:bg-white/15"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{restaurant.name}</p>
                    <p className="text-sm text-white/60">ETA {restaurant.etaMinutes} min</p>
                  </div>
                  <span className="text-sm font-medium text-hungry-amber-300">
                    Delivery fee {restaurant.deliveryFee}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">{restaurant.reviewSummary}</p>
              </button>
            ))
          )}
        </div>
      )}

      {stage === "menu" && selectedRestaurant && (
        <div className="space-y-5">
          <p className="text-sm text-white/70">
            Verbally add items and I’ll build the cart. Try saying “Add the truffle ramen.”
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {mockMenu.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {item.category}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-hungry-amber-300">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
                <button
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-hungry-amber-500 px-3 py-1 text-sm font-semibold text-black"
                  onClick={() => {
                    setCart((prev) => {
                      const existing = prev.find((entry) => entry.id === item.id);
                      if (existing) {
                        return prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, quantity: entry.quantity + 1 }
                            : entry,
                        );
                      }
                      const newCart = [...prev, { ...item, quantity: 1 }];
                      setFeaturePayload({
                        type: "order",
                        stage: "cart",
                        selectedRestaurant,
                        restaurants,
                        cart: newCart,
                      });
                      return newCart;
                    });
                    setStage("cart");
                  }}
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "cart" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-white/10 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.name}
                    <span className="ml-2 text-xs text-white/50">
                      ×{item.quantity}
                    </span>
                  </p>
                  <p className="text-xs text-white/60">{item.description}</p>
                </div>
                <span className="text-sm font-medium text-hungry-amber-300">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <span className="text-sm text-white/60">Subtotal</span>
            <span className="text-lg font-semibold text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <button
            className="w-full rounded-full bg-gradient-to-r from-hungry-amber-500 to-hungry-plum-500 py-3 text-sm font-semibold text-black"
            onClick={() => {
              setStage("confirmation");
              setFeaturePayload({
                type: "order",
                stage: "confirmation",
                selectedRestaurant,
                restaurants,
                cart,
              });
            }}
          >
            Checkout mock order
          </button>
        </div>
      )}

      <AnimatePresence>
        {stage === "confirmation" && (
          <motion.div
            className="relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/10 p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-hungry-amber-500 text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-semibold text-white">
              Mock Order Complete!
            </h4>
            <p className="max-w-sm text-sm text-white/70">
              Your virtual feast is on the way. Ready to try another craving?
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

