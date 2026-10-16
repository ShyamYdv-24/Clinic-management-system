import mongoose from 'mongoose';
import { validateEnv } from '../validation/env.schema';

// Security boundary: Prevent browser code from importing or executing database connector
if (typeof window !== 'undefined') {
  throw new Error('Security Error: Database connector cannot be executed in browser/client environments.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache || { conn: null, promise: null };
globalThis.mongooseCache = cached;

/**
 * Sanitizes MongoDB connection URIs to avoid exposing passwords in logs or error messages.
 */
function sanitizeUri(uri: string): string {
  try {
    return uri.replace(/:([^:@]+)@/, ':****@');
  } catch {
    return 'mongodb+srv://****:****@cluster';
  }
}

/**
 * Reusable, safe database connection for MongoDB Atlas using Mongoose.
 * Reuses existing connections in serverless or development environments to prevent connection storms.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const envValidation = validateEnv();
  if (!envValidation.valid) {
    console.warn(`[Database Configuration Notice] Environment check: ${envValidation.error}`);
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // If MONGODB_URI is unconfigured in development, log a safe notice without crashing the dev server
    return null;
  }

  // If already connected and ready, return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const sanitized = sanitizeUri(uri);
    console.log(`[Database] Connecting to MongoDB Atlas (${sanitized})...`);

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev/staging
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((instance) => {
        console.log('[Database] Connected to MongoDB Atlas successfully.');
        return instance;
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : 'Unknown database connection error';
        console.warn(`[Database Warning] Unable to connect to MongoDB: ${errorMsg}`);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}

/**
 * Gracefully close database connection (useful during tests or server shutdown)
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[Database] Disconnected from MongoDB.');
  }
}

/**
 * Returns true if MongoDB connection is open and ready
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Detailed database health check report
 */
export function checkDatabaseHealth(): {
  status: 'connected' | 'connecting' | 'disconnected' | 'unconfigured';
  readyState: number;
  databaseName?: string;
} {
  const state = mongoose.connection.readyState;
  const stateMap: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = !process.env.MONGODB_URI
    ? 'unconfigured'
    : (stateMap[state] === 'connected' ? 'connected' : stateMap[state] === 'connecting' ? 'connecting' : 'disconnected');

  return {
    status,
    readyState: state,
    databaseName: mongoose.connection.name || undefined,
  };
}
