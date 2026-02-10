# CRUD Refactoring Progress

From generic CRUD to list + form pages with server-side pagination.

## Phase 0: API Infrastructure

### 0a. Pagination helper
- [x] `api/src/lib/pagination.js` — `paginateQuery()` + `paginateResponse()`
- Branch: `feature/api-pagination-helper` — merged to main

### 0b. Pagination + GET /:id on all routes
- [x] `api/src/routes/eventLocations.js` — search: name, address
- [x] `api/src/routes/assetCategories.js` — search: name
- [x] `api/src/routes/warehouses.js` — search: name, kind
- [x] `api/src/routes/events.js` — search: name (keep `include: { location }`)
- [x] `api/src/routes/assets.js` — search: name, make, model, assetTag, serial (keep includes)
- [x] `api/src/routes/movements.js` — search: notes (keep includes, remove hardcoded `take: 50`)
- Branch: `feature/api-pagination-routes` — merged to main

### 0c. Update `web/src/lib/api.js`
- [x] `list()` accepts `{ page, limit, search }` params
- Branch: `feature/api-js-pagination` — merged to main

### 0d. GenericCrud backward compatibility
- [x] Handle `{ data, meta }` envelope in GenericCrud
- Branch: `feature/api-js-pagination` — merged to main

---

## Phase 1: Frontend Shared Components

### 1a. Pagination component
- [x] `web/src/components/Pagination.jsx`

### 1b. SearchInput component
- [x] `web/src/components/SearchInput.jsx`

### 1c. GenericListPage
- [x] `web/src/pages/GenericListPage.jsx`

### 1d. GenericFormPage
- [x] `web/src/pages/GenericFormPage.jsx`
- Cancel button with dirty check, breadcrumb link above form

- Branch: `feature/list-form-pages` — merged to main

---

## Phase 2: Routing Changes

- [x] Update `web/src/App.jsx` — nested routes: list / new / :id/edit
- Branch: `feature/list-form-pages` — merged to main

---

## Phase 3: Verify Simple Models

- [x] EventLocation — list + create + edit + delete
- [x] AssetCategory — list + create + edit + delete
- [x] Warehouse — list + create + edit + delete
- [x] Pagination contract (limit, page, meta fields)
- [x] Auth guard on all three endpoints
- Branch: `feature/smoke-tests-simple-models` — merged to main

---

## Phase 4: Migrate Remaining Models

- [ ] Event (relations + DateTime)
- [ ] Asset (photo upload, many fields, relations)
- [ ] Movement (multiple relations, enum — likely NOT standard CRUD long-term; may become relational/automated for item transfers, maintenance signals, vendor tracking. Keep generic for now, dedicated UX later.)
- Branches: `feature/migrate-event`, `feature/migrate-asset`, `feature/migrate-movement`

---

## Phase 5: Cleanup

- [ ] Delete `GenericCrud.jsx`
- [ ] Delete dead page components (Assets.jsx, Events.jsx, Warehouses.jsx, etc.)
- [ ] Persist search/page/limit in URL via `useSearchParams()`
- Branch: `feature/cleanup-generic-crud`

---

## Files Created

| File | Phase | Purpose |
|------|-------|---------|
| `api/src/lib/pagination.js` | 0a | Shared pagination helpers |

## Files Modified

| File | Phase | Changes |
|------|-------|---------|
| `api/src/routes/eventLocations.js` | 0b | Paginated GET /, added GET /:id |
| `api/src/routes/assetCategories.js` | 0b | Paginated GET /, added GET /:id |
| `api/src/routes/warehouses.js` | 0b | Paginated GET /, added GET /:id |
| `api/src/routes/events.js` | 0b | Paginated GET /, added GET /:id |
| `api/src/routes/assets.js` | 0b | Paginated GET /, added GET /:id |
| `api/src/routes/movements.js` | 0b | Paginated GET /, added GET /:id, removed hardcoded take: 50 |
| `web/src/lib/api.js` | 0c | list() accepts { page, limit, search } params |
| `web/src/pages/GenericCrud.jsx` | 0d | Unwrap { data, meta } envelope |
