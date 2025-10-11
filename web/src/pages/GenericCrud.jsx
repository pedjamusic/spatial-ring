import { useEffect, useState, useMemo } from "react";
import ModelForm from "../components/ModelForm";
import ModelTable from "../components/ModelTable";
import ColumnSettings from "../components/ColumnSettings";
import { resource } from "../lib/api";
import { useUiConfigWithPreferences } from "../hooks/useUiConfigWithPreferences";

export default function GenericCrud({
  modelName,
  resourceName,
  uiConfig: defaultUiConfig = {},
}) {
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use preferences hook with default config
  const { config, updatePreferences, resetPreferences } =
    useUiConfigWithPreferences(modelName, defaultUiConfig);

  // Listen for preference changes to trigger re-render
  useEffect(() => {
    const handler = (e) => {
      if (e.detail.modelName === modelName) {
        // Force re-render by updating a dummy state
        setData((prev) => [...prev]);
      }
    };
    window.addEventListener("uiConfigChanged", handler);
    return () => window.removeEventListener("uiConfigChanged", handler);
  }, [modelName]);

  // Log when model metadata is first loaded
  // useEffect(() => {
  //   if (meta) {
  //     console.log(`🏗️ CRUD page initialized for ${modelName}`);
  //     console.log(`📊 Model has ${meta.fields.length} total fields`);

  //     const relationCount = meta.fields.filter(
  //       (f) => f.kind === "object"
  //     ).length;
  //     if (relationCount > 0) {
  //       console.log(`🔗 Found ${relationCount} relation field(s)`);
  //     }
  //   }
  // }, [meta, modelName]);

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
    <div className="grid gap-6 border border-red-800">
      <div className="flex items-center justify-between">
        <h2 className="border border-red-500 mb-2">
          {editingItem ? `Edit ${modelName}` : `Create ${modelName}`}
        </h2>
        <ColumnSettings
          meta={meta}
          config={config}
          onToggle={updatePreferences}
          onReset={resetPreferences}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-200 text-red-600 border border-red-300">
          {error}
        </div>
      )}

      <ModelForm
        meta={meta}
        initialData={editingItem || {}}
        onSubmit={handleSave}
        uiConfig={config}
      />

      <div>
        <h3 className="mb-4">All {modelName}s</h3>
        <ModelTable
          meta={meta}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          uiConfig={config}
        />
      </div>
    </div>
  );
}
