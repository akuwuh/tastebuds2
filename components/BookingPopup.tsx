"use client";

import { motion, AnimatePresence } from "framer-motion";

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

interface BookingPopupProps {
  bookings: RestaurantBookingData[];
  searchQuery?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingPopup({
  bookings,
  searchQuery,
  isOpen,
  onClose,
}: BookingPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <span className="text-green-500">📅</span>
                  Restaurant Bookings
                </h2>
                <p className="text-slate-400 mt-1">
                  {bookings.length} reservation
                  {bookings.length !== 1 ? "s" : ""} confirmed
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.confirmationNumber || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-6">
                      {/* Restaurant Image */}
                      <img
                        src={booking.restaurant.image}
                        alt={booking.restaurant.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {booking.restaurant.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                🍽️ {booking.restaurant.cuisine}
                              </span>
                              {booking.restaurant.rating && (
                                <span className="flex items-center gap-1">
                                  ⭐ {booking.restaurant.rating.toFixed(1)}
                                </span>
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
                          <div>
                            <div className="text-sm text-slate-400 mb-1">
                              Date & Time
                            </div>
                            <div className="text-white font-medium">
                              {new Date(
                                booking.booking.date
                              ).toLocaleDateString()}{" "}
                              at {booking.booking.time}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400 mb-1">
                              Party Size
                            </div>
                            <div className="text-white font-medium">
                              {booking.booking.partySize}{" "}
                              {booking.booking.partySize === 1
                                ? "person"
                                : "people"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-slate-400 mb-1">
                              Restaurant
                            </div>
                            <div className="text-slate-300 text-sm">
                              📍 {booking.restaurant.address}
                            </div>
                            <div className="text-slate-300 text-sm">
                              📞 {booking.restaurant.phone}
                            </div>
                          </div>

                          {booking.confirmationNumber && (
                            <div>
                              <div className="text-sm text-slate-400 mb-1">
                                Confirmation Number
                              </div>
                              <div className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                                {booking.confirmationNumber}
                              </div>
                            </div>
                          )}

                          {booking.booking.specialRequests && (
                            <div>
                              <div className="text-sm text-slate-400 mb-1">
                                Special Requests
                              </div>
                              <div className="text-slate-300 text-sm">
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

            {/* Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {searchQuery && <span>🔍 Search: "{searchQuery}"</span>}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
