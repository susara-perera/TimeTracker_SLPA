// Simple test to check role endpoints without authentication
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('🔍 Testing role management endpoints...\n');
  
  try {
    // Test GET /api/roles
    console.log('📋 Testing GET /api/roles');
    const getRoles = await makeRequest('/roles');
    console.log(`Status: ${getRoles.status}`);
    console.log(`Response: ${getRoles.data}\n`);
    
    // Test POST /api/roles (will likely fail due to auth, but let's see the error)
    console.log('➕ Testing POST /api/roles');
    const postRole = await makeRequest('/roles', 'POST', {
      value: 'test_role_123',
      label: 'Test Role 123'
    });
    console.log(`Status: ${postRole.status}`);
    console.log(`Response: ${postRole.data}\n`);
    
    // Test health endpoint to confirm server is responding
    console.log('❤️ Testing health endpoint');
    const health = await makeRequest('/../health');
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${health.data}\n`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testEndpoints();
