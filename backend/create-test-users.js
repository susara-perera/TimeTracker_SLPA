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

const createTestData = async () => {
  try {
    console.log('🔄 Creating test divisions...');
    
    // Clear existing data
    await User.deleteMany({});
    await Division.deleteMany({});
    await Section.deleteMany({});
    
    // Create test divisions
    const divisions = await Division.insertMany([
      {
        name: 'Information Systems',
        code: 'IS',
        description: 'IT and technology services'
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Financial operations and accounting'
      },
      {
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Civil engineering projects'
      }
    ]);
    
    console.log('✅ Divisions created:', divisions.length);
    
    // Create test sections
    const sections = await Section.insertMany([
      {
        name: 'Software Development',
        code: 'DEV',
        description: 'Software development team',
        division: divisions[0]._id
      },
      {
        name: 'System Administration',
        code: 'SYSAD',
        description: 'System administration team',
        division: divisions[0]._id
      },
      {
        name: 'Accounting',
        code: 'ACC',
        description: 'Accounting department',
        division: divisions[1]._id
      },
      {
        name: 'Project Management',
        code: 'PM',
        description: 'Project management office',
        division: divisions[2]._id
      }
    ]);
    
    console.log('✅ Sections created:', sections.length);
    
    // Create test users
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@slpa.lk',
        employeeId: 'ADM001',
        password: await bcrypt.hash('admin123', 10),
        role: 'super_admin',
        isActive: true,
        division: divisions[0]._id,
        section: sections[0]._id
      },
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@slpa.lk',
        employeeId: 'MGR001',
        password: await bcrypt.hash('manager123', 10),
        role: 'admin',
        isActive: true,
        division: divisions[0]._id,
        section: sections[0]._id
      },
      {
        firstName: 'Jane',
        lastName: 'Clerk',
        email: 'clerk@slpa.lk',
        employeeId: 'CLK001',
        password: await bcrypt.hash('clerk123', 10),
        role: 'clerk',
        isActive: true,
        division: divisions[1]._id,
        section: sections[2]._id
      },
      {
        firstName: 'Bob',
        lastName: 'Employee',
        email: 'employee@slpa.lk',
        employeeId: 'EMP001',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        isActive: true,
        division: divisions[2]._id,
        section: sections[3]._id
      },
      {
        firstName: 'Naflal',
        lastName: 'Senior',
        email: 'naflal@slpa.lk',
        employeeId: '3',
        password: await bcrypt.hash('naflal123', 10),
        role: 'administrative_clerk',
        isActive: true,
        division: divisions[0]._id,
        section: sections[1]._id
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log('✅ Users created:', createdUsers.length);
    
    // Display created users
    console.log('\n👥 Created users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.employeeId}) - ${user.role}`);
    });
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Super Admin: admin@slpa.lk / admin123');
    console.log('Manager: manager@slpa.lk / manager123');
    console.log('Clerk: clerk@slpa.lk / clerk123');
    console.log('Employee: employee@slpa.lk / employee123');
    console.log('Naflal: naflal@slpa.lk / naflal123');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestData();
