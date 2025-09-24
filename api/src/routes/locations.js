import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// LOCATIONS routes
// Note: The base path for this router is /locations,
// so a GET on '/' here corresponds to GET /api/locations

// GET /api/locations
router.get('/', async (req, res) => {  
  try {
    console.log('👤 Request user:', req.user) // Debug log

    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })
    res.status(200).json(locations)
    console.log('✅ Fetched locations successfully')
  } catch (error) {
    res.status(500).json({ error: '❌ Failed to fetch locations' })
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
    console.log('✅ Created', location, 'successfully')
  } catch (error) {
    res.status(400).json({ error: '❌ Failed to create location' })
  }
})

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, kind } = req.body

    const location = await prisma.location.update({
      where: { id: id },
      data: { name, kind }
    })
    res.json(location)
  } catch (error) {
    console.error('❌ Failed to update location:', error)
    res.status(400).json({ error: '❌ Failed to update location' })
  }
})

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.location.delete({
      where: { id: id }
    })

    res.status(204).send()
    console.log('✅ Deleted location successfully')
  } catch (error) {
    console.error('❌ Failed to delete location:', error)
    res.status(400).json({ error: '❌ Failed to delete location' })
  }
})

export default router;