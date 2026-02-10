# UI Configuration Guide

This app auto-generates CRUD pages (forms + tables) from the Prisma schema, similar to Ruby on Rails scaffolding. `ui-configs.json` controls how fields appear without writing any component code.

## How It Works

```
Prisma schema  ──>  /api/meta/models/:ModelName  ──>  GenericCrud
                                                        ├── ModelForm (create/edit form)
                                                        ├── ModelTable (data table)
                                                        └── ColumnSettings (column picker)

ui-configs.json ──>  App.jsx loads at startup  ──>  passed to GenericCrud as uiConfig prop
                                                        └── merged with localStorage user prefs
```

1. The API exposes Prisma field metadata at `/api/meta/models/:ModelName`
2. `GenericCrud` fetches that metadata and renders forms/tables automatically
3. `ui-configs.json` overrides default behavior per model and per field
4. User column preferences (via the gear icon) are saved in localStorage and merged on top

## File Locations

| File | Purpose |
|------|---------|
| `web/public/meta/ui-configs.json` | Field display configuration per model |
| `web/public/meta/resources.json` | Sidebar navigation and model registration |
| `web/src/pages/GenericCrud.jsx` | CRUD container — loads metadata, handles save/delete |
| `web/src/components/ModelForm.jsx` | Auto-generated form from field metadata |
| `web/src/components/ModelTable.jsx` | Auto-generated table from field metadata |
| `web/src/components/ColumnSettings.jsx` | Column visibility dropdown (gear icon) |
| `web/src/lib/fieldMapping.js` | Label generation, type mapping, visibility helpers |

## ui-configs.json Structure

```json
{
  "ModelName": {
    "fieldName": { /* field options */ },
    "columnOrder": ["field1", "field2"],
    "maxColumns": 6,
    "photoField": "photoUrl"
  }
}
```

## Field Options

### `hidden` — Hide from both form and table

```json
"id": { "hidden": true },
"createdAt": { "hidden": true }
```

Note: `id`, `createdAt`, `updatedAt`, and reverse relations are hidden automatically — you only need this for additional fields you want to suppress.

### `label` — Override display name

Without this, field names are converted from camelCase to Title Case automatically (`photoUrl` → "Photo Url").

```json
"photoUrl": { "label": "Photo" },
"category": { "label": "Category" }
```

### `widget` — Custom form input type

| Value | Renders | Used for |
|-------|---------|----------|
| `"textarea"` | Multi-line `<textarea>` | Notes, descriptions |
| `"photo"` | Photo upload with preview | Image fields |
| `"dateRangePicker"` | Flatpickr range picker (two calendars, Cancel/Apply) | Date range pairs |

```json
"notes": { "widget": "textarea" },
"photoUrl": { "widget": "photo", "label": "Photo" }
```

#### Date Range Picker

The `dateRangePicker` widget manages two fields (start + end) from a single picker. Configure it with `rangeEnd` on the start field and `pairedWith` on the end field:

```json
"startsAt": {
  "widget": "dateRangePicker",
  "rangeEnd": "endsAt"
},
"endsAt": {
  "pairedWith": "startsAt"
}
```

- `rangeEnd` — names the end-date field that the picker also controls
- `pairedWith` — hides this field from the form (the range picker handles it)
- The picker theme uses Tailwind v4 CSS variables and supports dark mode

Without `widget`, the input type is inferred from the Prisma field type:
- `String` → text input
- `Int`/`Float`/`Decimal` → number input
- `Boolean` → checkbox
- `DateTime` → datetime-local input
- `enum` → select dropdown
- `object` (relation) → select dropdown populated from API

### `hideInTable` — Show in form, hide from table

Useful for long text fields or photo URLs that don't need a table column.

```json
"notes": { "widget": "textarea", "hideInTable": true },
"photoUrl": { "widget": "photo", "hideInTable": true }
```

### `path` — Display nested relation data in table

Relations are objects. Without `path`, relation fields are hidden from the table. With `path`, the table resolves the nested value using dot notation.

```json
"category": { "label": "Category", "path": "category.name" },
"fromWarehouse": { "label": "From", "path": "fromWarehouse.name" }
```

This makes the table show `row.category.name` instead of the raw category object.

### `required` — Override required validation

By default, required state comes from the Prisma schema (`isRequired && !hasDefaultValue`). This lets you override it.

```json
"optionalField": { "required": false }
```

## Model-Level Options

### `columnOrder` — Table column order

Fields listed appear first, in the given order. Unlisted fields appear after.

```json
"columnOrder": ["name", "category", "status", "warehouse"]
```

### `maxColumns` — Limit visible table columns

```json
"maxColumns": 5
```

### `photoField` — Field containing photo filename

Used by the table to show an avatar/thumbnail column. Defaults to `"photoUrl"`. Currently only works for the Asset model.

```json
"photoField": "photoUrl"
```

## Complete Example

```json
{
  "Asset": {
    "id": { "hidden": true },
    "createdAt": { "hidden": true },
    "photoUrl": {
      "widget": "photo",
      "label": "Photo",
      "hideInTable": true
    },
    "category": {
      "label": "Category",
      "path": "category.name"
    },
    "warehouse": {
      "label": "Warehouse",
      "path": "warehouse.name"
    },
    "notes": {
      "widget": "textarea",
      "hideInTable": true
    },
    "columnOrder": ["name", "category", "warehouse", "status"]
  }
}
```

## Adding a New Model

1. Define the model in `api/prisma/schema.prisma`
2. Run `npm run db:migrate` and `npm run scaffold`
3. Add a route entry to `web/public/meta/resources.json`:
   ```json
   {
     "title": "Things",
     "singular": "Thing",
     "modelName": "Thing",
     "resourceName": "things",
     "path": "things",
     "order": 50,
     "enabled": true,
     "icon": "Box"
   }
   ```
4. Add field config to `web/public/meta/ui-configs.json`:
   ```json
   "Thing": {
     "id": { "hidden": true },
     "createdAt": { "hidden": true }
   }
   ```
5. The CRUD page appears automatically — no component code needed.

## Relation Dropdowns in Forms

When a field is a Prisma relation (e.g., `category` → `AssetCategory`), ModelForm automatically renders a `<select>` dropdown and loads options from the API. The endpoint mapping is in `ModelForm.jsx`:

```js
const endpointMap = {
  Warehouse: "warehouses",
  AssetCategory: "assetCategories",
  User: "users",
  Event: "events",
  EventLocation: "eventLocations",
};
```

If you add a new relation, add its endpoint here too.

## User Column Preferences

Users can toggle column visibility via the gear icon (ColumnSettings). These preferences are saved in localStorage under `uiConfig_${ModelName}` and merged on top of the JSON config. The "Reset" button clears localStorage and reverts to defaults.
