import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lastTimestamp = parseInt(url.searchParams.get("since") || "0");

    const queue = global.recipeDisplayQueue || [];
    const newData = queue.filter((item) => item.timestamp > lastTimestamp);

    if (newData.length > 0) {
      const latestData = newData[newData.length - 1];

      return NextResponse.json({
        success: true,
        hasNewData: true,
        data: latestData,
      });
    } else {
      return NextResponse.json({
        success: true,
        hasNewData: false,
        data: null,
      });
    }
  } catch (error) {
    console.error("Error polling recipe data:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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
