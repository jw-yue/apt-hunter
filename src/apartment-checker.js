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
  console.log(`Checking property website: ${url}`);
  try {
    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
      },
      timeout: 30000, // 30 seconds timeout
      maxRedirects: 5
    });
    
    console.log(`Successfully fetched ${url}, status: ${response.status}`);
    
    // Make sure we have HTML content to parse
    if (!response.data) {
      console.log(`Warning: Empty response from ${url}`);
      return [];
    }
    
    // Parse the HTML based on the website type
    if (type === "amli") {
      return parseAmliWebsite(response.data, url);
    } else if (type === "cortland") {
      return parseCortlandWebsite(response.data, url);
    } else {
      // Try both parsers as a fallback
      console.log(`Unknown website type: ${type}, trying generic parsing`);
      const amliUnits = parseAmliWebsite(response.data, url);
      const cortlandUnits = parseCortlandWebsite(response.data, url);
      return [...amliUnits, ...cortlandUnits];
    }
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
    return [];
  }
}

// Parse AMLI website HTML
function parseAmliWebsite(html, url) {
  console.log("Parsing AMLI website HTML");
  const matchingUnits = [];
  
  // Safety check for HTML content
  if (!html) {
    console.log("Warning: Empty HTML content received");
    return matchingUnits;
  }
  
  // Load HTML with more options for robustness
  const $ = cheerio.load(html, { 
    decodeEntities: true,
    xmlMode: false
  });

  console.log("Looking for floor plans on AMLI website");
  
  // AMLI website structure - looking for floorplan cards with unit information
  $(".floorplan-card").each((i, element) => {
    try {
      console.log(`Processing floor plan ${i+1}`);
      
      // Extract unit details (this will vary based on actual HTML structure)
      const unitName = $(element).find(".floorplan-card__name").text().trim() || "Unknown";
      const unitNumber = unitName.split(" ").pop().trim() || `Unit-${i+1}`; // Assuming unit number is last part

      // Extract bedrooms from the text or data attributes
      const bedroomText = $(element)
        .find(".floorplan-card__bed-text")
        .text()
        .trim();
      // Use safer regex pattern with default value
      const bedroomMatch = bedroomText.match(/(\d+)/);
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 0;

      // Extract bathrooms from the text or data attributes
      const bathroomText = $(element)
        .find(".floorplan-card__bath-text")
        .text()
        .trim();
      // Safer regex for bathrooms
      const bathroomMatch = bathroomText.match(/(\d+(?:\.\d+)?)/);
      const bathrooms = bathroomMatch ? parseFloat(bathroomMatch[1]) : 0;

      // Extract price from the text
      const priceText = $(element).find(".floorplan-card__price").text().trim() || "0";
      const price = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;

      // Extract floor information (this might be challenging and depends on actual HTML structure)
      // For now, assume we can extract it from some attribute or text
      const floorInfo = $(element).find(".floorplan-card__floor").text().trim() || "";
      // Use optional chaining to avoid null errors
      const floorMatch = floorInfo.match(/(\d+)/);
      const floor = floorMatch ? parseInt(floorMatch[1]) : 1; // Default to 1st floor if not found

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
  console.log("Parsing Cortland website HTML");
  const matchingUnits = [];
  
  // Safety check for HTML content
  if (!html) {
    console.log("Warning: Empty HTML content received");
    return matchingUnits;
  }
  
  const $ = cheerio.load(html, { 
    decodeEntities: true,
    xmlMode: false
  });

  console.log("Looking for apartment listings on Cortland website");
  
  // Try multiple possible selectors for Cortland
  const possibleSelectors = [
    ".apartment-listing", 
    ".apartment-card", 
    ".apartment-result",
    ".floorplan-card",
    ".floorplan"
  ];
  
  let selector = ".apartment-listing"; // Default selector
  
  // Find which selector works for this page
  for (const testSelector of possibleSelectors) {
    if ($(testSelector).length > 0) {
      selector = testSelector;
      console.log(`Found matching selector: ${selector}`);
      break;
    }
  }
  
  // Use the best selector we found
  $(selector).each((i, element) => {
    try {
      console.log(`Processing apartment ${i+1}`);
      
      // Extract unit details (this will vary based on actual HTML structure)
      const unitNumber = $(element)
        .find("[class*='name'], [class*='title'], .name, .title, h3")
        .first()
        .text()
        .trim() || `Unit-${i+1}`;

      // Look for bedroom info in multiple possible locations
      const bedroomEl = $(element).find("[class*='bedroom'], [class*='bed-'], .beds, .bedrooms");
      const bedroomText = bedroomEl.text().trim();
      const bedroomMatch = bedroomText.match(/(\d+)/);
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 0;

      // Look for bathroom info in multiple possible locations
      const bathroomEl = $(element).find("[class*='bathroom'], [class*='bath-'], .baths, .bathrooms");
      const bathroomText = bathroomEl.text().trim();
      const bathroomMatch = bathroomText.match(/(\d+(?:\.\d+)?)/);
      const bathrooms = bathroomMatch ? parseFloat(bathroomMatch[1]) : 0;

      // Look for price info in multiple possible locations
      const priceEl = $(element).find("[class*='price'], [class*='rent'], .price, .rent");
      const priceText = priceEl.text().trim();
      const priceMatch = priceText.replace(/[^0-9]/g, "");
      const price = priceMatch ? parseInt(priceMatch) : 0;

      // Try to find floor information - this is the most challenging
      const floorEl = $(element).find("[class*='floor'], [class*='level'], .floor, .level");
      const floorText = floorEl.text().trim();
      const floorMatch = floorText.match(/(\d+)/);
      const floor = floorMatch ? parseInt(floorMatch[1]) : 1; // Default to 1st floor if not found

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
