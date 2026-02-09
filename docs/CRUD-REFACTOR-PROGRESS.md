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
- [ ] `list()` accepts `{ page, limit, search }` params
- Branch: `feature/api-js-pagination`

### 0d. GenericCrud backward compatibility
- [ ] Handle `{ data, meta }` envelope in GenericCrud
- Branch: `feature/api-js-pagination`

---

## Phase 1: Frontend Shared Components

### 1a. Pagination component
- [ ] `web/src/components/Pagination.jsx`
- Branch: `feature/pagination-component`

### 1b. SearchInput component
- [ ] `web/src/components/SearchInput.jsx`
- Branch: `feature/search-input`

### 1c. GenericListPage
- [ ] `web/src/pages/GenericListPage.jsx`
- Branch: `feature/generic-list-page`

### 1d. GenericFormPage
- [ ] `web/src/pages/GenericFormPage.jsx`
- Branch: `feature/generic-form-page`

---

## Phase 2: Routing Changes

- [ ] Update `web/src/App.jsx` — nested routes: list / new / :id/edit
- Branch: `feature/routing-nested`

---

## Phase 3: Verify Simple Models

- [ ] EventLocation — list + create + edit + delete
- [ ] AssetCategory — list + create + edit + delete
- [ ] Warehouse — list + create + edit + delete
- Branch: `feature/migrate-simple-models`

---

## Phase 4: Migrate Remaining Models

- [ ] Event (relations + DateTime)
- [ ] Asset (photo upload, many fields, relations)
- [ ] Movement (multiple relations, enum)
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
