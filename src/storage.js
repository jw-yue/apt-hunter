import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store known units
const STORAGE_FILE = path.join(__dirname, "..", "data", "known_units.json");

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load saved units from storage
export function loadSavedUnits() {
  try {
    ensureDataDirectory();

    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf8");
      const knownUnitsArray = JSON.parse(data);
      return new Set(knownUnitsArray);
    }
  } catch (error) {
    console.error("Error loading saved units:", error);
  }

  return new Set();
}

// Save units to storage
export function saveUnits(knownUnits) {
  try {
    ensureDataDirectory();

    const knownUnitsArray = Array.from(knownUnits);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(knownUnitsArray, null, 2));
  } catch (error) {
    console.error("Error saving units:", error);
  }
}
