import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// WAREHOUSES routes
// Note: The base path for this router is /warehouses,
// so a GET on '/' here corresponds to GET /api/warehouses

// GET /api/warehouses
router.get('/', async (req, res) => {
  try {
    // console.log('👤 Request user:', req.user) // Debug log

    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(warehouses)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' })
  }
})
// POST /api/warehouses
router.post('/', async (req, res) => {
  try {
    const { name, kind } = req.body
    const warehouse = await prisma.warehouse.create({
      data: { name, kind }
    })
    res.status(201).json(warehouse)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create warehouse' })
  }
})

export default router;