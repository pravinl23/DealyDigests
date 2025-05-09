export interface User {
  id: string
  name: string | null
  email: string
  password: string // This would be hashed in a real app
  createdAt: Date
  updatedAt: Date
}

export interface UserBankConnection {
  id: string
  userId: string
  aggregatorAccessToken: string
  cardType: string | null
  last4: string | null
  institutionName: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  bankConnectionId: string
  date: Date
  description: string
  amount: number
  category: string | null
  merchant: string | null
  rawData: any
  createdAt: Date
}

export interface Deal {
  id: string
  title: string
  description: string
  validFrom: Date
  validTo: Date
  cardRequired: string | null
  categories: string[]
  merchant: string | null
  discountAmount: number
  discountType: "percentage" | "fixed"
  minPurchase: number | null
  createdAt: Date
  updatedAt: Date
}

export interface UserDeal {
  id: string
  userId: string
  dealId: string
  clicked: boolean
  claimed: boolean
  knotConnected: boolean
  createdAt: Date
  updatedAt: Date
}

// Media interfaces
export interface NetflixWatchHistory {
  id: string
  userId: string
  title: string
  type: "movie" | "series"
  genre: string[]
  watchDate: Date
  duration: number // in minutes
}

export interface SpotifyListenHistory {
  id: string
  userId: string
  trackName: string
  artist: string
  genre: string[]
  listenDate: Date
  duration: number // in minutes
}

export interface EntertainmentEvent {
  id: string
  title: string
  type: "concert" | "musical" | "show" | "movie"
  performers: string[]
  venue: string
  date: Date
  price: number
  genres: string[]
  imageUrl?: string
  description: string
  relatedTo?: string[] // IDs of Netflix/Spotify content this event is related to
}

export interface MerchandiseItem {
  id: string
  title: string
  type: "figurine" | "clothing" | "poster" | "collectible" | "accessory"
  description: string
  price: number
  imageUrl?: string
  relatedTo?: string[] // IDs of Netflix/Spotify content this merchandise is related to
}

// Add the retail related interfaces
export interface RetailService {
  id: string
  name: string
  logo: string
  connected: boolean
}

export interface RetailPurchase {
  id: string
  userId: string
  retailServiceId: string
  items: RetailItem[]
  purchaseDate: Date
  total: number
}

export interface RetailItem {
  id: string
  name: string
  category: string
  price: number
  purchaseDate: Date
  quantity: number
}

// Mock data stores
export const users: User[] = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "$2b$10$dGOEzzVNVVGYNLKPQRRRRO9HQ9wLdAMSOG5DCwgJnA8yYAKQqOOOO", // 'password123'
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
]

export const bankConnections: UserBankConnection[] = [
  {
    id: "1",
    userId: "1",
    aggregatorAccessToken: "mock-access-token-amex",
    cardType: "AMEX",
    last4: "1008",
    institutionName: "American Express",
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02"),
  },
  {
    id: "2",
    userId: "1",
    aggregatorAccessToken: "mock-access-token-visa",
    cardType: "VISA",
    last4: "8095",
    institutionName: "Chase Bank",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-02-15"),
  },
  {
    id: "3",
    userId: "1",
    aggregatorAccessToken: "mock-access-token-apple-pay",
    cardType: "APPLE PAY",
    last4: "3333",
    institutionName: "Apple Pay",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
  },
]

