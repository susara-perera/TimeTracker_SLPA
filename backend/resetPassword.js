const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const resetPassword = async () => {
  try {
    const user = await User.findOne({ email: 'susaraperera33@gmail.com' });
    
    if (user) {
      console.log('Resetting password for user:', user.email);
      
      // Set a simple password directly (bypassing the pre-save hook)
      const newPassword = 'admin123';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the password directly
      await User.updateOne(
        { email: 'susaraperera33@gmail.com' },
        { 
          password: hashedPassword,
          loginAttempts: 0,
          isLocked: false
        }
      );
      
      console.log('Password updated successfully!');
      console.log('New password:', newPassword);
      
      // Test the new password
      const updatedUser = await User.findOne({ email: 'susaraperera33@gmail.com' });
      const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
      console.log('Password verification:', isMatch);
      
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetPassword();
