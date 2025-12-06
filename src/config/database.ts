import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.url);
    console.info('✅ MongoDB connected successfully');

    mongoose.connection.on('error', error => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
