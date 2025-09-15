// Tool to verify Vercel deployment
import fetch from 'node-fetch';

// Check a specific Vercel deployment
async function checkVercelDeployment() {
  const VERCEL_URL = 'https://apt-hunter.vercel.app';
  
  console.log(`\n===== VERCEL DEPLOYMENT CHECK: ${VERCEL_URL} =====\n`);
  
  try {
    // Check root URL
    console.log('Checking root URL...');
    const rootResponse = await fetch(VERCEL_URL);
    
    console.log(`Status: ${rootResponse.status}`);
    console.log(`Content-Type: ${rootResponse.headers.get('content-type')}`);
    
    if (rootResponse.ok) {
      const text = await rootResponse.text();
      console.log(`Content length: ${text.length} characters`);
      
      // Check if it's your apartment hunter app
      if (text.includes('Apt Unit Finder') && text.includes('Your apartment unit finder assistant')) {
        console.log('✅ Success! Your Apt Unit Finder app is deployed correctly.');
      } else if (text.includes('Vercel') && text.includes('deployment')) {
        console.log('⚠️ Found a Vercel placeholder page. Your app is not deployed correctly.');
      } else {
        console.log('⚠️ Found content, but it doesn\'t match your Apt Unit Finder app.');
        console.log('First 200 characters:');
        console.log(text.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ Failed to access the root URL');
    }
    
    // Check API endpoint
    console.log('\nChecking API status endpoint...');
    try {
      const apiResponse = await fetch(`${VERCEL_URL}/api/status`);
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log('✅ API status endpoint is working!');
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ API status failed with status: ${apiResponse.status}`);
        console.log('Response:', await apiResponse.text());
      }
    } catch (apiError) {
      console.log('❌ Error accessing API:', apiError.message);
    }
    
  } catch (error) {
    console.error('Error checking deployment:', error);
  }
}

checkVercelDeployment();
