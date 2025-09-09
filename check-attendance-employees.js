const { createMySQLConnection } = require('./backend/config/mysql');

async function checkAttendanceEmployees() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== EMPLOYEES WITH ATTENDANCE DATA ===');
    const [attendanceEmployees] = await connection.execute(`
      SELECT DISTINCT a.employee_ID, e.employee_name, e.division, d.division_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_ID = e.employee_ID
      LEFT JOIN divisions d ON e.division = d.division_id
      WHERE a.date_ = "2024-10-31"
      LIMIT 10
    `);
    console.log('Employees with attendance on 2024-10-31:', attendanceEmployees);

    console.log('\n=== SAMPLE ATTENDANCE DATA ===');
    const [sampleAttendance] = await connection.execute(`
      SELECT a.*, e.employee_name, e.division, d.division_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_ID = e.employee_ID
      LEFT JOIN divisions d ON e.division = d.division_id
      WHERE a.date_ = "2024-10-31"
      LIMIT 5
    `);
    console.log('Sample attendance with employee info:', sampleAttendance);

    await connection.end();

  } catch (error) {
    console.error('Check error:', error);
  }
}

checkAttendanceEmployees();
