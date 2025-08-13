const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const User = require('./backend/models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const testLogin = async () => {
  await connectDB();
  
  try {
    // List all users
    console.log('\n=== ALL USERS IN DATABASE ===');
    const users = await User.find({})
      .select('firstName lastName email employeeId role isActive')
      .populate('division', 'name')
      .populate('section', 'name');
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) [${user.employeeId}] - Role: ${user.role} - Active: ${user.isActive}`);
      });
    }
    
    // Test different login credentials
    const testCredentials = [
      { email: 'susara_perera@admin', password: 'susara_perera' },
      { email: 'susaraperera33@gmail.com', password: 'susara_perera' },
      { employeeId: 'SP001', password: 'susara_perera' },
      { employeeId: 'CL001', password: 'clerk123' },
      { employeeId: 'AD001', password: 'admin123' },
      { employeeId: 'EM001', password: 'employee123' }
    ];
    
    console.log('\n=== TESTING LOGIN CREDENTIALS ===');
    
    for (const cred of testCredentials) {
      try {
        let user;
        if (cred.email) {
          user = await User.findOne({ email: cred.email });
          console.log(`\nTesting email: ${cred.email}`);
        } else {
          user = await User.findOne({ employeeId: cred.employeeId });
          console.log(`\nTesting employeeId: ${cred.employeeId}`);
        }
        
        if (!user) {
          console.log('❌ User not found');
          continue;
        }
        
        console.log(`✅ User found: ${user.fullName} (${user.role})`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Locked: ${user.isLocked}`);
        
        const isPasswordValid = await user.comparePassword(cred.password);
        console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`);
        
      } catch (error) {
        console.log(`❌ Error testing credential: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    process.exit(0);
  }
};

testLogin();
