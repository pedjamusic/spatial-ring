// 1. Try to read from window.env (Production/Docker runtime)
// 2. Fallback to import.meta.env (Local Dev build-time)
const env = window.env || import.meta.env;

export const config = {
  // Production: "https://api.your-domain.com" (No trailing slash)
  // Local Dev: "" (Empty string)
  apiUrl: env.VITE_API_BASE_URL || "",
};
