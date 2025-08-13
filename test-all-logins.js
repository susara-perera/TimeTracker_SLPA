const http = require('http');

const testAllLogins = async () => {
  console.log('Testing login with all known users...\n');
  
  // Get all users first
  const users = await makeRequest('GET', 'http://localhost:5000/api/users');
  
  if (users.success) {
    console.log('=== FOUND USERS ===');
    users.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Locked: ${user.isLocked}`);
      console.log('');
    });
  }
  
  // Test credentials for each user
  const testCredentialsList = [
    // Super admin
    { email: 'susaraperera33@gmail.com', password: 'susara_perera' },
    { employeeId: 'SP001', password: 'susara_perera' },
    
    // John Clerk
    { email: 'clerk@example.com', password: 'clerk123' },
    { email: 'clerk@example.com', password: 'password' },
    { email: 'clerk@example.com', password: '123456' },
    { employeeId: 'CLK001', password: 'clerk123' },
    { employeeId: 'CLK001', password: 'password' },
    { employeeId: 'CLK001', password: '123456' },
    
    // Amaya Doni
    { email: 'doni@slpa.com', password: 'admin123' },
    { email: 'doni@slpa.com', password: 'password' },
    { email: 'doni@slpa.com', password: '123456' },
    { employeeId: '0123', password: 'admin123' },
    { employeeId: '0123', password: 'password' },
    { employeeId: '0123', password: '123456' },
    
    // Shenuka Navod
    { email: 'shenuka@slpa.com', password: 'clerk123' },
    { email: 'shenuka@slpa.com', password: 'password' },
    { email: 'shenuka@slpa.com', password: '123456' },
    { employeeId: '2002', password: 'clerk123' },
    { employeeId: '2002', password: 'password' },
    { employeeId: '2002', password: '123456' }
  ];
  
  console.log('=== TESTING LOGIN CREDENTIALS ===');
  
  for (let i = 0; i < testCredentialsList.length; i++) {
    const cred = testCredentialsList[i];
    const identifier = cred.email || cred.employeeId;
    
    console.log(`\n${i + 1}. Testing ${cred.email ? 'email' : 'employeeId'}: ${identifier} with password: ${cred.password}`);
    
    try {
      const loginResponse = await makeRequest('POST', 'http://localhost:5000/api/auth/login', cred);
      console.log(`✅ LOGIN SUCCESS! User: ${loginResponse.user.firstName} ${loginResponse.user.lastName} (${loginResponse.user.role})`);
      
      // If we found a working login, stop testing
      if (loginResponse.success) {
        console.log('\n🎉 FOUND WORKING CREDENTIALS!');
        console.log(`   ${cred.email ? 'Email' : 'Employee ID'}: ${identifier}`);
        console.log(`   Password: ${cred.password}`);
        console.log(`   User: ${loginResponse.user.firstName} ${loginResponse.user.lastName}`);
        console.log(`   Role: ${loginResponse.user.role}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
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

testAllLogins().catch(console.error);
