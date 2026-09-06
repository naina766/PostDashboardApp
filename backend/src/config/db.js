import mongoose from "mongoose";
import dns from "dns";
import User from "../modules/auth/auth.model.js";

/**
 * Production-ready MongoDB Connection Manager
 * Includes pool controls, timeout resilience, reconnection telemetry, and graceful shutdown.
 */
const connectDB = async () => {
  // Environment-driven DNS resolution fallback for environments requiring custom resolvers (e.g., local Windows stubs)
  try {
    if (process.env.DNS_SERVERS) {
      const servers = process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean);
      if (servers.length > 0) {
        dns.setServers(servers);
      }
    } else if (process.env.DNS_FALLBACK === "true") {
      const currentDns = dns.getServers();
      if (currentDns.length === 1 && currentDns[0] === "127.0.0.1") {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      }
    }
  } catch {
    // Fallback gracefully
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ Fatal: MONGODB_URI or MONGO_URI environment variable is not defined.");
    process.exit(1);
  }

  // Prevent multiple connection instances during development hot-reloading
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // 5s timeout on initial connection/cluster discovery
    connectTimeoutMS: 10000,        // 10s TCP handshake timeout
    maxPoolSize: 10,                // Connection pool size for horizontal scalability
    minPoolSize: 2,                 // Keep warm connections ready
    socketTimeoutMS: 45000,         // Socket inactivity timeout
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    // Non-blocking index synchronization during startup
    User.createIndexes().catch(() => {});
  } catch (err) {
    console.error(`❌ MongoDB Initial Connection Error: ${err.message}`);
    process.exit(1);
  }

  // Connection Lifecycle Monitoring
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB connection disconnected. Attempting automatic reconnection...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB connection re-established.");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`❌ MongoDB runtime error: ${err.message}`);
  });
};

/**
 * Gracefully close database connection during server termination
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close(false);
    console.log("🛑 MongoDB connection closed cleanly.");
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
  }
};

export default connectDB;
