const mongoose = require('mongoose');
const env = require('./env');

let mongoMemoryServerInstance = null;

const getSafeMongoUri = (uri) => uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:********@');

const connectDB = async () => {
  try {
    if (env.MONGODB_URI && env.MONGODB_URI.includes('<db_password>')) {
      throw new Error('MONGODB_URI still contains the <db_password> placeholder');
    }

    if (env.MONGODB_URI) {
      console.log(`[DB] Connecting to configured MongoDB URI: ${getSafeMongoUri(env.MONGODB_URI)}`);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] MongoDB connected successfully.');
      return;
    }
  } catch (err) {
    console.warn(`[DB] Could not connect to configured MongoDB URI (${err.message}). Falling back to in-memory database...`);
  }

  // In-Memory MongoDB Fallback
  try {
    console.log('[DB] Initializing in-memory MongoDB server for seamless zero-config operation...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] In-Memory MongoDB started and connected at: ${uri}`);
  } catch (memoryErr) {
    console.error('[DB] Failed to start In-Memory MongoDB server:', memoryErr.message);
    throw memoryErr;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
  } catch (err) {
    console.error('[DB] Error during database disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
