import { promises as fs } from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "fake-key-for-demo"
);

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  card: string;
}

export interface TimeUsage {
  service: string;
  date: string;
  hours: number;
  content_type: string;
}

export interface AnalysisResult {
  spendingByCategory: Record<string, number>;
  spendingByMerchant: Record<string, number>;
  spendingByCard: Record<string, number>;
  timeUsageByService: Record<string, number>;
  timeUsageByContentType: Record<string, number>;
  totalSpending: number;
  totalHoursUsed: number;
  aiInsights: string;
  recommendations: string[];
  topMerchants: Array<{ name: string; amount: number }>;
  topCategories: Array<{ name: string; amount: number }>;
  monthlyTrend: Array<{ date: string; amount: number }>;
  aiScore: number; // Score from 0-100 based on spending habits
}

/**
 * Read all JSON files from the data directory
 */
export async function readDataFiles(): Promise<{
  transactions: Transaction[];
  timeUsage: TimeUsage[];
}> {
  try {
    // For production use path.join(process.cwd(), 'public', 'data')
    // For demo, just use the relative path
    const dataDir = path.join(process.cwd(), "public", "data");

    // Read transactions data
    const transactionsFile = path.join(dataDir, "transactions.json");
    const transactionsData = await fs.readFile(transactionsFile, "utf8");
    const transactions: Transaction[] = JSON.parse(transactionsData);

    // Read time usage data
    const timeUsageFile = path.join(dataDir, "time_usage.json");
    const timeUsageData = await fs.readFile(timeUsageFile, "utf8");
    const timeUsage: TimeUsage[] = JSON.parse(timeUsageData);

    return { transactions, timeUsage };
  } catch (error) {
    console.error("Error reading data files:", error);
    // For demo purposes, return empty arrays if files can't be read
    return { transactions: [], timeUsage: [] };
  }
}

/**
 * Get aggregate data for visualization and summary
 */
