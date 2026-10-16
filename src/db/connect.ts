/**
 * Re-exporting from src/db/mongodb.ts for backwards compatibility
 */
export {
  connectToDatabase,
  disconnectFromDatabase,
  isDatabaseConnected,
  checkDatabaseHealth,
} from './mongodb';
