import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import ModelForm from "../components/ModelForm";
import { PageHeader } from "../components/layout/PageHeader";
import { H1 } from "../components/typography/H1";
import LoadingSpinner from "../components/LoadingSpinner";
import { resource } from "../lib/api";
import { config } from "../config";
import { toast } from "../lib/toast";

export default function GenericFormPage({
  modelName,
  resourceName,
  uiConfig = {},
  titles = {},
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isEventEdit = resourceName === "events" && isEdit;

  const singular = titles.singular || modelName;
  const plural = titles.plural || `${modelName}s`;

  const [meta, setMeta] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);

  const api = useMemo(() => resource(resourceName), [resourceName]);
  const defaultBackPath = isEventEdit
    ? `/admin/${resourceName}/${id}`
    : `/admin/${resourceName}`;
  const requestedBackPath = location.state?.returnTo;
  const requestedBackLabel = location.state?.returnLabel;
  const backPath = isEventEdit
    ? defaultBackPath
    : typeof requestedBackPath === "string" && requestedBackPath.startsWith("/admin")
      ? requestedBackPath
      : defaultBackPath;
  const backLabel =
    isEventEdit
      ? `${singular} Details`
      : typeof requestedBackLabel === "string" && requestedBackLabel.trim()
        ? requestedBackLabel
        : backPath === "/admin"
          ? "Dashboard"
          : plural;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setLoading(true);
      try {
        // Load metadata
        const metaResponse = await fetch(`/api/meta/models/${modelName}`, { signal });
        if (!metaResponse.ok) throw new Error(`Meta fetch failed: ${metaResponse.status}`);
        const metaData = await metaResponse.json();
        setMeta(metaData);

        // Load existing record for edit mode
        if (isEdit) {
          const record = await api.get(id, { signal });
          setInitialData(record);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        toast.error(err.message);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [modelName, id, isEdit, api]);

  const handleSave = async (formData, extras = {}) => {
    try {
      if (isEdit) {
        await api.update(id, formData);
        toast.success(`${singular} updated successfully!`);
      } else {
        const created = await api.create(formData);

        // Upload pending photo if any (same pattern as GenericCrud)
        if (extras.pendingPhotoFile && created?.id) {
          const token = localStorage.getItem("token");
          const fd = new FormData();
          fd.append("photo", extras.pendingPhotoFile);
          const photoBaseUrl = config.apiUrl ? `${config.apiUrl}/api` : "/api";
          const r = await fetch(`${photoBaseUrl}/${resourceName}/${created.id}/photo`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          });
          if (!r.ok) {
            throw new Error((await r.json().catch(() => ({}))).error || "Upload failed");
          }
        }

        toast.success(`${singular} created successfully!`);
      }
      navigate(isEdit ? backPath : `/admin/${resourceName}`);
    } catch (err) {
      const errorMessage = err.message || "Operation failed";
      toast.error(`Failed to save ${singular}: ${errorMessage}`);
      throw err; // Re-throw so ModelForm can handle loading state
    }
  };

  const handleCancel = () => {
    navigate(backPath);
  };

  if (loading) return <LoadingSpinner />;
  if (!meta) return <div>Model not found</div>;

  return (
    <div className="grid gap-y-4">
      <PageHeader />
      <H1>{isEdit ? `Edit ${singular}` : `Create ${singular}`}</H1>

      <div className="flex items-center gap-3">
        <Link
          to={backPath}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          {backLabel}
        </Link>
      </div>

      <ModelForm
        key={`${resourceName}:${id ?? "create"}`}
        meta={meta}
        initialData={isEdit ? initialData : {}}
        onSubmit={handleSave}
        onCancel={handleCancel}
        uiConfig={uiConfig}
      />
    </div>
  );
}
