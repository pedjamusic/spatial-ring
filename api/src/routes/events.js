import express from 'express';
import prisma from '../lib/prisma.js';
import { paginateQuery, paginateResponse } from '../lib/pagination.js';

const router = express.Router();

async function getLatestMovementsByAssetIds(assetIds) {
  if (!assetIds.length) return [];

  return prisma.movement.findMany({
    where: { assetId: { in: assetIds } },
    orderBy: [{ assetId: 'asc' }, { performedAt: 'desc' }, { id: 'desc' }],
    distinct: ['assetId'],
    select: {
      assetId: true,
      type: true,
      eventId: true,
    },
  });
}

async function getActiveEventAssignments(eventId) {
  const inUseMovements = await prisma.movement.findMany({
    where: {
      eventId,
      type: 'InUse',
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
    orderBy: [{ performedAt: 'desc' }, { id: 'desc' }],
  });

  const assetIds = [...new Set(inUseMovements.map((movement) => movement.assetId))];
  const latestByAsset = await getLatestMovementsByAssetIds(assetIds);
  const latestMap = new Map(latestByAsset.map((movement) => [movement.assetId, movement]));

  return inUseMovements.filter((movement) => {
    const latest = latestMap.get(movement.assetId);
    return latest?.type === 'InUse' && latest?.eventId === eventId;
  });
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { rangeStart, rangeEnd } = req.query;

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
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

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

    const latestMovements = await prisma.movement.findMany({
      orderBy: [{ assetId: 'asc' }, { performedAt: 'desc' }, { id: 'desc' }],
      distinct: ['assetId'],
      select: {
        assetId: true,
        type: true,
      },
    });

    const inUseAssetIds = latestMovements
      .filter((movement) => movement.type === 'InUse')
      .map((movement) => movement.assetId);

    const assets = await prisma.asset.findMany({
      where: {
        id: inUseAssetIds.length ? { notIn: inUseAssetIds } : undefined,
      },
      include: {
        category: { select: { name: true } },
        restingLocation: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ data: assets });
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
        select: { id: true, quantity: true },
      }),
    ]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (parsedQuantity > asset.quantity) {
      return res.status(400).json({ error: `Cannot assign more than ${asset.quantity}` });
    }

    const latestMovement = await prisma.movement.findFirst({
      where: { assetId },
      orderBy: [{ performedAt: 'desc' }, { id: 'desc' }],
      select: { type: true, eventId: true },
    });

    if (latestMovement?.type === 'InUse') {
      return res.status(400).json({ error: 'Asset is already assigned to an event' });
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
