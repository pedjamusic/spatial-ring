import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// LOCATIONS routes
// Note: The base path for this router is /locations,
// so a GET on '/' here corresponds to GET /api/locations

// GET /api/locations
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(locations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
})
// POST /api/locations
router.post('/', async (req, res) => {
  try {
    const { name, kind } = req.body
    const location = await prisma.location.create({
      data: { name, kind }
    })
    res.status(201).json(location)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create location' })
  }
})

export default router;