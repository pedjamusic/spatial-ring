import "dotenv/config";

export function getAllowedOrigins() {
  // Single or comma-separated list, e.g.:
  // CORS_ALLOWED_ORIGINS="http://localhost:5173,https://demo.toodear.rocks"
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  const fromEnv = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  // Sensible defaults for OSS:
  const defaults = [
    "http://localhost:5173", // Vite dev
    "http://localhost:4173", // Vite preview
  ];

  // De‑duplicate
  return Array.from(new Set([...defaults, ...fromEnv]));
}
