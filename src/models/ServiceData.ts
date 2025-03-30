import mongoose, { Schema, Document, model, Model } from 'mongoose';

// Initialize mongoose models if they haven't been initialized
let ServiceData: Model<ServiceDataDocument>;
let UserConnection: Model<UserConnectionDocument>;

// Base interfaces
export interface BaseActivity {
  id: string;
  timestamp: Date;
}

// Spotify interfaces
export interface SpotifyTrack extends BaseActivity {
  name: string;
  artist: string;
  album: string;
  playedAt: string;
  imageUrl?: string;
}

export interface SpotifyArtist {
  name: string;
  genres?: string[];
  imageUrl?: string;
}

export interface SpotifyData {
  recentTracks: SpotifyTrack[];
  topGenres: string[];
  topArtists: SpotifyArtist[] | string[];
  recommendations: any[];
  lastUpdated: Date;
}

// Netflix interfaces
export interface NetflixShow extends BaseActivity {
  title: string;
  type: string;
  genre: string;
  watchedAt: string;
  imageUrl?: string;
  season?: string;
  episode?: string;
}

export interface NetflixData {
  recentlyWatched: NetflixShow[];
  topGenres: string[];
  recommendations: any[];
  upcomingReleases: any[];
  lastUpdated: Date;
}

// DoorDash interfaces
export interface DoorDashOrder extends BaseActivity {
  restaurant: string;
  date: string;
  total: number;
  items: string[];
}

export interface DoorDashData {
  recentOrders: DoorDashOrder[];
  topRestaurants: string[];
  frequentItems: string[];
  upcomingDeals: any[];
  lastUpdated: Date;
}

// Uber interfaces
export interface UberRide extends BaseActivity {
  from: string;
  to: string;
  date: string;
  cost: number;
  distance: string;
}

export interface UberData {
  recentRides: UberRide[];
  frequentDestinations: string[];
  upcomingReservations: any[];
  availablePromotions: any[];
  lastUpdated: Date;
}

// Amazon interfaces
export interface AmazonPurchase extends BaseActivity {
  item: string;
  date: string;
  price: number;
  status: string;
}

export interface AmazonData {
  recentPurchases: AmazonPurchase[];
  subscriptions: any[];
  recommendations: any[];
  upcomingDeliveries: any[];
  lastUpdated: Date;
}

// Main service data interface
export interface ServiceDataDocument extends Document {
  userId: string;
  spotify?: SpotifyData;
  netflix?: NetflixData;
  doordash?: DoorDashData;
  uber?: UberData;
  amazon?: AmazonData;
  createdAt: Date;
  updatedAt: Date;
}

// User connection interface
export interface UserConnectionDocument extends Document {
  userId: string;
  merchantName: string;
  merchantId: number;
  connectionId: string;
  connectedAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Create schemas
const ServiceDataSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    spotify: {
      recentTracks: [
        {
          id: String,
          name: String,
          artist: String,
          album: String,
          playedAt: String,
          imageUrl: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      topGenres: [String],
      topArtists: [Schema.Types.Mixed],
      recommendations: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    },
    netflix: {
      recentlyWatched: [
        {
          id: String,
          title: String,
          type: String,
          genre: String,
          watchedAt: String,
          imageUrl: String,
          season: String,
          episode: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      topGenres: [String],
      recommendations: [Schema.Types.Mixed],
      upcomingReleases: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    },
    doordash: {
      recentOrders: [
        {
          id: String,
          restaurant: String,
          date: String,
          total: Number,
          items: [String],
          timestamp: { type: Date, default: Date.now }
        }
      ],
      topRestaurants: [String],
      frequentItems: [String],
      upcomingDeals: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    },
    uber: {
      recentRides: [
        {
          id: String,
          from: String,
          to: String,
          date: String,
          cost: Number,
          distance: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      frequentDestinations: [String],
      upcomingReservations: [Schema.Types.Mixed],
      availablePromotions: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    },
    amazon: {
      recentPurchases: [
        {
          id: String,
          item: String,
          date: String,
          price: Number,
          status: String,
          timestamp: { type: Date, default: Date.now }
        }
      ],
      subscriptions: [Schema.Types.Mixed],
      recommendations: [Schema.Types.Mixed],
      upcomingDeliveries: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

const UserConnectionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    merchantName: { type: String, required: true },
    merchantId: { type: Number, required: true },
    connectionId: { type: String, required: true },
    connectedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure we don't have duplicate connections
UserConnectionSchema.index({ userId: 1, merchantName: 1 }, { unique: true });

// Initialize models
try {
  // Check if the model is already defined
  if (mongoose.models && mongoose.models.ServiceData) {
    ServiceData = mongoose.models.ServiceData as Model<ServiceDataDocument>;
  } else {
    ServiceData = mongoose.model<ServiceDataDocument>('ServiceData', ServiceDataSchema);
  }

  if (mongoose.models && mongoose.models.UserConnection) {
    UserConnection = mongoose.models.UserConnection as Model<UserConnectionDocument>;
  } else {
    UserConnection = mongoose.model<UserConnectionDocument>('UserConnection', UserConnectionSchema);
  }
} catch (error) {
  console.error('Error initializing MongoDB models:', error);
}

export { ServiceData, UserConnection }; 