import { checkAllProperties } from "../src/apartment-checker.js";
import { sendNotification } from "../src/notification.js";
import { loadSavedUnits, saveUnits } from "../src/storage.js";
import config from "../src/config.js";

// Initialize state
let knownUnits;

export default async function handler(req, res) {
  console.log(
    `[${new Date().toLocaleString()}] Running apartment check via API endpoint...`
  );

  // Load saved units if not already loaded
  if (!knownUnits) {
    knownUnits = loadSavedUnits();
  }

  try {
    const results = await checkAllProperties();
    const newUnits = [];

    // Check for new matching units
    for (const result of results) {
      for (const unit of result.matchingUnits) {
        const unitKey = `${result.propertyName}-${unit.unitNumber}`;

        if (!knownUnits.has(unitKey)) {
          knownUnits.add(unitKey);
          newUnits.push({
            property: result.propertyName,
            unit: unit.unitNumber,
            floor: unit.floor,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            price: unit.price,
            url: result.url,
          });
        }
      }
    }

    // Send notifications for new units
    if (newUnits.length > 0) {
      console.log(`Found ${newUnits.length} new matching units!`);

      for (const unit of newUnits) {
        const message = `New apartment available! ${unit.property}: Unit ${unit.unit}, ${unit.bedrooms}bed/${unit.bathrooms}bath on floor ${unit.floor} for $${unit.price}/month. Check it out: ${unit.url}`;
        await sendNotification(message);
      }

      // Save updated known units
      saveUnits(knownUnits);

      res.status(200).json({ success: true, newUnits });
    } else {
      console.log("No new matching units found.");
      res
        .status(200)
        .json({ success: true, message: "No new matching units found" });
    }
  } catch (error) {
    console.error("Error checking properties:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
