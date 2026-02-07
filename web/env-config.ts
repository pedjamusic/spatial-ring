// src/config.ts

// 1. Try to read from window.env (Production/Docker)
// 2. Fallback to import.meta.env (Local Dev)
const env = (window as any).env || import.meta.env;

export const config = {
  // Use a default for safety, but expect VITE_API_URL to be provided
  apiUrl: env.VITE_API_URL || "http://localhost:3000",
};
