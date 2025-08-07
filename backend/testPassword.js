const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const testPassword = async () => {
  try {
    const user = await User.findOne({ email: 'susaraperera33@gmail.com' });
    
    if (user) {
      console.log('Testing password for user:', user.email);
      
      // Test the password
      const isMatch1 = await user.comparePassword('password123');
      console.log('Password "password123" matches:', isMatch1);
      
      const isMatch2 = await bcrypt.compare('password123', user.password);
      console.log('Direct bcrypt compare:', isMatch2);
      
      // Test other possibilities
      const isMatch3 = await user.comparePassword('Password123');
      console.log('Password "Password123" matches:', isMatch3);
      
      const isMatch4 = await user.comparePassword('123456');
      console.log('Password "123456" matches:', isMatch4);
      
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error testing password:', error);
  } finally {
    mongoose.connection.close();
  }
};

testPassword();
