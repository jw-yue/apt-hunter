import axios from "axios";
import * as cheerio from "cheerio";
import config from "./config.js";

// Main function to check all properties
export async function checkAllProperties() {
  const results = [];

  for (const website of config.WEBSITES) {
    try {
      console.log(`Checking ${website.name}...`);
      const matchingUnits = await checkProperty(website.url, website.type);

      results.push({
        propertyName: website.name,
        url: website.url,
        matchingUnits,
      });

      console.log(
        `Found ${matchingUnits.length} matching units at ${website.name}`
      );
    } catch (error) {
      console.error(`Error checking ${website.name}:`, error.message);
    }
  }

  return results;
}

// Check a specific property website
async function checkProperty(url, type) {
  try {
    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      },
    });

    // Parse the HTML based on the website type
    if (type === "amli") {
      return parseAmliWebsite(response.data, url);
    } else if (type === "cortland") {
      return parseCortlandWebsite(response.data, url);
    }

    return [];
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return [];
  }
}

// Parse AMLI website HTML
function parseAmliWebsite(html, url) {
  const matchingUnits = [];
  const $ = cheerio.load(html);

  // AMLI website structure - looking for floorplan cards with unit information
  $(".floorplan-card").each((i, element) => {
    try {
      // Extract unit details (this will vary based on actual HTML structure)
      const unitName = $(element).find(".floorplan-card__name").text().trim();
      const unitNumber = unitName.split(" ").pop().trim(); // Assuming unit number is last part

      // Extract bedrooms from the text or data attributes
      const bedroomText = $(element)
        .find(".floorplan-card__bed-text")
        .text()
        .trim();
      const bedrooms = parseInt(bedroomText.match(/(\d+)/)[1]) || 0;

      // Extract bathrooms from the text or data attributes
      const bathroomText = $(element)
        .find(".floorplan-card__bath-text")
        .text()
        .trim();
      const bathrooms =
        parseFloat(bathroomText.match(/(\d+(?:\.\d+)?)/)[1]) || 0;

      // Extract price from the text
      const priceText = $(element).find(".floorplan-card__price").text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;

      // Extract floor information (this might be challenging and depends on actual HTML structure)
      // For now, assume we can extract it from some attribute or text
      const floorInfo = $(element).find(".floorplan-card__floor").text().trim();
      const floor = parseInt(floorInfo.match(/(\d+)/)?.[1]) || 0;

      // Check if this unit matches our criteria
      if (
        bedrooms === config.TARGET_BEDROOMS &&
        bathrooms === config.TARGET_BATHROOMS &&
        price <= config.MAX_PRICE &&
        floor > config.MIN_FLOOR
      ) {
        matchingUnits.push({
          unitNumber,
          bedrooms,
          bathrooms,
          price,
          floor,
        });
      }
    } catch (error) {
      console.error("Error parsing unit data:", error.message);
    }
  });

  return matchingUnits;
}

// Parse Cortland website HTML
function parseCortlandWebsite(html, url) {
  const matchingUnits = [];
  const $ = cheerio.load(html);

  // Cortland website structure - looking for apartment listings
  $(".apartment-listing").each((i, element) => {
    try {
      // Extract unit details (this will vary based on actual HTML structure)
      const unitNumber = $(element)
        .find(".apartment-listing__name")
        .text()
        .trim();

      // Extract bedrooms
      const bedroomText = $(element)
        .find(".apartment-listing__bedrooms")
        .text()
        .trim();
      const bedrooms = parseInt(bedroomText.match(/(\d+)/)[1]) || 0;

      // Extract bathrooms
      const bathroomText = $(element)
        .find(".apartment-listing__bathrooms")
        .text()
        .trim();
      const bathrooms =
        parseFloat(bathroomText.match(/(\d+(?:\.\d+)?)/)[1]) || 0;

      // Extract price
      const priceText = $(element)
        .find(".apartment-listing__price")
        .text()
        .trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;

      // Extract floor information
      const floorText = $(element)
        .find(".apartment-listing__floor")
        .text()
        .trim();
      const floor = parseInt(floorText.match(/(\d+)/)?.[1]) || 0;

      // Check if this unit matches our criteria
      if (
        bedrooms === config.TARGET_BEDROOMS &&
        bathrooms === config.TARGET_BATHROOMS &&
        price <= config.MAX_PRICE &&
        floor > config.MIN_FLOOR
      ) {
        matchingUnits.push({
          unitNumber,
          bedrooms,
          bathrooms,
          price,
          floor,
        });
      }
    } catch (error) {
      console.error("Error parsing unit data:", error.message);
    }
  });

  return matchingUnits;
}

export { checkProperty };
