const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Division = require('./models/Division');
const Section = require('./models/Section');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createSimpleUsers = async () => {
  try {
    console.log('🔄 Creating simple test users...');
    
    // Get divisions and sections
    const divisions = await Division.find({});
    const sections = await Section.find({}).populate('division');
    
    console.log(`Found ${divisions.length} divisions and ${sections.length} sections`);
    
    if (divisions.length === 0) {
      console.log('❌ No divisions found. Please create divisions first.');
      return;
    }
    
    // Clear existing users
    await User.deleteMany({});
    
    // Get some sections for assignment
    const itSection = sections.find(s => s.name === 'Software Development');
    const financeSection = sections.find(s => s.name === 'Accounts Payable');
    const civilSection = sections.find(s => s.name === 'Project Management');
    
    // Get divisions
    const itDivision = divisions.find(d => d.name === 'Information Systems');
    const financeDivision = divisions.find(d => d.name === 'Finance');
    const civilDivision = divisions.find(d => d.name === 'Civil Engineering');
    
    // Create basic test users
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@slpa.lk',
        employeeId: 'ADM001',
        password: await bcrypt.hash('admin123', 10),
        role: 'super_admin',
        isActive: true
        // super_admin doesn't need division/section
      },
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@slpa.lk',
        employeeId: 'MGR001',
        password: await bcrypt.hash('manager123', 10),
        role: 'admin',
        division: itDivision ? itDivision._id : null,
        section: itSection ? itSection._id : null,
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Clerk',
        email: 'clerk@slpa.lk',
        employeeId: 'CLK001',
        password: await bcrypt.hash('clerk123', 10),
        role: 'clerk',
        division: financeDivision ? financeDivision._id : null,
        section: financeSection ? financeSection._id : null,
        isActive: true
      },
      {
        firstName: 'Bob',
        lastName: 'Employee',
        email: 'employee@slpa.lk',
        employeeId: 'EMP001',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        division: civilDivision ? civilDivision._id : null,
        section: civilSection ? civilSection._id : null,
        isActive: true
      },
      {
        firstName: 'Naflal',
        lastName: 'Senior',
        email: 'naflal@slpa.lk',
        employeeId: '3',
        password: await bcrypt.hash('naflal123', 10),
        role: 'administrative_clerk',
        division: itDivision ? itDivision._id : null,
        section: itSection ? itSection._id : null,
        isActive: true
      },
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@slpa.lk',
        employeeId: 'TEST001',
        password: await bcrypt.hash('test123', 10),
        role: 'employee',
        division: financeDivision ? financeDivision._id : null,
        section: financeSection ? financeSection._id : null,
        isActive: true
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log('✅ Users created:', createdUsers.length);
    
    // Display created users with populated division/section info
    console.log('\n👥 Created users:');
    for (const user of createdUsers) {
      const populatedUser = await User.findById(user._id)
        .populate('division')
        .populate('section');
      
      const divisionName = populatedUser.division ? populatedUser.division.name : 'None';
      const sectionName = populatedUser.section ? populatedUser.section.name : 'None';
      
      console.log(`- ${populatedUser.firstName} ${populatedUser.lastName} (${populatedUser.employeeId}) - ${populatedUser.role}`);
      console.log(`  Division: ${divisionName}, Section: ${sectionName}`);
      console.log(`  Email: ${populatedUser.email}`);
    }
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Super Admin: admin@slpa.lk / admin123');
    console.log('Manager: manager@slpa.lk / manager123');
    console.log('Clerk: clerk@slpa.lk / clerk123');
    console.log('Employee: employee@slpa.lk / employee123');
    console.log('Naflal: naflal@slpa.lk / naflal123');
    console.log('Test User: test@slpa.lk / test123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSimpleUsers();
