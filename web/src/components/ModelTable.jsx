import { useState, useRef, useEffect } from "react";
import {
  Button,
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { getFieldLabel, formatFieldValue } from "../lib/fieldMapping.js";
import AssetAvatar from "./AssetAvatar";

function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-block sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
        aria-label="Actions"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-32 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 shadow-xl backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(); }}
            className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-300/50 dark:text-blue-400 dark:hover:bg-neutral-600/25"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-300/50 dark:text-red-400 dark:hover:bg-neutral-600/25"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModelTable({
  meta,
  data,
  onEdit,
  onDelete,
  uiConfig = {},
  modelName = "",
}) {
  // If the page provides uiConfig.columnOrder = ['field1','field2',…]
  // sort meta.fields accordingly and fall back to schema order.
  const order = uiConfig.columnOrder || [];

  const visibleFields = meta.fields
    .filter((f) => !uiConfig[f.name]?.hidden) // hide everywhere
    .filter((f) => !uiConfig[f.name]?.hideInTable) // hide **only** in table
    .filter((f) => !["Json"].includes(f.type))
    .filter((f) => f.kind !== "object" || Boolean(uiConfig[f.name]?.path)) // allow relations with path, otherwise hide
    .sort((a, b) => {
      const ia = order.indexOf(a.name);
      const ib = order.indexOf(b.name);
      if (ia === -1 && ib === -1) return 0; // neither specified
      if (ia === -1) return 1; // a not listed → after b
      if (ib === -1) return -1; // b not listed → after a
      return ia - ib; // both listed → compare pos
    })
    .slice(0, uiConfig.maxColumns || meta.fields.length); // Limit columns
  // .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name) || 0);

  if (!data?.length) {
    return <div>👀 No records found.</div>;
  }

  // Check if this model has a photo field configured to show
  const photoField = uiConfig.photoField || "photoUrl";
  // const hasPhoto = Boolean(photoField);
  // const hasPhoto =
  //   uiConfig.photoField &&
  //   meta.fields.some((f) => f.name === uiConfig.photoField);
  const hasPhoto = modelName === "Asset"; // this makes AssetAvatar appear only on Asset(s) page all assets table

  return (
    <div className="flex flex-col overflow-x-auto px-6 py-4">
      {/* <div className="inline-block min-w-full align-middle dark:border-neutral-700"> */}
      {/* <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-neutral-700"> */}
      {/* <div className="overflow-x-auto"> */}
      <Table
        aria-label=""
        selectionMode="multiple"
        className="w-full divide-y divide-gray-200 dark:divide-neutral-700"
      >
        <TableHeader>
          {/* Photo column - no header text */}
          {hasPhoto && <Column className="w-16 py-4" />}
          {visibleFields.map((field) => (
            <Column
              scope="col"
              key={field.name}
              className="py-4 text-start text-xs font-medium uppercase text-gray-500 dark:text-neutral-400"
            >
              {getFieldLabel(field, uiConfig)}
            </Column>
          ))}

          <Column className="flex-none py-4 text-end text-xs font-medium uppercase text-gray-500 dark:text-neutral-400">
            Actions
          </Column>
        </TableHeader>

        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {data.map((row) => (
            <Row key={row.id}>
              {/* Photo cell */}
              {hasPhoto && (
                <Cell className="py-2 pr-3">
                  <AssetAvatar
                    // filename={row[uiConfig.photoField]}
                    filename={row[photoField]}
                    // size={32}
                    alt={row.name}
                  />
                </Cell>
              )}
              {visibleFields.map((field) => (
                <Cell
                  key={field.name}
                  className="whitespace-nowrap py-2 text-sm font-medium text-gray-800 dark:text-neutral-200"
                >
                  {/* {formatFieldValue(row[field.name], field)} */}
                  {(() => {
                    const cfg = uiConfig[field.name] || {};
                    const path = cfg.path; // e.g. "location.name"
                    const raw = path
                      ? path
                          .split(".")
                          .reduce(
                            (acc, key) => (acc ? acc[key] : undefined),
                            row,
                          )
                      : row[field.name];

                    // Date-only + optional duration display
                    if (field.type === "DateTime" && cfg.dateOnly && raw) {
                      const dateStr = new Date(raw).toLocaleDateString();
                      if (cfg.showDuration) {
                        const fromVal = row[cfg.showDuration.fromField];
                        if (fromVal) {
                          const ms = new Date(raw) - new Date(fromVal);
                          const days = Math.round(ms / (1000 * 60 * 60 * 24));
                          if (days > 0) {
                            return (
                              <>
                                {dateStr}{" "}
                                <span className="text-xs text-gray-400 dark:text-neutral-500">
                                  ({days} {days === 1 ? "day" : "days"})
                                </span>
                              </>
                            );
                          }
                        }
                      }
                      return dateStr;
                    }

                    return formatFieldValue(raw, field); // existing helper for dates etc.
                  })()}
                </Cell>
              ))}
              <Cell className="whitespace-nowrap py-2 text-end text-sm font-medium">
                {/* Desktop: inline buttons */}
                <div className="hidden shadow-2xs sm:inline-flex sm:rounded-md">
                  <Button
                    onClick={() => onEdit(row)}
                    type="button"
                    className="shadow-2xs focus:outline-hidden -ms-px inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer hover:bg-gray-50 hover:text-blue-800 focus:z-10 focus:bg-gray-50 focus:text-blue-800 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-blue-500 dark:hover:bg-neutral-800 dark:hover:text-blue-400 dark:focus:bg-neutral-800 dark:focus:text-blue-400"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(row.id)}
                    type="button"
                    className="shadow-2xs focus:outline-hidden -ms-px inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-red-600 first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer hover:bg-gray-50 hover:text-red-800 focus:z-10 focus:bg-gray-50 focus:text-red-800 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-red-500 dark:hover:bg-neutral-800 dark:hover:text-red-400 dark:focus:bg-neutral-800 dark:focus:text-red-400"
                  >
                    Delete
                  </Button>
                </div>
                {/* Mobile: kebab menu */}
                <ActionMenu
                  onEdit={() => onEdit(row)}
                  onDelete={() => onDelete(row.id)}
                />
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
