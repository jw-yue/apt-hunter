import { checkAllProperties } from '../src/apartment-checker.js';
import { sendNotification } from '../src/notification.js';
import { loadSavedUnits, saveUnits } from '../src/storage.js';
import config from '../src/config.js';

export default async function handler(req, res) {
  console.log(`[${new Date().toLocaleString()}] Running TEST apartment check...`);
  
  try {
    // Load saved units
    const knownUnits = loadSavedUnits();
    
    // Check all properties
    const results = await checkAllProperties();
    const newUnits = [];
    
    // Check for matching units
    for (const result of results) {
      for (const unit of result.matchingUnits) {
        const unitKey = `${result.propertyName}-${unit.unitNumber}`;
        
        if (!knownUnits.has(unitKey)) {
          newUnits.push({
            property: result.propertyName,
            unit: unit.unitNumber,
            floor: unit.floor,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            price: unit.price,
            url: result.url
          });
        }
      }
    }
    
    // Prepare summary message
    let summary = `📊 Apartment Hunter TEST Run Summary (${new Date().toLocaleString()}):\n\n`;
    
    if (newUnits.length > 0) {
      summary += `Found ${newUnits.length} matching units that would be new!\n\n`;
      
      for (const unit of newUnits) {
        summary += `• ${unit.property}: Unit ${unit.unit}\n`;
        summary += `  ${unit.bedrooms}bed/${unit.bathrooms}bath on floor ${unit.floor}\n`;
        summary += `  $${unit.price}/month\n\n`;
      }
    } else {
      summary += "No new matching units found.\n\n";
    }
    
    // Add property scan summary
    summary += "Properties scanned:\n";
    for (const result of results) {
      summary += `• ${result.propertyName}: Found ${result.matchingUnits.length} matching units total\n`;
    }
    
    // Always send a notification with the test results
    await sendNotification(`🧪 TEST ALERT: ${summary}`);
    
    // Return the results
    res.status(200).json({ 
      success: true, 
      message: "Test run completed successfully",
      newUnits,
      results
    });
  } catch (error) {
    console.error('Error in test run:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
