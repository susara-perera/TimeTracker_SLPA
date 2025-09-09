const mysql = require('mysql2/promise');

// Import the MySQL configuration
const { createMySQLConnection } = require('./config/mysql');

async function testFrontendRequest() {
  try {
    console.log('Testing Frontend Request Simulation...\n');

    // This simulates what the frontend is sending
    const frontendPayload = {
      report_type: 'group',
      employee_id: '',
      division_id: '8',  // This is what frontend sends
      section_id: '3',   // IS JCT section
      from_date: '2025-06-01',
      to_date: '2025-06-05'
    };

    console.log('Frontend payload:', JSON.stringify(frontendPayload, null, 2));

    // Test the exact SQL query that the backend uses
    const connection = await createMySQLConnection();

    // This is from generateMySQLGroupAttendanceReport function
    let employeeSql = `
      SELECT e.employee_ID, e.employee_name, d.division_name, s.section_name
      FROM employees e
      LEFT JOIN divisions d ON e.division = d.division_id
      LEFT JOIN sections s ON e.section = s.section_id
      WHERE 1=1
    `;
    let employeeParams = [];

    const { division_id, section_id } = frontendPayload;

    if (section_id && section_id !== 'all') {
      employeeSql += ' AND e.section = ?';
      employeeParams.push(section_id);
      console.log(`\nAdding section filter: section = ${section_id}`);
    } else if (division_id && division_id !== 'all') {
      employeeSql += ' AND e.division = ?';
      employeeParams.push(division_id);
      console.log(`\nAdding division filter: division = ${division_id}`);
    }

    employeeSql += ' ORDER BY e.employee_ID ASC';

    console.log('\nExecuting employee query:');
    console.log('SQL:', employeeSql);
    console.log('Params:', employeeParams);

    const [employees] = await connection.execute(employeeSql, employeeParams);
    
    console.log(`\nFound ${employees.length} employees:`);
    if (employees.length > 0) {
      console.log('Sample employees:');
      employees.slice(0, 3).forEach(emp => {
        console.log(`  - ID: ${emp.employee_ID}, Name: ${emp.employee_name}, Division: ${emp.division_name}, Section: ${emp.section_name}`);
      });
    }

    if (employees.length === 0) {
      console.log('\n❌ NO EMPLOYEES FOUND! This explains the "No records found" error.');
      
      // Let's check what sections exist for division 8
      console.log('\nChecking available sections for division 8:');
      const [sections] = await connection.execute(
        'SELECT DISTINCT s.section_id, s.section_name FROM sections s WHERE s.division_id = ?',
        ['8']
      );
      
      console.log('Available sections in division 8:');
      sections.forEach(section => {
        console.log(`  - ID: ${section.section_id}, Name: ${section.section_name}`);
      });

      // Check employees in division 8 regardless of section
      console.log('\nChecking employees in division 8 (any section):');
      const [divEmployees] = await connection.execute(
        'SELECT e.employee_ID, e.employee_name, e.section FROM employees e WHERE e.division = ?',
        ['8']
      );
      
      console.log(`Found ${divEmployees.length} employees in division 8:`);
      divEmployees.slice(0, 5).forEach(emp => {
        console.log(`  - ID: ${emp.employee_ID}, Name: ${emp.employee_name}, Section: ${emp.section}`);
      });
    }

    await connection.end();

  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendRequest();
