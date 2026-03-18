import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

function getScopeWhere(scope) {
  const now = new Date();
  if (scope === 'archived') {
    return {
      OR: [
        { endsAt: { lt: now } },
        { AND: [{ endsAt: null }, { startsAt: { lt: now } }] },
      ],
    };
  }
  if (scope === 'active') {
    return {
      OR: [
        { endsAt: { gte: now } }, // future + ongoing
        { AND: [{ endsAt: null }, { startsAt: { gte: now } }] }, // no end, upcoming
        { AND: [{ startsAt: null }, { endsAt: null }] }, // unscheduled events
      ],
    };
  }
  return {};
}

function toQuantityMap(rows) {
  return new Map(
    rows.map((row) => [row.assetId, row._sum.quantity || 0]),
  );
}

async function getQuantityMapByType(type, assetIds) {
  if (!assetIds?.length) return new Map();

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

  return { totalQuantity, inUseQuantity, availableQuantity };
}

async function getAssetAvailabilityMaps(assetIds) {
  const [inUseMap, storedMap] = await Promise.all([
    getQuantityMapByType('InUse', assetIds),
    getQuantityMapByType('Stored', assetIds),
  ]);

  return { inUseMap, storedMap };
}

async function getActiveEventAssignments(eventId) {
  const grouped = await prisma.movement.groupBy({
    by: ['assetId'],
    where: {
      eventId,
      type: 'InUse',
    },
    _sum: { quantity: true },
  });
  if (!grouped.length) return [];

  const assetIds = grouped.map((row) => row.assetId);
  const [assets, latestByAsset, { inUseMap, storedMap }] = await Promise.all([
    prisma.asset.findMany({
      where: { id: { in: assetIds } },
      include: {
        category: { select: { name: true } },
        restingLocation: { select: { name: true } },
      },
    }),
    prisma.movement.findMany({
      where: {
        eventId,
        type: 'InUse',
        assetId: { in: assetIds },
      },
      include: { performedBy: { select: { id: true, name: true } } },
      orderBy: [{ assetId: 'asc' }, { performedAt: 'desc' }, { id: 'desc' }],
      distinct: ['assetId'],
    }),
    getAssetAvailabilityMaps(assetIds),
  ]);

  const groupedByAsset = new Map(grouped.map((row) => [row.assetId, row._sum.quantity || 0]));
  const latestByAssetMap = new Map(latestByAsset.map((row) => [row.assetId, row]));
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));

  return assetIds
    .map((assetId) => {
      const asset = assetsById.get(assetId);
      if (!asset) return null;
      const latest = latestByAssetMap.get(assetId);
      const { availableQuantity, totalQuantity } = getAvailabilityForAsset(asset, inUseMap, storedMap);

      return {
        id: assetId,
        assetId,
        asset,
        assignedQuantity: groupedByAsset.get(assetId) || 0,
        availableQuantity,
        totalQuantity,
        lastAssignedAt: latest?.performedAt || null,
        lastAssignedBy: latest?.performedBy || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.asset.name.localeCompare(b.asset.name));
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { rangeStart, rangeEnd, scope } = req.query;

    // Calendar date-range mode: return all events in range (no pagination)
    if (rangeStart && rangeEnd) {
      const start = new Date(rangeStart);
      const end = new Date(rangeEnd);
      const data = await prisma.event.findMany({
        where: {
          AND: [
            { startsAt: { lte: end } },
            {
              OR: [
                { endsAt: { gte: start } },
                { endsAt: null, startsAt: { gte: start } },
              ],
            },
          ],
        },
        include: { location: { select: { name: true } } },
        orderBy: { startsAt: 'asc' },
      });
      return res.json({ data });
    }

    // Default paginated mode
    const { skip, take, page, limit, search } = paginateQuery(req);
    const searchWhere = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};
    const scopeWhere = getScopeWhere(scope);
    const where = {
      AND: [searchWhere, scopeWhere],
    };

    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take,
        include: { location: { select: { name: true } } },
        orderBy: { startsAt: 'asc' }
      }),
      prisma.event.count({ where }),
    ]);
    res.json(paginateResponse(data, total, { page, limit }))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { location: { select: { name: true } } },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// GET /api/events/:id/assignments
router.get('/:id/assignments', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const assignments = await getActiveEventAssignments(req.params.id);
    res.json({ data: assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event assignments' });
  }
});

// GET /api/events/:id/assignable-assets
router.get('/:id/assignable-assets', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const assets = await prisma.asset.findMany({
      include: {
        category: { select: { name: true } },
        restingLocation: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const assetIds = assets.map((asset) => asset.id);
    const { inUseMap, storedMap } = await getAssetAvailabilityMaps(assetIds);

    const data = assets
      .map((asset) => ({
        ...asset,
        ...getAvailabilityForAsset(asset, inUseMap, storedMap),
      }))
      .filter((asset) => asset.availableQuantity > 0);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignable assets' });
  }
});

// POST /api/events/:id/assignments
router.post('/:id/assignments', async (req, res) => {
  try {
    const { assetId, quantity, notes } = req.body || {};
    const parsedQuantity = Number.parseInt(quantity, 10);

    if (!assetId) {
      return res.status(400).json({ error: 'assetId is required' });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }

    const [event, asset] = await Promise.all([
      prisma.event.findUnique({
        where: { id: req.params.id },
        select: { id: true, endsAt: true },
      }),
      prisma.asset.findUnique({
        where: { id: assetId },
        select: { id: true, quantity: true, status: true },
      }),
    ]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const { inUseMap, storedMap } = await getAssetAvailabilityMaps([assetId]);
    const availability = getAvailabilityForAsset(asset, inUseMap, storedMap);

    if (parsedQuantity > availability.availableQuantity) {
      return res.status(400).json({
        error: `Cannot assign ${parsedQuantity}. Only ${availability.availableQuantity} available.`,
      });
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const createdMovement = await tx.movement.create({
        data: {
          assetId,
          type: 'InUse',
          quantity: parsedQuantity,
          eventId: req.params.id,
          performedById: req.user?.id,
          expectedReturnAt: event.endsAt || null,
          notes,
        },
        include: {
          asset: {
            include: {
              category: { select: { name: true } },
              restingLocation: { select: { name: true } },
            },
          },
          performedBy: { select: { id: true, name: true } },
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'InUse' },
      });

      return createdMovement;
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign asset to event' });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt, notes } = req.body
    const event = await prisma.event.create({
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null, notes }
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' })
  }
})

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, locationId, startsAt, endsAt, notes } = req.body
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { name, locationId, startsAt: startsAt ? new Date(startsAt) : null, endsAt: endsAt ? new Date(endsAt) : null, notes }
    })
    res.json(event)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update event' })
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
    res.status(400).json({ error: 'Failed to delete event' })
  }
})

export default router;
