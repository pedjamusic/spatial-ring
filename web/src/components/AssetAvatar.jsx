import { Image as ImageIcon } from "lucide-react";

// Use relative URLs that work with Vite proxy
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function AssetAvatar({
  filename,
  alt,
  shape = "rounded", // "circle" or "rounded"
  size = 48,
}) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-md";
  const dim = `h-${(size / 4) * 1} w-${(size / 4) * 1}`; // tailwind requires known tokens; default 12 = 48px
  if (!filename) {
    return (
      <div
        className={`flex ${dim} items-center justify-center ${radius} border border-gray-300 bg-gray-100 not-dark:shadow-lg dark:bg-neutral-700`}
      >
        <ImageIcon className="h-6 w-6 text-gray-400/75 dark:text-neutral-500" />
      </div>
    );
  }

  // CRITICAL: Use relative URL, not absolute
  // Vite proxy will forward /uploads/* to localhost:port
  const imageUrl = `/uploads/assets/${filename}`;

  return (
    <img
      src={imageUrl}
      alt={alt || "Asset"}
      className={`h-12 w-12 ${radius} border border-gray-300 object-cover outline -outline-offset-1 outline-gray-300 not-dark:shadow-lg dark:border-neutral-700`}
      loading="lazy"
      onError={(e) => {
        // Fallback if image fails to load
        e.target.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className = `flex h-12 w-12 items-center justify-center ${radius} bg-gray-300 dark:bg-neutral-700`;
        fallback.innerHTML =
          '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
        e.target.parentNode.appendChild(fallback);
      }}
    />
  );
}
