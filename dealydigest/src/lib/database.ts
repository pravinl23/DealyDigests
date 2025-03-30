import mongoose from "mongoose";

// Cache the database connection
let cachedConnection: typeof mongoose | null = null;

/**
 * Connect to MongoDB
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have a connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Get the MongoDB connection string from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Connect to MongoDB
  try {
    const opts = {
      bufferCommands: false,
    };

    const connection = await mongoose.connect(MONGODB_URI, opts);
    console.log("Connected to MongoDB successfully");

    // Cache the connection
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log("Disconnected from MongoDB");
  }
}
