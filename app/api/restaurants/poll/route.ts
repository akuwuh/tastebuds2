import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the last timestamp from query params
    const url = new URL(request.url);
    const lastTimestamp = parseInt(url.searchParams.get("since") || "0");

    // Check if we have any restaurant data in the queue
    const queue = global.restaurantDisplayQueue || [];

    // Find new restaurant data since the last timestamp
    const newData = queue.filter((item) => item.timestamp > lastTimestamp);

    if (newData.length > 0) {
      // Return the latest restaurant data
      const latestData = newData[newData.length - 1];

      return NextResponse.json({
        success: true,
        hasNewData: true,
        data: latestData,
      });
    } else {
      // No new data
      return NextResponse.json({
        success: true,
        hasNewData: false,
        data: null,
      });
    }
  } catch (error) {
    console.error("Error polling restaurant data:", error);

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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
