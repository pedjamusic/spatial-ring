import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// --- ESM Compatibility: Get the script's directory ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Monorepo Path Configuration ---
const API_FOLDER_ROOT = path.join(__dirname, '..'); 
const SCHEMA_PATH = path.join(API_FOLDER_ROOT, 'prisma', 'schema.prisma');
const ENV_PATH = path.join(API_FOLDER_ROOT, '.env'); // Path to your API's .env file
const DATA_DIR = path.join(API_FOLDER_ROOT, 'data');

// SQLite file path, defined relative to the API root
const SQLITE_FILE_PATH = path.join(DATA_DIR, 'spatial-ring-inventory.db');
const SQLITE_URL = `file:${SQLITE_FILE_PATH}`;

// --- Initialization for Readline Interface ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// [All helper functions (updateEnvFile, updateSchemaFile, runPrismaCommands) remain the same]

/**
 * Reads the existing .env file, updates the DATABASE_URL, and writes the content back.
 * @param {string} dbUrl - The new database URL.
 */
function updateEnvFile(dbUrl) {
  let envContent = '';
  const dbLine = `DATABASE_URL="${dbUrl}"`;
  
  try {
    // 1. Read existing content
    if (fs.existsSync(ENV_PATH)) {
      envContent = fs.readFileSync(ENV_PATH, 'utf8');
      
      // 2. Remove any existing DATABASE_URL/DB_PROVIDER line
      const updatedLines = envContent
        .split('\n')
        .filter(line => !line.trim().startsWith('DATABASE_URL='))
        .filter(line => !line.trim().startsWith('DB_PROVIDER='));

      // 3. Add the new DATABASE_URL line and join back
      updatedLines.push(dbLine);
      envContent = updatedLines.join('\n');
    } else {
      // If .env doesn't exist, create it with just the URL
      envContent = dbLine + '\n';
    }

    // 4. Write content back
    fs.writeFileSync(ENV_PATH, envContent);
    console.log(`\n✅ ${path.basename(ENV_PATH)} updated successfully.`);

  } catch (e) {
    console.error(`\n❌ Error handling .env file at ${ENV_PATH}:`, e.message);
    process.exit(1);
  }
}

/**
 * Updates the 'provider' value in the schema.prisma file.
 * @param {string} provider - 'postgresql' or 'sqlite'
 */
function updateSchemaFile(provider) {
  try {
    let schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');

    // Regex to find and replace the provider line in the datasource block
    const newContent = schemaContent.replace(
      /provider\s*=\s*"(sqlite|postgresql)"/i,
      `provider = "${provider}"`
    );

    fs.writeFileSync(SCHEMA_PATH, newContent);
    console.log(`\nSuccessfully set provider to: ${provider} in ${path.relative(process.cwd(), SCHEMA_PATH)}`);
  } catch (e) {
    console.error(`\n❌ Error updating schema file at ${SCHEMA_PATH}. Does api/prisma/schema.prisma exist?`, e.message);
    process.exit(1);
  }
}

/**
 * Runs the Prisma commands (generate and migrate).
 */
function runPrismaCommands(dbUrl, provider) {
  // 1. Update .env file (now handled by the new function)
  updateEnvFile(dbUrl);

  // 2. Run Prisma Commands
  try {
    // The CWD is crucial: Tells Prisma to look for its schema and .env files in the API_FOLDER_ROOT (api)
    const runOptions = { stdio: 'inherit', cwd: API_FOLDER_ROOT };

    if (provider === 'sqlite') {
      // Ensure the data directory exists for the SQLite file
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Generate the Prisma Client
    console.log('\nGenerating Prisma Client...');
    execSync('npx prisma generate', runOptions);

    // Apply the migrations
    console.log('\nApplying Database Migrations...');
    execSync('npx prisma migrate deploy', runOptions);

    console.log('\n✨ Database setup complete!');
    if (provider === 'sqlite') {
      console.log(`Local SQLite file is ready at: ${path.relative(process.cwd(), SQLITE_FILE_PATH)}`);
    }
  } catch (error) {
    console.error('\n❌ Database command failed. Check the error above.');
    console.error('\n*** TIP: Ensure PostgreSQL is running and accessible. If you entered the URL manually, double-check it. ***');
    process.exit(1);
  } finally {
    rl.close();
  }
}


/**
 * Handles the PostgreSQL setup path via manual input.
 */
function handleManualPostgres() {
  const provider = 'postgresql';
  // Use a placeholder URL that will be replaced manually by the user
  const dbUrl = 'postgresql://user:password@localhost:5432/REPLACE_ME_PASTE_YOUR_FULL_URL_HERE';

  console.log(`\nConfiguring for PostgreSQL (Manual Setup).`);
  updateSchemaFile(provider);
  updateEnvFile(dbUrl); // Write placeholder to ensure file is structured

  console.log(`\n------------------------------------------------------------`);
  console.log(`\n✨ MANUAL STEP REQUIRED!`);
  console.log(`\n1. Find your full, secret ${provider.toUpperCase()} DATABASE_URL.`);
  console.log(`\n2. Open the file: ${path.relative(process.cwd(), ENV_PATH)}`);
  console.log(`\n3. Carefully replace the placeholder with your real URL:`);
  console.log(`   DATABASE_URL="${dbUrl}"`); // show the placeholder
  console.log(`\n4. After saving, run: \`npm run db:deploy\` to apply the schema.`); // <--- THE FIXED INSTRUCTION
  console.log(`\n------------------------------------------------------------`);

  rl.close(); // Exit the script here since the user needs to edit the file
}

/**
 * Handles the PostgreSQL setup path via prompt (for simple local URLs).
 */
function handlePromptPostgres() {
  rl.question('\nPlease enter your simple PostgreSQL connection URL (e.g., postgresql://user:pass@localhost:5432/db): ', (pgUrl) => {
    const dbUrl = pgUrl.trim();
    
    if (!dbUrl.startsWith('postgresql://')) {
      console.log('\n⚠️ Invalid URL format. Please start with "postgresql://". Falling back to manual setup.');
      handleManualPostgres(); // Use the manual path if the input is garbage
      return;
    }

    console.log(`\nConfiguring for PostgreSQL with URL: ${dbUrl}`);
    updateSchemaFile('postgresql');
    runPrismaCommands(dbUrl, 'postgresql');

    console.log('\nGood luck with your vibecoding! Remember to have your PostgreSQL server running.');
  });
}

/**
 * Handles the SQLite setup path (used for default/fallback).
 */
function handleSQLite() {
  const provider = 'sqlite';
  const dbUrl = SQLITE_URL;

  console.log('\nConfiguring for zero-setup SQLite (local file database).');
  updateSchemaFile(provider);
  runPrismaCommands(dbUrl, provider);
  console.log('\nGood luck with your vibecoding! The SQLite file is self-contained and ready to go.');
}

/**
 * Main application setup flow.
 */
function setup() {
  console.log('--- Spatial Ring Database Setup ---');
  console.log('This script will configure your API service to use either PostgreSQL or SQLite.');

  // First question: Database choice
  rl.question(`
Which database would you like to use?
(1) PostgreSQL (Simple URL, e.g., local server)
(2) SQLite (Zero-setup, local file) [Default]
(3) PostgreSQL (Manual, for long/secret URLs like Prisma Data Platform)

Enter choice (1/2/3): `, (answer) => {
    const choice = answer.trim().toLowerCase();

    if (choice === '1') {
      handlePromptPostgres();
    } else if (choice === '3') {
      handleManualPostgres();
    } else {
      // Option 2 (SQLite) or any other input defaults to SQLite
      handleSQLite();
    }
  });
}

setup();
