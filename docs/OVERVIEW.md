Monorepo Structure

An npm workspaces monorepo with three packages: api/, web/, and mobile/ (placeholder). The root package.json orchestrates dev, test, and scaffolding commands.

API (api/src/)

Express.js + Prisma + PostgreSQL

- Entry: server.js → app.js (middleware setup, route mounting)
- Auth: JWT-based. POST /auth/login returns a token, stored client-side in localStorage. All /api/\* routes are protected by middleware/auth.js.
- Routes: Standard CRUD routers for each model (assets.js, warehouses.js, events.js, etc.), aggregated in routes/index.js
- Metadata endpoint: GET /api/meta/models/:name exposes Prisma schema info (field types, relations, enums) — this is what drives the frontend's generic UI
- Photo uploads: Multer middleware at POST /api/assets/:id/photo, files stored in api/uploads/assets/

Database (api/prisma/schema.prisma)

Core models: User, Asset, Warehouse, AssetCategory, Event, EventLocation, Movement. Key enums: AssetStatus (Ready/Stored/InUse/Maintenance), MovementType.

Movements track asset transitions between warehouses and events, linking assets, events, and users.

Web Frontend (web/src/)

React + Vite + Tailwind CSS v4 + react-aria-components

The defining pattern is metadata-driven generic CRUD:

1. App.jsx fetches public/meta/resources.json to dynamically create routes (/admin/assets, /admin/warehouses, etc.)
2. Each route renders GenericCrud.jsx, which fetches the Prisma schema from /api/meta/models/{name}
3. ModelForm.jsx auto-generates form fields (text, select, date, textarea, relation dropdowns) from schema metadata
4. ModelTable.jsx auto-generates table columns with dot-notation relation display (e.g., category.name)
5. public/meta/ui-configs.json customizes field visibility, labels, widgets, and column order per model

The API client (lib/api.js) provides a resource(name) factory that returns .list(), .get(), .create(), .update(), .remove() methods.

How It All Connects

Browser → Vite dev proxy (:5173) → Express API (:3000) → Prisma → PostgreSQL
↓
/api/meta/models/:name
↓
Frontend auto-generates UI

- Auth flow: Login → JWT stored in localStorage → sent as Authorization: Bearer header → verified by middleware → 401 triggers redirect to /login
- CRUD flow: Frontend reads schema metadata + UI configs → renders form/table → calls resource(name).create/update/delete() → API performs Prisma operations
- Scaffolding: npm run scaffold regenerates route boilerplate and UI configs from the Prisma schema, so adding a model is mostly automatic

The key design decision is that almost no per-model UI code exists — everything is driven by Prisma schema introspection and JSON configuration files.
