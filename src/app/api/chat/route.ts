import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define types for the insights data
interface Category {
  name: string;
  amount: number;
}

interface Merchant {
  name: string;
  amount: number;
}

interface Insights {
  totalSpending: number;
  totalHoursUsed: number;
  topCategories: Category[];
  topMerchants: Merchant[];
  aiScore: number;
  recommendations: string[];
}

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "fake-key-for-demo"
);

export async function POST(request: Request) {
  try {
    const { message, insights } = await request.json();

    // If no API key or using demo key, return simulated response
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "fake-key-for-demo"
    ) {
      return simulateResponse(message, insights);
    }

    // Prepare context for Gemini
    const context = `
      User's Financial Data:
      - Total Spending: $${insights.totalSpending}
      - Total Hours Used: ${insights.totalHoursUsed} hours
      - Top Categories: ${insights.topCategories
        .map((c: Category) => `${c.name} ($${c.amount})`)
        .join(", ")}
      - Top Merchants: ${insights.topMerchants
        .map((m: Merchant) => `${m.name} ($${m.amount})`)
        .join(", ")}
      - AI Score: ${insights.aiScore}/100
    `;

    const prompt = `
      You are a helpful financial AI assistant. Using the following context about the user's financial data, 
      answer their question in a clear and concise way. If you can't answer based on the available data, 
      say so politely.

      Context:
      ${context}

      User Question: ${message}
    `;

    // Call Gemini AI API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

function simulateResponse(message: string, insights: Insights) {
  // Simple keyword-based response simulation
  const response = generateSimulatedResponse(message, insights);
  return NextResponse.json({ response });
}

function generateSimulatedResponse(message: string, insights: Insights) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("spending") || lowerMessage.includes("spent")) {
    return `Based on your data, you've spent a total of $${insights.totalSpending.toFixed(
      2
    )}. Your top spending category is ${
      insights.topCategories[0]?.name
    } at $${insights.topCategories[0]?.amount.toFixed(2)}.`;
  }

  if (lowerMessage.includes("merchant") || lowerMessage.includes("store")) {
    return `Your top merchant is ${
      insights.topMerchants[0]?.name
    }, where you've spent $${insights.topMerchants[0]?.amount.toFixed(2)}.`;
  }

  if (lowerMessage.includes("score") || lowerMessage.includes("rating")) {
    return `Your financial wellness score is ${insights.aiScore}/100. This score is based on your spending patterns, category diversity, and financial habits.`;
  }

  if (lowerMessage.includes("time") || lowerMessage.includes("hours")) {
    return `You've spent ${insights.totalHoursUsed.toFixed(
      1
    )} hours on entertainment services. This includes streaming, music, and other digital content.`;
  }

  if (
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("suggestion")
  ) {
    return (
      insights.recommendations[0] ||
      "Based on your spending patterns, I recommend reviewing your subscription services and looking for opportunities to maximize rewards on your most frequent purchases."
    );
  }

  return "I understand you're asking about your financial data. Could you please be more specific about what you'd like to know? You can ask about spending, merchants, time usage, or recommendations.";
}
