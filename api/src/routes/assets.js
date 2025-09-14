import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// ASSETS routes
// Note: The base path for this router is /assets,
// so a GET on '/' here corresponds to GET /api/assets

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { restingLocation: true },
      orderBy: { name: 'asc' }
    })
    res.json(assets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' })
  }
})
// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const { name, category, make, model, quantity, restingLocationId, shelf, notes } = req.body
    const asset = await prisma.asset.create({
       data: {
        name, category, make, model,
        quantity: parseInt(quantity) || 1,
        restingLocationId, shelf, notes
      }
    })
    res.status(201).json(asset)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create asset' })
  }
})

export default router;