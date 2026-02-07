import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/eventLocations
router.get('/', async (req, res) => {
  try {
    const eventLocations = await prisma.eventLocation.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(eventLocations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event locations' })
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
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event location' })
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
    console.error('Failed to update event location:', error.message)
    res.status(400).json({ error: 'Failed to update event location' })
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
  } catch (error) {
    console.error('Failed to delete event location:', error.message)
    res.status(400).json({ error: 'Failed to delete event location' })
  }
})

export default router;
