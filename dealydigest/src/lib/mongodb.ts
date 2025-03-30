import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-1'
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
    
    const testClient = await clientPromise;
    await testClient.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    
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

export async function updateUserCreditCards(email: string, creditCards: CreditCard[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be used in server-side code');
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('swipeDB');
    const result = await db.collection('users').updateOne(
      { email },
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