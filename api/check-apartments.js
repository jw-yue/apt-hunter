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

    // Prepare a summary message
    let summary = `📊 Daily Apartment Check (${new Date().toLocaleString()}):\n\n`;
    
    // Add new units to the summary if any were found
    if (newUnits.length > 0) {
      console.log(`Found ${newUnits.length} new matching units!`);
      summary += `🎉 Found ${newUnits.length} NEW matching units!\n\n`;
      
      for (const unit of newUnits) {
        summary += `• ${unit.property}: Unit ${unit.unit}\n`;
        summary += `  ${unit.bedrooms}bed/${unit.bathrooms}bath on floor ${unit.floor}\n`;
        summary += `  $${unit.price}/month\n`;
        summary += `  ${unit.url}\n\n`;
      }
      
      // Save updated known units
      saveUnits(knownUnits);
    } else {
      console.log("No new matching units found.");
      summary += "😔 No new matching units found today.\n\n";
    }
    
    // Add total counts for each property
    summary += "Properties scanned:\n";
    for (const result of results) {
      summary += `• ${result.property || result.propertyName}: Found ${result.matchingUnits.length} matching units total\n`;
    }
    
    // Always send a daily notification with the summary
    await sendNotification(summary);
    
    // Return appropriate response
    if (newUnits.length > 0) {
      res.status(200).json({ success: true, newUnits });
    } else {
      res.status(200).json({ success: true, message: "No new matching units found" });
    }
  } catch (error) {
    console.error("Error checking properties:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
