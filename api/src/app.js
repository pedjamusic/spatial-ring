import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Import Routers and Middleware
import apiRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import metaRouter from "./routes/meta.js";
import { authenticateToken } from "./middleware/auth.js";
import { getAllowedOrigins } from "../config/corsOrigins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = getAllowedOrigins();

export const app = express();
app.use(helmet());
// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // const allowedOrigins = ["http://localhost:5173"];
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true); //cURL, mobile apps, etc.

      // Allow localhost, your specific production domain, or any sslip.io subdomain
      // if (allowedOrigins.includes(origin) || origin.endsWith(".sslip.io")) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Serve uploaded photos as static files (PUBLIC - no auth needed for viewing)
const assetsDir = path.resolve(__dirname, "../uploads/assets");
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(
  "/uploads/assets",
  express.static(assetsDir, {
    index: false,
    // Optional: cache headers
    setHeaders(res, filePath) {
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

// Authentication routes are public and should not be protected by requiring a token
// public
app.use("/auth", authRouter);
app.use("/api/meta", metaRouter);

// All routes defined on 'apiRouter' will be prefixed with /api and protected.
// protected
app.use("/api", authenticateToken);
app.use("/api", apiRouter);

// 404 + error
app.use((req, res) =>
  res.status(404).json({ error: "⛓️‍💥 Route not found (from api app)" }),
);
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "❗️ Internal server error" });
});
