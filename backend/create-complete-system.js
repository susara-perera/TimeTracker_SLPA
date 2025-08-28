const mongoose = require('mongoose');
const User = require('./models/User');
const Division = require('./models/Division');
const Section = require('./models/Section');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createCompleteSystem = async () => {
  try {
    console.log('🔄 Creating complete system with divisions, sections, and users...');
    
    // Clear all existing data
    await User.deleteMany({});
    await Section.deleteMany({});
    await Division.deleteMany({});
    console.log('🗑️ Cleared all existing data');
    
    // Create a super admin first for createdBy requirements
    const tempAdmin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'system@temp.com',
      employeeId: 'SYS000',
      password: '$2a$10$temppassword',
      role: 'super_admin',
      isActive: true,
      address: { country: 'Sri Lanka' }
    });
    
    // Create division
    const division = await Division.create({
      _id: new mongoose.Types.ObjectId('689443a4c8066bb7f0b32a44'),
      name: 'Main Division',
      code: 'MAIN',
      description: 'Main organizational division',
      createdBy: tempAdmin._id
    });
    
    // Create sections
    const section1 = await Section.create({
      _id: new mongoose.Types.ObjectId('6899758a3c6a81481797f3ce'),
      name: 'Primary Section',
      code: 'PRIM',
      division: division._id,
      description: 'Primary operational section',
      createdBy: tempAdmin._id
    });
    
    const section2 = await Section.create({
      _id: new mongoose.Types.ObjectId('689975f93c6a81481797f3ed'),
      name: 'Secondary Section',
      code: 'SEC',
      division: division._id,
      description: 'Secondary operational section',
      createdBy: tempAdmin._id
    });
    
    const section3 = await Section.create({
      _id: new mongoose.Types.ObjectId('689976203c6a81481797f400'),
      name: 'Support Section',
      code: 'SUPP',
      division: division._id,
      description: 'Support section',
      createdBy: tempAdmin._id
    });
    
    console.log('✅ Created division and sections');
    
    // Delete temp admin
    await User.deleteOne({ _id: tempAdmin._id });
    
    // Your original users data with proper division/section assignments
    const originalUsers = [
      {
        firstName: 'Susara',
        lastName: 'Perera',
        email: 'susaraperera33@gmail.com',
        employeeId: 'SP001',
        password: '$2a$10$b8ObLnvrzamOZ0mX0bOkVubKHMsLOFlRcVqQAS9FBYuF3nBWVC9Gi',
        role: 'super_admin',
        division: division._id,
        section: section1._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-05T02:37:09.419Z'),
        lastLogin: new Date('2025-08-26T05:40:53.367Z'),
        loginAttempts: 0
      },
      {
        firstName: 'shenuka',
        lastName: 'navod',
        email: 'shenuka@slpa.com',
        employeeId: '2002',
        password: '$2a$10$X.OhLcQHgMxXocR4MOFdiOwx0yP9Vwe1p0nzllr37UEMWE0k5u7QW',
        role: 'clerk',
        division: division._id,
        section: section1._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-12T02:50:53.951Z'),
        lastLogin: new Date('2025-08-18T05:11:17.765Z'),
        loginAttempts: 0
      },
      {
        firstName: 'Amaya',
        lastName: 'Doni',
        email: 'doni@slpa.com',
        employeeId: '0123',
        password: '$2a$10$LICsYpysdj9tHeoedxKtDeu2KgKXhb504XjmjgGk5cNgayEOvbs9q',
        role: 'admin',
        division: division._id,
        section: section1._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-12T02:53:06.940Z'),
        lastLogin: new Date('2025-08-13T04:42:39.225Z'),
        loginAttempts: 0
      },
      {
        firstName: 'Bawantha',
        lastName: 'Madhushan',
        email: 'bawantha@slpa.com',
        employeeId: '8250651',
        password: '$2a$10$twSXhyZG1fFiWBoy7Hr/XOtNFHXarwg/wmCGlOojy0TcsDShW180e',
        role: 'super_admin',
        division: division._id,
        section: section1._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-15T04:43:50.812Z'),
        lastLogin: new Date('2025-08-26T00:04:37.190Z'),
        loginAttempts: 0
      },
      {
        firstName: 'sri',
        lastName: 'lanka',
        email: 'srilanka@gmail.com',
        employeeId: 'EMP070',
        password: '$2a$10$KwMcMvHjXYuP0DvoxTnJnOn3f32d/UjVMjQj9lm/JiSWDmQCsE0mK',
        role: 'clerk',
        division: division._id,
        section: section2._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-18T05:55:01.187Z'),
        lastLogin: new Date('2025-08-26T05:41:12.984Z'),
        loginAttempts: 0
      },
      {
        firstName: 'Hello',
        lastName: 'World',
        email: 'helloworld@slpa.com',
        employeeId: 'EMP010',
        password: '$2a$10$nAv6vAbW.JIp1F5sdzVRS.NBwhq0p9EMQZ2poIkI5BhJfZTBqeKf.',
        role: 'employee',
        division: division._id,
        section: section3._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T07:37:02.862Z'),
        lastLogin: new Date('2025-08-21T09:59:32.437Z'),
        loginAttempts: 0
      },
      {
        firstName: 'admin',
        lastName: 'new',
        email: 'admin@slpa.com',
        employeeId: 'EMP728',
        password: '$2a$10$eA2v0bgZsC3h6y5nsinXh.5//76LZ7tluWkX8XU5fwrkbhhkdw2JO',
        role: 'admin',
        division: division._id,
        section: section3._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T08:17:24.643Z'),
        lastLogin: new Date('2025-08-25T03:59:28.846Z'),
        loginAttempts: 0
      },
      {
        firstName: 'admin',
        lastName: 'clerk',
        email: 'adminclerk@slpa.com',
        employeeId: 'EMP329',
        password: '$2a$10$WTvg682OpUZKlSWWV0yfSebROhI5tzETujq4EVeQKfIDMcHNnkRPm',
        role: 'administrative_clerk',
        division: division._id,
        section: section3._id,
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T09:51:23.730Z'),
        lastLogin: new Date('2025-08-21T09:54:14.560Z'),
        loginAttempts: 0
      }
    ];
    
    // Insert all users
    const createdUsers = await User.insertMany(originalUsers);
    console.log(`✅ Successfully created ${createdUsers.length} original users!`);
    
    console.log('\n👥 Your original users:');
    for (const user of createdUsers) {
      const populatedUser = await User.findById(user._id)
        .populate('division')
        .populate('section');
      
      console.log(`- ${populatedUser.firstName} ${populatedUser.lastName} (${populatedUser.email})`);
      console.log(`  Role: ${populatedUser.role}`);
      console.log(`  Employee ID: ${populatedUser.employeeId}`);
      console.log(`  Division: ${populatedUser.division.name}`);
      console.log(`  Section: ${populatedUser.section.name}`);
      console.log(`  Active: ${populatedUser.isActive}`);
      console.log('');
    }
    
    console.log('🎉 Complete system restored with all your original users!');
    console.log('\n🔑 All accounts are unlocked and ready to use.');
    
  } catch (error) {
    console.error('❌ Error creating system:', error);
  } finally {
    mongoose.connection.close();
  }
};

createCompleteSystem();
