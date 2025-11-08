import { useState } from "react";
import { FileTrigger, Button } from "react-aria-components";
import { X } from "lucide-react";

// Use environment variable with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Image upload constraints
const fileSize = 2; // MB

export default function PhotoUpload({
  assetId,
  initialFilename,
  onUploaded, // ({ filename, asset? })
  onPendingFile, // (file) — for create flow (no id yet)
  onDeleted,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState(initialFilename || null);

  const validate = (file) => {
    if (!file.type.startsWith("image/"))
      return "Please choose an image (JPEG/PNG/WebP)";
    if (file.size > fileSize * 1024 * 1024) return `Max size is ${fileSize}MB`;
    return "";
  };

  const uploadNow = async (file) => {
    const token = localStorage.getItem("token");
    const body = new FormData();
    body.append("photo", file);

    const res = await fetch(`${API_BASE}/assets/${assetId}/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });

    if (!res.ok) {
      throw new Error(
        (await res.json().catch(() => ({}))).error || "Upload failed",
      );
    }
    return res.json();
  };

  const onSelect = async (fl) => {
    const file = Array.from(fl || [])[0];
    if (!file) return;

    const err = validate(file);
    if (err) return setError(err);

    setError("");
    if (!assetId) {
      onPendingFile?.(file);
      return;
    }

    setUploading(true);
    try {
      const data = await uploadNow(file);
      setFilename(data.filename);
      onUploaded?.(data);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!assetId || !filename) return;
    if (!confirm("Delete photo?")) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/assets/${assetId}/photo`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Delete failed");

      setFilename(null);
      onDeleted?.();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* preview */}
      {filename && (
        <div className="relative inline-block">
          <img
            src={`/uploads/assets/${filename}`}
            alt="Asset"
            className="h-24 w-24 rounded-md border border-gray-300 object-cover shadow-sm dark:border-neutral-700"
            loading="lazy"
          />
          <Button
            onPress={remove}
            isDisabled={uploading}
            className="focus:outline-hidden absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:cursor-pointer hover:bg-red-700"
            aria-label="Delete photo"
          >
            <X strokeWidth={1} size={16} />
          </Button>
        </div>
      )}

      {/* trigger */}
      <div className="flex items-center gap-2">
        <FileTrigger
          acceptedFileTypes={[
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ]}
          onSelect={onSelect}
        >
          <Button
            isDisabled={uploading}
            className="not-dark:shadow-lg inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-white px-3 py-1.5 text-base font-medium text-gray-500 outline-dashed outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:outline-gray-400 focus:z-10 focus:border-transparent focus:bg-gray-50 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 disabled:pointer-events-none disabled:opacity-50 sm:text-sm/6 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-400 dark:outline-neutral-700/50 dark:placeholder:text-gray-500 dark:hover:bg-neutral-800 dark:hover:text-gray-400 dark:focus:bg-neutral-800 dark:focus:hover:outline-blue-500"
          >
            {uploading
              ? "Uploading…"
              : filename
                ? "Change photo"
                : "Upload photo"}
          </Button>
        </FileTrigger>
        <span className="text-xs text-gray-500 dark:text-neutral-400">
          JPEG/PNG/WebP, up to 2MB
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
