const { connectMySQL, sequelize } = require('./config/mysql');
const { MySQLUser, MySQLDivision, MySQLSection } = require('./models/mysql');

const testMySQLConnection = async () => {
  try {
    console.log('🔄 Testing MySQL connection...\n');
    
    // Test connection
    await connectMySQL();
    
    // Test creating a sample division
    console.log('📊 Creating sample data...');
    
    const division = await MySQLDivision.findOrCreate({
      where: { code: 'IT' },
      defaults: {
        name: 'Information Technology',
        description: 'IT Department',
        code: 'IT'
      }
    });
    
    console.log('✅ Division created/found:', division[0].name);
    
    // Test creating a sample section
    const section = await MySQLSection.findOrCreate({
      where: { code: 'DEV' },
      defaults: {
        name: 'Development',
        description: 'Software Development Section',
        code: 'DEV',
        divisionId: division[0].id
      }
    });
    
    console.log('✅ Section created/found:', section[0].name);
    
    // Test creating a sample user
    const user = await MySQLUser.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        employeeId: 'ADM001',
        password: '123456',
        role: 'admin',
        divisionId: division[0].id,
        sectionId: section[0].id
      }
    });
    
    console.log('✅ User created/found:', user[0].getFullName());
    
    // Test relationships
    const userWithRelations = await MySQLUser.findByPk(user[0].id, {
      include: [
        { model: MySQLDivision, as: 'division' },
        { model: MySQLSection, as: 'section' }
      ]
    });
    
    console.log('🔗 User with relations:');
    console.log('   - Name:', userWithRelations.getFullName());
    console.log('   - Division:', userWithRelations.division?.name);
    console.log('   - Section:', userWithRelations.section?.name);
    
    console.log('\n✅ MySQL connection and models working perfectly!');
    
  } catch (error) {
    console.error('❌ MySQL test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 MySQL connection closed');
  }
};

testMySQLConnection();
