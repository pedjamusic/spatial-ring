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
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          {visibleFields.map((field) => (
            <th
              key={field.name}
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "2px solid #ddd",
                fontWeight: "bold",
              }}
            >
              {getFieldLabel(field, uiConfig)}
            </th>
          ))}
          <th
            style={{
              padding: "12px",
              textAlign: "left",
              borderBottom: "2px solid #ddd",
              fontWeight: "bold",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
            {visibleFields.map((field) => (
              <td key={field.name} style={{ padding: "12px" }}>
                {/* {formatFieldValue(row[field.name], field)} */}
                {(() => {
                  const cfg = uiConfig[field.name] || {};
                  const path = cfg.path; // e.g. "location.name"
                  const raw = path
                    ? path
                        .split(".")
                        .reduce((acc, key) => (acc ? acc[key] : undefined), row)
                    : row[field.name];
                  return formatFieldValue(raw, field); // existing helper for dates etc.
                })()}
              </td>
            ))}
            <td style={{ padding: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => onEdit(row)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(row.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
