import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// --- Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_ROOT = path.join(__dirname, "..");
const WEB_ROOT = path.join(__dirname, "../../web");

const API_ENV_PATH = path.join(API_ROOT, ".env");
const WEB_ENV_PROD_PATH = path.join(WEB_ROOT, ".env.production");

// --- Defaults ---
const DEFAULT_CORS = [
  "http://localhost:5173",
  "http://localhost:4173", // Vite preview
  "http://127.0.0.1:5173",
  "http://172.17.0.1:5173", // Common Docker gateway
  "http://10.0.1.1:5173", // Another common Docker gateway (it was for me on Ubuntu Server > Coolify v4)
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Helper to safely update a specific key in a .env file
 * without destroying other lines (like secrets).
 */
function setEnvValue(filePath, key, value) {
  let content = "";
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");
  } else {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const lines = content.split("\n");
  let found = false;

  const newLines = lines.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    if (newLines.length > 0 && newLines[newLines.length - 1] !== "") {
      newLines.push("");
    }
    newLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(filePath, newLines.join("\n"));
  console.log(`✅ Updated ${key} in ${path.relative(process.cwd(), filePath)}`);
}

function configure(domainInput) {
  const domain = domainInput
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // 1. Calculate Backend CORS
  const corsOrigins = new Set(DEFAULT_CORS);
  if (domain) {
    corsOrigins.add(`https://${domain}`);
    corsOrigins.add(`https://api.${domain}`);
  }

  const corsString = Array.from(corsOrigins).join(",");
  setEnvValue(API_ENV_PATH, "CORS_ALLOWED_ORIGINS", corsString);

  // 2. Set VITE_API_BASE_URL in .env.production only (for builds)
  if (domain) {
    const viteApiUrl = `https://api.${domain}`;
    setEnvValue(WEB_ENV_PROD_PATH, "VITE_API_BASE_URL", viteApiUrl);
    console.log(`\n✨ Production environment configured for ${domain}`);
  } else {
    // If no domain, just ensure .env.production is empty or has empty string
    setEnvValue(WEB_ENV_PROD_PATH, "VITE_API_BASE_URL", "");
    console.log("\n✨ Local development mode (using Vite proxy)");
  }

  console.log("\n📝 Important:");
  console.log("   - Local dev (npm run dev): uses Vite proxy → localhost:3000");
  console.log(
    "   - Production build: uses VITE_API_BASE_URL from .env.production",
  );

  rl.close();
}

function start() {
  console.log("\n--- Spatial Ring Environment Setup ---");
  console.log(
    "Configure CORS for the API and production API URL for web builds.",
  );
  console.log("Leave empty for local development only.\n");

  rl.question(
    "Enter your public domain (e.g., demo.toodear.rocks) or press ENTER: ",
    (answer) => {
      configure(answer);
    },
  );
}

start();
