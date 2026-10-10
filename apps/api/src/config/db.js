import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    family: 4
  };

  try {
    await mongoose.connect(env.MONGODB_URI, connectionOptions);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (atlasError) {
    console.warn('Atlas connection failed, falling back to local MongoDB:', atlasError.message);

    if (env.MONGODB_LOCAL_URI && env.MONGODB_LOCAL_URI !== env.MONGODB_URI) {
      await mongoose.connect(env.MONGODB_LOCAL_URI, connectionOptions);
      console.log('Connected to MongoDB');
      return mongoose.connection;
    }

    throw atlasError;
  }
};

export const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};