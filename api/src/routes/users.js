import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/users (read-only, for dropdowns)
router.get('/', async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
