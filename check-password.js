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

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const checkPassword = async () => {
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
    
    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Employee ID:', user.employeeId);
    console.log('- Role:', user.role);
    console.log('- Is Active:', user.isActive);
    console.log('- Login Attempts:', user.loginAttempts);
    console.log('- Lock Until:', user.lockUntil);
    console.log('- Password Hash:', user.password.substring(0, 20) + '...');
    
    // Test password
    console.log('\nTesting password: 248310');
    const isValid = await user.comparePassword('248310');
    console.log('Password valid:', isValid);
    
    // Test other passwords
    const testPasswords = ['susara_perera', 'SuperAdmin123!', 'admin123'];
    for (const pwd of testPasswords) {
      console.log(`Testing password: ${pwd}`);
      const valid = await user.comparePassword(pwd);
      console.log(`Password "${pwd}" valid:`, valid);
    }
    
    // Check if account is locked
    const isLocked = !!(user.lockUntil && user.lockUntil > Date.now());
    console.log('\nAccount locked:', isLocked);
    
    if (isLocked) {
      console.log('Unlock time:', new Date(user.lockUntil));
      console.log('Current time:', new Date());
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkPassword();
