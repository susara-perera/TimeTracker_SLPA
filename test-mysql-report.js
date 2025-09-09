const http = require('http');

async function testMySQLGroupReport() {
  try {
    const data = JSON.stringify({
      report_type: 'group',
      division_id: '8', // INFORMATION SYSTEMS division
      section_id: 'all',
      from_date: '2025-07-22',
      to_date: '2025-07-22'
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

    console.log('Testing MySQL Group Attendance Report...');
    console.log('Request Data:', JSON.parse(data));
    console.log('');

    const req = http.request(options, (res) => {
      console.log('Response Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('');
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response Success:', jsonData.success);
          console.log('Response Message:', jsonData.message);
          
          if (jsonData.success && jsonData.data) {
            console.log('Total Records:', jsonData.data.length);
            if (jsonData.data.length > 0) {
              console.log('Sample Record:', JSON.stringify(jsonData.data[0], null, 2));
            }
          }
          
          if (jsonData.summary) {
            console.log('Summary:', JSON.stringify(jsonData.summary, null, 2));
          }
          
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

testMySQLGroupReport();
