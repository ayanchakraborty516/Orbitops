import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect: ${error.message}`);
    // Don't crash immediately so health checks can report DB status
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
