import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const rootEnvPath = path.resolve(process.cwd(), ".env");

// Load existing values if present
dotenv.config({ path: rootEnvPath });

function ensureEnv(key, value) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// ---- DB setup (simplified placeholder) ----
// PENDING
// (Call your existing db:setup logic here, or require its module.)

// ---- CORS + API base setup ----

// Example: infer a default public domain if user set APP_DOMAIN
// e.g. APP_DOMAIN=demo.toodear.rocks
const appDomain = process.env.APP_DOMAIN;

// Build CORS origin list
const origins = new Set();

// always add local dev
origins.add("http://localhost:5173");

// if APP_DOMAIN is provided, add https origin
if (appDomain) {
  origins.add(`https://${appDomain}`);
  origins.add(`https://api.${appDomain}`);
}

// Persist CORS_ALLOWED_ORIGINS and VITE_API_BASE_URL if not set
ensureEnv("CORS_ALLOWED_ORIGINS", Array.from(origins).join(","));
ensureEnv("VITE_API_BASE_URL", appDomain ? `https://api.${appDomain}` : "");

// Write back to .env (simple append; in a real helper you’d rewrite keys)
const lines = Object.entries(process.env)
  .filter(([key]) =>
    ["CORS_ALLOWED_ORIGINS", "VITE_API_BASE_URL", "APP_DOMAIN"].includes(key),
  )
  .map(([k, v]) => `${k}=${v}`);

fs.writeFileSync(rootEnvPath, lines.join("\n") + "\n");
console.log("Updated .env with CORS_ALLOWED_ORIGINS and VITE_API_BASE_URL");
