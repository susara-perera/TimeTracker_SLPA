const { createMySQLConnection } = require('./backend/config/mysql');

async function checkDivision8AttendanceData() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== CHECKING DIVISION 8 (INFORMATION SYSTEMS) DATA ===');
    
    // Check if there are any employees in division 8 with attendance
    const [empWithAttendance] = await connection.execute(`
      SELECT DISTINCT e.employee_ID, e.employee_name, a.date_
      FROM employees e
      INNER JOIN attendance a ON e.employee_ID = a.employee_ID
      WHERE e.division = '8'
      ORDER BY a.date_ DESC
      LIMIT 10
    `);
    
    console.log('Division 8 employees with attendance:', empWithAttendance);
    
    if (empWithAttendance.length === 0) {
      console.log('\nNo attendance data found for INFORMATION SYSTEMS division employees.');
      console.log('Let\'s check what divisions have recent attendance data...\n');
      
      const [activeDivisions] = await connection.execute(`
        SELECT d.division_id, d.division_name, COUNT(DISTINCT a.employee_ID) as employee_count,
               MAX(a.date_) as latest_date, MIN(a.date_) as earliest_date
        FROM divisions d
        INNER JOIN employees e ON d.division_id = e.division
        INNER JOIN attendance a ON e.employee_ID = a.employee_ID
        WHERE a.date_ >= '2025-07-01'
        GROUP BY d.division_id, d.division_name
        ORDER BY employee_count DESC
        LIMIT 5
      `);
      
      console.log('Top 5 divisions with recent attendance data (July 2025+):');
      activeDivisions.forEach((div, index) => {
        console.log(`${index + 1}. ${div.division_name} (ID: ${div.division_id})`);
        console.log(`   - ${div.employee_count} employees with attendance`);
        console.log(`   - Date range: ${div.earliest_date} to ${div.latest_date}`);
      });
    }

    await connection.end();

  } catch (error) {
    console.error('Check error:', error);
  }
}

checkDivision8AttendanceData();
