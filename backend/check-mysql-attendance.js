const { createMySQLConnection } = require('./config/mysql');

async function checkMySQLAttendance() {
  try {
    const connection = await createMySQLConnection();
    console.log('Connected to MySQL database');
    
    // Check if attendance table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'attendance'");
    console.log('Attendance table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Show table structure
      const [structure] = await connection.execute('DESCRIBE attendance');
      console.log('Table structure:');
      structure.forEach(field => {
        console.log(`  ${field.Field}: ${field.Type}`);
      });
      
      // Count records
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
      console.log('Total attendance records:', count[0].count);
      
      // Show sample records
      if (count[0].count > 0) {
        const [sample] = await connection.execute('SELECT * FROM attendance LIMIT 5');
        console.log('Sample records:', sample);
      }
    } else {
      console.log('Attendance table does not exist. Let me check what tables are available:');
      const [allTables] = await connection.execute('SHOW TABLES');
      console.log('Available tables:', allTables.map(t => Object.values(t)[0]));
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMySQLAttendance();
