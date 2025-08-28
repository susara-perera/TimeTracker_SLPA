const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const unlockAllUsers = async () => {
  try {
    console.log('🔓 Unlocking all users and resetting login attempts...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // Reset login attempts and remove lock for all users
    const result = await User.updateMany(
      {},
      {
        $unset: { 
          lockUntil: 1 
        },
        $set: { 
          loginAttempts: 0,
          isActive: true
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users`);
    
    // Display updated users
    const updatedUsers = await User.find({}, 'firstName lastName email employeeId role loginAttempts isActive');
    console.log('\n👥 Updated users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.employeeId})`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Login Attempts: ${user.loginAttempts}`);
      console.log(`  Active: ${user.isActive}`);
      console.log('');
    });
    
    console.log('🎉 All users unlocked and reset successfully!');
    console.log('\n📋 You can now login with these credentials:');
    console.log('- susaraperera33@gmail.com (or SP001)');
    console.log('- shenuka@slpa.com (or 2002)');
    console.log('- doni@slpa.com (or 0123)');
    console.log('- bawantha@slpa.com (or 8250651)');
    console.log('- srilanka@gmail.com (or EMP070)');
    console.log('- helloworld@slpa.com (or EMP010)');
    console.log('- admin@slpa.com (or EMP728)');
    console.log('- adminclerk@slpa.com (or EMP329)');
    
  } catch (error) {
    console.error('❌ Error unlocking users:', error);
  } finally {
    mongoose.connection.close();
  }
};

unlockAllUsers();
