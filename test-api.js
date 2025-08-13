const https = require('https');
const http = require('http');

const testAPI = async () => {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await makeRequest('GET', 'http://localhost:5000/health');
    console.log('✅ Health check successful:', healthResponse);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Login with default super admin
  console.log('\n2. Testing login with default super admin...');
  const loginData = {
    email: 'susaraperera33@gmail.com',
    password: 'susara_perera'
  };
  
  try {
    const loginResponse = await makeRequest('POST', 'http://localhost:5000/api/auth/login', loginData);
    console.log('✅ Login successful:', loginResponse);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
  
  // Test 3: Try with employee ID
  console.log('\n3. Testing login with employee ID...');
  const loginData2 = {
    employeeId: 'SP001',
    password: 'susara_perera'
  };
  
  try {
    const loginResponse2 = await makeRequest('POST', 'http://localhost:5000/api/auth/login', loginData2);
    console.log('✅ Login with employee ID successful:', loginResponse2);
  } catch (error) {
    console.log('❌ Login with employee ID failed:', error.message);
  }
  
  // Test 4: Test with simple credentials
  console.log('\n4. Testing login with simple credentials...');
  const loginData3 = {
    email: 'susara_perera@admin',
    password: 'susara_perera'
  };
  
  try {
    const loginResponse3 = await makeRequest('POST', 'http://localhost:5000/api/auth/login', loginData3);
    console.log('✅ Login with admin email successful:', loginResponse3);
  } catch (error) {
    console.log('❌ Login with admin email failed:', error.message);
  }
  
  // Test 5: Get all users
  console.log('\n5. Testing get users endpoint...');
  try {
    const usersResponse = await makeRequest('GET', 'http://localhost:5000/api/users');
    console.log('✅ Get users successful:', usersResponse);
  } catch (error) {
    console.log('❌ Get users failed:', error.message);
  }
};

function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseBody}`));
          }
        } catch (error) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseBody);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
          }
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testAPI().catch(console.error);
