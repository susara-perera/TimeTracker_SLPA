const mongoose = require('mongoose');
const User = require('./models/User');

const findAndImportOriginalUsers = async () => {
  try {
    console.log('🔍 Finding your original MongoDB users...');
    
    // First, let's check different possible database names
    const possibleDatabases = [
      'slpa_timetracker',
      'timetracker', 
      'slpa_attendance',
      'slpa_db',
      'slpa',
      'attendance_system'
    ];
    
    let originalUsers = [];
    let sourceDatabase = '';
    
    for (const dbName of possibleDatabases) {
      try {
        await mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        const users = await User.find({});
        console.log(`Database '${dbName}': Found ${users.length} users`);
        
        // Check if this contains your specific users by looking for your email
        const susaraUser = users.find(u => u.email === 'susaraperera33@gmail.com');
        const bawanthaUser = users.find(u => u.email === 'bawantha@slpa.com');
        
        if (susaraUser && bawanthaUser && users.length >= 8) {
          console.log(`✅ Found your original users in database: ${dbName}`);
          originalUsers = users;
          sourceDatabase = dbName;
          break;
        }
        
        await mongoose.connection.close();
      } catch (error) {
        console.log(`Database '${dbName}': Not accessible or doesn't exist`);
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
        }
      }
    }
    
    if (originalUsers.length === 0) {
      console.log('❌ Could not find your original users in any database');
      return;
    }
    
    console.log(`\n🔄 Importing ${originalUsers.length} users from ${sourceDatabase}...`);
    
    // Connect to the target database (slpa_timetracker)
    await mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear all existing users first
    await User.deleteMany({});
    console.log('🗑️ Cleared existing test users');
    
    // Import all original users
    const importedUsers = [];
    for (const originalUser of originalUsers) {
      const newUser = new User({
        _id: originalUser._id,
        firstName: originalUser.firstName,
        lastName: originalUser.lastName,
        email: originalUser.email,
        employeeId: originalUser.employeeId,
        password: originalUser.password,
        role: originalUser.role,
        division: originalUser.division,
        section: originalUser.section,
        address: originalUser.address,
        permissions: originalUser.permissions,
        isActive: originalUser.isActive,
        dateOfJoining: originalUser.dateOfJoining,
        createdAt: originalUser.createdAt,
        updatedAt: originalUser.updatedAt,
        lastLogin: originalUser.lastLogin,
        loginAttempts: 0, // Reset login attempts
        // Don't include lockUntil to unlock accounts
        __v: originalUser.__v
      });
      
      await newUser.save();
      importedUsers.push(newUser);
      console.log(`✅ Imported: ${newUser.firstName} ${newUser.lastName} (${newUser.email})`);
    }
    
    console.log(`\n🎉 Successfully imported ${importedUsers.length} original users!`);
    console.log('\n👥 Your users are now available:');
    importedUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.employeeId}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
};

findAndImportOriginalUsers();
