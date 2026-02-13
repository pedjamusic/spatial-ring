# Backlog / TBA

Items mentioned during development but deferred. Not urgent — just so nothing gets forgotten.

Effort tags: `⚡ quick` (<30 min) · `🟢 easy` (<half day) · `🟡 medium` (1-2 days) · `🔴 large` (3+ days)

## API

- [ ] `🟡 medium` **Input validation on routes** — no validation on any API endpoint currently; should validate at system boundaries (user input, request bodies)
- [x] `⚡ quick` **Login.jsx uses hardcoded `/auth/login`** — doesn't go through `config.js` / `api.js` like other endpoints *(fixed — `auth.js` uses `config.apiUrl`, Login.jsx delegates to `auth.js`)*

## Frontend

- [x] `🟢 easy` **Form error notification → toast** — removed inline error `<div>` from `GenericFormPage.jsx`; all errors now use `toast.error()` only
- [ ] `🟡 medium` **Form element consistency** — make all form elements (inputs, selects, textareas) style and behave identically (noted in CHANGELOG v0.5.3)
- [ ] `🟢 easy` **Bundle size** — currently ~620kB; consider code splitting / lazy loading routes (`React.lazy` + `Suspense`)
- [ ] `🔴 large` **Settings page** — sidebar has a placeholder "Settings Group" comment (`AppSidebar.jsx`) but no implementation
- [ ] `🔴 large` **Mobile app** — `mobile/` workspace exists as an empty placeholder

## UX — Maybe

- [ ] `🔴 large` **Optimistic UI** — currently all mutations are pessimistic (wait for server → refetch). Would matter for: drag-to-reorder lists, inline status toggles, equipment assignment lists (drag/apply to event). Not needed until one of those features lands.

## Calendar

- [ ] `🟢 easy` **Time support in date range picker** — `enableTime` prop exists but is `false` by default; wire up if events need time-of-day
- [ ] `🔴 large` **Recurring events** — no recurrence model; would need schema + UI changes

## Modern JS Adoption

