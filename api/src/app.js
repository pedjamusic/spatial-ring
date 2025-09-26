import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import Routers and Middleware
import apiRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import metaRouter from './routes/meta.js';
import { authenticateToken } from './middleware/auth.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Authentication routes are public and should not be protected by requiring a token
// public
app.use('/auth', authRouter);
app.use('/api/meta', metaRouter);

// All routes defined on 'apiRouter' will be prefixed with /api and protected.
// protected
app.use('/api', authenticateToken);
app.use('/api', apiRouter);

// 404 + error
app.use((req, res) => res.status(404).json({ error: '⛓️‍💥 Route not found (from api app)' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: '❗️ Internal server error' });
});
