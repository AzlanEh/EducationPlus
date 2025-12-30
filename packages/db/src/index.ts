import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
	throw new Error(
		"Please define the DATABASE_URL environment variable inside .env",
	);
}

// Global cache to prevent multiple connections in serverless environment
let cached = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE || 10),
			minPoolSize: Number(process.env.DB_MIN_POOL_SIZE || 1),
			serverSelectionTimeoutMS: 5000,
		};

		cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

// Establish connection on module load to satisfy better-auth synchronous requirement
// This top-level await is supported in Node 14+ and Vercel

if (!process.env.DATABASE_URL) {
	console.error("CRITICAL ERROR: DATABASE_URL is not defined in the environment.");
} else {
	console.log("Attempting to connect to MongoDB...");
}

try {
	await connect();
	console.log("Successfully connected to MongoDB.");
} catch (error) {
	console.error("FATAL ERROR: Failed to connect to MongoDB during module initialization:", error);
	throw error;
}

// Use the database instance from the established connection
// This ensures we use the DB name specified in the connection string
const client = mongoose.connection.db;

export { client, connect };
export * from "./models/auth.model";
export * from "./models/education.model";
export * from "./models/module.model";
export * from "./models/progress.model";
