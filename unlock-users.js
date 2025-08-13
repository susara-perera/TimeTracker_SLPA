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

const unlockUsers = async () => {
  await connectDB();
  
  try {
    console.log('Unlocking all locked user accounts...');
    
    // Reset all locked accounts
    const result = await User.updateMany(
      { 
        $or: [
          { lockUntil: { $exists: true } },
          { loginAttempts: { $gt: 0 } }
        ]
      },
      { 
        $unset: { 
          lockUntil: 1,
          loginAttempts: 1 
        }
      }
    );
    
    console.log(`✅ Unlocked ${result.modifiedCount} user accounts`);
    
    // List all users after unlock
    const users = await User.find({})
      .select('firstName lastName email employeeId role isActive lockUntil loginAttempts')
      .lean();
    
    console.log('\n=== ALL USERS STATUS ===');
    users.forEach((user, index) => {
      const isLocked = user.lockUntil && user.lockUntil > new Date();
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Locked: ${isLocked ? '🔒 YES' : '✅ NO'}`);
      console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error during unlock:', error);
  } finally {
    process.exit(0);
  }
};

unlockUsers();
