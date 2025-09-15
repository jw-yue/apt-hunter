// Import modules
import dotenv from "dotenv";
import cron from "node-cron";
import { checkAllProperties } from "./apartment-checker.js";
import { sendNotification } from "./notification.js";
import { loadSavedUnits, saveUnits } from "./storage.js";
import config from "./config.js";

// Initialize environment variables
dotenv.config();

// Global state
let knownUnits = loadSavedUnits();

console.log("Starting Apt Unit Finder application...");
console.log(
  `Looking for 2bed/2bath units under $${config.MAX_PRICE} above floor ${config.MIN_FLOOR}`
);
console.log(
  `Will check ${config.WEBSITES.length} properties every ${config.CHECK_INTERVAL_MINUTES} minutes`
);
console.log(
  `Will send notifications to: ${
    process.env.TARGET_PHONE_NUMBER || "5124121653"
  }`
);

// Main function to check all properties
async function checkProperties() {
  try {
    console.log(
      `\n[${new Date().toLocaleString()}] Checking for new apartment listings...`
    );

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
        console.log(
          `Notification sent for unit ${unit.unit} at ${unit.property}`
        );
      }

      // Save updated known units
      saveUnits(knownUnits);
    } else {
      console.log("No new matching units found.");
    }
  } catch (error) {
    console.error("Error checking properties:", error);
  }
}

// Run immediately on startup
checkProperties();

// Schedule regular checks
cron.schedule(`*/${config.CHECK_INTERVAL_MINUTES} * * * *`, () => {
  checkProperties();
});

console.log(
  `Apt Unit Finder is running. Will check every ${config.CHECK_INTERVAL_MINUTES} minutes.`
);
