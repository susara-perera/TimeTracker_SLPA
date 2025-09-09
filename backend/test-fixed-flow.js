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

async function testFixedFlow() {
  try {
    console.log('🧪 Testing Fixed MongoDB -> MySQL Division Mapping...\n');

    // Test 1: Get sections with MongoDB division ID
    console.log('1. Testing sections endpoint with MongoDB division ID...');
    const sectionsResponse = await makeRequest('http://localhost:5000/api/divisions/689443a4c8066bb7f0b32a44/mysql-sections');
    
    if (sectionsResponse.ok) {
      const sectionsData = sectionsResponse.json();
      console.log('✅ Sections endpoint working!');
      console.log(`Found ${sectionsData.data.length} sections`);
      
      if (sectionsData.mapping) {
        console.log(`✅ Division mapping: MongoDB(${sectionsData.mapping.mongoId}) -> MySQL(${sectionsData.mapping.mysqlId})`);
      }
      
      // Find IS JCT section
      const isJctSection = sectionsData.data.find(s => s.name === 'IS JCT');
      if (isJctSection) {
        console.log(`✅ Found IS JCT section with ID: ${isJctSection._id}`);
        
        // Test 2: Group report with MongoDB division ID and correct section ID
        console.log('\n2. Testing group report with MongoDB division ID...');
        
        const reportPayload = {
          report_type: 'group',
          employee_id: '',
          division_id: '689443a4c8066bb7f0b32a44', // MongoDB division ID
          section_id: isJctSection._id, // Correct MySQL section ID
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
          console.log('✅ Group report working!');
          console.log(`Found ${reportData.data.employees?.length || 0} employees`);
          console.log(`Date range: ${reportData.data.dates?.length || 0} days`);
          
          if (reportData.data.employees && reportData.data.employees.length > 0) {
            console.log('\n✅ SUCCESS! Sample data:');
            const sample = reportData.data.employees[0];
            console.log(`- Employee: ${sample.employeeName} (${sample.employeeId})`);
            console.log(`- Division: ${sample.division}`);
            console.log(`- Section: ${sample.section}`);
            
            const firstDate = reportData.data.dates[0];
            const attendance = sample.dailyAttendance[firstDate];
            console.log(`- ${firstDate}: ${attendance.status}`);
          }
        } else {
          console.error('❌ Group report failed:', reportResponse.status);
          if (reportResponse.text) {
            console.error(reportResponse.text());
          }
        }
        
      } else {
        console.error('❌ IS JCT section not found');
      }
    } else {
      console.error('❌ Sections endpoint failed:', sectionsResponse.status);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testFixedFlow();
