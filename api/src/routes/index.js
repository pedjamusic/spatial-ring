// This is a centralized router file that combines all resource-specific routers
// and mounts them under the /api prefix with authentication middleware applied.

import express from "express";
import warehousesRouter from "./warehouses.js";
import assetsRouter from "./assets.js";
import eventsRouter from "./events.js";
import movementsRouter from "./movements.js";
import assetCategories from "./assetCategories.js";
import eventLocations from "./eventLocations.js";
import usersRouter from "./users.js";

const router = express.Router();

// Mount each resource router at its respective path
router.use("/warehouses", warehousesRouter);
router.use("/assets", assetsRouter);
router.use("/events", eventsRouter);
router.use("/movements", movementsRouter);
router.use("/assetCategories", assetCategories);
router.use("/eventLocations", eventLocations);
router.use("/users", usersRouter);

export default router;
