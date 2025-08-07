const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const checkUser = async () => {
  try {
    const user = await User.findOne({ 
      $or: [
        { email: 'susaraperera33@gmail.com' },
        { employeeId: 'SP001' }
      ]
    });

    if (user) {
      console.log('User found:');
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Employee ID:', user.employeeId);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Role:', user.role);
      console.log('Is Active:', user.isActive);
      console.log('Is Locked:', user.isLocked);
      console.log('Login Attempts:', user.loginAttempts);
      console.log('Password hash length:', user.password ? user.password.length : 'No password');
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUser();
