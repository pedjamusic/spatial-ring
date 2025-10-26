import express from 'express';
import prisma from '../lib/prisma.js';
import { uploadAssetPhoto, deletePhotoFile } from '../middleware/upload.js';

const router = express.Router();

// ASSETS routes
// Note: The base path for this router is /assets,
// so a GET on '/' here corresponds to GET /api/assets

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    console.log('👤 Request user:', req.user) // Debug log
    
    const assets = await prisma.asset.findMany({
      include: { restingLocation: true, category: true }, // Oct 25: included 'category' while working on Asset Photo upload, otherwise it was just 'restingLocation'
      orderBy: { name: 'asc' }
    })
    res.json(assets)
  } catch (error) {
    console.error('[API routes] ⚠️ Failed to fetch assets:', error);
    res.status(500).json({ error: '[API routes] ⚠️ Failed to fetch assets' })
  }
});

// POST /api/assets/:id/photo - Upload/replace photo for specific asset (multipart/form-data with field 'photo')
router.post('/:id/photo', uploadAssetPhoto, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '👀🖼️ No photo file provided' });
    }

    const assetId = req.params.id;
    // Get current asset to delete old photo if exists
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });
    // Delete old photo file if it exists
    if (currentAsset?.photoUrl) {
      deletePhotoFile(currentAsset.photoUrl);
    };
    // Update asset with new photo filename
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { photoUrl: req.file.filename }
    });

    console.log(`📸 Photo uploaded for asset ${assetId}: ${req.file.filename}`);
    res.json({ 
      success: true, 
      filename: req.file.filename,
      asset: updatedAsset
    });
  } catch (error) {
    console.error('⚠️ Photo upload failed:', error);
    // Delete uploaded file if database update failed
    // if (req.file) {
    if (req.file?.filename) {
      deletePhotoFile(req.file.filename);
    }
    res.status(400).json({ error: '⚠️ Failed to upload photo' });
  }
});

// DELETE /api/assets/:id/photo - Delete photo for specific asset
router.delete('/:id/photo', async (req, res) => {
  try {
    const assetId = req.params.id;
    // Get current asset
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });
    if (!currentAsset?.photoUrl) {
      return res.status(404).json({ error: '❌ No photo to delete' });
    }

    // Delete photo file
    deletePhotoFile(currentAsset.photoUrl);
    // Update asset to remove photo reference
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { photoUrl: null }
    });
    console.log(`🗑️ Photo deleted for asset ${assetId}`);
    res.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('⚠️ Photo deletion failed:', error);
    res.status(400).json({ error: '⚠️ Failed to delete photo' });
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
        photoUrl: null // Photos uploaded separately
      }
    });
    res.status(201).json(asset)
  } catch (error) {
    console.error('[API routes] ⚠️ Failed to create asset:', error);
    res.status(400).json({ error: '[API routes] ⚠️ Failed to create asset' })
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
        // Note: photoUrl NOT updated here - use photo upload endpoint
      }
    });
    res.json(asset)
  } catch (error) {
    res.status(400).json({ error: '[API routes] ⚠️ Failed to update asset' })
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    // Get asset to delete photo file
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { photoUrl: true }
    });

    // Delete photo file if exists
    if (currentAsset?.photoUrl) {
      deletePhotoFile(currentAsset.photoUrl);
    }

    await prisma.asset.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    console.error('[API routes] ⚠️ Failed to delete asset:', error);
    res.status(400).json({ error: '[API routes] ⚠️ Failed to delete asset' })
  }
})

export default router;