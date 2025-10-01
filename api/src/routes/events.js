import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// EVENTS routes
// Note: The base path for this router is /events,
// so a GET on '/' here corresponds to GET /api/events

// GET /api/events
router.get('/', async (req, res) => {
  try {
    // console.log('👤 Request user:', req.user) // Debug log
    
    const events = await prisma.event.findMany({
      include: { location: { select: { name: true } } },
      orderBy: { startsAt: 'asc' }
    })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: '[API routes] ⚠️ Failed to fetch events' })
  }
})
// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt } = req.body
    const event = await prisma.event.create({
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null }
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to create event' })
  }
})
// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt } = req.body
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null }
    })
    res.json(event)
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to update event' })
  }
})
// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to delete event' })
  }
})

export default router;