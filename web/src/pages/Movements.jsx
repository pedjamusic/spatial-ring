import { useEffect, useState } from "react";
import { resource } from "../lib/api";

const api = resource("movements");

export default function Movements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", kind: "" });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.update(editing.id, form);
      } else {
        await api.create(form);
      }
      setForm({ name: "", kind: "" });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name || "", kind: item.kind || "" });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this movement?")) return;
    try {
      await api.remove(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Movements</h2>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 420 }}
      >
        <label>
          <div>Name</div>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          <div>Kind</div>
          <input
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editing ? "Update" : "Create"}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", kind: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "crimson" }}>{error}</div>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                  padding: 8,
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                  padding: 8,
                }}
              >
                Kind
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                  padding: 8,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td style={{ padding: 8 }}>{it.name}</td>
                <td style={{ padding: 8 }}>{it.kind || "-"}</td>
                <td style={{ padding: 8, display: "flex", gap: 8 }}>
                  <button onClick={() => onEdit(it)}>Edit</button>
                  <button onClick={() => onDelete(it.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
