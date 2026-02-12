# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
