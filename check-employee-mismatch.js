const { createMySQLConnection } = require('./backend/config/mysql');

async function checkEmployeeIdMismatch() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== ATTENDANCE EMPLOYEE IDs (SAMPLE) ===');
    const [attendanceEmpIds] = await connection.execute(`
      SELECT DISTINCT employee_ID 
      FROM attendance 
      WHERE date_ = "2024-10-31"
      LIMIT 10
    `);
    console.log('Employee IDs in attendance table:', attendanceEmpIds);

    console.log('\n=== EMPLOYEES TABLE EMPLOYEE IDs (SAMPLE) ===');
    const [employeeTableIds] = await connection.execute(`
      SELECT employee_ID, employee_name 
      FROM employees 
      LIMIT 10
    `);
    console.log('Employee IDs in employees table:', employeeTableIds);

    // Let's try a different date that might have better data
    console.log('\n=== TRYING DIFFERENT DATE - LATEST AVAILABLE ===');
    const [latestDate] = await connection.execute(`
      SELECT DISTINCT date_ 
      FROM attendance 
      ORDER BY date_ DESC 
      LIMIT 1
    `);
    
    if (latestDate.length > 0) {
      const date = latestDate[0].date_;
      console.log('Latest date:', date);
      
      const [latestAttendance] = await connection.execute(`
        SELECT a.employee_ID, a.date_, a.time_, a.scan_type, e.employee_name, e.division
        FROM attendance a
        LEFT JOIN employees e ON a.employee_ID = e.employee_ID
        WHERE a.date_ = ?
        LIMIT 5
      `, [date]);
      console.log('Latest attendance with employee info:', latestAttendance);
    }

    await connection.end();

  } catch (error) {
    console.error('Check error:', error);
  }
}

checkEmployeeIdMismatch();
