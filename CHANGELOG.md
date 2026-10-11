# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased]

### Vitest Security Maintenance — 2026-10-11, 19:33 CEST

- Upgraded API and web test dependencies from Vitest `3.2.7` to `4.1.11`, with manifest ranges `^4.1.11`. This is the smallest next-major line that fixes the [mocker file-read advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9) and [removes Tinypool](https://v4.vitest.dev/guide/migration#pool-rework), eliminating its critical advisory chain. Vitest 5 was not required for these fixes.
- Both workspaces share Vitest/mocker `4.1.11`; Tinypool and vite-node are absent from the lockfile. Vite remains `7.3.6`, Prisma remains `6.19.3`, Node remains `24.21.0`, and application dependencies/version `0.8.3` are unchanged. No overrides, forced audit fixes, test/config rewrites, or install-script approvals were needed; the existing release-age policy was retained.
- On Node `24.21.0` / npm `11.19.0`, all **54 API tests** and **7 web tests**, the frontend build, dependency-tree validation, lockfile scope checks, and `git diff --check` passed. A fresh private temporary installation (`npm ci --ignore-scripts`, then explicit Prisma generation) also passed both complete suites against `app_test` and the frontend build. The temporary test configuration and installation were removed afterward.
- Live npm audit now reports **7 high affected entries, 0 critical, and 0 moderate**, down from 10 entries before this step. Remaining chains are Prisma/config/deepmerge-ts and nodemon/chokidar/braces; they require separate reviewed changes. Existing bundle-size/runtime-env build warnings remain. This verifies the dependency tree and test migration, not exploit resistance or homelab deployment.

### Node Runtime Alignment — 2026-10-11, 19:28 CEST

- Selected Node `24.21.0` LTS as the local verification baseline, confirmed against the [official release index](https://nodejs.org/dist/index.json). Updated `.node-version` and all three Node stages in the tracked root Dockerfile to this version. Root/API/web manifests and their lockfile entries now declare `engines.node: 24.x`; resolved dependency versions and application version `0.8.3` are unchanged.
- Documented project-specific Node selection in README, including using the already installed Homebrew `node@24` in the current terminal. The machine's global Node installation and shell configuration were not changed. Both local development servers were restarted and their executable paths confirmed as Node `24.21.0`.
- Documented Coolify/Nixpacks selection through the root manifest and the higher-priority `NIXPACKS_NODE_VERSION` override. Current [Nixpacks source](https://github.com/railwayapp/nixpacks/blob/main/src/providers/node/mod.rs) supports Node 24, but the homelab's installed builder version, overrides, and actual runtime remain unverified. Nixpacks selects a major version and may provide a different Node 24 patch from the exact local/Docker pin.
- Verification on macOS Node `24.21.0` / npm `11.19.0`: API tests **54/54**, web tests **7/7**, frontend build, Prisma Client generation, dependency-tree validation, documented command/file checks, and runtime/config consistency checks passed. A fresh isolated `npm ci --ignore-scripts` also passed, followed by explicit Prisma generation and a frontend build without local environment files.
- Built the root Dockerfile's `api-builder` and `web-builder` targets on `node:24.21.0-alpine` from a temporary tracked-source context excluding environment files, database backups, old generated Prisma output, and uploads. Fresh container `npm ci`, Prisma generation, and frontend build passed. Native bcrypt hash/compare passed; Prisma's native engine initialized and returned `P1001` when connecting to an intentionally closed port. This is engine startup evidence, not a container-to-database integration test.
- Local HTTP smoke checks passed: web 200, model metadata 200, and protected inventory 401 without credentials. Existing bundle/runtime-env warnings and the 10 outstanding dependency audit entries remain. No full production image, Coolify deployment, or signed-in local UI test was claimed; existing packaging issues and ignored per-workspace Dockerfiles remain separate follow-up work.

### Local Restart & Compatible Dependency Maintenance — 2026-10-11, 19:11 CEST

- Started Docker Desktop and recovered the existing `postgres-db` container (PostgreSQL 18.3). Its `app` database already contained the original 8 assets, 9 events, and 2 users; no restore or password reset was needed to run the API checks. The scripts' documented `pg-local` container name does not match this Mac's container.
- Saved a private, Git-ignored logical backup at `backups/app_before_restart_20261011_190452.sql` with file permissions `0600`. After verification, all PostgreSQL COPY data sections from `app` matched this pre-test backup, proving the original records were preserved beyond matching counts.
- Created the previously absent `app_test` database and ran the API suite against it. The test bootstrap resets only this configured test database; the development inventory remains separate.
- Reproduced two failing CRUD tests in `api/test/models.test.js`: the file deleted its warehouse/event-location records and then reused their IDs for asset/event creation. Its whole-database cleanup also conflicted with another file's movement records in the parallel suite. The isolated file failed 2 of 10 tests before the repair.
- Repaired only the CRUD test fixtures: dedicated relation records live until teardown, and cleanup deletes only IDs created by that file, including rows left after failed assertions. The isolated file then passed all 10 tests, and the complete suite passed all 54. No API application behavior was changed.
- Updated compatible dependency versions in the lockfile: Multer `2.4.0`, express-rate-limit `8.7.0`, React Router `7.18.4`, Vite `7.3.6`, Vitest `3.2.7`, nodemon `3.1.14`, and Prisma client/CLI/internals `6.19.3`, plus compatible transitive security patches (including proxy-addr `2.0.8`). Existing workspace metadata and the owner's pre-existing lockfile corrections were preserved.
- Applied non-forced npm audit fixes with install scripts disabled, retained `.npmrc`'s seven-day release-age setting, and explicitly regenerated Prisma Client `6.19.3`. No major migration, override, forced downgrade, global install-script approval, or package version bump was performed.
- Final live security audit: **10 affected entries** (2 critical, 7 high, 1 moderate), down from 37. Critical entries remain in the Vitest/Tinypool development test chain. `npm audit --omit=dev` reports **6 high and 0 critical** entries; those six belong to Prisma/nodemon tool chains currently classified as production dependencies. Audit counts are package entries, not demonstrated exploit counts.
- Remaining security decisions: review a Vitest major upgrade and its Tinypool/mocker chain, Prisma's deepmerge-ts configuration chain, and nodemon's braces/chokidar chain. npm currently recommends major upgrades or old-version downgrades for these; none were forced. The dependency tree is not security-clean.
- Final checks on the existing Node `26.11.1` environment: `npm run test` passed **54/54** API tests; `npm run test:web` passed **7/7** web tests; `npm run build --workspace=web`, `npm run db:generate`, `npm ls --depth=0`, and `git diff --check` passed. Supported-LTS and fresh-clone installation checks remain open.
- Web build warnings remain: a 652.75 kB main JS chunk (197.11 kB gzip), the runtime `/env-config.js` script, and Node's module-register deprecation. The root build script, Docker clean-clone inputs, tracked database backup, and deployment documentation findings from the restart checkpoint remain separate work.
- Local development is available with `npm run dev:local`: web at `http://localhost:5173`, API at `http://localhost:3000`. Public model metadata returned 200, unauthenticated inventory returned 401, and the browser displayed the local login page. Local signed-in UI testing is not yet verified; the homelab testing account is in a separate database and is not automatically copied here.
- Changes are local on `codex/project-restart-2026-10-11`; the homelab deployment was not changed. Git commit/merge/push still requires the owner's confirmation.

### Project Restart Checkpoint — 2026-10-11, 18:35 CEST (Europe/Belgrade)

This is a dated inspection and restart plan, not a release or an implementation change. No dependencies, account passwords, databases, or deployment settings were changed. Package versions remain `0.8.3`.

#### Where we left off

- **Product:** Spatial Ring, an inventory and event-equipment management app. Express 5 + Prisma 6 + PostgreSQL power the API; React 19 + Vite 7 + Tailwind 4 power the web UI. The mobile workspace remains a placeholder.
- **Baseline:** local `main` and live GitHub `main` both point to `01e08b9acad086c2d19247979659f2ff4804b43c`. The last commits on March 18, 2026 normalized line endings after a macOS reinstall. The last feature work was February 14, 2026.
- **Latest feature work:** dedicated Event details pages, inline event editing and equipment assignments, quantity-aware asset availability, active/archived event lists, table sorting defaults, and an availability filter. These features are merged into main; not all were described in the older Unreleased notes below.
- **Task state:** no other local task branches and no open GitHub issues or pull requests were found. There is no clearly identified unfinished task. The generic CRUD refactor is marked complete in `docs/CRUD-REFACTOR-PROGRESS.md`.
- **Backlog:** API input validation, bundle splitting, settings, date/time and recurrence improvements, TypeScript migration, and phased search upgrades remain open in `TODO.md`. TypeScript and advanced search are plans, not implemented capabilities. Recommended next work is environment/access recovery and dependency maintenance before new features.
- **Inspection branch:** `codex/project-restart-2026-10-11`, created from main. Existing local work was preserved: modified `package-lock.json`, untracked `.claude/settings.local.json`, `.npmrc`, and `dump.sql`.
- **Existing lockfile diff:** workspace version metadata was updated from `0.8.1` to `0.8.3` and the web Vitest dependency was recorded. This diff does not upgrade resolved package versions.

#### Local environment and data

- Installed Node/npm: `26.11.1` / `11.20.0`; `.node-version` pins `22.12.0`, while the Dockerfile uses Node 20. These environments disagree. Node 20 is now EOL; use a current supported Node 24 LTS patch for the maintenance baseline and align local/deployment configuration in a separate change. See the [official Node release status](https://nodejs.org/en/about/previous-releases).
- `npm ls --depth=0` succeeds: installed direct dependencies are present and satisfy the manifests.
- Local development config targets PostgreSQL `app` on `localhost:5432`. Test config separately targets `app_test`. JWT secrets are configured; their values were not recorded.
- Docker.app is installed, but its configured daemon socket is absent. No local API, web, or PostgreSQL listener was found on ports 3000, 5173, or 5432. A host-level TCP check confirms port 5432 refuses connections.
- The untracked `dump.sql` is a PostgreSQL 17.7 logical backup, modified March 18, 2026. Parsed COPY sections contain 8 assets, 4 categories, 9 events, 5 event locations, 4 movements, 2 users, 6 warehouses, and 7 migration records. These are backup counts, not live database counts. Account identity was reported privately in chat; no emails or password hashes are copied into this checkpoint.
- `api/pgdata-backup/` is a PostgreSQL 17 physical data directory: approximately 62 MB and 1,309 tracked files. The GitHub repository is PUBLIC. Review the backup's contents and move database backups out of source control; any history cleanup needs a deliberate separate plan. This inspection did not establish which private records or credentials the physical backup contains.
- `api/generated/` contributes 23 tracked files (about 20 MB), although the current Prisma generator uses the default client location. Review this older generated output separately; do not confuse generated declaration-file size with application complexity.
- The logical backup does not include uploaded photo files. Inventory restoration needs a separate check for `api/uploads/assets/` or a server-side upload backup. No restore was attempted or verified.

#### Login recovery — both environments

- Authentication uses email plus a bcrypt password hash. The API implements login, registration, and client-side logout; there is no forgot-password/reset endpoint or UI. An existing plaintext password cannot be recovered from the stored hash.
- **Local:** start Docker Desktop, inventory existing containers and volumes, and start the existing `pg-local` database if it is present. Inspect the live account list and inventory before changing anything. If the original database is absent, restore `dump.sql` into a NEW PostgreSQL 17 recovery database first, verify schema/counts, then explicitly select it for local development. Preserve the original dump and volumes.
- Reset only the selected existing user's `passwordHash` with a new bcrypt hash through a verified database administration session, using a password supplied securely by the owner. Keep that password in a password manager. Do not create a substitute account when the existing user is linked to movement history. Verify actual login and an authenticated inventory request after the reset.
- **Deployed:** `https://demo.toodear.rocks/` and same-origin API probes return HTTP 403 from this inspection environment. `api.demo.toodear.rocks`, still referenced by `web/.env.production`, does not resolve here. These observations do not prove the app itself is down or identify the source of the 403.
- **Follow-up, October 11 at 18:49 CEST:** the owner confirmed the app is hosted on the homelab at `https://demo.toodear.rocks` and reported successfully signing in using an existing Bruno request. Codex's in-app browser also successfully opened the deployed login page. The earlier HTTP 403 probes therefore do not establish a deployment outage. A dedicated testing account is being arranged; its creation and authenticated access have not yet been verified. The owner will retain its password securely and sign in through the browser; no credentials are to be saved in project files.
- **Testing access, October 11 at 18:55 CEST:** the owner reported creating the dedicated testing account and saving its credentials in a password manager. The in-app browser has a signed-in session: the protected dashboard and asset list successfully loaded live inventory data (8 asset records, total quantity 9, 4 categories, 6 warehouses), and the Events calendar opened. The session was left on the dashboard for further testing. This verifies authenticated read access, not account identity display, write operations, or an end-to-end regression suite. No inventory records were changed and no passwords/tokens were read or saved in the repository. Re-authentication may be needed when the browser session expires; unattended API access was not configured. Deployed login recovery is no longer an outstanding prerequisite; local database recovery and dependency maintenance remain open.
- Identify the active Coolify/hosting project, public domain, API service, and authoritative database first. `api/.env.production` uses a Prisma Accelerate URL, whereas deployment docs describe a Coolify PostgreSQL setup; do not assume the old local file is the current production configuration. No production database query was made.
- Back up the authoritative deployed database, confirm the account there, and reset only that account using the same secure process. Local and deployed databases are independent; a local reset does not update the deployed account. Verify login from an ordinary browser and authenticated inventory access.
- Public `/auth/register` currently creates accounts without an invitation or role gate, and authenticated accounts share access to the inventory routes. Confirm this access policy before restoring public use; this inspection did not determine the intended registration policy.

#### Dependency checkpoint

Live npm registry checks were run on October 11, 2026. These are advisory/package counts, not counts of independently demonstrated exploitable application bugs.

- Full `npm audit`: **37 affected dependency entries** — 3 critical, 27 high, 5 moderate, 2 low.
- `npm audit --omit=dev`: **25 entries** — 1 critical, 22 high, 1 moderate, 1 low. This still includes Vite/build-tool chains and nodemon because of current manifest classification; it is not a pure runtime-exposure count.
- Critical entries in the full report are `proxy-addr`, `tinypool`, and `vitest`. The Vitest UI advisory requires particular UI/API exposure conditions; the repository's ordinary test command is `vitest run`. See the [maintainer advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp).
- Prioritize upload and authentication dependencies, then runtime transitive dependencies and the build/test toolchain. Multer `2.0.2` is within the affected range of the [maintainer's denial-of-service advisory](https://github.com/expressjs/multer/security/advisories/GHSA-5528-5vmv-3xc2); rate limiting also has a [maintainer advisory](https://github.com/express-rate-limit/express-rate-limit/security/advisories/GHSA-46wh-pxpv-q5gq). No exploit test was run.

| Package | Installed/locked | Latest allowed by current range | Latest registry release |
| --- | --- | --- | --- |
| multer | 2.0.2 | 2.4.0 | 2.4.0 |
| express-rate-limit | 8.2.1 | 8.7.0 | 8.7.0 |
| react-router-dom | 7.13.0 | 7.18.4 | 7.18.4 |
| vite | 7.3.1 | 7.3.6 | 8.3.2 |
| vitest | 3.2.4 | 3.2.7 | 5.0.3 |
| prisma / @prisma/client / @prisma/internals | 6.19.2 | 6.19.3 | 7.10.0 |
| react / react-dom | 19.2.3 | 19.3.0 | 19.3.0 |
| tailwindcss / @tailwindcss/vite | 4.1.18 | 4.3.3 | 4.3.3 |
| react-aria-components | 1.14.0 | 1.21.1 | 1.21.1 |
| eslint | 9.39.2 | 9.39.5 | 10.12.0 |

Apply and verify compatible maintenance updates in small groups, then re-run the audit. Do not use `npm audit fix --force` indiscriminately: the current report proposes downgrading Prisma/internals to `6.12.0` and nodemon to `1.14.10` for some chains. The allowed-version column is not a guarantee that every advisory will be resolved. Treat Prisma 7, Vite 8, Vitest 5, and ESLint 10 as separate migration decisions.

#### Verification and maintenance findings

| Check | Result at this checkpoint |
| --- | --- |
| `npm ls --depth=0` | Passed |
| `npm run test:web` | Passed: 2 files, 7 tests; form key/value utility coverage only |
| `npm run build --workspace=web` | Passed; main JS chunk 649.93 kB / 195.98 kB gzip; chunk-size and runtime env-script warnings |
| Prisma validation from `api/` | Passed with `../node_modules/.bin/prisma validate` |
| `npm run test` | Failed in global setup during `prisma db push --force-reset`; no API assertions ran |
| Local database read | Failed to initialize; PostgreSQL TCP connection refused |
| AGENTS command/file checklist | Passed: documented scripts and key paths exist |
| Remote main / open work | Main matches local baseline; no open issues or PRs |
| GitHub Actions | Last 3 runs are historical failed Release runs from February 11–12; latest is [run 21952269466](https://github.com/pedjamusic/spatial-ring/actions/runs/21952269466), unrelated older SHA `bfef690` |
| CI configuration | No workflow files in the current tracked tree; no current automated CI gate verified |
| End-to-end UI, local/deployed login, database restore, Docker image | Not verified |

- The API test bootstrap resets the entire configured test database. Keep `app_test` isolated; never run tests against restored inventory or production. The env guard passed, but its string-based test-name check should not be treated as universal protection for arbitrary remote configurations.
- Root `npm run build` calls an API build script that is literally `exit 1`, so it cannot complete. Use the web build command for the current frontend baseline; resolve the root build contract before adding CI.
- The tracked Dockerfile copies `web/inject-env.sh`, which exists locally but is ignored/untracked. A clean clone will lack it. The Dockerfile also selects EOL Node 20 and copies the API directory containing tracked database backups. Docker image build was not attempted.
- `docs/COOLIFY.md` recommends `db:migrate` (`prisma migrate dev`) at production startup. For this pinned Prisma 6 project, production should apply reviewed migrations using `prisma migrate deploy` with the actual deployment environment, after checking database state. Reconcile the same-origin proxy guide with the separate API URL described elsewhere.
- README advertises `/api/docs`; no corresponding API route or documentation generator was found. The older Unreleased notes also omit the later archive/sorting/availability changes listed above.
- API boundary validation remains uneven: auth and event assignment have some validation, while generic asset/movement CRUD accepts loosely parsed quantities. Before relying on multi-user event assignments, test concurrent requests: availability is read before the assignment transaction, so concurrency protection is not established. Dedicated event return/check-in UX is also absent; movements remain generic CRUD. These are follow-up review/test targets, not fixes applied here.
- The audit signal script mostly flags generated Prisma declaration files as size hotspots. Its broad script/CI detection is incomplete for this workspace; the command-level results above take precedence. This was a restart assessment, not an exhaustive security or code audit.

#### Recommended order of work

1. **Recover local access and prove the backup:** start Docker, inspect existing volumes, connect to the existing database or restore into a new recovery database, verify counts/schema/photos, securely reset the existing account, and log in. Bring up development services with `npm run dev:local` once the intended local database is selected.
2. **Recover deployed access:** identify the live hosting/database configuration, investigate the 403 and stale API hostname, take a current backup, reset the verified deployed account, and prove browser/API login. Do not overwrite deployed data with the old local dump.
3. **Establish a reproducible baseline:** align on supported Node LTS, retain the existing lockfile work, run the API suite against an isolated test database, fix clean-clone Docker inputs, the root build contract, and deployment instructions. Address the public tracked database backup before further distribution.
4. **Maintain dependencies:** update compatible groups, regenerate the matching Prisma client when needed, re-run web/API tests and builds, audit again, and document residual advisories with their actual exposure. Decide major migrations separately.
5. **Resume product work:** start with API request validation and assignment/return correctness. Defer TypeScript, embeddings/LLMs, recurring events, and mobile until the existing inventory workflow is usable and verified. Add a CI gate once the baseline commands are dependable.

Checkpoint completion: inspection and timestamp saved; account recovery, database restore, dependency updates, deployment repair, and end-to-end checks remain future work. Commit/merge/push require the owner's confirmation under `AGENTS.md`; nothing was committed or pushed during this inspection.

### Event Assignment & View Flow

- Added a dedicated Event `VIEW` page (`/admin/events/:id`) as the default single-event page, with a built-in `Edit` action
- Added `Assets Used` management on the Event view, including inline asset assignment to the event
- Added Event assignment API endpoints:
  - `GET /api/events/:id/assignments`
  - `GET /api/events/:id/assignable-assets`
  - `POST /api/events/:id/assignments`
- Updated Event links to point to the Event view page from:
  - Calendar day popover entries
  - Events table `Name` column (actions remain `Edit` + `Delete`)
  - Dashboard event cards
  - Global search results
- Updated Event edit navigation so both `Save` and `Cancel` return to Event `SHOW` (`/admin/events/:id`) and breadcrumb text reflects `Event Details`
- Added backend tests for assignment flow in `api/test/events-assignments.test.js`

## [0.8.3] - 2026-02-13

### Dashboard Event UX & Visual Polish

- **Event card status glow** — added subtle bottom-left radial gradient glow on dashboard event cards, with color driven by event urgency/ongoing status via `color-mix(in oklch, ...)`
- **Badge color consistency** — moved badge variant backgrounds/text to centralized CSS tokens with light/dark theme-specific mixing for stronger visual parity across themes
- **Context-aware event navigation** — when opening an event from Dashboard, Cancel/back now return to Dashboard instead of default Events list
- **Breadcrumb context labeling** — event form breadcrumb now shows `Dashboard` for Dashboard-origin flows (fallback remains resource label like `Events`)

### Frontend Form Validation Consistency

- **Relation field validation key alignment** — relation dropdown blur/change/submit validation now consistently uses FK value mapping with stable error/touched state keys
- **Numeric input zero handling** — number normalization preserves `0` values instead of collapsing to empty string, preventing false required-field errors
- **Date range widget validation parity** — `DateRangePicker` now uses shared form input classes, touched/error display, and blur wiring through the same `ModelForm` validation flow as other form controls
- **Frontend regression tests** — added targeted Vitest coverage for field key mapping and numeric input normalization

### Testing & Environment

- **Isolated test env guardrails** — added `api/.env.test.example` and mandatory test env checks before API test commands
- **Safer setup script behavior** — `setup-db` now writes `.env.test` automatically only for local PostgreSQL and SQLite flows, and skips automatic test env changes for manual/remote PostgreSQL
- **Test harness hardening** — enabled shared one-time Vitest global setup and tightened permissive CRUD test assertions

### Documentation

- **TODO format cleanup** — `TODO.md` now keeps infrastructure updates in established checkbox task format, with narrative summaries tracked in changelog entries

### Versioning

- Bumped monorepo versions to `0.8.3` in root, API, and web package manifests

## [0.8.2] - 2026-02-11

### Sidebar Refactoring

Improved desktop and mobile sidebar UX with unified navigation.

- **Sticky inline layout** on desktop — sidebar remains visible and fixed in place
- **Mobile overlay** — sidebar appears as an overlay with backdrop on small screens
- **Unified toggle** — single burger icon controls both desktop and mobile states
- **Font and icon weights** — updated navigation typography for better hierarchy and readability

### Button Enhancements

Added visual depth to primary action buttons.

- **Colored outer glow** — buttons now have a subtle colored glow effect matching their theme
- **Custom shadow-glow utility** — centered glow effect using custom CSS utility (`shadow-glow`)

### Calendar Improvements

Enhanced calendar visual presentation and usability.

- **Weekday positioning** — refined layout for better alignment
- **Past event muting** — past events now display in neutral gray for visual hierarchy
- **Popover positioning** — calendar day popover now uses measured height for accurate positioning

### Search & Navigation

- **Search result linking** — global search results now link to individual item detail pages
- **Toast standardization** — unified toast notification styling and behavior across the UI

### Bug Fixes

- **Login security** — improved security, accessibility, and loading state handling
- **Node.js version pinning** — fixed nixpacks builds by pinning Node.js version

## [0.8.1] - 2026-02-11

### Request Race Condition Fixes

Added `AbortController` to all data-fetching effects that re-fire on parameter changes, preventing out-of-order responses from rendering stale data.

- **API layer**: `makeRequest`, `resource().list()`, `resource().get()`, and `authFetch` now accept an optional `signal` for request cancellation
- **GenericListPage**: Aborts in-flight requests on search, pagination, or view changes — the highest-impact fix
- **useCalendarEvents**: Aborts when rapidly navigating months/years
- **GenericFormPage**: Upgraded from `active` flag to `AbortController` for real HTTP cancellation
- **ModelForm**: Relation dropdown fetches abort on meta change or unmount
- Mount-once components (`AdminHome`, `GlobalSearch`, `App`) retain their existing `active` flag pattern — no race risk with static deps

## [0.8] - 2026-02-10

### Date Range Picker

Replaced native `<input type="datetime-local">` for Event dates with a flatpickr-powered range picker.

- **New component**: `DateRangePicker.jsx` — wraps flatpickr with `mode: "range"`, two-month display on desktop, one on mobile
- **Custom theme**: `flatpickr-theme.css` using Tailwind v4 CSS variables (`--color-*`, `--spacing`, `--radius-*`, `--text-*`, `--font-weight-*`) for full design token reuse
- **Cancel / Apply buttons**: Button group footer matching the app's existing button group style; selection only commits on Apply
- **Config-driven**: New `widget: "dateRangePicker"` and `rangeEnd` / `pairedWith` options in `ui-configs.json` — no per-model component code needed
- **Dark mode**: Full dark mode support via `prefers-color-scheme`
- **oklch color mixing**: Uses `color-mix(in oklch, ...)` for perceptually uniform transparency blending

### Calendar Semantic Colors

Replaced monochromatic blue calendar pills/dots with semantically distinct hues for better scannability.

| Classification | Color        | Meaning            |
| -------------- | ------------ | ------------------ |
| Start / Single | Teal         | "begins here"      |
| Ongoing        | Blue (light) | span continues     |
| End            | Amber        | "concludes here"   |
| More           | Gray         | overflow indicator |

Applied consistently across month-view pills, year-view dots, and day popover.

## [0.7]

### CRUD Refactor (Phases 0–5)

Replaced the monolithic `GenericCrud.jsx` with dedicated list and form pages, server-side pagination, and URL-driven state.

- **API**: Added `paginateQuery()` helper and paginated `GET /` + `GET /:id` on all routes (EventLocation, AssetCategory, Warehouse, Event, Asset, Movement)
- **Frontend**: New `GenericListPage` + `GenericFormPage` with server-side pagination, search, and column settings
- **Dynamic routing**: All models served via `/admin/:model`, `/admin/:model/new`, `/admin/:model/:id/edit`
- **URL state**: Search, page, and limit synced to URL query params (`useSearchParams`) — shareable links, browser back/forward
- **Complex models**: Event (relations + DateTime), Asset (photo upload, many fields), Movement (multiple relations, enum) all working through generic pages
- **Cleanup**: Deleted 7 dead page files (`GenericCrud.jsx`, `Assets.jsx`, `Events.jsx`, `Warehouses.jsx`, `Movements.jsx`, `EventLocations.jsx`, `AssetCategories.jsx`) — removed ~580 lines
- **Tests**: API smoke tests for simple models; test safety (no `clearData()`, track + cleanup own rows only)

### Other

- Added PostgreSQL backup script with auto-pruning
- Moved search + column settings inside table card

## [0.6]

- Added live search

### Bug fixes

- Corrected React crashing on SidebarMenuButton.jsx by destructuring all needed values from the single hook call

## [0.5.4]

- Added Logout to the sidebar
- Added disable for submit button, on submit (D'oh!) (on wrong Login inputs and entry conditions not met)
- Button consistency (hopefully), styling and behaviour (Login and CRUD forms)

## [0.5.3](https://github.com/pedjamusic/spatial-ring/commit/c034dc1b8cda92d581be26bb9bfdd234512d6dcf) (2025-11-08)

### Bug Fixes

- Tailwindcss Forms plugin fixes height of select element, but affects validation formatting
- Validation fixed by setting ring-0 in ValidatedFormField
- TODO: Make all form elements style and behave the same

## [0.5.2](https://github.com/pedjamusic/spatial-ring/compare/v0.5.0...v0.5.2) (2025-11-07)

### Bug Fixes

- **ModelTable:** improve AssetAvatar visibility logic and related data handling ([6e746a3](https://github.com/pedjamusic/spatial-ring/commit/6e746a359bb794c34e1a2148324109fd41cd178f))

### [0.5.1](https://github.com/pedjamusic/spatial-ring/compare/v0.5.0...v0.5.1) (2025-11-07)

## 0.2.0 (20251107)

Highlights

- Automated changelogs added.
- Documentation updates, dashboard and data improvements, multi-environment and DB setup.

Full list of commits (newest → oldest in this release)

- feat: automated changelogs (2025-11-07) — 117ebd2 / https://github.com/pedjamusic/spatial-ring/commit/117ebd2a622dabaa657d20f516b28a6311d1446c
- Prettier config file location corrected (2025-10-31) — 2e4fe24 / https://github.com/pedjamusic/spatial-ring/commit/2e4fe247be1fd1e71bc66ec9161a7c580e81c9cf
- sqlite .db file added to .gitignore (2025-10-31) — 7bb9e19 / https://github.com/pedjamusic/spatial-ring/commit/7bb9e198b09595b10aee2c0a317d9d01c4cea9da
- Database setup (2025-10-30) — aa50423 / https://github.com/pedjamusic/spatial-ring/commit/aa5042394fde6526388a24295d0beb7e4d8316e8
- Multi-Environment Setup (2025-10-30) — ecb4283 / https://github.com/pedjamusic/spatial-ring/commit/ecb42832ef17963ae6fc2e5a8f0f85b792266abb
- Abracadabra monorepo (2025-10-28) — b3d8142 / https://github.com/pedjamusic/spatial-ring/commit/b3d81425dc7b6b8e077c10ec931c39f36721eac7
- Cleaning reset styles for img (2025-10-28) — d7f2ee0 / https://github.com/pedjamusic/spatial-ring/commit/d7f2ee008344a47a102e52fc1e83966e1c87195d
- Reset styles for img (2025-10-28) — 1eb1348 / https://github.com/pedjamusic/spatial-ring/commit/1eb134848a8fadeb360cdf69d39af5551e47820f
- Dashboard layout responsive formatting, sizing and limiting(max-w) (2025-10-28) — f1da515 / https://github.com/pedjamusic/spatial-ring/commit/f1da5154b037d8ac1f6ebf75387c3b371ea9f035
- App description adjective (2025-10-28) — 82b6b1a / https://github.com/pedjamusic/spatial-ring/commit/82b6b1ad1f4f7d6d219f57a169e6a33057ac881f
- Styling and unifying collapsed nav icons (2025-10-28) — fe73d10 / https://github.com/pedjamusic/spatial-ring/commit/fe73d10aa49c6b97dc3d3ae9785257d1ee01a76f
- Overlay nav positioning somewhat resolved (2025-10-28) — 6fd025a / https://github.com/pedjamusic/spatial-ring/commit/6fd025a6c9b23c73385fc31135d5a4bec30feb22
- Fixed table overflow, adjusted blurs on pop-ups, almost fine nav style, broken collapse/drawer (2025-10-27) — ec273c0 / https://github.com/pedjamusic/spatial-ring/commit/ec273c06faebb40abf206557b2afe7866eb45f52
- Working on layout issues across the app (2025-10-27) — be7a458 / https://github.com/pedjamusic/spatial-ring/commit/be7a4589cb183591df003760b7069d0e8728c443
- Glitchy burger menu and glitchy tooltip (2025-10-27) — 69d33dc / https://github.com/pedjamusic/spatial-ring/commit/69d33dcb33612fb7ba84ae15c3e20fb1125fce89
- Annoyingly glitchy responsive-ish sidebar (2025-10-27) — 767d012 / https://github.com/pedjamusic/spatial-ring/commit/767d012492ac39e6a5284f837a4f2a4bed92e413
- Basic asset photo upload added (2025-10-26) — 1ba1d28 / https://github.com/pedjamusic/spatial-ring/commit/1ba1d283e5fdf4610c4cb5f3be34b9127f1ee9cd
- Added H1 component (2025-10-25) — 3408b5d / https://github.com/pedjamusic/spatial-ring/commit/3408b5dcd604ce2ba898ef616f6058a650b320d6
- Form feedback and CRUD entry toast (2025-10-24) — af52b3f / https://github.com/pedjamusic/spatial-ring/commit/af52b3f485a51812e9a76b72031fa34ef5ff6a44
- README.md updated the second time (2025-10-24) — 559f24f / https://github.com/pedjamusic/spatial-ring/commit/559f24fa6cb6f674188fbeeaa5e7a087208638c8
- README.md updated (2025-10-24) — 89e2f47 / https://github.com/pedjamusic/spatial-ring/commit/89e2f479c51140f8c26744af644e939f69259d7
- Dashboard cards show real values. Updated README.md. (2025-10-24) — 565b53d / https://github.com/pedjamusic/spatial-ring/commit/565b53daabb979ad5189104fe8a7c7104fa7940c

## 0.1.1 (20251021)

Highlights

- Major UI work: login, sidebar, model forms and tables, dashboard cards and column settings.
- Multiple styling and layout fixes; CRUD Edit/Cancel stabilized.

Full list of commits (newest → oldest in this release)

- Dashboard card styling (2025-10-21) — 64b16c0 / https://github.com/pedjamusic/spatial-ring/commit/64b16c00132f9560afa017aec14fe84fa762ccf9
- Alias @ set in Vite config. Dashboard info cards added. (2025-10-21) — 0f2f362 / https://github.com/pedjamusic/spatial-ring/commit/0f2f362806f94c58b8e6c259ed7c6c302b6e33b2
- ColumnSettings transparent+blur and Dashboard kick off (2025-10-21) — e10cfe9 / https://github.com/pedjamusic/spatial-ring/commit/e10cfe98cf63a0d2e9830fd5f7783fd5bb9c19fa
- CRUD Edit/Cancel fixed. (2025-10-16) — 38b72d6 / https://github.com/pedjamusic/spatial-ring/commit/38b72d6de4b3afb15a77d52f644d097e45d8b581
- Trying to fix CRUD Edit/Cancel (2025-10-16) — ae2e115 / https://github.com/pedjamusic/spatial-ring/commit/ae2e11549849db17a6d4ddeb57319ff8a8e70ad4
- Resource Manifest as central setting and starting point for generator (2025-10-16) — ab096a8 / https://github.com/pedjamusic/spatial-ring/commit/ab096a8438e8089d1389083435c0d82fb105ac2f
- Removed shadow from default form text input field(s) (2025-10-15) — 87114d2 / https://github.com/pedjamusic/spatial-ring/commit/87114d2af729bf9b79d0cb112f89054014cf4954
- Fixed dark styles, worked on flawed sidebar icons (2025-10-15) — 2afb625 / https://github.com/pedjamusic/spatial-ring/commit/2afb62558d8f8552aab921efca41e0ec1ebb3a17
- Fixed padding and gaps (2025-10-15) — 62d4fea / https://github.com/pedjamusic/spatial-ring/commit/62d4fea98c8296ad0e137243df2b5218f26e00f4
- Styled form and table (2025-10-15) — be7c464 / https://github.com/pedjamusic/spatial-ring/commit/be7c4642980594770cadfd9498fced8ed45d3a9d
- Removing dev borders and styling dashboard (2025-10-14) — 569318a / https://github.com/pedjamusic/spatial-ring/commit/569318afdf6d4769589fd93405e1b33e200fc945
- Corrected ColumnSetting button placement (2025-10-14) — b9e33af / https://github.com/pedjamusic/spatial-ring/commit/b9e33afdde2f686b115c65ab070801d678957bd4
- ColumnSettings and uiConfig rework (2025-10-14) — d470c53 / https://github.com/pedjamusic/spatial-ring/commit/d470c534250613371302dd30334592c01c8dfe85
- Semi-working table columns hidding (2025-10-11) — 3256165 / https://github.com/pedjamusic/spatial-ring/commit/325616531904340db6b02d7a25cbef44085056b4
- Colmn settings WIP, rework of uiConfig (2025-10-11) — f9c500e / https://github.com/pedjamusic/spatial-ring/commit/f9c500e81cf728f978c34bd81c69d4a6fbf1c866
- Dashboard semi-working, starting to fix uiConfig (2025-10-11) — 25d5995 / https://github.com/pedjamusic/spatial-ring/commit/25d59959170db70fff1ce25d49d3229227c08632
- Programatic navigation works. Including API script to generate nav items. (2025-10-10) — 2a3aab0 / https://github.com/pedjamusic/spatial-ring/commit/2a3aab08b0e16f290b2bb40548333e43775a38eb
- Styling sidebar, broke sidebar with unnecessary complication (2025-10-10) — cb55d82 / https://github.com/pedjamusic/spatial-ring/commit/cb55d82a81b644bd89e280fd5e3758089fec3bab
- Styling Login page, ModelForm and ModelTable, Popover stash (2025-10-04) — bd15fd8 / https://github.com/pedjamusic/spatial-ring/commit/bd15fd89854ea95c315d8189111c95c3e29286ed
- Reverting login validation from glitchy popover to inline (2025-10-01) — 37b46c2 / https://github.com/pedjamusic/spatial-ring/commit/37b46c2db61fcc4c8531cd9d13ac260e1d85b54b
- Popover validation on login page (2025-10-01) — 863ecc6 / https://github.com/pedjamusic/spatial-ring/commit/863ecc6012269c8413b279ad1a14110616757c2a
- Logout fixed, toast component working (2025-10-01) — 7056ec6 / https://github.com/pedjamusic/spatial-ring/commit/7056ec61c8dc4138c0a6a66e06a1884aec501eda

## 0.1.0 (20250930)

Highlights

- Project initialization, authentication and route refactor, Prisma library work and early CRUD/UI scaffolding.

Full list of commits (newest → oldest in this release)

- React Aria plus Tailwind CSS styling of Login.jsx (2025-09-30) — b1085a2 / https://github.com/pedjamusic/spatial-ring/commit/b1085a26ee1f6ada0a7941d2c79974016d52c243
- React Aria plus Tailwind CSS styling of Login.jsx (2025-09-29) — 81fcab1 / https://github.com/pedjamusic/spatial-ring/commit/81fcab10ec60cd7b31bbf35a040d4c4f3a1dd876
- Adding tests (2025-09-26) — bd9725c / https://github.com/pedjamusic/spatial-ring/commit/bd9725cfcbb2e773f17b9831ba96c351fc73e75f
- Renamed Locations>Warehouses. CRUD page table sort, hide, reorder (2025-09-25) — 2b846c8 / https://github.com/pedjamusic/spatial-ring/commit/2b846c87a4e765426ef3587033d8e2dcea39071c
- CRUD updates, Item List WIP (ModelTable.jsx) (2025-09-25) — 1151179 / https://github.com/pedjamusic/spatial-ring/commit/11511799e90c3f03f639afc3745f1330e11cb834
- Re-done API responses and login/logout (2025-09-24) — 773011e / https://github.com/pedjamusic/spatial-ring/commit/773011eaadc71481b80dce0110641787ea7b12fd
- Recovering from token refresh. Type Error plaguing (2025-09-24) — 59d40eb / https://github.com/pedjamusic/spatial-ring/commit/59d40eb3e18e9d24dab09d37be7a204ddec5c18d
- Reverting from fiasco (2025-09-24) — 2081b54 / https://github.com/pedjamusic/spatial-ring/commit/2081b540edc5b2aee45ab36e743c0a205d3f7405
- Saving before revert, due to fiasco with token refresh (2025-09-24) — eae6576 / https://github.com/pedjamusic/spatial-ring/commit/eae6576dc8d53246c92138cd6fedf6f0bbf98d99
- EventLocation model update and its CRUD (2025-09-22) — 488b5e1 / https://github.com/pedjamusic/spatial-ring/commit/488b5e173f2e41d5d264550bce766c01de9f49bc
- Generic Field Name Mapping and moved logging to useEffect (2025-09-19) — 4440258 / https://github.com/pedjamusic/spatial-ring/commit/444025865204576b205a483dd545834ead5d62e3
- Ruby on Rails scaffold equivalent (2025-09-18) — 3e0b38b / https://github.com/pedjamusic/spatial-ring/commit/3e0b38b226b9eedd0d1484b3f5905b9c33e73261
- ring & Prisma singleton lib (2025-09-16) — 584e8ce / https://github.com/pedjamusic/spatial-ring/commit/584e8cee3c706a9b96becaad55c34f0ec59a4faf
- Authentication, route refacto (2025-09-14) — 0fd655e / https://github.com/pedjamusic/spatial-ring/commit/0fd655e6c877deb50fe3a51cc48c7b72c6593739
- Initial push :) (2025-09-12) — 15c0ace / https://github.com/pedjamusic/spatial-ring/commit/15c0ace867fb5f1f5355ab3e0a661fb0d7928950
- Initial push (2025-09-12) — bca77e2 / https://github.com/pedjamusic/spatial-ring/commit/bca77e21fa8d1bf2e64341e579a075510b666dd7
