const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    const users = await User.find({}, 'email employeeId firstName lastName isActive isLocked loginAttempts lockUntil');
    console.log('Users in database:');
    users.forEach(user => {
      console.log({
        email: user.email,
        employeeId: user.employeeId,
        name: user.firstName + ' ' + user.lastName,
        isActive: user.isActive,
        isLocked: user.isLocked,
        loginAttempts: user.loginAttempts,
        lockUntil: user.lockUntil
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
