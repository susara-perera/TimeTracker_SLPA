const mongoose = require('mongoose');
const User = require('./models/User');

const copyAllUsers = async () => {
  try {
    console.log('🔄 Copying all users from different databases...');
    
    // Connect to the main database (slpa_timetracker)
    await mongoose.connect('mongodb://localhost:27017/slpa_timetracker');
    
    // Get all existing users from slpa_timetracker
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} users in slpa_timetracker`);
    
    // Close connection
    await mongoose.connection.close();
    
    // Connect to slpa_attendance database to get the test users
    await mongoose.connect('mongodb://localhost:27017/slpa_attendance');
    const testUsers = await User.find({});
    console.log(`Found ${testUsers.length} users in slpa_attendance`);
    
    if (testUsers.length > 0) {
      // Close connection
      await mongoose.connection.close();
      
      // Connect back to main database
      await mongoose.connect('mongodb://localhost:27017/slpa_timetracker');
      
      // Add test users to main database (skip if email already exists)
      for (const testUser of testUsers) {
        const existingUser = await User.findOne({ email: testUser.email });
        if (!existingUser) {
          const newUser = new User({
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
            employeeId: testUser.employeeId,
            password: testUser.password,
            role: testUser.role,
            division: testUser.division,
            section: testUser.section,
            isActive: testUser.isActive,
            dateOfJoining: testUser.dateOfJoining
          });
          
          await newUser.save();
          console.log(`✅ Added user: ${newUser.firstName} ${newUser.lastName}`);
        } else {
          console.log(`⚠️ User already exists: ${testUser.email}`);
        }
      }
    }
    
    // Final count
    const finalUsers = await User.find({});
    console.log(`\n🎉 Total users now: ${finalUsers.length}`);
    
    finalUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

copyAllUsers();
