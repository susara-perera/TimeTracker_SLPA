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

async function testAllFixes() {
  try {
    console.log('🧪 Testing All Console Error Fixes...\n');

    // Test 1: Dashboard stats endpoint
    console.log('1. Testing dashboard stats endpoint...');
    const statsResponse = await makeRequest('http://localhost:5000/api/dashboard/stats');
    
    if (statsResponse.ok) {
      const stats = statsResponse.json();
      console.log('✅ Dashboard stats working!');
      console.log(`  - Total users: ${stats.data.totalUsers}`);
      console.log(`  - Total divisions: ${stats.data.totalDivisions}`);
      console.log(`  - Today's employees present: ${stats.data.todayAttendance.employeesPresent}`);
    } else {
      console.error('❌ Dashboard stats failed:', statsResponse.status);
    }

    // Test 2: Division with MySQL sections (INFORMATION SYSTEM)
    console.log('\n2. Testing INFORMATION SYSTEM division sections...');
    const infoSystemResponse = await makeRequest('http://localhost:5000/api/divisions/689443a4c8066bb7f0b32a44/mysql-sections');
    
    if (infoSystemResponse.ok) {
      const sections = infoSystemResponse.json();
      console.log('✅ INFORMATION SYSTEM sections working!');
      console.log(`  - Found ${sections.data.length} sections`);
      console.log(`  - Mapping: MongoDB -> MySQL(${sections.mapping?.mysqlId})`);
    } else {
      console.error('❌ INFORMATION SYSTEM sections failed:', infoSystemResponse.status);
    }

    // Test 3: Division without MySQL sections (INTERNAL AUDIT)
    console.log('\n3. Testing INTERNAL AUDIT division sections...');
    const auditResponse = await makeRequest('http://localhost:5000/api/divisions/689443bac8066bb7f0b32a53/mysql-sections');
    
    if (auditResponse.ok) {
      const auditSections = auditResponse.json();
      console.log('✅ INTERNAL AUDIT sections gracefully handled!');
      console.log(`  - Found ${auditSections.data.length} sections (expected 0)`);
      console.log(`  - Message: ${auditSections.message}`);
      console.log(`  - No more 404 errors!`);
    } else {
      console.error('❌ INTERNAL AUDIT sections still returning error:', auditResponse.status);
    }

    // Test 4: Group report with MongoDB division ID
    console.log('\n4. Testing group report with MongoDB division ID...');
    const reportPayload = {
      report_type: 'group',
      employee_id: '',
      division_id: '689443a4c8066bb7f0b32a44', // MongoDB ID
      section_id: '29', // MySQL section ID
      from_date: '2025-06-01',
      to_date: '2025-06-05'
    };
    
    const reportResponse = await makeRequest('http://localhost:5000/api/reports/mysql/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportPayload)
    });
    
    if (reportResponse.ok) {
      const report = reportResponse.json();
      console.log('✅ Group report working!');
      console.log(`  - Found ${report.data.employees?.length || 0} employees`);
      console.log(`  - Date range: ${report.data.dates?.length || 0} days`);
    } else {
      console.error('❌ Group report failed:', reportResponse.status);
    }

    console.log('\n🎉 All fixes tested! Check your browser console - the errors should be gone!');

  } catch (error) {
    console.error('Error:', error);
  }
}

testAllFixes();
