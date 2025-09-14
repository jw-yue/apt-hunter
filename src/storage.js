import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store known units - for local development
const STORAGE_FILE = path.join(__dirname, "..", "data", "known_units.json");

// In-memory storage for Vercel environment
let memoryStorage = new Set();

// Ensure data directory exists for local development
function ensureDataDirectory() {
  // Skip if running on Vercel
  if (process.env.VERCEL) return;

  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load saved units from storage
export function loadSavedUnits() {
  // If we already have in-memory storage (in Vercel), use that
  if (process.env.VERCEL && memoryStorage.size > 0) {
    return memoryStorage;
  }

  try {
    ensureDataDirectory();

    if (!process.env.VERCEL && fs.existsSync(STORAGE_FILE)) {
      // Local file storage
      const data = fs.readFileSync(STORAGE_FILE, "utf8");
      const knownUnitsArray = JSON.parse(data);
      memoryStorage = new Set(knownUnitsArray);
      return memoryStorage;
    }
  } catch (error) {
    console.error("Error loading saved units:", error);
  }

  return new Set();
}

// Save units to storage
export function saveUnits(knownUnits) {
  // Update memory storage
  memoryStorage = knownUnits;

  // Skip file operations if on Vercel
  if (process.env.VERCEL) return;

  try {
    ensureDataDirectory();

    const knownUnitsArray = Array.from(knownUnits);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(knownUnitsArray, null, 2));
  } catch (error) {
    console.error("Error saving units:", error);
  }
}
