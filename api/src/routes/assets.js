import express from 'express';
import prisma from '../lib/prisma.js';
import { uploadAssetPhoto, deletePhotoFile } from '../middleware/upload.js';

const router = express.Router();

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { restingLocation: true, category: true },
      orderBy: { name: 'asc' }
    })
    res.json(assets)
  } catch (error) {
    console.error('Failed to fetch assets:', error.message);
    res.status(500).json({ error: 'Failed to fetch assets' })
  }
});

// POST /api/assets/:id/photo
router.post('/:id/photo', uploadAssetPhoto, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const assetId = req.params.id;
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });

    if (currentAsset?.photoUrl) {
      deletePhotoFile(currentAsset.photoUrl);
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { photoUrl: req.file.filename }
    });

    res.json({
      success: true,
      filename: req.file.filename,
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Photo upload failed:', error.message);
    if (req.file?.filename) {
      deletePhotoFile(req.file.filename);
    }
    res.status(400).json({ error: 'Failed to upload photo' });
  }
});

// DELETE /api/assets/:id/photo
router.delete('/:id/photo', async (req, res) => {
  try {
    const assetId = req.params.id;
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });
    if (!currentAsset?.photoUrl) {
      return res.status(404).json({ error: 'No photo to delete' });
    }

    deletePhotoFile(currentAsset.photoUrl);
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { photoUrl: null }
    });
    res.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('Photo deletion failed:', error.message);
    res.status(400).json({ error: 'Failed to delete photo' });
  }
});

// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const { name, make, model, dimensions, assetTag, serial, quantity, shelf, status, notes, categoryId, restingLocationId } = req.body
    const asset = await prisma.asset.create({
       data: {
        name, make, model, dimensions, assetTag, serial,
        quantity: parseInt(quantity) || 1,
        shelf, status, notes, categoryId, restingLocationId,
        photoUrl: null
      }
    });
    res.status(201).json(asset)
  } catch (error) {
    console.error('Failed to create asset:', error.message);
    res.status(400).json({ error: 'Failed to create asset' })
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    const { name, make, model, dimensions, assetTag, serial, quantity, shelf, status, notes, categoryId, restingLocationId } = req.body
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name, make, model, dimensions, assetTag, serial,
        quantity: parseInt(quantity) || 1,
        shelf, status, notes, categoryId, restingLocationId
      }
    });
    res.json(asset)
  } catch (error) {
    console.error('Failed to update asset:', error.message);
    res.status(400).json({ error: 'Failed to update asset' })
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });

    if (currentAsset?.photoUrl) {
      deletePhotoFile(currentAsset.photoUrl);
    }

    await prisma.asset.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete asset:', error.message);
    res.status(400).json({ error: 'Failed to delete asset' })
  }
})

export default router;
