const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    const user = await User.findOne({ email: 'susaraperera33@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('susara', salt);
    
    // Update the user's password directly
    await User.updateOne(
      { email: 'susaraperera33@gmail.com' },
      { 
        password: hashedPassword,
        $unset: { 
          lockUntil: 1, 
          loginAttempts: 1 
        }
      }
    );
    
    console.log('Password reset to "susara" for susaraperera33@gmail.com');
    console.log('User unlocked and login attempts reset');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
