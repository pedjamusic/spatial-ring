import 'dotenv/config';
import express from 'express'
import { PrismaClient } from '@prisma/client'
import helmet from 'helmet'

const app = express()
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

async function start() {
  try {
    await prisma.$connect();
    console.log('Prisma connected');
    app.listen(port, () => console.log('API listening on', port));
  } catch (e) {
    console.error('Startup failed:', e);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect(); //ensures all database connections are properly closed, preventing potential resource leaks
  process.exit(0);
});