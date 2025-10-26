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

export default function ModelTable({
  meta,
  data,
  onEdit,
  onDelete,
  uiConfig = {},
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
  const hasPhoto = Boolean(photoField);
  // const hasPhoto =
  //   uiConfig.photoField &&
  //   meta.fields.some((f) => f.name === uiConfig.photoField);

  return (
    <div className="flex flex-col rounded-lg border border-gray-300 bg-white px-6 py-4 not-dark:shadow dark:border-neutral-700/50 dark:bg-neutral-800/50">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle dark:border-neutral-700">
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-neutral-700"> */}
          <div className="overflow-hidden">
            <Table
              aria-label=""
              selectionMode="multiple"
              className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700"
            >
              {/* <TableHeader className="bg-gray-50 dark:bg-neutral-700"> */}
              <TableHeader>
                {/* Photo column - no header text */}
                {hasPhoto && <Column className="w-16 py-4" />}

                {visibleFields.map((field) => (
                  <Column
                    scope="col"
                    key={field.name}
                    className="py-4 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                  >
                    {getFieldLabel(field, uiConfig)}
                  </Column>
                ))}

                <Column className="flex-none py-4 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-400">
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
                        className="py-2 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-neutral-200"
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
                          return formatFieldValue(raw, field); // existing helper for dates etc.
                        })()}
                      </Cell>
                    ))}
                    <Cell className="py-2 text-end text-sm font-medium whitespace-nowrap">
                      <div className="inline-flex rounded-md shadow-2xs">
                        {/* Action buttons */}
                        <Button
                          onClick={() => onEdit(row)}
                          type="button"
                          className="-ms-px inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 shadow-2xs first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer hover:bg-gray-50 hover:text-blue-800 focus:z-10 focus:bg-gray-50 focus:text-blue-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-blue-500 dark:hover:bg-neutral-800 dark:hover:text-blue-400 dark:focus:bg-neutral-800 dark:focus:text-blue-400"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete(row.id)}
                          type="button"
                          className="-ms-px inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-2xs first:ms-0 first:rounded-s-lg last:rounded-e-lg hover:cursor-pointer hover:bg-gray-50 hover:text-red-800 focus:z-10 focus:bg-gray-50 focus:text-red-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-red-500 dark:hover:bg-neutral-800 dark:hover:text-red-400 dark:focus:bg-neutral-800 dark:focus:text-red-400"
                        >
                          Delete
                        </Button>
                      </div>
                    </Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
