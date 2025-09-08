const http = require('http');

async function testMySQLEndpoint() {
  try {
    const data = JSON.stringify({
      report_type: 'group',
      division_id: '2', // INFORMATION SYSTEM division
      section_id: 'all',
      from_date: '2024-10-31',
      to_date: '2024-11-01'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reports/mysql/attendance',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      console.log('Response Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response Data:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw Response:', responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
    });

    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testMySQLEndpoint();
