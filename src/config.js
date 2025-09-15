// Configuration for the Apt Unit Finder application
export default {
  // Apartment criteria
  TARGET_BEDROOMS: 2,
  TARGET_BATHROOMS: 2,
  MAX_PRICE: 3100,
  MIN_FLOOR: 1, // Above first floor

  // Check interval in minutes (for local development)
  // In Vercel deployment, this runs once daily via cron
  CHECK_INTERVAL_MINUTES: 1440, // 24 hours = 1440 minutes

  // Websites to check
  WEBSITES: [
    {
      name: "AMLI Branch Park",
      url: "https://www.amli.com/apartments/austin/mueller-apartments/amli-branch-park/floorplans",
      type: "amli",
    },
    {
      name: "AMLI on Aldrich",
      url: "https://www.amli.com/apartments/austin/mueller-apartments/amli-on-aldrich/floorplans?size=2&tab=floorplans",
      type: "amli",
    },
    {
      name: "AMLI Lakeline",
      url: "https://www.amli.com/apartments/austin/northwest-austin-apartments/amli-lakeline/floorplans",
      type: "amli",
    },
    {
      name: "Cortland Arboretum",
      url: "https://cortland.com/apartments/cortland-arboretum/",
      type: "cortland",
    },
  ],
};
