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
  auth0_id: string; // Auth0 user ID
  email: string;
  username: string;
  created_at: string;
  apple_pay_cards: ApplePayCard[];
  credit_cards: CreditCard[];
}

// Get user by Auth0 ID instead of email
export async function getUserById(auth0Id: string): Promise<User | null> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    const user = await db.collection('users').findOne({ auth0_id: auth0Id });
    return user as User | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Legacy function - kept for compatibility
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

// Create a new user using Auth0 ID
export async function createNewUser(auth0Id: string, email: string): Promise<User | null> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    
    // Create a basic user with empty credit cards array
    const newUser = {
      auth0_id: auth0Id,
      email,
      username: email.split('@')[0],
      created_at: new Date().toISOString(),
      apple_pay_cards: [],
      credit_cards: [] // Empty array as requested
    };
    
    // Insert the new user
    const result = await db.collection('users').insertOne(newUser);
    
    if (result.acknowledged) {
      console.log(`Created new user account for Auth0 ID: ${auth0Id}`);
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

export async function findOrCreateUser(auth0Id: string, email: string): Promise<User | null> {
  // First try to find the existing user by Auth0 ID
  let user = await getUserById(auth0Id);
  
  // If not found, try by email as fallback (for existing records)
  if (!user) {
    user = await getUserByEmail(email);
    
    // If found by email but not having auth0_id, update the record
    if (user && !user.auth0_id) {
      const client = await connectToDatabase();
      const db = client.db('swipeDB');
      await db.collection('users').updateOne(
        { email },
        { $set: { auth0_id: auth0Id } }
      );
      user.auth0_id = auth0Id;
    }
  }
  
  // If user still not found, create a new one
  if (!user) {
    console.log(`User not found with Auth0 ID: ${auth0Id}, creating new user...`);
    user = await createNewUser(auth0Id, email);
  }
  
  return user;
}

export async function updateUserCreditCards(auth0Id: string, creditCards: CreditCard[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    
    // Check if user exists first
    const userExists = await db.collection('users').findOne({ auth0_id: auth0Id });
    
    if (!userExists) {
      // We need the email to create a new user - this is a limitation of this function
      // In practice, this shouldn't be called before findOrCreateUser
      console.error('User not found and email not provided for creation');
      return false;
    }
    
    const result = await db.collection('users').updateOne(
      { auth0_id: auth0Id },
      { $set: { credit_cards: creditCards } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user credit cards:', error);
    return false;
  }
}

// Export a promise that resolves to the MongoDB client
export default clientPromise; 