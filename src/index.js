import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 1111;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://crm-backend-topaz-xi.vercel.app/",
      "https://crm-backend-topaz-xi.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World to abhi!");
});

// auth routes
app.use("/v1/auth", authRoutes);

// connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
