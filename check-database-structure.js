const { createMySQLConnection } = require('./backend/config/mysql');

async function checkDatabase() {
  try {
    const connection = await createMySQLConnection();

    console.log('=== CHECKING DIVISIONS ===');
    const [divisions] = await connection.execute('SELECT * FROM divisions LIMIT 10');
    console.log('Divisions:', divisions);

    console.log('\n=== CHECKING EMPLOYEES ===');
    const [employees] = await connection.execute('SELECT * FROM employees LIMIT 10');
    console.log('Employees:', employees);

    console.log('\n=== CHECKING ATTENDANCE ===');
    const [attendance] = await connection.execute('SELECT * FROM attendance WHERE date_ = "2024-11-01" LIMIT 5');
    console.log('Attendance for 2024-11-01:', attendance);

    // Check available dates
    console.log('\n=== CHECKING AVAILABLE DATES ===');
    const [dates] = await connection.execute('SELECT DISTINCT date_ FROM attendance ORDER BY date_ DESC LIMIT 10');
    console.log('Available dates:', dates);

    // Check if there are employees with division = 2
    console.log('\n=== CHECKING EMPLOYEES IN DIVISION 2 ===');
    const [empInDiv2] = await connection.execute('SELECT * FROM employees WHERE division = 2 LIMIT 5');
    console.log('Employees in division 2:', empInDiv2);

    await connection.end();

  } catch (error) {
    console.error('Database check error:', error);
  }
}

checkDatabase();
