import { useEffect, useState, useMemo } from "react";
import ModelForm from "../components/ModelForm";
import ModelTable from "../components/ModelTable";
import { resource } from "../lib/api";
import { config } from "../config";
import { toast } from "../lib/toast"; // Import toast
import ColumnSettings from "../components/ColumnSettings";
import { PageHeader } from "../components/layout/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

// Below commented out section rendered AssetAvatars across model CRUD pages' "all items" tables
// const STORAGE_KEY_PREFIX = "uiConfig_";
// const deepMerge = (a = {}, b = {}) =>
//   Object.fromEntries(
//     Object.keys({ ...a, ...b }).map((k) => [
//       k,
//       { ...(a[k] || {}), ...(b[k] || {}) },
//     ]),
//   );
const STORAGE_KEY_PREFIX = "uiConfig_";
const deepMerge = (a = {}, b = {}) =>
  Object.fromEntries(
    Object.keys({ ...a, ...b }).map((k) => {
      const aVal = a[k];
      const bVal = b[k];
      // Only merge if both values are plain objects, otherwise preserve the value
      if (
        aVal &&
        bVal &&
        typeof aVal === "object" &&
        typeof bVal === "object" &&
        !Array.isArray(aVal) &&
        !Array.isArray(bVal)
      ) {
        return [k, { ...aVal, ...bVal }];
      }
      // For primitive values (strings, numbers, booleans), use b if present, otherwise a
      return [k, bVal !== undefined ? bVal : aVal];
    }),
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
        localStorage.getItem(storageKey) || "{}",
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
          `Meta fetch failed: ${metaResponse.status} ${errorText}`,
        );
      }

      const metaData = await metaResponse.json();
      console.log(`✅ Meta data received:`, metaData);

      setMeta(metaData);

      // Load actual data
      console.log(`📡 Loading data for model: "${modelName.toLowerCase()}"`);
      const dataResponse = await api.list();
      console.log(`✅ Data loaded:`, dataResponse);

      setData(Array.isArray(dataResponse) ? dataResponse : dataResponse.data || []);
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

  // const handleSave = async (formData) => {
  const handleSave = async (formData, extras = {}) => {
    try {
      if (editingItem) {
        await api.update(editingItem.id, formData);
        toast.success(`${singular} updated successfully!`);
      } else {
        // await api.create(formData);

        // Create first… (when above await api.create(formData) is NOT commented out)
        // Create once (when above await api.create(formData) has been commented out)
        const created = await api.create(formData);
        // …then upload pending photo, if any
        if (extras.pendingPhotoFile && created?.id) {
          const token = localStorage.getItem("token");
          const fd = new FormData();
          fd.append("photo", extras.pendingPhotoFile);
          const photoBaseUrl = config.apiUrl ? `${config.apiUrl}/api` : "/api";
          await fetch(
            `${photoBaseUrl}/${resourceName}/${created.id}/photo`,
            {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            },
          ).then(async (r) => {
            if (!r.ok)
              throw new Error(
                (await r.json().catch(() => ({}))).error || "Upload failed",
              );
          });
        }

        toast.success(`${singular} created successfully!`);
      }
      setEditingItem(null);
      await loadData();
    } catch (err) {
      const errorMessage = err.message || "Operation failed";
      setError(errorMessage);
      toast.error(`Failed to save ${singular}: ${errorMessage}`);
      throw err; // Re-throw so ModelForm can handle it
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (id) => {
    if (!confirm("‼️ Are you sure you want to delete this item?")) return;

    try {
      await api.remove(id);
      toast.info(`${singular} deleted successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to delete ${singular}: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!meta) return <div>Model not found</div>;

  return (
    <div className="grid gap-y-4">
      <PageHeader title={plural} />

      <div className="flex items-center justify-between">
        <h2 className="text font-bold uppercase">
          {editingItem ? `Edit ${singular}` : `Create ${singular}`}
        </h2>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-200 p-4 text-red-600">
          {error}
        </div>
      )}

      <ModelForm
        key={`${resourceName}:${editingItem?.id ?? "create"}`} // remount per identity
        meta={meta}
        initialData={editingItem || {}}
        onSubmit={handleSave}
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
      <div className="w-full min-w-0">
        <ModelTable
          meta={meta}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          uiConfig={uiConfig}
          modelName={modelName}
        />
      </div>
    </div>
  );
}
