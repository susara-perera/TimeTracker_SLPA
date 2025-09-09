const { createMySQLConnection } = require('./config/mysql');

async function debugGroupAttendance() {
  try {
    console.log('🔍 Debugging Group Attendance Issue...\n');

    // Test MySQL connection
    console.log('1. Testing MySQL connection...');
    const connection = await createMySQLConnection();
    console.log('✅ MySQL connection successful');

    // Test basic query
    console.log('\n2. Testing basic MySQL queries...');
    const [basicTest] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
    console.log(`Total attendance records: ${basicTest[0].count}`);

    // Test divisions
    console.log('\n3. Testing divisions...');
    const [divisions] = await connection.execute('SELECT division_id, division_name FROM divisions ORDER BY division_name');
    console.log('Available divisions:');
    divisions.forEach(div => {
      console.log(`  - ID: ${div.division_id}, Name: ${div.division_name}`);
    });

    // Test sections for INFORMATION SYSTEMS (division 8)
    console.log('\n4. Testing sections for INFORMATION SYSTEMS...');
    const [sections] = await connection.execute(`
      SELECT s.section_id, s.section_name, s.division_id, d.division_name
      FROM sections s
      LEFT JOIN divisions d ON s.division_id = d.division_id
      WHERE s.division_id = ?
      ORDER BY s.section_name ASC
    `, ['8']);
    
    console.log('Sections in INFORMATION SYSTEMS:');
    sections.forEach(section => {
      console.log(`  - ID: ${section.section_id}, Name: ${section.section_name}`);
    });

    // Test employees in IS JCT section (section 29)
    console.log('\n5. Testing employees in IS JCT section...');
    const [employees] = await connection.execute(`
      SELECT e.employee_ID, e.employee_name, d.division_name, s.section_name
      FROM employees e
      LEFT JOIN divisions d ON e.division = d.division_id
      LEFT JOIN sections s ON e.section = s.section_id
      WHERE e.section = ?
      ORDER BY e.employee_ID ASC
      LIMIT 10
    `, ['29']);
    
    console.log(`Found ${employees.length} employees in IS JCT section:`);
    employees.forEach(emp => {
      console.log(`  - ID: ${emp.employee_ID}, Name: ${emp.employee_name}`);
    });

    // Test attendance data for these employees in June 2025
    if (employees.length > 0) {
      console.log('\n6. Testing attendance data for June 2025...');
      const employeeIds = employees.map(emp => emp.employee_ID);
      const placeholders = employeeIds.map(() => '?').join(',');
      
      const [attendance] = await connection.execute(`
        SELECT employee_ID, date_, time_, scan_type, COUNT(*) as record_count
        FROM attendance
        WHERE date_ BETWEEN '2025-06-01' AND '2025-06-05'
        AND employee_ID IN (${placeholders})
        GROUP BY employee_ID, date_
        ORDER BY date_ ASC, employee_ID ASC
        LIMIT 20
      `, employeeIds);
      
      console.log(`Found ${attendance.length} attendance records:`);
      attendance.forEach(att => {
        console.log(`  - Employee: ${att.employee_ID}, Date: ${att.date_}, Records: ${att.record_count}`);
      });
    }

    // Test the group report generation function directly
    console.log('\n7. Testing group report generation...');
    const { generateMySQLGroupAttendanceReport } = require('./controllers/reportController');
    
    try {
      // Test with division 8 (INFORMATION SYSTEMS)
      const groupReport = await generateMySQLGroupAttendanceReport(
        '2025-06-01', 
        '2025-06-05', 
        '8',  // MySQL division ID
        null  // No specific section
      );
      
      console.log('Group report generated successfully!');
      console.log(`- Report type: ${groupReport.reportType}`);
      console.log(`- Employees found: ${groupReport.employees?.length || 0}`);
      console.log(`- Date range: ${groupReport.dates?.length || 0} days`);
      
      if (groupReport.employees && groupReport.employees.length > 0) {
        console.log('Sample employee data:');
        const sample = groupReport.employees[0];
        console.log(`  - Employee: ${sample.employeeName} (${sample.employeeId})`);
        console.log(`  - Division: ${sample.division}`);
        console.log(`  - Section: ${sample.section}`);
      }
      
    } catch (error) {
      console.error('❌ Group report generation failed:', error.message);
    }

    await connection.end();
    console.log('\n✅ Debug completed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugGroupAttendance();
