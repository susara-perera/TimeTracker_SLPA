const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// User schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  employeeId: String,
  password: String,
  role: String,
  isActive: Boolean,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
});

const User = mongoose.model('User', userSchema);

const fixSuperAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    // Find the super admin user
    const user = await User.findOne({ email: 'susaraperera33@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('Current status - Locked:', !!(user.lockUntil && user.lockUntil > Date.now()));
    console.log('Login attempts:', user.loginAttempts);
    
    // Hash the new password
    console.log('\n🔄 Setting new password to: 248310');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('248310', saltRounds);
    
    // Update user with new password and unlock account
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      loginAttempts: 0,
      $unset: { lockUntil: 1 }
    });
    
    console.log('✅ User updated successfully!');
    console.log('- Password set to: 248310');
    console.log('- Account unlocked');
    console.log('- Login attempts reset to 0');
    
    // Verify the changes
    const updatedUser = await User.findById(user._id);
    const isPasswordValid = await bcrypt.compare('248310', updatedUser.password);
    const isLocked = !!(updatedUser.lockUntil && updatedUser.lockUntil > Date.now());
    
    console.log('\n✅ Verification:');
    console.log('- Password "248310" is valid:', isPasswordValid);
    console.log('- Account is locked:', isLocked);
    console.log('- Login attempts:', updatedUser.loginAttempts);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

fixSuperAdmin();
