const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSampleUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    console.log(`Existing users: ${existingUsers}`);
    
    if (existingUsers > 1) {
      console.log('Sample users already exist');
      process.exit(0);
    }
    
    // Create sample divisions first
    const Division = require('./models/Division');
    const Section = require('./models/Section');
    
    // Create divisions
    const sampleDivisions = [
      { name: 'Human Resources', code: 'HR', description: 'Human Resources Division' },
      { name: 'Information Technology', code: 'IT', description: 'IT Division' },
      { name: 'Finance', code: 'FIN', description: 'Finance Division' }
    ];
    
    const createdDivisions = [];
    for (const divData of sampleDivisions) {
      const existingDiv = await Division.findOne({ code: divData.code });
      if (!existingDiv) {
        const division = new Division(divData);
        await division.save();
        createdDivisions.push(division);
        console.log(`Created division: ${divData.name}`);
      } else {
        createdDivisions.push(existingDiv);
      }
    }
    
    // Create sample users
    const sampleUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@slpa.lk',
        employeeId: 'EMP001',
        password: 'password123',
        role: 'admin',
        division: createdDivisions[0]._id,
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@slpa.lk',
        employeeId: 'EMP002',
        password: 'password123',
        role: 'clerk',
        division: createdDivisions[1]._id,
        isActive: true
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@slpa.lk',
        employeeId: 'EMP003',
        password: 'password123',
        role: 'employee',
        division: createdDivisions[1]._id,
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@slpa.lk',
        employeeId: 'EMP004',
        password: 'password123',
        role: 'administrative_clerk',
        division: createdDivisions[2]._id,
        isActive: false
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@slpa.lk',
        employeeId: 'ADM001',
        password: 'password123',
        role: 'super_admin',
        isActive: true
      }
    ];
    
    // Hash passwords and create users
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.firstName} ${userData.lastName} (${userData.employeeId})`);
    }
    
    console.log('Sample users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSampleUsers();
