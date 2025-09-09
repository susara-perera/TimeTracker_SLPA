const { createMySQLConnection } = require('./backend/config/mysql');

async function debugGroupReport() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== DEBUGGING GROUP ATTENDANCE REPORT ===\n');

    // 1. Check available divisions
    console.log('1. Available Divisions:');
    const [divisions] = await connection.execute('SELECT division_id, division_name FROM divisions ORDER BY division_name');
    divisions.forEach(div => {
      console.log(`   - ID: ${div.division_id}, Name: ${div.division_name}`);
    });

    // 2. Check INFORMATION SYSTEM division specifically
    console.log('\n2. INFORMATION SYSTEM Division Details:');
    const [infoDiv] = await connection.execute('SELECT * FROM divisions WHERE division_name LIKE "%INFORMATION%"');
    console.log('   Info Division:', infoDiv);

    // 3. Check employees in INFORMATION SYSTEM division
    console.log('\n3. Employees in INFORMATION SYSTEM division:');
    const [empCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM employees 
      WHERE division = '8'
    `);
    console.log(`   Total employees: ${empCount[0].count}`);

    // 4. Check sections for INFORMATION SYSTEM division
    console.log('\n4. Sections in INFORMATION SYSTEM division:');
    const [sections] = await connection.execute(`
      SELECT DISTINCT s.section_id, s.section_name 
      FROM sections s
      INNER JOIN employees e ON s.section_id = e.section
      WHERE e.division = '8'
      ORDER BY s.section_name
    `);
    console.log('   Sections:', sections);

    // 5. Check attendance date ranges
    console.log('\n5. Available Attendance Date Ranges:');
    const [dateRange] = await connection.execute(`
      SELECT 
        MIN(date_) as earliest_date,
        MAX(date_) as latest_date,
        COUNT(*) as total_records
      FROM attendance
    `);
    console.log(`   Date range: ${dateRange[0].earliest_date} to ${dateRange[0].latest_date}`);
    console.log(`   Total records: ${dateRange[0].total_records}`);

    // 6. Check specific dates around your query
    console.log('\n6. Attendance data for dates around 2025-06:');
    const [june2025] = await connection.execute(`
      SELECT DISTINCT date_, COUNT(*) as count
      FROM attendance 
      WHERE date_ BETWEEN '2025-06-01' AND '2025-06-30'
      GROUP BY date_
      ORDER BY date_
      LIMIT 10
    `);
    console.log('   June 2025 data:', june2025);

    // 7. Check attendance for INFORMATION SYSTEM employees
    console.log('\n7. Recent attendance for INFORMATION SYSTEM employees:');
    const [recentAttendance] = await connection.execute(`
      SELECT DISTINCT a.date_, COUNT(*) as count
      FROM attendance a
      INNER JOIN employees e ON a.employee_ID = e.employee_ID
      WHERE e.division = '8'
      GROUP BY a.date_
      ORDER BY a.date_ DESC
      LIMIT 10
    `);
    console.log('   Recent dates with attendance:', recentAttendance);

    // 8. Test the exact query that would be used for group report
    console.log('\n8. Testing Group Report Query for INFORMATION SYSTEM:');
    const [testQuery] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM employees e
      WHERE e.division = '8'
    `);
    console.log(`   Employees in division 8: ${testQuery[0].count}`);

    const [testAttendance] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM attendance a
      INNER JOIN employees e ON a.employee_ID = e.employee_ID
      WHERE e.division = '8'
      AND a.date_ BETWEEN '2025-06-01' AND '2025-06-05'
    `);
    console.log(`   Attendance records for division 8 between 2025-06-01 and 2025-06-05: ${testAttendance[0].count}`);

    await connection.end();

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugGroupReport();
