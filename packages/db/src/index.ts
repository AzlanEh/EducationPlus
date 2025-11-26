import mongoose from "mongoose";

await mongoose
	.connect(process.env.DATABASE_URL || "", {
		maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE || 10),
		minPoolSize: Number(process.env.DB_MIN_POOL_SIZE || 1),
		serverSelectionTimeoutMS: 5000,
	})
	.catch((error) => {
		console.log("Error connecting to database:", error);
	});

const client = mongoose.connection.getClient().db("myDB");

export { client };
export * from "./models/auth.model";
export * from "./models/education.model";
export * from "./models/progress.model";
