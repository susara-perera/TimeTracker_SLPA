const { createMySQLConnection } = require('./backend/config/mysql');

async function checkAttendanceInDivision8() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== EMPLOYEES IN DIVISION 8 ===');
    const [empInDiv8] = await connection.execute('SELECT employee_ID, employee_name FROM employees WHERE division = "8" LIMIT 10');
    console.log('Employees in division 8:', empInDiv8);

    if (empInDiv8.length > 0) {
      const employeeIds = empInDiv8.map(emp => emp.employee_ID);
      const placeholders = employeeIds.map(() => '?').join(',');
      
      console.log('\n=== ATTENDANCE FOR DIVISION 8 EMPLOYEES ===');
      const [attendance] = await connection.execute(
        `SELECT employee_ID, date_, time_, scan_type 
         FROM attendance 
         WHERE employee_ID IN (${placeholders}) 
         AND date_ = "2024-10-31" 
         LIMIT 10`,
        employeeIds
      );
      console.log('Attendance records for division 8 employees on 2024-10-31:', attendance);
      
      // Check all dates for these employees
      console.log('\n=== ALL ATTENDANCE DATES FOR DIVISION 8 EMPLOYEES ===');
      const [allDates] = await connection.execute(
        `SELECT DISTINCT date_ 
         FROM attendance 
         WHERE employee_ID IN (${placeholders}) 
         ORDER BY date_ DESC 
         LIMIT 10`,
        employeeIds
      );
      console.log('Available dates for division 8 employees:', allDates);
    }

    await connection.end();

  } catch (error) {
    console.error('Check error:', error);
  }
}

checkAttendanceInDivision8();
