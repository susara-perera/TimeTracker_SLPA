const mysql = require('mysql2/promise');
require('dotenv').config();

const checkExistingTables = async () => {
  try {
    console.log('🔍 Checking existing MySQL database structure...\n');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'slpa_db'
    });
    
    console.log('✅ Connected to MySQL database: slpa_db');
    
    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Existing tables:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });
    
    // Check users table structure if it exists
    const userTableExists = tables.some(table => Object.values(table)[0] === 'users');
    if (userTableExists) {
      console.log('\n🔍 Current users table structure:');
      const [columns] = await connection.execute('DESCRIBE users');
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ` [${col.Key}]` : ''}`);
      });
      
      // Count existing users
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Existing users count: ${userCount[0].count}`);
      
      if (userCount[0].count > 0) {
        console.log('\n📋 Sample user data:');
        const [users] = await connection.execute('SELECT * FROM users LIMIT 3');
        users.forEach((user, index) => {
          console.log(`${index + 1}.`, Object.keys(user).slice(0, 5).map(key => `${key}: ${user[key]}`).join(', '));
        });
      }
    }
    
    await connection.end();
    console.log('\n🔌 MySQL connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkExistingTables();