- [x] `⚡ quick` **`Object.groupBy()` in GlobalSearch** — `GlobalSearch.jsx:139-146` manually groups with `.reduce()`; `Object.groupBy(results, item => item.model)` is cleaner (note: won't pre-populate empty keys)
- [x] `⚡ quick` **`.toSorted()` in 2 spots** — `UpcomingEvents.jsx:37` and `ModelTable.jsx:76-83` use `.sort()` on filtered arrays; `.toSorted()` signals immutability intent (not a bug, style improvement)
- [x] `⚡ quick` **Optional chaining cleanup** — `ColumnSettings.jsx:71`: `(config[f.name] && config[f.name].label) || f.name` → `config[f.name]?.label ?? f.name`
- [ ] `🟢 easy` **Centralize date locale** — `DateRangePicker.jsx:134` and `EventCard.jsx:15` hardcode `"en-US"`; other spots use `undefined` (browser default). Standardize when i18n becomes a priority.
- [x] `⚡ quick` **`for...of` → `.find()` in Stats.jsx:18** — imperative loop with early return can be functional: `resources.find(r => candidates.some(c => hay.some(h => h.includes(lower(c)))))` then return path or fallback
- [x] `⚡ quick` **Derive `hasErrors` in useFormValidation.js:67** — replace `let hasErrors` flag with `Object.keys(errors).length > 0`; eliminates the only avoidable `let` in the codebase

<details>
<summary>Modern JS Feature Audit (2026-02-12)</summary>

| Feature | Used? | Action Needed? |
|---|---|---|
| Top-level await | No | No — current pattern is fine |
| structuredClone() | No | No — no deep-clone needs |
| .toSorted() etc. | Yes | Done — UpcomingEvents, ModelTable |
| ?. and ?? | Yes (82 uses) | Done — ColumnSettings cleanup |
| Object.groupBy() | Yes | Done — GlobalSearch |
| i18n readiness | Partial | Centralize locale when i18n starts |
| using/await using | No | No — low applicability |

</details>

<details>
<summary>Composition / Immutability / FP Audit (2026-02-12)</summary>

| Pattern | Rating | Notes |
|---|---|---|
| Composition over Inheritance | 5/5 | Zero classes. Factory pattern, custom hooks, middleware composition, component composition throughout |
| Immutability | 5/5 | 98.7% const (9 let / 663 const). All React state updates immutable. `.toSorted()` replaces in-place `.sort()` |
| Functional Programming | 5/5 | 82 functional array method calls vs 3 imperative loops (all justified). Pure utility modules, extensive useMemo/useCallback |

</details>

## TypeScript Migration

Gradual migration with `allowJs: true` — convert everything except `ModelForm.jsx` (470 lines of deeply dynamic metadata-driven rendering; not worth the type gymnastics). TS still type-checks the boundary where typed components call ModelForm.

**Phase 1 — Foundation** `🟢 easy`
- [ ] Add `tsconfig.json` to `api/` and `web/` (with `allowJs: true`, `strict: true`)
- [ ] Install `@types/express`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/multer`, `@types/supertest`
- [ ] Rename `vite.config.js` → `.ts`

**Phase 2 — API layer** `🟡 medium` (~1,100 lines, mostly mechanical)
- [ ] Convert `api/src/lib/` — `prisma.js`, `pagination.js` (Prisma types flow for free)
- [ ] Convert `api/src/middleware/` — `auth.js`, `upload.js` (typed `Request` extensions)
- [ ] Convert route files one by one (start with simplest: `warehouses.js`)
- [ ] Convert `api/test/` files
- [ ] Bonus: add Zod request validation (addresses the "input validation" TODO above)

**Phase 3 — Web utilities & libs** `🟡 medium` (highest value-per-line)
- [ ] Convert `web/src/lib/api.js` — typed `resource<T>()` factory with model mapping
- [ ] Convert `web/src/lib/auth.js`, `fieldMapping.js`, `toast.js`
- [ ] Convert hooks: `useDebouncedValue`, `useFormValidation`, `useFieldValidation`

**Phase 4 — Web components & pages** `🔴 large` (bulk of files)
- [ ] Convert simple components (LoadingSpinner, Pagination, SearchInput, ColumnSettings, etc.)
- [ ] Convert pages: `GenericListPage`, `GenericFormPage`, `AdminHome`, `Login`
- [ ] Convert `ModelTable.jsx` → `.tsx`
- [ ] Convert calendar components (8 files)
- [ ] Convert sidebar components
- [ ] **Skip `ModelForm.jsx`** — leave as `.jsx` with `allowJs`

**Estimated effort:** ~8-10 days (solo, phases 1-4), with ~80% type coverage.

<details>
<summary>TypeScript Migration Assessment (2026-02-12)</summary>

| Layer | Files | Lines | Difficulty |
|---|---|---|---|
| API routes | 10 | ~870 | Low — repetitive CRUD |
| API lib/middleware | 4 | ~230 | Low |
| API tests | 6 | ~500 | Low |
| Web lib/hooks | 7 | ~740 | Medium — resource factory needs generics |
| Web components | 53 | ~4,770 | Low-Medium (except ModelForm) |
| Web pages | 5 | ~600 | Medium — generic type params |
| **ModelForm.jsx** | **1** | **~470** | **High — skip, leave as .jsx** |

**Why skip ModelForm:** It dynamically renders inputs from Prisma DMMF metadata at runtime — field types, widget overrides, relation dropdowns all determined by API response. Typing it properly requires discriminated unions for every widget/field combination and generics over the metadata schema. The type definitions would be longer than the component itself, with heavy use of `as` casts. Not worth it.

**Key wins from migration:**
- Prisma query autocomplete (catch typos in `include`/`where`/`select`)
- Typed API responses via `resource<Asset>('assets').list()`
- Component prop validation without PropTypes
- Refactoring safety — rename a schema field, compiler flags every reference

</details>

## Search & AI — Phased Roadmap

Current search is `ILIKE '%term%'` — no stemming, no ranking, no fuzzy matching. This roadmap upgrades search incrementally, each step independent of the next.

**Phase 0 — PostgreSQL Full-Text Search** `🟡 medium` (highest value, zero new dependencies)
- [ ] Add `tsvector` columns / GIN indexes on searchable fields (`name`, `description`, `notes`)
- [ ] Replace `ILIKE` queries with `ts_query` in search endpoints
- [ ] Gives: stemming ("amplifiers" → "amplifier"), ranking by relevance, multi-field search
- [ ] No new services, no extensions, built into PostgreSQL.

**Phase 1 — "Did you mean?" at data entry** `🟢 easy` (prevents inconsistencies at the source)
- [ ] Fuzzy match against existing asset names on create/edit (Levenshtein or Fuse.js)
- [ ] Show suggestions: "You have 3 similar items: *1000W Amplifier*, *1200W Amp*, *PA Amplifier*"
- [ ] Triggers on name field blur or debounced input — one lightweight API query
- [ ] One new endpoint + one UI component.

**Phase 2 — Local embeddings + pgvector** `🔴 large` (when FTS isn't enough / multilingual needs arise)
- [ ] Install `pgvector` PostgreSQL extension (`CREATE EXTENSION vector`)
- [ ] Add vector column to assets (and optionally events, warehouses)
- [ ] Embed text fields on create/update using `all-MiniLM-L6-v2` (~90MB, runs in Node.js via `@xenova/transformers`, ~50ms/embedding on Ryzen 7 7840HS, no GPU needed)
- [ ] Search = embed query → cosine similarity → ranked results
- [ ] Handles: "pojačalo" finds "amplifier", typos, abbreviations

**Phase 3 — LLM natural language queries** `🔴 large` (ambitious, only if inventory/team grows)
- [ ] Ollama on homelab with small model (Phi-3 or Mistral 7B, ~6GB RAM resident)
- [ ] Natural language → structured Prisma query: "1000w amp used in event ending in 2 days" → joins + filters
- [ ] Requires: prompt engineering, structured output parsing, query validation/sandboxing
- [ ] Risk: highest complexity, hardest to maintain. Only pursue if phases 0-2 feel insufficient.

<details>
<summary>Search & AI Assessment (2026-02-12)</summary>

| Phase | Effort | New Dependencies | RAM Impact | Value |
|---|---|---|---|---|
| 0: PostgreSQL FTS | 1-2 days | None | None | High — immediate search quality upgrade |
| 1: "Did you mean?" | 1 day | Fuse.js (~5KB) or none | None | High — prevents data inconsistencies |
| 2: pgvector + embeddings | 3-4 days | pgvector, @xenova/transformers | ~90MB model in memory | Medium — multilingual/fuzzy matching |
| 3: LLM query planner | 5-10 days | Ollama + 7B model | ~6GB reserved | Cool but niche for small team |

**Hardware:** Ryzen 7 7840HS, 32GB RAM, 1TB SSD, iGPU 512MB. Phases 0-2 run comfortably. Phase 3 feasible but reserves ~20% of RAM for Ollama. AMD iGPU (Radeon 780M) has limited ROCm inference support — CPU inference is the practical path.

**Recommendation:** Phases 0 and 1 deliver 80% of the value for 20% of the effort. Start there. Phases 2-3 are "when the inventory grows to thousands of items and multilingual becomes a real need."

</details>

## Infrastructure

- [x] `🟢 easy` **`.env.test` for test database** — isolated test env guardrails added (`.env.test.example`, env safety check in test scripts)
- [x] `🟢 easy` **API test suite hardening** — centralized test bootstrap enabled and permissive CRUD assertions tightened

### Completed in this pass

- Shared one-time DB bootstrap for tests enabled (`vitest` global setup)
- Permissive status assertions (`404` fallback) removed from CRUD tests
- Test data lifecycle centralization improved by removing per-file DB disconnect side effects

### Test review findings (addressed)

- Shared setup file existed but was not active in `vitest` config
- `models.test.js` allowed `200/404` and `204/404`, masking route regressions
- Some suites had duplicated auth/data setup with inconsistent cleanup ownership
