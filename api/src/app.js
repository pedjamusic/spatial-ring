import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

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
app.use(express.json());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options(
  [/^\/auth(\/|$)/, /^\/api(\/|$)/, /^\/uploads(\/|$)/],
  cors(corsOptions),
);

// Serve uploaded photos as static files (public - no auth needed)
const assetsDir = path.resolve(__dirname, "../uploads/assets");
app.use(
  "/uploads/assets",
  express.static(assetsDir, {
    index: false,
    setHeaders(res, filePath) {
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

// Public routes
app.use("/auth", authRouter);
app.use("/api/meta", metaRouter);

// Protected routes
app.use("/api", authenticateToken);
app.use("/api", apiRouter);

// 404 + error
app.use((req, res) =>
  res.status(404).json({ error: "Route not found" }),
);
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
