import { getCollection } from './mongodb';
import { ServiceData, UserConnection } from '../models/ServiceData';
import mongoose from 'mongoose';

// Initialize mongoose connection
const initMongoose = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.example.mongodb.net/?retryWrites=true&w=majority');
  }
};

// ServiceDataService - handles all service data operations
export class ServiceDataService {
  
  // Get service data for a user
  static async getServiceData(userId: string) {
    await initMongoose();
    
    try {
      // Find the user's service data document
      const serviceData = await ServiceData.findOne({ userId });
      return serviceData || null;
    } catch (error) {
      console.error('Error fetching service data:', error);
      throw error;
    }
  }
  
  // Update or create Spotify data for a user
  static async updateSpotifyData(userId: string, spotifyData: any) {
    await initMongoose();
    
    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...spotifyData,
        lastUpdated: new Date()
      };
      
      // Update or create the service data document
      const result = await ServiceData.findOneAndUpdate(
        { userId },
        { 
          $set: { userId, spotify: dataWithTimestamp }
        },
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating Spotify data:', error);
      throw error;
    }
  }
  
  // Update or create Netflix data for a user
  static async updateNetflixData(userId: string, netflixData: any) {
    await initMongoose();
    
    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...netflixData,
        lastUpdated: new Date()
      };
      
      // Update or create the service data document
      const result = await ServiceData.findOneAndUpdate(
        { userId },
        { 
          $set: { userId, netflix: dataWithTimestamp }
        },
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating Netflix data:', error);
      throw error;
    }
  }
  
  // Update or create DoorDash data for a user
  static async updateDoorDashData(userId: string, doordashData: any) {
    await initMongoose();
    
    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...doordashData,
        lastUpdated: new Date()
      };
      
      // Update or create the service data document
      const result = await ServiceData.findOneAndUpdate(
        { userId },
        { 
          $set: { userId, doordash: dataWithTimestamp }
        },
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating DoorDash data:', error);
      throw error;
    }
  }
  
  // Update or create Uber data for a user
  static async updateUberData(userId: string, uberData: any) {
    await initMongoose();
    
    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...uberData,
        lastUpdated: new Date()
      };
      
      // Update or create the service data document
      const result = await ServiceData.findOneAndUpdate(
        { userId },
        { 
          $set: { userId, uber: dataWithTimestamp }
        },
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating Uber data:', error);
      throw error;
    }
  }
  
  // Update or create Amazon data for a user
  static async updateAmazonData(userId: string, amazonData: any) {
    await initMongoose();
    
    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...amazonData,
        lastUpdated: new Date()
      };
      
      // Update or create the service data document
      const result = await ServiceData.findOneAndUpdate(
        { userId },
        { 
          $set: { userId, amazon: dataWithTimestamp }
        },
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating Amazon data:', error);
      throw error;
    }
  }
}

// UserConnectionService - handles all user connection operations
export class UserConnectionService {
  
  // Get all connections for a user
  static async getUserConnections(userId: string) {
    await initMongoose();
    
    try {
      const connections = await UserConnection.find({ 
        userId, 
        isActive: true 
      });
      
      return connections;
    } catch (error) {
      console.error('Error fetching user connections:', error);
      throw error;
    }
  }
  
  // Add a new connection for a user
  static async addUserConnection(
    userId: string, 
    merchantName: string, 
    merchantId: number, 
    connectionId: string,
    metadata?: any
  ) {
    await initMongoose();
    
    try {
      const connection = await UserConnection.findOneAndUpdate(
        { userId, merchantName },
        {
          userId,
          merchantName,
          merchantId,
          connectionId,
          connectedAt: new Date(),
          isActive: true,
          metadata: metadata || {}
        },
        { upsert: true, new: true }
      );
      
      return connection;
    } catch (error) {
      console.error('Error adding user connection:', error);
      throw error;
    }
  }
  
  // Remove a connection (mark as inactive)
  static async removeUserConnection(userId: string, merchantName: string) {
    await initMongoose();
    
    try {
      const connection = await UserConnection.findOneAndUpdate(
        { userId, merchantName },
        { isActive: false },
        { new: true }
      );
      
      return connection;
    } catch (error) {
      console.error('Error removing user connection:', error);
      throw error;
    }
  }
} 