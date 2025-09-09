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

async function testFrontendFlow() {
  try {
    console.log('🔍 Testing Frontend Flow (Group Report)...\n');

    // This is exactly what the frontend should send
    const frontendPayload = {
      report_type: 'group',
      employee_id: '',
      division_id: '8',  // INFORMATION SYSTEM division
      section_id: '29',  // IS JCT section (correct MySQL ID)
      from_date: '2025-06-01',
      to_date: '2025-06-05'
    };

    console.log('Frontend request payload:');
    console.log(JSON.stringify(frontendPayload, null, 2));

    // Test the group report API call
    const response = await makeRequest('http://localhost:5000/api/reports/mysql/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frontendPayload)
    });

    if (response.ok) {
      const data = response.json();
      console.log('\n✅ API Response Structure:');
      console.log(`- Success: ${data.success}`);
      console.log(`- Data Type: ${data.data?.reportType}`);
      console.log(`- Employees Found: ${data.data?.employees?.length || 0}`);
      console.log(`- Date Range: ${data.data?.dates?.length || 0} days`);
      
      if (data.data?.employees && data.data.employees.length > 0) {
        console.log('\n📋 Sample Employee Structure:');
        const sample = data.data.employees[0];
        console.log(`- Employee ID: ${sample.employeeId}`);
        console.log(`- Employee Name: ${sample.employeeName}`);
        console.log(`- Division: ${sample.division}`);
        console.log(`- Section: ${sample.section}`);
        
        if (sample.dailyAttendance) {
          console.log(`- Daily Attendance Keys: ${Object.keys(sample.dailyAttendance).length}`);
          const firstDate = data.data.dates[0];
          if (sample.dailyAttendance[firstDate]) {
            console.log(`- Sample Attendance (${firstDate}):`, sample.dailyAttendance[firstDate]);
          }
        }
      }

      // Check what frontend expects vs what it gets
      console.log('\n🔍 Frontend Compatibility Check:');
      console.log(`- Has reportData.data: ${!!data.data}`);
      console.log(`- Has reportData.employees: ${!!data.data?.employees}`);
      console.log(`- Has reportData.reportType: ${data.data?.reportType}`);
      console.log(`- Has reportData.dates: ${!!data.data?.dates}`);

      // Test if frontend condition would pass
      const hasData = data.data && data.data.employees && data.data.employees.length > 0;
      console.log(`- Frontend condition (hasData): ${hasData}`);

    } else {
      console.error('❌ API call failed:', response.status);
      console.error('Response:', response.text ? response.text() : 'No response text');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendFlow();
