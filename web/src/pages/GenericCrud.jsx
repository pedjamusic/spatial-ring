import { useEffect, useState, useMemo } from "react";
import ModelForm from "../components/ModelForm";
import ModelTable from "../components/ModelTable";
import { resource } from "../lib/api";

export default function GenericCrud({
  modelName,
  resourceName,
  uiConfig = {},
}) {
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Log when model metadata is first loaded
  useEffect(() => {
    if (meta) {
      console.log(`🏗️ CRUD page initialized for ${modelName}`);
      console.log(`📊 Model has ${meta.fields.length} total fields`);

      const relationCount = meta.fields.filter(
        (f) => f.kind === "object"
      ).length;
      if (relationCount > 0) {
        console.log(`🔗 Found ${relationCount} relation field(s)`);
      }
    }
  }, [meta, modelName]);

  const api = useMemo(() => resource(resourceName), [resourceName]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      console.log(`🔍 Loading metadata for model: "${modelName}"`);
      // Load metadata with debugging
      const metaUrl = `/api/meta/models/${modelName}`;
      console.log(`📡 Fetching: ${metaUrl}`);

      const metaResponse = await fetch(metaUrl);
      console.log(`📡 Meta response status: ${metaResponse.status}`);

      if (!metaResponse.ok) {
        const errorText = await metaResponse.text();
        console.error(`❌ Meta fetch failed:`, errorText);
        throw new Error(
          `Meta fetch failed: ${metaResponse.status} ${errorText}`
        );
      }

      const metaData = await metaResponse.json();
      console.log(`✅ Meta data received:`, metaData);

      setMeta(metaData);

      // Load actual data
      console.log(`📡 Loading data for model: "${modelName.toLowerCase()}"`);
      const dataResponse = await api.list();
      console.log(`✅ Data loaded:`, dataResponse);

      setData(dataResponse);
    } catch (err) {
      console.error("❌ LoadData error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modelName]);

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await api.update(editingItem.id, formData);
      } else {
        await api.create(formData);
      }

      setEditingItem(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.remove(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!meta) return <div>Model not found</div>;

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <h2 style={{ margin: 0 }}>
        {editingItem ? `Edit ${modelName}` : `Create ${modelName}`}
      </h2>

      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#ffe6e6",
            color: "#d00",
            border: "1px solid #fcc",
          }}
        >
          {error}
        </div>
      )}

      <ModelForm
        meta={meta}
        initialData={editingItem || {}}
        onSubmit={handleSave}
        uiConfig={uiConfig}
      />

      <div>
        <h3>All {modelName}s</h3>
        <ModelTable
          meta={meta}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          uiConfig={uiConfig}
        />
      </div>
    </div>
  );
}
