// Test script to verify API access
import fetch from 'node-fetch';

async function testApi() {
  console.log('Testing local API endpoints...');

  try {
    // Test the status endpoint
    console.log('\nTesting /api/status:');
    const statusResponse = await fetch('http://localhost:3000/api/status');
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Status API working!');
      console.log(JSON.stringify(statusData, null, 2));
    } else {
      console.error(`❌ Status API failed with status: ${statusResponse.status}`);
    }

    // Test the test endpoint
    console.log('\nTesting /test:');
    const testResponse = await fetch('http://localhost:3000/test');
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test endpoint working!');
      console.log(JSON.stringify(testData, null, 2));
    } else {
      console.error(`❌ Test endpoint failed with status: ${testResponse.status}`);
    }

    console.log('\nTests completed!');
  } catch (error) {
    console.error('Error during tests:', error);
    console.log('\nMake sure the server is running with `npm run dev` before running this test.');
  }
}

testApi();
