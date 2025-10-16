import { useEffect, useState, useMemo } from "react";
import ModelForm from "../components/ModelForm";
import ModelTable from "../components/ModelTable";
import { resource } from "../lib/api";
// import { useUiConfigWithPreferences } from "../hooks/useUiConfigWithPreferences";

import ColumnSettings from "../components/ColumnSettings";
const STORAGE_KEY_PREFIX = "uiConfig_";
const deepMerge = (a = {}, b = {}) =>
  Object.fromEntries(
    Object.keys({ ...a, ...b }).map((k) => [
      k,
      { ...(a[k] || {}), ...(b[k] || {}) },
    ])
  );

export default function GenericCrud({
  modelName,
  resourceName,
  uiConfig: defaultUiConfig = {},
  titles = {},
}) {
  const singular = titles.singular || modelName; // safe fallback
  const plural = titles.plural || `${modelName}s`;

  const [meta, setMeta] = useState(null);
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: uiConfig managed as state + localStorage
  const storageKey = `${STORAGE_KEY_PREFIX}${modelName}`;
  const [uiConfig, setUiConfig] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return deepMerge(defaultUiConfig, stored);
    } catch {
      return defaultUiConfig;
    }
  });

  // Use preferences hook with default config
  // const { config, updatePreferences, resetPreferences } =
  //   useUiConfigWithPreferences(modelName, defaultUiConfig);

  // Listen for preference changes to trigger re-render
  // useEffect(() => {
  //   const handler = (e) => {
  //     if (e.detail.modelName === modelName) {
  //       // Force re-render by updating a dummy state
  //       setData((prev) => [...prev]);
  //     }
  //   };
  //   window.addEventListener("uiConfigChanged", handler);
  //   return () => window.removeEventListener("uiConfigChanged", handler);
  // }, [modelName]);

  // Re-merge when model or defaults change
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setUiConfig(deepMerge(defaultUiConfig, stored));
    } catch {
      setUiConfig(defaultUiConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, JSON.stringify(defaultUiConfig)]);

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

  // Handlers for Column Settings
  const handleToggleColumnPref = (fieldName, updates) => {
    setUiConfig((prev) => {
      const next = {
        ...prev,
        [fieldName]: { ...(prev[fieldName] || {}), ...updates },
      };

      // Save to localStorage
      const currentStored = JSON.parse(
        localStorage.getItem(storageKey) || "{}"
      );
      const nextStored = {
        ...currentStored,
        [fieldName]: { ...(currentStored[fieldName] || {}), ...updates },
      };
      localStorage.setItem(storageKey, JSON.stringify(nextStored));

      return next;
    });
  };

  const handleResetPrefs = () => {
    localStorage.removeItem(storageKey);
    setUiConfig(defaultUiConfig);
  };

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
  }, [modelName]); // eslint-disable-line

  // if (loading) return <div>Loading...</div>;
  // if (!meta) return <div>Model not found</div>;

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
    <div className="grid gap-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text font-bold uppercase">
          {editingItem ? `Edit ${singular}` : `Create ${singular}`}
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-200 text-red-600 border border-red-300">
          {error}
        </div>
      )}

      <ModelForm
        key={`${resourceName}:${editingItem?.id ?? "create"}`} // remount per identity
        meta={meta}
        initialData={editingItem || {}}
        onSubmit={async (formData) => {
          try {
            if (editingItem) await api.update(editingItem.id, formData);
            else await api.create(formData);
            setEditingItem(null);
            await loadData();
          } catch (err) {
            setError(err.message);
          }
        }}
        onCancel={() => {
          // leave Edit without clearing the form in-place
          setEditingItem(null);
        }}
        uiConfig={uiConfig}
      />

      <div className="flex items-center justify-between">
        <h3 className="text font-bold uppercase">All {plural}</h3>
        <ColumnSettings
          meta={meta}
          config={uiConfig}
          onToggle={handleToggleColumnPref}
          onReset={handleResetPrefs}
        />
      </div>
      <div>
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