export const transactions: Transaction[] = [
  // Food & Dining Transactions
  {
    id: "1",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-27"),
    description: "DoorDash - Buffalo Maitake Sandwich",
    amount: 24.67,
    category: "Food and Dining",
    merchant: "DoorDash",
    rawData: {
      merchant: "DoorDash",
      products: ["Buffalo Maitake Sandwich"],
      total: 24.67,
    },
    createdAt: new Date("2025-03-27"),
  },
  {
    id: "2",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-25"),
    description: "DoorDash - Salmon Sandwich, Chai Latte",
    amount: 32.45,
    category: "Food and Dining",
    merchant: "DoorDash",
    rawData: {
      merchant: "DoorDash",
      products: ["Salmon Sandwich", "Chai Latte"],
      total: 32.45,
    },
    createdAt: new Date("2025-03-25"),
  },
  {
    id: "3",
    userId: "1",
    bankConnectionId: "2",
    date: new Date("2025-03-22"),
    description: "DoorDash - Sushi Rolls",
    amount: 34.9,
    category: "Food and Dining",
    merchant: "DoorDash",
    rawData: {
      merchant: "DoorDash",
      products: ["Salmon Avocado Roll", "Eel Avocado Roll", "Yellowtail Belly"],
      total: 34.9,
    },
    createdAt: new Date("2025-03-22"),
  },
  {
    id: "4",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-20"),
    description: "DoorDash - Strawberry Shortcake Cookie",
    amount: 18.98,
    category: "Food and Dining",
    merchant: "DoorDash",
    rawData: {
      merchant: "DoorDash",
      products: ["Healing Strawberry Shortcake Cookie Sandwich"],
      total: 18.98,
    },
    createdAt: new Date("2025-03-20"),
  },
  {
    id: "5",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-28"),
    description: "Instacart - Groceries",
    amount: 15.48,
    category: "Groceries",
    merchant: "Instacart",
    rawData: {
      merchant: "Instacart",
      products: ["Eataly Banana", "Driscoll's Organic Blackberries", "Eataly Half Focaccia Sandwich Loaf"],
      total: 15.48,
    },
    createdAt: new Date("2025-03-28"),
  },
  {
    id: "6",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-09"),
    description: "UberEats - Sushi Combo",
    amount: 109.84,
    category: "Food and Dining",
    merchant: "UberEats",
    rawData: {
      merchant: "UberEats",
      products: ["Sushi Combo"],
      total: 109.84,
    },
    createdAt: new Date("2025-03-09"),
  },
  {
    id: "7",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-26"),
    description: "UberEats - Burrito, Vegan Salad, Chicken Sandwich",
    amount: 46.08,
    category: "Food and Dining",
    merchant: "UberEats",
    rawData: {
      merchant: "UberEats",
      products: ["Burrito", "Vegan Salad", "Chicken Sandwich"],
      total: 46.08,
    },
    createdAt: new Date("2025-03-26"),
  },

  // Transportation Transactions
  {
    id: "8",
    userId: "1",
    bankConnectionId: "3",
    date: new Date("2025-03-29"),
    description: "Uber - 5.4 miles, 28 min",
    amount: 19.5,
    category: "Transportation",
    merchant: "Uber",
    rawData: {
      merchant: "Uber",
      products: ["UberX - 5.4 miles, 28 min"],
      total: 19.5,
    },
    createdAt: new Date("2025-03-29"),
  },
  {
    id: "9",
    userId: "1",
    bankConnectionId: "3",
    date: new Date("2025-03-27"),
    description: "Uber - 4.9 miles, 21 min",
    amount: 19.5,
    category: "Transportation",
    merchant: "Uber",
    rawData: {
      merchant: "Uber",
      products: ["UberX - 4.9 miles, 21 min"],
      total: 19.5,
    },
    createdAt: new Date("2025-03-27"),
  },
  {
    id: "10",
    userId: "1",
    bankConnectionId: "3",
    date: new Date("2025-03-24"),
    description: "Uber - 6.8 miles, 27 min",
    amount: 19.5,
    category: "Transportation",
    merchant: "Uber",
    rawData: {
      merchant: "Uber",
      products: ["UberX - 6.8 miles, 27 min"],
      total: 19.5,
    },
    createdAt: new Date("2025-03-24"),
  },

  // Retail Transactions
  {
    id: "11",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-26"),
    description: "Walmart - Aleve Tablets, Hawaiian Dinner Rolls",
    amount: 60.0,
    category: "Shopping",
    merchant: "Walmart",
    rawData: {
      merchant: "Walmart",
      products: ["Aleve Tablets with Easy Open Arthritis Cap", "Freshness Guaranteed Hawaiian Dinner Rolls"],
      total: 60.0,
    },
    createdAt: new Date("2025-03-26"),
  },
  {
    id: "12",
    userId: "1",
    bankConnectionId: "1",
    date: new Date("2025-03-22"),
    description: "Walmart - Aleve Tablets, Hawaiian Dinner Rolls",
    amount: 50.0,
    category: "Shopping",
    merchant: "Walmart",
    rawData: {
      merchant: "Walmart",
      products: ["Aleve Tablets with Easy Open Arthritis Cap", "Freshness Guaranteed Hawaiian Dinner Rolls"],
      total: 50.0,
    },
    createdAt: new Date("2025-03-22"),
  },

  // Subscription Transactions
  {
    id: "13",
    userId: "1",
    bankConnectionId: "2",
    date: new Date("2025-03-21"),
    description: "Netflix Standard Plan - Monthly",
    amount: 15.49,
    category: "Entertainment",
    merchant: "Netflix",
    rawData: {
      merchant: "Netflix",
      products: ["Netflix Standard Plan - Monthly"],
      total: 15.49,
    },
    createdAt: new Date("2025-03-21"),
  },
  {
    id: "14",
    userId: "1",
    bankConnectionId: "2",
    date: new Date("2025-03-23"),
    description: "Spotify Premium Family Plan",
    amount: 15.99,
    category: "Entertainment",
    merchant: "Spotify",
    rawData: {
      merchant: "Spotify",
      products: ["Spotify Premium Family Plan"],
      total: 15.99,
    },
    createdAt: new Date("2025-03-23"),
  },
]

