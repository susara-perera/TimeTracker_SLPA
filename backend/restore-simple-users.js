const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_timetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createYourOriginalUsers = async () => {
  try {
    console.log('🔄 Creating your original users...');
    
    // Clear existing users first
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Your original users data (simplified without complex ObjectIds)
    const originalUsers = [
      {
        firstName: 'Susara',
        lastName: 'Perera',
        email: 'susaraperera33@gmail.com',
        employeeId: 'SP001',
        password: '$2a$10$b8ObLnvrzamOZ0mX0bOkVubKHMsLOFlRcVqQAS9FBYuF3nBWVC9Gi',
        role: 'super_admin',
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-05T02:37:09.419Z'),
        createdAt: new Date('2025-08-05T02:37:09.422Z'),
        updatedAt: new Date('2025-08-26T05:40:53.368Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-12T02:50:53.951Z'),
        createdAt: new Date('2025-08-12T02:50:53.955Z'),
        updatedAt: new Date('2025-08-26T05:41:04.704Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-12T02:53:06.940Z'),
        createdAt: new Date('2025-08-12T02:53:06.942Z'),
        updatedAt: new Date('2025-08-21T09:46:01.426Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-15T04:43:50.812Z'),
        createdAt: new Date('2025-08-15T04:43:50.813Z'),
        updatedAt: new Date('2025-08-26T02:59:09.959Z'),
        lastLogin: new Date('2025-08-26T00:04:37.190Z'),
        loginAttempts: 0 // Reset from 5 to unlock
      },
      {
        firstName: 'sri',
        lastName: 'lanka',
        email: 'srilanka@gmail.com',
        employeeId: 'EMP070',
        password: '$2a$10$KwMcMvHjXYuP0DvoxTnJnOn3f32d/UjVMjQj9lm/JiSWDmQCsE0mK',
        role: 'clerk',
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-18T05:55:01.187Z'),
        createdAt: new Date('2025-08-18T05:55:01.189Z'),
        updatedAt: new Date('2025-08-26T05:41:12.985Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T07:37:02.862Z'),
        createdAt: new Date('2025-08-21T07:37:02.868Z'),
        updatedAt: new Date('2025-08-21T09:59:32.438Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T08:17:24.643Z'),
        createdAt: new Date('2025-08-21T08:17:24.645Z'),
        updatedAt: new Date('2025-08-25T03:59:28.850Z'),
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
        address: { country: 'Sri Lanka' },
        isActive: true,
        dateOfJoining: new Date('2025-08-21T09:51:23.730Z'),
        createdAt: new Date('2025-08-21T09:51:23.736Z'),
        updatedAt: new Date('2025-08-21T09:54:14.562Z'),
        lastLogin: new Date('2025-08-21T09:54:14.560Z'),
        loginAttempts: 0
      }
    ];
    
    // Insert all users
    const createdUsers = await User.insertMany(originalUsers);
    console.log(`✅ Successfully created ${createdUsers.length} original users!`);
    
    console.log('\n👥 Your original users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      console.log(`  Employee ID: ${user.employeeId}`);
      console.log(`  Active: ${user.isActive}`);
      console.log('');
    });
    
    console.log('🎉 All your original users have been restored!');
    console.log('\n🔑 Note: All accounts are unlocked and ready to use.');
    console.log('The original hashed passwords should work with their original passwords.');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createYourOriginalUsers();
