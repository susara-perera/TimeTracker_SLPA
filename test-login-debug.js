const fetch = require('node-fetch');

const testLogin = async () => {
  console.log('Testing login with debug info...\n');
  
  try {
    // First check if server is responding
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Server is responding:', healthData);
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
    return;
  }
  
  try {
    // Test login with detailed error info
    console.log('\n2. Testing login...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'susaraperera33@gmail.com',
        password: '248310'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
};

testLogin();
