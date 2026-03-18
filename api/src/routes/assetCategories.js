import express from 'express'
import prisma from '../lib/prisma.js'
import { paginateQuery, paginateResponse } from '../lib/pagination.js'

const router = express.Router()

// GET /api/assetCategories
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      prisma.assetCategory.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { assets: true }
          }
        }
      }),
      prisma.assetCategory.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/assetCategories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.assetCategory.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

// POST /api/assetCategories
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body
    const category = await prisma.assetCategory.create({
      data: { name, description }
    })
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create category' })
  }
})

// PUT /api/assetCategories/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body
    const category = await prisma.assetCategory.update({
      where: { id: req.params.id },
      data: { name, description }
    })
    res.json(category)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/assetCategories/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.assetCategory.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete category' })
  }
})

export default router
