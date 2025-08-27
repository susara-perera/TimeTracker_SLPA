const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/timetracker');
    console.log('✓ Connected to database');
    
    const users = await User.find({}, 'email role firstName lastName');
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Role: ${user.role}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
