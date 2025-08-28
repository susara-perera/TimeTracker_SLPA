const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  try {
    const users = await User.find({});
    console.log('Users in slpa_timetracker database:');
    console.log('Total users:', users.length);
    console.log('');
    
    users.forEach(user => {
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Employee ID: ${user.employeeId}`);
      console.log(`Role: ${user.role}`);
      console.log(`MongoDB ID: ${user._id}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Login Attempts: ${user.loginAttempts || 0}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
});
