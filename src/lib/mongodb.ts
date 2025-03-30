import { MongoClient, ServerApiVersion } from 'mongodb';

// Replace this with your MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.example.mongodb.net/?retryWrites=true&w=majority';

// MongoDB client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable to preserve the MongoDB connection
// across hot-reloads
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to create a new connection for each request
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

export { clientPromise };

// Helper function to get a database
export async function getDatabase(dbName = 'dealydigest') {
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper function to get a collection
export async function getCollection(collectionName: string, dbName = 'dealydigest') {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
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
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('swipe').findOne({ email });
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
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('swipe').updateOne(
      { email },
      { $set: { credit_cards: creditCards } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user credit cards:', error);
    return false;
  }
} 