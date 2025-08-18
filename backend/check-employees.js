const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkEmployees() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
    
    console.log('Connected to MySQL');
    
    const [employees] = await connection.execute(`
      SELECT e.*, d.division_name, s.section_name 
      FROM employees e 
      LEFT JOIN divisions d ON e.division_id = d.id 
      LEFT JOIN sections s ON e.section_id = s.id 
      ORDER BY e.id 
      LIMIT 10
    `);
    
    console.log('Sample employees from MySQL:');
    employees.forEach(emp => {
      console.log({
        id: emp.id,
        emp_id: emp.emp_id,
        name: emp.first_name + ' ' + emp.last_name,
        email: emp.email,
        division: emp.division_name,
        section: emp.section_name
      });
    });
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployees();
