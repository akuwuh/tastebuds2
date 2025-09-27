import { NextRequest, NextResponse } from "next/server";

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
    date: string; // ISO date string
    time: string; // "7:00 PM" format
    partySize: number;
    specialRequests?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  };
  confirmationNumber?: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface BookingRequest {
  bookings: RestaurantBookingData[];
  searchQuery?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    console.log("Booking request received:", body);

    // Validate the request
    if (!body.bookings || !Array.isArray(body.bookings)) {
      return NextResponse.json(
        { error: "Invalid request: bookings array is required" },
        { status: 400 }
      );
    }

    // Validate each booking has required fields
    for (const booking of body.bookings) {
      if (
        !booking.restaurant?.name ||
        !booking.booking?.date ||
        !booking.booking?.time ||
        !booking.booking?.partySize
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid booking data: restaurant name, date, time, and party size are required",
          },
          { status: 400 }
        );
      }
    }

    // Process bookings and add missing data
    const processedBookings = body.bookings.map((booking, index) => ({
      ...booking,
      confirmationNumber:
        booking.confirmationNumber || `TB${Date.now()}${index}`,
      status: booking.status || "confirmed",
      restaurant: {
        ...booking.restaurant,
        id: booking.restaurant.id || `restaurant-${index}`,
        rating: booking.restaurant.rating || 4.5,
        image:
          booking.restaurant.image ||
          `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop`,
      },
    }));

    // Store the booking data
    const bookingData = {
      bookings: processedBookings,
      searchQuery: body.searchQuery,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    // Store in global memory
    if (!global.bookingDisplayQueue) {
      global.bookingDisplayQueue = [];
    }
    global.bookingDisplayQueue.push(bookingData);

    // Clean up old entries
    if (global.bookingDisplayQueue.length > 10) {
      global.bookingDisplayQueue = global.bookingDisplayQueue.slice(-10);
    }

    console.log("Stored booking data for display:", {
      id: bookingData.id,
      bookingCount: processedBookings.length,
      searchQuery: body.searchQuery,
    });

    return NextResponse.json({
      success: true,
      message: "Booking data received and queued for display",
      data: {
        id: bookingData.id,
        bookings: processedBookings,
        searchQuery: body.searchQuery,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing booking request:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
