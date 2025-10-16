import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME;

  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ MongoDB connected successfully.");

    mongoose.connection.on("connected", () => {
      console.log(`✅ Mongoose connected to database: ${DB_NAME}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose connection disconnected.");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("✅ Mongoose connection closed due to app termination.");
      process.exit(0);
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};