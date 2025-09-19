import express from 'express'
import prisma from '../lib/prisma.js'

const router = express.Router()

// ASSET CATEGORIES routes
// Note: The base path for this router is /assetCategories,
// so a GET on '/' here corresponds to GET /api/assetCategories

// GET /api/assetCategories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { assets: true }
        }
      }
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
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
