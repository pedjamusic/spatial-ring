import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// EVENTS routes
// Note: The base path for this router is /events,
// so a GET on '/' here corresponds to GET /api/events

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { location: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})
// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { name, venue, city, locationId, startsAt, endsAt } = req.body
    const event = await prisma.event.create({
      data: { name, venue, city, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null }
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' })
  }
})

export default router;