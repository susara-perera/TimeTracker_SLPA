const http = require('http');

const testSingleLogin = async () => {
  console.log('Testing single login after rate limit fix...\n');
  
  // Test login with super admin
  const loginData = {
    email: 'susaraperera33@gmail.com',
    password: '248310'
  };
  
  try {
    console.log('Testing super admin login...');
    const loginResponse = await makeRequest('POST', 'http://localhost:5000/api/auth/login', loginData);
    console.log('✅ LOGIN SUCCESS!', loginResponse);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    
    // Try with other potential passwords
    const passwords = ['248310', 'SuperAdmin123!', 'password', '123456', 'susara123', 'admin123'];
    
    for (const pwd of passwords) {
      console.log(`\nTrying password: ${pwd}`);
      try {
        const testLogin = await makeRequest('POST', 'http://localhost:5000/api/auth/login', {
          email: 'susaraperera33@gmail.com',
          password: pwd
        });
        console.log('✅ SUCCESS with password:', pwd);
        console.log('User:', testLogin.user);
        break;
      } catch (err) {
        console.log('❌ Failed with:', pwd);
      }
    }
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

testSingleLogin().catch(console.error);
