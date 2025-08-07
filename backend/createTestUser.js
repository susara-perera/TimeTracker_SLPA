const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const createTestUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: 'susaraperera33@gmail.com' },
        { employeeId: 'SP001' }
      ]
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email || existingUser.employeeId);
      
      // Update password for testing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('Password updated to: password123');
      process.exit(0);
    }

    // Create new test user
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const testUser = new User({
      firstName: 'Susara',
      lastName: 'Perera',
      email: 'susaraperera33@gmail.com',
      employeeId: 'SP001',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      isLocked: false,
      loginAttempts: 0,
      dateOfJoining: new Date('2025-08-05'),
      permissions: {
        dashboard: { read: true, write: true },
        users: { read: true, write: true, delete: true },
        attendance: { read: true, write: true, delete: true },
        reports: { read: true, write: true, export: true },
        settings: { read: true, write: true }
      }
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: susaraperera33@gmail.com');
    console.log('Employee ID: SP001');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();
