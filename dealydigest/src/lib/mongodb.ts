import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase() {
  if (clientPromise) {
    return clientPromise;
  }

  try {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
    
    // Test the connection
    const testClient = await clientPromise;
    await testClient.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
    
    return clientPromise;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export interface CreditCard {
  last4: string;
  expiry: string;
  card_type: string;
  name: string;
}

export interface ApplePayCard {
  card_token: string;
  last4: string;
  expiry: string;
  card_type: string;
  date_added: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  created_at: string;
  apple_pay_cards: ApplePayCard[];
  credit_cards: CreditCard[];
}

// Only use these functions in server-side code (API routes)
export async function getUserByEmail(email: string): Promise<User | null> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    const user = await db.collection('users').findOne({ email });
    return user as User | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Create a new user with placeholder data
export async function createPlaceholderUser(email: string): Promise<User | null> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    
    // Create a basic user with empty credit cards array
    const newUser = {
      email,
      username: email.split('@')[0],
      created_at: new Date().toISOString(),
      apple_pay_cards: [],
      credit_cards: [] // Empty array instead of sample card
    };
    
    // Insert the new user
    const result = await db.collection('users').insertOne(newUser);
    
    if (result.acknowledged) {
      console.log(`Created new user account for email: ${email}`);
      return {
        _id: result.insertedId.toString(),
        ...newUser
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function findOrCreateUser(email: string): Promise<User | null> {
  // First try to find the existing user
  let user = await getUserByEmail(email);
  
  // If user doesn't exist, create a placeholder
  if (!user) {
    console.log(`User not found with email: ${email}, creating placeholder...`);
    user = await createPlaceholderUser(email);
  }
  
  return user;
}

export async function updateUserCreditCards(email: string, creditCards: CreditCard[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    
    // Check if user exists first
    const userExists = await db.collection('users').findOne({ email });
    
    if (!userExists) {
      // Create the user first, then we'll update in the next step
      await createPlaceholderUser(email);
    }
    
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { credit_cards: creditCards } },
      { upsert: true } // Create if doesn't exist
    );
    
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  } catch (error) {
    console.error('Error updating user credit cards:', error);
    return false;
  }
}

// Export a promise that resolves to the MongoDB client
export default clientPromise; 