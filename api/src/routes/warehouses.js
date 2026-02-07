import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// GET /api/warehouses
router.get('/', async (req, res) => {
  try {
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

// PUT /api/warehouses/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, kind } = req.body
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: { name, kind }
    })
    res.json(warehouse)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update warehouse' })
  }
})

// DELETE /api/warehouses/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.warehouse.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete warehouse' })
  }
})

export default router;
