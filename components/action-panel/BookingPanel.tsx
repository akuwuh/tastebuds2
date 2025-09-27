"use client";

import { motion } from "framer-motion";

export interface RestaurantBookingData {
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
    cuisine: string;
    rating?: number;
    image?: string;
  };
  booking: {
    date: string;
    time: string;
    partySize: number;
    specialRequests?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  };
  confirmationNumber?: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface BookingPanelProps {
  payload?: Record<string, unknown>;
  setFeaturePayload: (payload?: Record<string, unknown>) => void;
}

export function BookingPanel({ payload }: BookingPanelProps) {
  const bookings = (payload?.bookings as RestaurantBookingData[]) || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/40">
            Reservation Confirmed
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Your table is booked!
          </h3>
        </div>
      </header>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.confirmationNumber || index}
            className="rounded-2xl bg-white/5 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              {/* Restaurant Image */}
              <img
                src={booking.restaurant.image}
                alt={booking.restaurant.name}
                className="w-20 h-20 rounded-xl object-cover"
              />

              {/* Booking Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {booking.restaurant.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span>🍽️ {booking.restaurant.cuisine}</span>
                      {booking.restaurant.rating && (
                        <span>⭐ {booking.restaurant.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : booking.status === "pending"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wide">
                        Date & Time
                      </div>
                      <div className="text-white font-medium">
                        {new Date(booking.booking.date).toLocaleDateString()} at{" "}
                        {booking.booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wide">
                        Party Size
                      </div>
                      <div className="text-white font-medium">
                        {booking.booking.partySize}{" "}
                        {booking.booking.partySize === 1 ? "person" : "people"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-1">
                      Restaurant Details
                    </div>
                    <div className="text-white/80 text-sm space-y-1">
                      <div>📍 {booking.restaurant.address}</div>
                      <div>📞 {booking.restaurant.phone}</div>
                    </div>
                  </div>

                  {booking.confirmationNumber && (
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wide mb-1">
                        Confirmation
                      </div>
                      <div className="text-white font-mono text-sm bg-white/10 px-3 py-2 rounded-lg">
                        {booking.confirmationNumber}
                      </div>
                    </div>
                  )}

                  {booking.booking.specialRequests && (
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wide mb-1">
                        Special Requests
                      </div>
                      <div className="text-white/80 text-sm">
                        {booking.booking.specialRequests}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
