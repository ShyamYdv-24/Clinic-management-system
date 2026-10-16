/**
 * Re-export database utilities from src/db/mongodb
 * Provides standardized path lib/db/mongodb.ts
 */
export {
  connectToDatabase,
  disconnectFromDatabase,
  isDatabaseConnected,
  checkDatabaseHealth,
} from '../../db/mongodb';
