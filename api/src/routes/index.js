// This is a centralized router file that combines all resource-specific routers
// and mounts them under the /api prefix with authentication middleware applied.

import express from 'express';
import locationsRouter from './locations.js';
import assetsRouter from './assets.js';
import eventsRouter from './events.js';
import movementsRouter from './movements.js';
import assetCategories from './assetCategories.js';

const router = express.Router();

// Mount each resource router at its respective path
router.use('/locations', locationsRouter);
router.use('/assets', assetsRouter);
router.use('/events', eventsRouter);
router.use('/movements', movementsRouter);
router.use('/assetCategories', assetCategories);

// You can also add a /me route here if you like
router.get('/me', (req, res) => {
    res.json({ user: req.user });
});

export default router;
