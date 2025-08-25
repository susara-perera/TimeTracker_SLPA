const mongoose = require('mongoose');
const User = require('./backend/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateUserPermissions = async () => {
  try {
    console.log('Starting user permissions update...');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      // Check if user already has roles permission
      if (!user.permissions.roles) {
        // Set default roles permission based on user's role
        let rolesPermission;
        
        switch (user.role) {
          case 'super_admin':
            rolesPermission = { create: true, read: true, update: true, delete: true };
            break;
          case 'admin':
            rolesPermission = { create: false, read: true, update: false, delete: false };
            break;
          case 'administrative_clerk':
            rolesPermission = { create: false, read: true, update: false, delete: false };
            break;
          case 'clerk':
            rolesPermission = { create: false, read: false, update: false, delete: false };
            break;
          default: // employee
            rolesPermission = { create: false, read: false, update: false, delete: false };
        }
        
        user.permissions.roles = rolesPermission;
        await user.save();
        updatedCount++;
        
        console.log(`Updated user: ${user.email} (${user.role})`);
      } else {
        console.log(`User ${user.email} already has roles permission`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} users with roles permissions`);
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('❌ Error updating user permissions:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateUserPermissions();
