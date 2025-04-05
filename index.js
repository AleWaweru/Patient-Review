import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectToDB } from "./config/db.js";
import authRoutes from "./routes/AuthRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import profileRoutes from "./routes/profileRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectToDB();

app.use("/api/auth", authRoutes);
// protected routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/profiles", profileRoutes);

app.listen(port,"0.0.0.0", () => console.log(`🚀 Server running on port ${port}`));
