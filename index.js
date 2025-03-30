import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { connectToDB } from "./config/db.js";

dotenv.config();

const app = express();
const appServer = http.createServer(app);
const port = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  console.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  }, "Incoming request");
  next();
});

// Public Routes
// Example: app.use("/api/auth", authRoutes);

// Restricted endpoints require a token
// app.use(verifyToken);

appServer.listen(port, async () => {
  await connectToDB();
  console.log("✅ Successfully connected to MongoDB");
  console.log(`🚀 Server is running on port ${port}`);
});

// Handle graceful shutdown
const handleExit = (signal) => {
  console.log(`⚠️ Received ${signal}. Shutting down application.`);
  process.exit(0);
};

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
