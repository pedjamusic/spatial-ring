import express from 'express';
import prisma from '../lib/prisma.js';
import { uploadAssetPhoto, deletePhotoFile } from '../middleware/upload.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

function toQuantityMap(rows) {
  return new Map(
    rows.map((row) => [row.assetId, row._sum.quantity || 0]),
  );
}

async function getQuantityMapByType(type, assetIds) {
  if (!assetIds.length) return new Map();

  const rows = await prisma.movement.groupBy({
    by: ['assetId'],
    where: {
      type,
      assetId: { in: assetIds },
    },
    _sum: { quantity: true },
  });
  return toQuantityMap(rows);
}

function getAvailabilityForAsset(asset, inUseMap, storedMap) {
  const totalQuantity = asset.quantity || 0;
  if (asset.status === 'Maintenance') {
    return {
      totalQuantity,
      inUseQuantity: totalQuantity,
      availableQuantity: 0,
    };
  }

  const totalInUse = inUseMap.get(asset.id) || 0;
  const totalStored = storedMap.get(asset.id) || 0;
  const netInUse = Math.max(0, totalInUse - totalStored);
  const inUseQuantity = Math.min(netInUse, totalQuantity);
  const availableQuantity = Math.max(0, totalQuantity - inUseQuantity);

  return {
    totalQuantity,
    inUseQuantity,
    availableQuantity,
  };
}

async function addAvailability(assets) {
  const assetIds = assets.map((asset) => asset.id);
  if (!assetIds.length) return assets;

  const [inUseMap, storedMap] = await Promise.all([
    getQuantityMapByType('InUse', assetIds),
    getQuantityMapByType('Stored', assetIds),
  ]);

  return assets.map((asset) => ({
    ...asset,
    ...getAvailabilityForAsset(asset, inUseMap, storedMap),
  }));
}

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const { skip, take, page, limit, search } = paginateQuery(req);
    const where = search
      ? { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { assetTag: { contains: search, mode: 'insensitive' } },
          { serial: { contains: search, mode: 'insensitive' } },
        ] }
      : {};

    const [rawData, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        include: { restingLocation: true, category: true },
        orderBy: { name: 'asc' }
      }),
      prisma.asset.count({ where }),
    ]);
    const data = await addAvailability(rawData);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    console.error('Failed to fetch assets:', error.message);
    res.status(500).json({ error: 'Failed to fetch assets' })
  }
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: { restingLocation: true, category: true }
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    const [assetWithAvailability] = await addAvailability([asset]);
    res.json(assetWithAvailability)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset' })
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