export async function analyzeUserData(): Promise<AnalysisResult> {
  // Read data files
  const { transactions, timeUsage } = await readDataFiles();

  // Default result if data is empty
  if (!transactions.length && !timeUsage.length) {
    return getDefaultAnalysisResult();
  }

  // Aggregate spending by category
  const spendingByCategory = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  // Aggregate spending by merchant
  const spendingByMerchant = transactions.reduce((acc, tx) => {
    acc[tx.merchant] = (acc[tx.merchant] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  // Aggregate spending by card
  const spendingByCard = transactions.reduce((acc, tx) => {
    acc[tx.card] = (acc[tx.card] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  // Aggregate time usage by service
  const timeUsageByService = timeUsage.reduce((acc, item) => {
    acc[item.service] = (acc[item.service] || 0) + item.hours;
    return acc;
  }, {} as Record<string, number>);

  // Aggregate time usage by content type
  const timeUsageByContentType = timeUsage.reduce((acc, item) => {
    acc[item.content_type] = (acc[item.content_type] || 0) + item.hours;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total spending
  const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate total hours used
  const totalHoursUsed = timeUsage.reduce((sum, item) => sum + item.hours, 0);

  // Get top merchants by spending
  const topMerchants = Object.entries(spendingByMerchant)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Get top categories by spending
  const topCategories = Object.entries(spendingByCategory)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Generate monthly trend data
  const monthlyTrend = generateMonthlyTrend(transactions);

  // Generate AI score based on spending habits
  const aiScore = generateAIScore(transactions, timeUsage);

  // Get AI insights from Gemini (or simulate if API key not available)
  const aiInsights = await getAIInsights(
    transactions,
    timeUsage,
    totalSpending,
    totalHoursUsed
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    transactions,
    timeUsage,
    spendingByCategory
  );

  return {
    spendingByCategory,
    spendingByMerchant,
    spendingByCard,
    timeUsageByService,
    timeUsageByContentType,
    totalSpending,
    totalHoursUsed,
    aiInsights,
    recommendations,
    topMerchants,
    topCategories,
    monthlyTrend,
    aiScore,
  };
}

/**
 * Generate monthly spending trend
 */
function generateMonthlyTrend(
  transactions: Transaction[]
): Array<{ date: string; amount: number }> {
  const dateMap: Record<string, number> = {};

  // Group transactions by date
  transactions.forEach((tx) => {
    const date = tx.date.substring(0, 10); // YYYY-MM-DD format
    dateMap[date] = (dateMap[date] || 0) + tx.amount;
  });

  // Convert to array and sort by date
  return Object.entries(dateMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate an AI score based on spending habits
 */
function generateAIScore(
  transactions: Transaction[],
  timeUsage: TimeUsage[]
): number {
  // For demo purposes, generate a score between 0-100
  // In a real implementation, this would use more sophisticated scoring logic

  if (!transactions.length) return 50;

  // Factors that could improve score:
  // - Diverse spending across categories (not concentrated in one area)
  // - Reasonable entertainment/subscription spending
  // - Good balance between different card usage

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const categories = new Set(transactions.map((tx) => tx.category)).size;
  const merchants = new Set(transactions.map((tx) => tx.merchant)).size;

  // Calculate diversity score (more diverse spending = higher score)
  const diversityScore = Math.min(100, categories * 10 + merchants * 2);

  // Calculate spending efficiency (lower is better)
  const entertainmentSpending = transactions
    .filter((tx) => tx.category === "Entertainment")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const entertainmentRatio = entertainmentSpending / totalSpent;
  const efficiencyScore = 100 - entertainmentRatio * 100;

  // Final score is average of subscores
  return Math.round((diversityScore + efficiencyScore) / 2);
}

/**
 * Get AI insights from Gemini
 */
async function getAIInsights(
  transactions: Transaction[],
  timeUsage: TimeUsage[],
  totalSpending: number,
  totalHoursUsed: number
): Promise<string> {
  if (!transactions.length) return "Not enough data to generate insights.";

  try {
    // Check if we have a valid API key
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "fake-key-for-demo"
    ) {
      // Return simulated AI response for demo
      return generateSimulatedInsights(
        transactions,
        timeUsage,
        totalSpending,
        totalHoursUsed
      );
    }

    // Prepare data for AI analysis
    const topCategories = Object.entries(
      transactions.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const topMerchants = Object.entries(
      transactions.reduce((acc, tx) => {
        acc[tx.merchant] = (acc[tx.merchant] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const prompt = `
      Based on the following user financial and time usage data, provide insights on spending patterns and habits:
      
      Total spending: $${totalSpending.toFixed(2)}
      Total entertainment time: ${totalHoursUsed.toFixed(1)} hours
      
      Top spending categories:
      ${topCategories
        .map((c) => `- ${c.category}: $${c.amount.toFixed(2)}`)
        .join("\n")}
      
      Top merchants:
      ${topMerchants
        .map((m) => `- ${m.merchant}: $${m.amount.toFixed(2)}`)
        .join("\n")}
      
      Format your response in a conversational tone, focusing on interesting patterns and providing useful financial insights. 
      Keep the response concise (limit to 3-4 paragraphs). Include specific dollar amounts when relevant.
    `;

    // Call Gemini AI API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return "We're experiencing issues generating insights right now. Please try again later.";
  }
}

/**
 * Generate simulated AI insights for demo purposes
 */
function generateSimulatedInsights(
  transactions: Transaction[],
  timeUsage: TimeUsage[],
  totalSpending: number,
  totalHoursUsed: number
): string {
  // Get top spending category
  const categorySpending = transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categorySpending).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const topCategoryAmount = categorySpending[topCategory];

  // Get top merchant
  const merchantSpending = transactions.reduce((acc, tx) => {
    acc[tx.merchant] = (acc[tx.merchant] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const topMerchant = Object.entries(merchantSpending).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const topMerchantAmount = merchantSpending[topMerchant];

  // Generate insights
  return `
    I've analyzed your spending patterns over the past month. You spent a total of $${totalSpending.toFixed(
      2
    )}, with your highest spending category being ${topCategory} at $${topCategoryAmount.toFixed(
    2
  )} (${((topCategoryAmount / totalSpending) * 100).toFixed(
    1
  )}% of total). Your most frequented merchant was ${topMerchant}, where you spent $${topMerchantAmount.toFixed(
    2
  )}.

    Looking at your entertainment usage, you've spent ${totalHoursUsed.toFixed(
      1
    )} hours across various platforms. This is slightly ${
    totalHoursUsed > 45 ? "higher" : "lower"
  } than the average user in your demographic. Consider balancing your digital entertainment time with other activities for better financial and mental wellness.

    Based on your spending patterns, I recommend exploring rewards opportunities with your Chase Sapphire Reserve for ${
      topCategory === "Travel" ? "travel purchases" : "dining experiences"
    }, which could earn you enhanced points. Additionally, consider setting up automated alerts for subscription renewals to avoid unexpected charges from entertainment services.
  `;
}

/**
 * Generate recommendations based on user data
 */
function generateRecommendations(
  transactions: Transaction[],
  timeUsage: TimeUsage[],
  spendingByCategory: Record<string, number>
): string[] {
  if (!transactions.length)
    return [
      "Start tracking your spending to receive personalized recommendations.",
    ];

  const recommendations: string[] = [];

  // Get total spending
  const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Calculate category percentages
  const categoryPercentages = Object.entries(spendingByCategory).map(
    ([category, amount]) => ({
      category,
      percentage: (amount / totalSpending) * 100,
    })
  );

  // Check for high entertainment spending
  const entertainmentPercentage =
    categoryPercentages.find((c) => c.category === "Entertainment")
      ?.percentage || 0;
  if (entertainmentPercentage > 15) {
    recommendations.push(
      "Your entertainment spending is above 15% of your total. Consider reviewing your subscriptions and look for bundle options to reduce costs."
    );
  }

  // Check for dining vs grocery balance
  const diningPercentage =
    categoryPercentages.find((c) => c.category === "Dining")?.percentage || 0;
  const groceryPercentage =
    categoryPercentages.find((c) => c.category === "Grocery")?.percentage || 0;

  if (diningPercentage > groceryPercentage * 2) {
    recommendations.push(
      "You're spending significantly more on dining out than groceries. Consider cooking at home more often to reduce expenses."
    );
  }

  // Check for shopping patterns
  const shoppingPercentage =
    categoryPercentages.find((c) => c.category === "Shopping")?.percentage || 0;
  if (shoppingPercentage > 20) {
    recommendations.push(
      "Your shopping expenses account for over 20% of your spending. Consider implementing a 24-hour rule before purchases to reduce impulse buying."
    );
  }

  // Check for travel opportunities
  const travelSpending = spendingByCategory["Travel"] || 0;
  if (travelSpending > 300) {
    recommendations.push(
      "You're spending significantly on travel. Make sure to maximize points with your Chase Sapphire Reserve for these purchases."
    );
  }

  // Check for card optimization
  const cardUsage = transactions.reduce((acc, tx) => {
    acc[tx.card] = (acc[tx.card] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const primaryCard = Object.entries(cardUsage).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  if (primaryCard.includes("Freedom") && travelSpending > 100) {
    recommendations.push(
      "Consider using your Chase Sapphire Reserve instead of Freedom Unlimited for travel purchases to earn more points."
    );
  }

  // Add default recommendations if we don't have enough
  if (recommendations.length < 3) {
    recommendations.push(
      "Track your spending consistently to unlock more personalized financial insights."
    );
    recommendations.push(
      "Consider setting up automatic transfers to a savings account to build an emergency fund."
    );
  }

  return recommendations;
}

/**
 * Default analysis result when no data is available
 */
function getDefaultAnalysisResult(): AnalysisResult {
  return {
    spendingByCategory: {},
    spendingByMerchant: {},
    spendingByCard: {},
    timeUsageByService: {},
    timeUsageByContentType: {},
    totalSpending: 0,
    totalHoursUsed: 0,
    aiInsights:
      "Not enough data to generate insights. Start connecting your accounts to see personalized insights.",
    recommendations: [
      "Connect your accounts to see personalized recommendations.",
    ],
    topMerchants: [],
    topCategories: [],
    monthlyTrend: [],
    aiScore: 50,
  };
}
