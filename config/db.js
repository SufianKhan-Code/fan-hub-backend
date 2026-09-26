import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const primaryUri = process.env.MONGO_URI;

  if (!primaryUri && isProduction) {
    throw new Error('MONGO_URI must be configured in production.');
  }

  if (!connectionPromise) {
    connectionPromise = connectToMongo(primaryUri || 'mongodb://127.0.0.1:27017/fanhubplus', isProduction)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

const connectToMongo = async (primaryUri, isProduction) => {
  try {
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: isProduction ? 10000 : 2000,
    });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (err) {
    if (isProduction) {
      throw err;
    }

    console.warn(`Could not connect to primary MongoDB: ${err.message}`);
    console.log('Initializing embedded MongoDB instance...');

    try {
      memoryServer ??= await MongoMemoryServer.create({
        instance: { dbName: 'fanhubplus' }
      });
      await mongoose.connect(memoryServer.getUri());
      console.log('Embedded MongoDB connected successfully.');
      return mongoose.connection;
    } catch (memErr) {
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  connectionPromise = null;
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
