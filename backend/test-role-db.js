const mongoose = require('mongoose');
const Role = require('./models/Role');

async function testRoles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/timetracker');
    console.log('✓ Connected to database');
    
    // Check existing roles
    const roles = await Role.find();
    console.log('\n📋 Current roles in database:');
    roles.forEach(role => {
      console.log(`  - ID: ${role._id}`);
      console.log(`    Value: ${role.value}`);
      console.log(`    Label: ${role.label}`);
      console.log(`    Name: ${role.name}`);
      console.log(`    Description: ${role.description}`);
      console.log(`    Permissions: ${JSON.stringify(role.permissions, null, 2)}`);
      console.log(`    Created: ${role.createdAt}`);
      console.log('');
    });
    
    // Test creating a new role
    console.log('🧪 Testing role creation...');
    const testRole = {
      value: 'test_manager',
      label: 'Test Manager',
      description: 'A test role for verification'
    };
    
    const newRole = await Role.create(testRole);
    console.log('✓ Test role created:', newRole);
    
    // Test updating the role
    console.log('\n🔄 Testing role update...');
    const updatedRole = await Role.findByIdAndUpdate(newRole._id, {
      label: 'Updated Test Manager',
      permissions: { users: { read: true, create: false } }
    }, { new: true });
    console.log('✓ Test role updated:', updatedRole);
    
    // Test deleting the role
    console.log('\n🗑️ Testing role deletion...');
    await Role.findByIdAndDelete(newRole._id);
    console.log('✓ Test role deleted');
    
    console.log('\n✅ All role operations working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRoles();
