const { createMySQLConnection } = require('./config/mysql');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, json: () => jsonData, status: res.statusCode });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, text: () => data, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCompleteFlow() {
  try {
    console.log('🔍 Testing Complete Group Report Flow...\n');

    // Test the new MySQL sections endpoint
    console.log('1. Testing MySQL sections endpoint for division 8...');
    
    const response = await makeRequest('http://localhost:5000/api/divisions/8/mysql-sections');
    
    if (response.ok) {
      const sectionsData = response.json();
      console.log('✅ MySQL sections endpoint working!');
      console.log(`Found ${sectionsData.data.length} sections:`);
      
      sectionsData.data.forEach(section => {
        console.log(`  - ID: ${section._id}, Name: "${section.name}"`);
      });
      
      // Get the "IS JCT" section ID
      const isJctSection = sectionsData.data.find(section => section.name === 'IS JCT');
      if (isJctSection) {
        console.log(`\n✅ Found IS JCT section with ID: ${isJctSection._id}`);
        
        // Test group report with correct section ID
        console.log('\n2. Testing group report with correct section ID...');
        
        const reportPayload = {
          report_type: 'group',
          employee_id: '',
          division_id: '8',
          section_id: isJctSection._id, // Use the correct MySQL section ID
          from_date: '2025-06-01',
          to_date: '2025-06-05'
        };
        
        console.log('Report payload:', JSON.stringify(reportPayload, null, 2));
        
        const reportResponse = await makeRequest('http://localhost:5000/api/reports/mysql/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportPayload)
        });
        
        if (reportResponse.ok) {
          const reportData = reportResponse.json();
          console.log('✅ Group report API working!');
          console.log(`Found ${reportData.data.employees?.length || 0} employees`);
          console.log(`Date range: ${reportData.data.dates?.length || 0} days`);
          
          if (reportData.data.employees && reportData.data.employees.length > 0) {
            console.log('\nSample employee data:');
            const sampleEmployee = reportData.data.employees[0];
            console.log(`- Employee: ${sampleEmployee.employeeName} (ID: ${sampleEmployee.employeeId})`);
            console.log(`- Division: ${sampleEmployee.division}`);
            console.log(`- Section: ${sampleEmployee.section}`);
            
            // Check attendance for first date
            const firstDate = reportData.data.dates[0];
            const firstDayAttendance = sampleEmployee.dailyAttendance[firstDate];
            if (firstDayAttendance) {
              console.log(`- ${firstDate}: ${firstDayAttendance.status}, In: ${firstDayAttendance.checkIn}, Out: ${firstDayAttendance.checkOut}`);
            }
          }
        } else {
          console.error('❌ Group report API failed:', reportResponse.status, reportResponse.text ? reportResponse.text() : 'No response text');
        }
        
      } else {
        console.error('❌ IS JCT section not found in results');
      }
      
    } else {
      console.error('❌ MySQL sections endpoint failed:', response.status, response.text ? response.text() : 'No response text');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testCompleteFlow();
