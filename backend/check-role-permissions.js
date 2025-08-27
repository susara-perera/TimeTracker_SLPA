const mongoose = require('mongoose');
const User = require('./models/User');

async function checkRolePermissions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/timetracker');
    console.log('✅ Connected to database');
    
    // Check current users and their role permissions
    const users = await User.find({}, 'firstName lastName email role permissions');
    
    console.log('\n📋 CURRENT USERS AND ROLE PERMISSIONS:');
    console.log('=' .repeat(60));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach(user => {
        console.log(`\n👤 ${user.firstName} ${user.lastName} (${user.role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role Permissions:`);
        
        const rolePerms = user.permissions?.roles || {};
        const roleManagePerms = user.permissions?.rolesManage || {};
        
        console.log(`     roles.read: ${rolePerms.read || false}`);
        console.log(`     roles.update: ${rolePerms.update || false}`);
        console.log(`     rolesManage.create: ${roleManagePerms.create || false}`);
        console.log(`     rolesManage.read: ${roleManagePerms.read || false}`);
        console.log(`     rolesManage.update: ${roleManagePerms.update || false}`);
        console.log(`     rolesManage.delete: ${roleManagePerms.delete || false}`);
        
        // Determine access level
        const hasRoleRead = rolePerms.read;
        const hasRoleUpdate = rolePerms.update;
        const hasRoleManage = roleManagePerms.read;
        
        console.log(`\n   📱 Frontend Access Level:`);
        if (!hasRoleRead && !hasRoleManage) {
          console.log(`     ❌ NO ACCESS - Cannot see role management`);
        } else if (hasRoleRead && !hasRoleUpdate) {
          console.log(`     👀 READ-ONLY - Can view but not modify permissions`);
        } else if (hasRoleRead && hasRoleUpdate) {
          console.log(`     ✏️  FULL ACCESS - Can view and modify permissions`);
        }
        
        if (hasRoleManage) {
          console.log(`     🔧 ROLE MANAGEMENT - Can manage role CRUD operations`);
        }
      });
    }
    
    // Test specific user permission checking
    console.log('\n\n🧪 TESTING PERMISSION LOGIC:');
    console.log('=' .repeat(60));
    
    const testUser = users.find(u => u.role === 'clerk') || users[0];
    if (testUser) {
      console.log(`\n🔍 Testing user: ${testUser.firstName} ${testUser.lastName}`);
      
      const permissions = testUser.permissions || {};
      const rolesRead = permissions.roles?.read;
      const rolesUpdate = permissions.roles?.update;
      const rolesManageRead = permissions.rolesManage?.read;
      
      console.log('\n📋 Permission Check Results:');
      console.log(`   hasRoleReadPermission(): ${rolesRead ? 'true' : 'false'}`);
      console.log(`   hasRoleUpdatePermission(): ${rolesUpdate ? 'true' : 'false'}`);
      console.log(`   hasRoleManagePermission(): ${rolesManageRead ? 'true' : 'false'}`);
      
      console.log('\n🎯 Expected UI Behavior:');
      if (!rolesRead) {
        console.log('   ❌ Should see: "You do not have permission to view roles and permissions"');
        console.log('   ❌ Should NOT see: Manage Roles button');
        console.log('   ❌ Should NOT see: Role selection and permissions sections');
      } else {
        console.log('   ✅ Should see: Manage Roles button');
        console.log('   ✅ Should see: Role selection and permissions sections');
        
        if (!rolesUpdate) {
          console.log('   ⚠️  Should see: Disabled/read-only permissions interface');
          console.log('   ⚠️  Should see: "View Only" badges on permission categories');
          console.log('   ❌ Should NOT be able to: Modify permission checkboxes');
        } else {
          console.log('   ✅ Should be able to: Modify permission checkboxes');
          console.log('   ✅ Should be able to: Submit permission changes');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkRolePermissions();
