// Test script to verify that the apartment scraper is working correctly
import { checkAllProperties } from "./apartment-checker.js";
import config from "./config.js";

async function runTest() {
  console.log("Testing apartment checker...");
  console.log(
    `Checking ${config.WEBSITES.length} websites for 2bed/2bath units under $${config.MAX_PRICE} above floor ${config.MIN_FLOOR}`
  );

  try {
    const results = await checkAllProperties();

    console.log("\nResults:");
    console.log("=======");

    let totalMatches = 0;

    for (const result of results) {
      console.log(`\n${result.propertyName} (${result.url}):`);
      console.log(`Found ${result.matchingUnits.length} matching units`);

      for (const unit of result.matchingUnits) {
        console.log(
          `- Unit ${unit.unitNumber}: ${unit.bedrooms}bed/${unit.bathrooms}bath on floor ${unit.floor} for $${unit.price}/month`
        );
      }

      totalMatches += result.matchingUnits.length;
    }

    console.log(`\nTotal matching units found: ${totalMatches}`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
