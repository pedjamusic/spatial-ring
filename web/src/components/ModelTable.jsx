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

export default function ModelTable({
  meta,
  data,
  onEdit,
  onDelete,
  uiConfig = {},
}) {
  // Select visible columns (limit for readability)
  // .filter((field) => !uiConfig[field.name]?.hidden)
  // .filter((field) => !["Json"].includes(field.type)) // Skip complex types in table
  // .filter((field) => field.kind !== "object") // Skip relations for now
  // .slice(0, 6) // Limit columns

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

  return (
    <div className="flex flex-col bg-white px-6 py-4 rounded-lg border border-gray-300 shadow">
      <div className="overflow-x-auto">
        <div className=" dark:border-neutral-700 min-w-full inline-block align-middle ">
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-neutral-700"> */}
          <div className="overflow-hidden">
            <Table
              aria-label=""
              selectionMode="multiple"
              className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700"
            >
              {/* <TableHeader className="bg-gray-50 dark:bg-neutral-700"> */}
              <TableHeader>
                {visibleFields.map((field) => (
                  <Column
                    scope="col"
                    key={field.name}
                    className=" py-4 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                  >
                    {getFieldLabel(field, uiConfig)}
                  </Column>
                ))}

                <Column className="py-4 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-400 flex-none">
                  Actions
                </Column>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {data.map((row) => (
                  <Row
                    key={row.id}
                    // className="odd:bg-white even:bg-gray-100 dark:odd:bg-neutral-900 dark:even:bg-neutral-800"
                  >
                    {visibleFields.map((field) => (
                      <Cell
                        key={field.name}
                        className="py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200"
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
                                  row
                                )
                            : row[field.name];
                          return formatFieldValue(raw, field); // existing helper for dates etc.
                        })()}
                      </Cell>
                    ))}
                    <Cell className="py-2 whitespace-nowrap text-end text-sm font-medium">
                      <div className="inline-flex rounded-md shadow-2xs">
                        {/* Action buttons */}
                        <Button
                          onClick={() => onEdit(row)}
                          type="button"
                          className="py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white  shadow-2xs hover:bg-gray-50  focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700  dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400 hover:cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete(row.id)}
                          type="button"
                          className="py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-white shadow-2xs hover:bg-gray-50 focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 text-red-600 hover:text-red-800 focus:text-red-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400 hover:cursor-pointer"
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
