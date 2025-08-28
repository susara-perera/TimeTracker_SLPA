const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const resetUserPassword = async () => {
  try {
    console.log('🔄 Resetting user passwords...');
    
    // Reset Susara's password
    const hashedPassword = await bcrypt.hash('susara123', 10);
    const result1 = await User.updateOne(
      { email: 'susaraperera33@gmail.com' },
      { 
        password: hashedPassword,
        loginAttempts: 0,
        $unset: { lockUntil: 1 }
      }
    );
    
    // Reset Bawantha's password
    const hashedPassword2 = await bcrypt.hash('bawantha123', 10);
    const result2 = await User.updateOne(
      { email: 'bawantha@slpa.com' },
      { 
        password: hashedPassword2,
        loginAttempts: 0,
        $unset: { lockUntil: 1 }
      }
    );
    
    // Reset other passwords to simple ones
    const hashedPassword3 = await bcrypt.hash('shenuka123', 10);
    await User.updateOne(
      { email: 'shenuka@slpa.com' },
      { 
        password: hashedPassword3,
        loginAttempts: 0,
        $unset: { lockUntil: 1 }
      }
    );
    
    const hashedPassword4 = await bcrypt.hash('amaya123', 10);
    await User.updateOne(
      { email: 'doni@slpa.com' },
      { 
        password: hashedPassword4,
        loginAttempts: 0,
        $unset: { lockUntil: 1 }
      }
    );
    
    console.log('✅ Passwords reset successfully!');
    console.log('\n📋 Updated login credentials:');
    console.log('Super Admin: admin@slpa.lk / admin123');
    console.log('Susara: susaraperera33@gmail.com / susara123');
    console.log('Bawantha: bawantha@slpa.com / bawantha123');
    console.log('Shenuka: shenuka@slpa.com / shenuka123');
    console.log('Amaya: doni@slpa.com / amaya123');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetUserPassword();
