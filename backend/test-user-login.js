const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/slpa_attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testLogin = async () => {
  try {
    const user = await User.findOne({ email: 'susaraperera33@gmail.com' });
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Locked:', user.lockUntil ? 'YES' : 'NO');
      console.log('Login attempts:', user.loginAttempts);
      
      // Test password
      const isValidPassword = await bcrypt.compare('susara123', user.password);
      console.log('Password valid:', isValidPassword);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testLogin();
