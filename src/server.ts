import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import createError from "http-errors";
import { verifyAccessToken } from "./helpers/jwt_helper";
import { connectDB } from "./helpers/init_mongodb";
import "./helpers/init_redis";
import AuthRoute from "./Routes/auth.route";

console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);


const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route (protected)
app.get("/", verifyAccessToken, async (req: Request, res: Response) => {
  res.send("Hello from Express.");
});

// Auth routes
app.use("/auth", AuthRoute);

// 404 handler
app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(createError.NotFound());
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
