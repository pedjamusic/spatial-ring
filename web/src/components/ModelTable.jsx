import { getFieldLabel, formatFieldValue } from "../lib/fieldMapping.js";

export default function ModelTable({
  meta,
  data,
  onEdit,
  onDelete,
  uiConfig = {},
}) {
  // Select visible columns (limit for readability)
  const visibleFields = meta.fields
    .filter((field) => !uiConfig[field.name]?.hidden)
    .filter((field) => !["Json"].includes(field.type)) // Skip complex types in table
    .filter((field) => field.kind !== "object") // Skip relations for now
    .slice(0, 6); // Limit columns

  if (!data?.length) {
    return <div>No records found.</div>;
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
                {formatFieldValue(row[field.name], field)}
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