export const deals: Deal[] = [
  {
    id: "1",
    title: "15% off your next DoorDash order",
    description: "Get 15% off your next DoorDash order when you spend $25 or more.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "AMEX",
    categories: ["Food and Dining", "Delivery"],
    merchant: "DoorDash",
    discountAmount: 15,
    discountType: "percentage",
    minPurchase: 25,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "2",
    title: "$5 off your next Uber ride",
    description: "Get $5 off your next Uber ride when you spend $15 or more.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: null,
    categories: ["Transportation", "Travel"],
    merchant: "Uber",
    discountAmount: 5,
    discountType: "fixed",
    minPurchase: 15,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "3",
    title: "10% off at Walmart",
    description: "Get 10% off your next Walmart purchase up to $20 in savings.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "VISA",
    categories: ["Shopping", "Retail", "Groceries"],
    merchant: "Walmart",
    discountAmount: 10,
    discountType: "percentage",
    minPurchase: null,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "4",
    title: "Free delivery on Instacart",
    description: "Get free delivery on your next Instacart order over $35.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: null,
    categories: ["Groceries", "Delivery"],
    merchant: "Instacart",
    discountAmount: 0,
    discountType: "fixed",
    minPurchase: 35,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "5",
    title: "20% off at UberEats",
    description: "Get 20% off your next UberEats purchase in-store or online.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "AMEX",
    categories: ["Food and Dining", "Delivery"],
    merchant: "UberEats",
    discountAmount: 20,
    discountType: "percentage",
    minPurchase: null,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "6",
    title: "$10 off at Sushi restaurants",
    description: "Get $10 off your next sushi order of $50 or more.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: null,
    categories: ["Food and Dining", "Restaurant"],
    merchant: null,
    discountAmount: 10,
    discountType: "fixed",
    minPurchase: 50,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "7",
    title: "1 month free Netflix",
    description: "Get 1 month free when you pay with your linked VISA card.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "VISA",
    categories: ["Entertainment", "Streaming"],
    merchant: "Netflix",
    discountAmount: 100,
    discountType: "percentage",
    minPurchase: null,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "8",
    title: "50% off first 3 months of Spotify Premium",
    description: "New subscribers get 50% off for the first 3 months of Spotify Premium.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "VISA",
    categories: ["Entertainment", "Music"],
    merchant: "Spotify",
    discountAmount: 50,
    discountType: "percentage",
    minPurchase: null,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "9",
    title: "15% off your next grocery order",
    description: "Get 15% off your next grocery order at any supermarket when you spend $75 or more.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "AMEX",
    categories: ["Groceries"],
    merchant: null,
    discountAmount: 15,
    discountType: "percentage",
    minPurchase: 75,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "10",
    title: "$25 off your next Apple Pay purchase",
    description: "Get $25 off when you spend $100 or more using Apple Pay.",
    validFrom: new Date("2025-03-01"),
    validTo: new Date("2025-12-31"),
    cardRequired: "APPLE PAY",
    categories: ["Shopping"],
    merchant: null,
    discountAmount: 25,
    discountType: "fixed",
    minPurchase: 100,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
]

export const userDeals: UserDeal[] = [
  {
    id: "1",
    userId: "1",
    dealId: "1",
    clicked: true,
    claimed: true,
    knotConnected: true,
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-10"),
  },
  {
    id: "2",
    userId: "1",
    dealId: "3",
    clicked: true,
    claimed: true,
    knotConnected: true,
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-03-15"),
  },
  {
    id: "3",
    userId: "1",
    dealId: "7",
    clicked: true,
    claimed: true,
    knotConnected: true,
    createdAt: new Date("2025-03-16"),
    updatedAt: new Date("2025-03-16"),
  },
  {
    id: "4",
    userId: "1",
    dealId: "8",
    clicked: true,
    claimed: true,
    knotConnected: true,
    createdAt: new Date("2025-03-17"),
    updatedAt: new Date("2025-03-17"),
  },
]

// Add Media History Data
export const netflixHistory: NetflixWatchHistory[] = [
  {
    id: "n1",
    userId: "1",
    title: "Stranger Things",
    type: "series",
    genre: ["Sci-Fi", "Horror", "Drama"],
    watchDate: new Date("2025-03-15"),
    duration: 50
  },
  {
    id: "n2",
    userId: "1",
    title: "The Queen's Gambit",
    type: "series",
    genre: ["Drama"],
    watchDate: new Date("2025-03-18"),
    duration: 60
  },
  {
    id: "n3",
    userId: "1",
    title: "Hamilton",
    type: "movie",
    genre: ["Musical", "Drama", "History"],
    watchDate: new Date("2025-03-20"),
    duration: 160
  },
  {
    id: "n4",
    userId: "1",
    title: "Bohemian Rhapsody",
    type: "movie",
    genre: ["Drama", "Music", "Biography"],
    watchDate: new Date("2025-03-24"),
    duration: 133
  },
  {
    id: "n5",
    userId: "1",
    title: "La La Land",
    type: "movie",
    genre: ["Musical", "Romance", "Drama"],
    watchDate: new Date("2025-03-27"),
    duration: 128
  }
];

export const spotifyHistory: SpotifyListenHistory[] = [
  {
    id: "s1",
    userId: "1",
    trackName: "Bohemian Rhapsody",
    artist: "Queen",
    genre: ["Rock", "Classic Rock"],
    listenDate: new Date("2025-03-25"),
    duration: 6
  },
  {
    id: "s2",
    userId: "1",
    trackName: "Welcome to the Black Parade",
    artist: "My Chemical Romance",
    genre: ["Rock", "Alternative", "Emo"],
    listenDate: new Date("2025-03-26"),
    duration: 5
  },
  {
    id: "s3",
    userId: "1",
    trackName: "Alexander Hamilton",
    artist: "Hamilton Original Broadway Cast",
    genre: ["Broadway", "Musical", "Rap"],
    listenDate: new Date("2025-03-27"),
    duration: 4
  },
  {
    id: "s4",
    userId: "1",
    trackName: "City of Stars",
    artist: "Ryan Gosling & Emma Stone",
    genre: ["Soundtrack", "Jazz", "Musical"],
    listenDate: new Date("2025-03-28"),
    duration: 4
  },
  {
    id: "s5",
    userId: "1",
    trackName: "Running Up That Hill",
    artist: "Kate Bush",
    genre: ["Pop", "80s", "Alternative"],
    listenDate: new Date("2025-03-29"),
    duration: 5
  }
];

// Define the entertainment events first
export const entertainmentEvents: EntertainmentEvent[] = [
  {
    id: "e1",
    title: "Queen + Adam Lambert - The Rhapsody Tour",
    type: "concert",
    performers: ["Queen", "Adam Lambert"],
    venue: "Madison Square Garden, New York",
    date: new Date("2025-04-15"),
    price: 120,
    genres: ["Rock", "Classic Rock"],
    imageUrl: "https://example.com/queen-concert.jpg",
    description: "Experience the legendary music of Queen performed by Adam Lambert and original band members Brian May and Roger Taylor.",
    relatedTo: ["s1"] // Related to Bohemian Rhapsody listen history
  },
  {
    id: "e2",
    title: "Hamilton - Broadway Musical",
    type: "musical",
    performers: ["Broadway Cast"],
    venue: "Richard Rodgers Theatre, New York",
    date: new Date("2025-04-20"),
    price: 250,
    genres: ["Musical", "Broadway", "Historical"],
    imageUrl: "https://example.com/hamilton.jpg",
    description: "The story of America's Founding Father Alexander Hamilton, an immigrant from the West Indies who became George Washington's right-hand man during the Revolutionary War.",
    relatedTo: ["n3", "s3"] // Related to Hamilton watch/listen history
  },
  {
    id: "e3",
    title: "My Chemical Romance Reunion Tour",
    type: "concert",
    performers: ["My Chemical Romance"],
    venue: "Barclays Center, Brooklyn",
    date: new Date("2025-04-10"),
    price: 95,
    genres: ["Rock", "Alternative", "Emo"],
    imageUrl: "https://example.com/mcr-concert.jpg",
    description: "Don't miss the legendary reunion tour of My Chemical Romance!",
    relatedTo: ["s2"] // Related to Black Parade listen history
  },
  {
    id: "e4",
    title: "La La Land in Concert",
    type: "show",
    performers: ["Live Orchestra"],
    venue: "Lincoln Center, New York",
    date: new Date("2025-04-25"),
    price: 85,
    genres: ["Soundtrack", "Jazz", "Musical"],
    imageUrl: "https://example.com/lalaland-concert.jpg",
    description: "Experience the Academy Award-winning film La La Land with a live orchestra performing the score.",
    relatedTo: ["n5", "s4"] // Related to La La Land watch history and City of Stars
  },
  {
    id: "e5",
    title: "Stranger Things: The Experience",
    type: "show",
    performers: ["Immersive Experience Cast"],
    venue: "Brooklyn Navy Yard, New York",
    date: new Date("2025-04-01"),
    price: 65,
    genres: ["Sci-Fi", "Immersive", "Interactive"],
    imageUrl: "https://example.com/stranger-things-experience.jpg",
    description: "Step into the world of Hawkins in this immersive experience based on the hit Netflix series.",
    relatedTo: ["n1"] // Related to Stranger Things watch history
  }
];

// Define the additionalEvents array
export const additionalEvents: EntertainmentEvent[] = [
  {
    id: "e6",
    title: "Kate Bush: Before the Dawn - Live Concert Film",
    type: "movie",
    performers: ["Kate Bush"],
    venue: "Angelika Film Center, New York",
    date: new Date("2025-04-15"),
    price: 20,
    genres: ["Music", "Concert Film"],
    imageUrl: "https://example.com/kate-bush-film.jpg",
    description: "Experience Kate Bush's legendary 'Before the Dawn' concert series on the big screen with enhanced audio.",
    relatedTo: ["s5"] // Related to Running Up That Hill listen history
  },
  {
    id: "e7",
    title: "My Chemical Romance Pop-Up Shop & Museum",
    type: "show",
    performers: ["Exhibit"],
    venue: "SoHo, New York",
    date: new Date("2025-04-05"),
    price: 15,
    genres: ["Music", "Exhibition"],
    imageUrl: "https://example.com/mcr-museum.jpg",
    description: "A limited-time exhibition featuring rare memorabilia, costumes, and interactive installations from My Chemical Romance's history.",
    relatedTo: ["s2"] // Related to Black Parade listen history
  },
  {
    id: "e8",
    title: "Sci-Fi TV Fest: Stranger Things Panel",
    type: "show",
    performers: ["Cast of Stranger Things"],
    venue: "Javits Center, New York",
    date: new Date("2025-04-12"),
    price: 45,
    genres: ["Television", "Sci-Fi", "Panel"],
    imageUrl: "https://example.com/stranger-things-panel.jpg",
    description: "Meet the cast of Stranger Things in this exclusive panel discussion with behind-the-scenes insights.",
    relatedTo: ["n1"] // Related to Stranger Things watch history
  }
];

// Add the additional events to the main events array
additionalEvents.forEach(event => entertainmentEvents.push(event));

export const merchandiseItems: MerchandiseItem[] = [
  {
    id: "m1",
    title: "Stranger Things Demogorgon Figurine",
    type: "figurine",
    description: "Detailed collectible figurine of the Demogorgon from Stranger Things. Perfect for fans of the show!",
    price: 29.99,
    imageUrl: "https://example.com/demogorgon-figurine.jpg",
    relatedTo: ["n1"] // Related to Stranger Things
  },
  {
    id: "m2",
    title: "Hamilton Broadway Poster",
    type: "poster",
    description: "Official Broadway poster from the hit musical Hamilton. Signed by the original cast.",
    price: 49.99,
    imageUrl: "https://example.com/hamilton-poster.jpg",
    relatedTo: ["n3", "s3"] // Related to Hamilton watch/listen history
  },
  {
    id: "m3",
    title: "Queen 'A Kind of Magic' Vinyl",
    type: "collectible",
    description: "Limited edition vinyl recording of Queen's 'A Kind of Magic' album. A must-have for any Queen fan.",
    price: 34.99,
    imageUrl: "https://example.com/queen-vinyl.jpg",
    relatedTo: ["s1"] // Related to Bohemian Rhapsody listen history
  },
  {
    id: "m4",
    title: "My Chemical Romance Welcome to the Black Parade T-Shirt",
    type: "clothing",
    description: "Official band merchandise T-shirt with the iconic Black Parade design. Made from premium cotton.",
    price: 24.99,
    imageUrl: "https://example.com/mcr-tshirt.jpg",
    relatedTo: ["s2"] // Related to Black Parade listen history
  },
  {
    id: "m5",
    title: "La La Land Piano Sheet Music Collection",
    type: "collectible",
    description: "Complete sheet music collection from the La La Land soundtrack, including 'City of Stars' and more.",
    price: 19.99,
    imageUrl: "https://example.com/lalaland-music.jpg",
    relatedTo: ["n5", "s4"] // Related to La La Land watch history and City of Stars
  }
];

// Add to the existing data at the appropriate place
export const retailServices: RetailService[] = [
  {
    id: "walmart",
    name: "Walmart",
    logo: "https://logo.clearbit.com/walmart.com",
    connected: true
  },
  {
    id: "instacart",
    name: "Instacart",
    logo: "https://logo.clearbit.com/instacart.com",
    connected: true
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://logo.clearbit.com/amazon.com",
    connected: false
  },
  {
    id: "target",
    name: "Target",
    logo: "https://logo.clearbit.com/target.com",
    connected: false
  }
];

export const retailPurchases: RetailPurchase[] = [
  {
    id: "rp1",
    userId: "1",
    retailServiceId: "walmart",
    items: [
      {
        id: "ri1",
        name: "Hamilton Original Cast Recording Vinyl",
        category: "Music",
        price: 29.99,
        purchaseDate: new Date("2025-03-20"),
        quantity: 1
      },
      {
        id: "ri2",
        name: "Queen Greatest Hits Collection",
        category: "Music",
        price: 15.99,
        purchaseDate: new Date("2025-03-20"),
        quantity: 1
      },
      {
        id: "ri3",
        name: "Stranger Things Season 4 Blu-ray",
        category: "Movies",
        price: 34.99,
        purchaseDate: new Date("2025-03-20"),
        quantity: 1
      }
    ],
    purchaseDate: new Date("2025-03-20"),
    total: 80.97
  },
  {
    id: "rp2",
    userId: "1",
    retailServiceId: "instacart",
    items: [
      {
        id: "ri4",
        name: "Popcorn Family Size",
        category: "Snacks",
        price: 5.99,
        purchaseDate: new Date("2025-03-27"),
        quantity: 2
      },
      {
        id: "ri5",
        name: "Organic Microwave Popcorn",
        category: "Snacks",
        price: 4.49,
        purchaseDate: new Date("2025-03-27"),
        quantity: 3
      },
      {
        id: "ri6",
        name: "Movie Theater Butter Topping",
        category: "Condiments",
        price: 3.99,
        purchaseDate: new Date("2025-03-27"),
        quantity: 1
      }
    ],
    purchaseDate: new Date("2025-03-27"),
    total: 23.44
  }
];

// Add new product recommendations based on retail and media history
export interface ProductRecommendation {
  id: string
  title: string
  category: string
  price: number
  imageUrl?: string
  description: string
  retailerId: string
  retailerName: string
  relevance: "media" | "retail" | "both"
  relatedToItems?: string[] // IDs of retail items/media content this is related to
}

export const productRecommendations: ProductRecommendation[] = [
  {
    id: "pr1",
    title: "Music Festival Survival Kit",
    category: "Accessories",
    price: 39.99,
    imageUrl: "https://example.com/festival-kit.jpg",
    description: "Everything you need for your next concert: portable charger, water bottle, earplugs, and more.",
    retailerId: "amazon",
    retailerName: "Amazon",
    relevance: "both",
    relatedToItems: ["s1", "s2", "ri1", "ri2"] // Related to music history and purchases
  },
  {
    id: "pr2",
    title: "Home Theater Popcorn Machine",
    category: "Appliances",
    price: 79.99,
    imageUrl: "https://example.com/popcorn-machine.jpg",
    description: "Bring the movie theater experience home with this retro-style popcorn maker.",
    retailerId: "walmart",
    retailerName: "Walmart",
    relevance: "retail",
    relatedToItems: ["ri4", "ri5", "ri6"] // Related to popcorn purchases
  },
  {
    id: "pr3",
    title: "Stranger Things Collector's Edition Box Set",
    category: "Entertainment",
    price: 129.99,
    imageUrl: "https://example.com/stranger-things-box.jpg",
    description: "Limited edition box set with all seasons, behind-the-scenes content, and exclusive merchandise.",
    retailerId: "amazon",
    retailerName: "Amazon",
    relevance: "media",
    relatedToItems: ["n1", "ri3"] // Related to Stranger Things
  },
  {
    id: "pr4",
    title: "Musical Theater Songbook Collection",
    category: "Books",
    price: 45.99,
    imageUrl: "https://example.com/musical-songbook.jpg",
    description: "Sheet music and lyrics from Broadway's biggest hits including Hamilton and more.",
    retailerId: "target",
    retailerName: "Target",
    relevance: "media",
    relatedToItems: ["n3", "s3"] // Related to Hamilton
  },
  {
    id: "pr5",
    title: "Premium Vinyl Record Player",
    category: "Electronics",
    price: 199.99,
    imageUrl: "https://example.com/record-player.jpg",
    description: "High-quality turntable with built-in speakers and Bluetooth connectivity.",
    retailerId: "walmart",
    retailerName: "Walmart",
    relevance: "retail",
    relatedToItems: ["ri1", "ri2"] // Related to vinyl purchases
  }
];

// Mock data access functions
export const mockDb = {
  // User functions
  findUserByEmail: (email: string) => {
    return users.find((user) => user.email === email) || null
  },
  findUserById: (id: string) => {
    return users.find((user) => user.id === id) || null
  },
  createUser: (data: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    const newUser = {
      id: String(users.length + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.push(newUser)
    return newUser
  },

  // Bank connection functions
  findBankConnectionsByUserId: (userId: string) => {
    return bankConnections.filter((conn) => conn.userId === userId)
  },
  createBankConnection: (data: Omit<UserBankConnection, "id" | "createdAt" | "updatedAt">) => {
    const newConnection = {
      id: String(bankConnections.length + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    bankConnections.push(newConnection)
    return newConnection
  },

  // Transaction functions
  findTransactionsByUserId: (userId: string) => {
    return transactions.filter((tx) => tx.userId === userId)
  },
  createTransaction: (data: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction = {
      id: String(transactions.length + 1),
      ...data,
      createdAt: new Date(),
    }
    transactions.push(newTransaction)
    return newTransaction
  },
  createManyTransactions: (data: Omit<Transaction, "id" | "createdAt">[]) => {
    const newTransactions = data.map((tx, index) => ({
      id: String(transactions.length + index + 1),
      ...tx,
      createdAt: new Date(),
    }))
    transactions.push(...newTransactions)
    return newTransactions.length
  },

  // Deal functions
  findAllDeals: (options: { category?: string; limit?: number; offset?: number } = {}) => {
    let filteredDeals = deals.filter((deal) => deal.validTo >= new Date())

    if (options.category) {
      filteredDeals = filteredDeals.filter((deal) => deal.categories.includes(options.category))
    }

    const total = filteredDeals.length

    if (options.offset !== undefined) {
      filteredDeals = filteredDeals.slice(options.offset)
    }

    if (options.limit !== undefined) {
      filteredDeals = filteredDeals.slice(0, options.limit)
    }

    return { deals: filteredDeals, total }
  },
  findDealById: (id: string) => {
    return deals.find((deal) => deal.id === id) || null
  },

  // User deal functions
  findUserDealsByUserId: (userId: string) => {
    return userDeals
      .filter((ud) => ud.userId === userId)
      .map((ud) => ({
        ...ud,
        deal: deals.find((d) => d.id === ud.dealId)!,
      }))
  },
  createOrUpdateUserDeal: (data: { userId: string; dealId: string; clicked: boolean; claimed: boolean; knotConnected?: boolean }) => {
    const existingIndex = userDeals.findIndex((ud) => ud.userId === data.userId && ud.dealId === data.dealId)

    if (existingIndex >= 0) {
      userDeals[existingIndex] = {
        ...userDeals[existingIndex],
        ...data,
        updatedAt: new Date(),
      }
      return userDeals[existingIndex]
    } else {
      const newUserDeal = {
        id: String(userDeals.length + 1),
        ...data,
        knotConnected: data.knotConnected || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      userDeals.push(newUserDeal)
      return newUserDeal
    }
  },

  // Find Knot connected companies for a user
  getUserKnotConnections: (userId: string) => {
    const userConnectedDeals = userDeals
      .filter(ud => ud.userId === userId && ud.knotConnected)
      .map(ud => {
        const deal = deals.find(d => d.id === ud.dealId);
        return deal?.merchant || null;
      })
      .filter(merchant => merchant !== null);
    
    return Array.from(new Set(userConnectedDeals));
  },

  // Mark a company as connected via Knot
  markCompanyAsKnotConnected: (userId: string, merchantName: string) => {
    // Find all deals from this merchant
    const merchantDeals = deals.filter(deal => deal.merchant === merchantName);
    
    // Update all user deals for these merchant deals
    merchantDeals.forEach(deal => {
      const existingUserDeal = userDeals.find(ud => ud.userId === userId && ud.dealId === deal.id);
      
      if (existingUserDeal) {
        existingUserDeal.knotConnected = true;
        existingUserDeal.updatedAt = new Date();
      } else {
        userDeals.push({
          id: String(userDeals.length + 1),
          userId,
          dealId: deal.id,
          clicked: true,
          claimed: true,
          knotConnected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    return true;
  },

  // Analytics functions
  getUserTransactionStats: (userId: string) => {
    const userTransactions = transactions.filter((tx) => tx.userId === userId)
    const categories = new Set(userTransactions.map((tx) => tx.category).filter(Boolean))
    const merchants = new Set(userTransactions.map((tx) => tx.merchant).filter(Boolean))
    const total = userTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    return {
      total_transactions: userTransactions.length,
      recent_transactions: userTransactions.filter((tx) => {
        const now = new Date()
        const txDate = new Date(tx.date)
        const diffTime = Math.abs(now.getTime() - txDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      }).length,
      categories: categories.size,
      merchants: merchants.size,
      total_spent: total.toFixed(2),
    }
  },
  getUserTopCategories: (userId: string) => {
    const userTransactions = transactions.filter((tx) => tx.userId === userId)
    const categoryCounts = {}

    userTransactions.forEach((tx) => {
      if (tx.category) {
        categoryCounts[tx.category] = (categoryCounts[tx.category] || 0) + 1
      }
    })

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0])
  },
  getUserTopMerchants: (userId: string) => {
    const userTransactions = transactions.filter((tx) => tx.userId === userId)
    const merchantCounts = {}

    userTransactions.forEach((tx) => {
      if (tx.merchant) {
        merchantCounts[tx.merchant] = (merchantCounts[tx.merchant] || 0) + 1
      }
    })

    return Object.entries(merchantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0])
  },
  getAllCategories: () => {
    const categories = new Set<string>()
    deals.forEach((deal) => {
      deal.categories.forEach((category) => {
        categories.add(category)
      })
    })
    return Array.from(categories).sort()
  },
  getAllMerchants: () => {
    return Array.from(new Set(deals.map((deal) => deal.merchant).filter(Boolean))) as string[]
  },
  getRecommendedDeals: (userId: string, limit = 10) => {
    // In a real app, this would be a much more sophisticated algorithm
    return deals
      .sort(() => 0.5 - Math.random()) // Randomly shuffle
      .slice(0, limit)
      .map((deal) => ({
        ...deal,
        // Stringify dates for easier consumption by components
        validFrom: deal.validFrom.toISOString(),
        validTo: deal.validTo.toISOString(),
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
      }))
  },

  // New methods for media-related data
  getUserNetflixHistory: (userId: string) => {
    return netflixHistory
      .filter(item => item.userId === userId)
      .sort((a, b) => b.watchDate.getTime() - a.watchDate.getTime())
  },
  
  getUserSpotifyHistory: (userId: string) => {
    return spotifyHistory
      .filter(item => item.userId === userId)
      .sort((a, b) => b.listenDate.getTime() - a.listenDate.getTime())
  },
  
  // Get user's favorite genres across Netflix and Spotify
  getUserFavoriteGenres: (userId: string) => {
    const netflix = netflixHistory.filter(item => item.userId === userId);
    const spotify = spotifyHistory.filter(item => item.userId === userId);
    
    const genreCounts = {};
    
    // Count genres from Netflix
    netflix.forEach(item => {
      item.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    // Count genres from Spotify
    spotify.forEach(item => {
      item.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  },
  
  // Get recommended events based on user's watch/listen history
  getRecommendedEvents: (userId: string) => {
    const netflix = netflixHistory.filter(item => item.userId === userId);
    const spotify = spotifyHistory.filter(item => item.userId === userId);
    
    // Collect all content IDs that might relate to events
    const contentIds = [
      ...netflix.map(item => item.id),
      ...spotify.map(item => item.id)
    ];
    
    // Find events related to the user's content
    const relatedEvents = entertainmentEvents.filter(event => {
      if (!event.relatedTo) return false;
      return event.relatedTo.some(id => contentIds.includes(id));
    });
    
    // If we don't have enough related events, add some random ones
    let recommendedEvents = [...relatedEvents];
    
    if (recommendedEvents.length < 4) {
      const randomEvents = entertainmentEvents
        .filter(event => !recommendedEvents.includes(event))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 - recommendedEvents.length);
      
      recommendedEvents = [...recommendedEvents, ...randomEvents];
    }
    
    return recommendedEvents.map(event => ({
      ...event,
      date: event.date.toISOString()
    }));
  },

  // New method for merchandise-related data
  getRecommendedMerchandise: (userId: string) => {
    const netflix = netflixHistory.filter(item => item.userId === userId);
    const spotify = spotifyHistory.filter(item => item.userId === userId);
    
    // Collect all content IDs that might relate to merchandise
    const contentIds = [
      ...netflix.map(item => item.id),
      ...spotify.map(item => item.id)
    ];
    
    // Find merchandise related to the user's content
    const relatedMerchandise = merchandiseItems.filter(item => {
      if (!item.relatedTo) return false;
      return item.relatedTo.some(id => contentIds.includes(id));
    });
    
    // If we don't have enough related merchandise, add some random ones
    let recommendedMerchandise = [...relatedMerchandise];
    
    if (recommendedMerchandise.length < 3) {
      const randomMerchandise = merchandiseItems
        .filter(item => !recommendedMerchandise.includes(item))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3 - recommendedMerchandise.length);
      
      recommendedMerchandise = [...recommendedMerchandise, ...randomMerchandise];
    }
    
    return recommendedMerchandise;
  },

  // Add methods to the mockDb object for the new data types
  getRetailServices: (userId: string) => {
    return retailServices.map(service => {
      // If connected, add purchase history
      if (service.connected) {
        const userPurchases = retailPurchases.filter(
          purchase => purchase.userId === userId && purchase.retailServiceId === service.id
        );
        
        return {
          ...service,
          purchaseHistory: {
            items: userPurchases.flatMap(purchase => 
              purchase.items.map(item => ({
                name: item.name,
                category: item.category,
                purchaseDate: item.purchaseDate.toISOString()
              }))
            )
          }
        };
      }
      
      return service;
    });
  },

  connectRetailService: (userId: string, serviceId: string) => {
    const serviceIndex = retailServices.findIndex(s => s.id === serviceId);
    if (serviceIndex >= 0) {
      retailServices[serviceIndex].connected = true;
      return true;
    }
    return false;
  },

  disconnectRetailService: (userId: string, serviceId: string) => {
    const serviceIndex = retailServices.findIndex(s => s.id === serviceId);
    if (serviceIndex >= 0 && retailServices[serviceIndex].connected) {
      retailServices[serviceIndex].connected = false;
      return true;
    }
    return false;
  },

  getProductRecommendations: (userId: string, category?: string) => {
    // In a real app, this would use algorithms to determine relevant products
    // based on the user's media and retail purchase history
    
    let recommendations = productRecommendations;
    
    // Filter by category if provided
    if (category) {
      recommendations = recommendations.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    return recommendations;
  },

  // Add getEventRecommendations as an alias for getRecommendedEvents for consistency
  getEventRecommendations: (userId: string) => {
    return mockDb.getRecommendedEvents(userId);
  }
}

