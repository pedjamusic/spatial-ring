import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// EVENTLOCATIONS routes
// Note: The base path for this router is /eventLocations,
// so a GET on '/' here corresponds to GET /api/eventLocations

// GET /api/eventLocations
router.get('/', async (req, res) => {
  try {
    // console.log('👤 Request user:', req.user) // Debug log
    
    const eventLocations = await prisma.eventLocation.findMany({
      orderBy: { name: 'asc' }
    })
    res.status(200).json(eventLocations)
    console.log('[API routes] ✅ Fetched event locations successfully')
  } catch (error) {
    res.status(500).json({ error: '[API routes] ❌ Failed to fetch event locations' })
  }
})

// POST /api/eventLocations
router.post('/', async (req, res) => {
  try {
    const { name, address, notes } = req.body
    const eventLocation = await prisma.eventLocation.create({
      data: { name, address, notes }
    })
    res.status(201).json(eventLocation)
    console.log('✅ Created', eventLocation, 'successfully')
  } catch (error) {
    res.status(400).json({ error: '[API routes] ❌ Failed to create event location' })
  }
})

// PUT /api/eventLocations/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, address, notes } = req.body

    const eventLocation = await prisma.eventLocation.update({
      where: { id: id },
      data: { name, address, notes }
    })
    res.json(eventLocation)
  } catch (error) {
    console.error('[API routes] ❌ Failed to update event location:', error)
    res.status(400).json({ error: '[API routes] ❌ Failed to update event location' })
  }
})

// DELETE /api/eventLocations/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.eventLocation.delete({
      where: { id: id }
    })

    res.status(204).send()
    console.log('[API routes] ✅ Deleted event location successfully')
  } catch (error) {
    console.error('[API routes] ❌ Failed to delete event location:', error)
    res.status(400).json({ error: '[API routes] ❌ Failed to delete event location' })
  }
})

export default router;