import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'; // Import path for serving static files

// Import Routers and Middleware
import authRouter from './routes/auth.js';
import apiRouter from './routes/index.js';
import { authenticateToken } from './middleware/auth.js';
import metaRouter from './routes/meta.js'; // Import the meta router

// Init Express app and Prisma client and Middleware
const app = express()
app.use(helmet())
app.use(cors({origin: 'http://localhost:5173', credentials: true}))
app.use(express.json())



// Authentication routes are public and should not be protected by requiring a token
app.use('/auth', authRouter);
app.use('/api/meta', metaRouter); // Use the meta router

// All routes defined on 'apiRouter' will be prefixed with /api and protected.
app.use('/api', authenticateToken);
app.use('/api', apiRouter)



// Serve static frontend files (when built)
// const frontendPath = path.join(process.cwd(), '../web/dist')
// app.use(express.static(frontendPath))

// SPA fallback: serve index.html for all non-API routes
// app.get((req, res) => {
  //   res.sendFile(path.join(frontendPath, 'index.html'))
  // })

  
  // 404 for routes that are not found
  app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' })
  })
  // General error handling
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })



// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port} 🥳`)
})

// Prisma connection and gracefull shutdown
// async function start() {
//   try {
//     await prisma.$connect();
//     console.log('Prisma connected');
//     app.listen(port, () => console.log('API listening on', port));
//   } catch (e) {
//     console.error('Startup failed:', e);
//     process.exit(1);
//   }
// }

// Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('SIGINT signal received. Closing HTTP server and shutting down gracefully...');
//   await prisma.$disconnect(); //ensures all database connections are properly closed, preventing potential resource leaks
//   server.close(() => {
//     console.log('HTTP server closed');
//     process.exit(0);
//   });
// });