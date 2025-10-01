import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// ASSETS routes
// Note: The base path for this router is /assets,
// so a GET on '/' here corresponds to GET /api/assets

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    console.log('👤 Request user:', req.user) // Debug log
    
    const assets = await prisma.asset.findMany({
      include: { restingLocation: true },
      orderBy: { name: 'asc' }
    })
    res.json(assets)
  } catch (error) {
    res.status(500).json({ error: '[API routes] ⚠️ Failed to fetch assets' })
  }
})
// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const { name, make, model, dimensions, photoUrl, assetTag, serial, quantity, shelf, status, notes, categoryId, restingLocationId } = req.body
    const asset = await prisma.asset.create({
       data: {
        name, make, model, dimensions, photoUrl, assetTag, serial,
        quantity: parseInt(quantity) || 1,
        shelf, status, notes, categoryId, restingLocationId
      }
    })
    res.status(201).json(asset)
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to create asset' })
  }
})
// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, make, model, dimensions, photoUrl, assetTag, serial, quantity, shelf, status, notes, categoryId, restingLocationId } = req.body
    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        name, make, model, dimensions, photoUrl, assetTag, serial,
        quantity: parseInt(quantity) || 1,
        shelf, status, notes, categoryId, restingLocationId
      }
    })
    res.json(asset)
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to update asset' })
  }
})
// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.asset.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to delete asset' })
  }
})

export default router;