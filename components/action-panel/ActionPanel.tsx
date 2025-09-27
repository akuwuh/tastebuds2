"use client";

import { useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ActiveFeature, FeatureIntent } from "@/lib/types";
import type { LocationCoordinates } from "@/lib/location";
import { RecipePanel } from "@/components/action-panel/RecipePanel";
import { RestaurantPanel } from "@/components/action-panel/RestaurantPanel";
import { OrderPanel } from "@/components/action-panel/OrderPanel";

interface ActionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeature: ActiveFeature;
  featurePayload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
  setActiveIntent: (intent: FeatureIntent | null) => void;
  userLocation?: LocationCoordinates | null;
}

const panelVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
};

export function ActionPanel({
  isOpen,
  onClose,
  activeFeature,
  featurePayload,
  setFeaturePayload,
  setActiveIntent,
  userLocation,
}: ActionPanelProps) {
  useEffect(() => {
    if (!isOpen) {
      setFeaturePayload(undefined);
      setActiveIntent(null);
    }
  }, [isOpen, setFeaturePayload, setActiveIntent]);

  const featureContent = useMemo(() => {
    switch (activeFeature) {
      case "recipe":
        return (
          <RecipePanel
            payload={featurePayload}
            setFeaturePayload={setFeaturePayload}
          />
        );
      case "maps":
        return (
          <RestaurantPanel
            payload={featurePayload}
            setFeaturePayload={setFeaturePayload}
            userLocation={userLocation}
          />
        );
      case "order":
        return (
          <OrderPanel
            payload={featurePayload}
            setFeaturePayload={setFeaturePayload}
          />
        );
      default:
        return null;
    }
  }, [activeFeature, featurePayload, setFeaturePayload, userLocation]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-5xl rounded-t-[28px] bg-neutral-900/95 p-6 shadow-2xl"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
                <Dialog.Title className="text-lg font-semibold text-white">
                  {activeFeature === "recipe"
                    ? "Cooking Companion"
                    : activeFeature === "maps"
                    ? "Restaurant Explorer"
                    : activeFeature === "order"
                    ? "Delivery Simulator"
                    : "Hungry Buddy"}
                </Dialog.Title>
                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {featureContent}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
