import { NextRequest, NextResponse } from "next/server";
import { analyzeUserData } from "../../../../lib/analyzeData";

export async function GET(request: NextRequest) {
  try {
    const analysisResult = await analyzeUserData();

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Error analyzing user data:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze user data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
