const mongoose = require('mongoose');
require('dotenv').config();

async function resetLocks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    const result = await User.updateMany(
      {},
      { 
        $unset: { 
          lockUntil: 1, 
          loginAttempts: 1 
        } 
      }
    );
    
    console.log('Reset result:', result);
    console.log('All user accounts unlocked and login attempts reset');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetLocks();
