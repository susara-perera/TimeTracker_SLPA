const https = require('https');
const http = require('http');

// Test data for group attendance report
const testData = {
  report_type: 'group',
  employee_id: '',
  division_id: '1', // Use division ID 1 based on your database
  section_id: 'all',
  from_date: '2024-11-01',
  to_date: '2024-11-02'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reports/mysql/attendance',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing MySQL Group Attendance Report...');
console.log('Request data:', testData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\nResponse:');
      console.log('Success:', response.success);
      console.log('Message:', response.message);
      
      if (response.data && response.data.length > 0) {
        console.log('Data records found:', response.data.length);
        console.log('First few records:', response.data.slice(0, 3));
      } else if (response.employees && response.employees.length > 0) {
        console.log('Employees found:', response.employees.length);
        console.log('First employee:', response.employees[0]);
        if (response.dates) {
          console.log('Date range:', response.dates);
        }
      } else {
        console.log('No data found');
      }
      
      if (response.summary) {
        console.log('Summary:', response.summary);
      }
    } catch (err) {
      console.error('Error parsing response:', err);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

req.write(postData);
req.end();
