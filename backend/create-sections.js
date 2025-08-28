const mongoose = require('mongoose');
const Division = require('./models/Division');
const Section = require('./models/Section');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createSections = async () => {
  try {
    console.log('🔄 Creating sections...');
    
    // Get existing divisions
    const divisions = await Division.find({});
    console.log(`Found ${divisions.length} divisions`);
    
    if (divisions.length === 0) {
      console.log('❌ No divisions found. Cannot create sections.');
      return;
    }
    
    // Clear existing sections
    await Section.deleteMany({});
    
    // Create sections for each division
    const sectionsToCreate = [];
    
    // Information Systems sections
    const itDivision = divisions.find(d => d.name === 'Information Systems');
    if (itDivision) {
      sectionsToCreate.push(
        { name: 'Software Development', code: 'SWDEV', division: itDivision._id, description: 'Software Development Team' },
        { name: 'Network Administration', code: 'NETADM', division: itDivision._id, description: 'Network and Infrastructure' },
        { name: 'Database Management', code: 'DBMGMT', division: itDivision._id, description: 'Database Administration' }
      );
    }
    
    // Finance sections
    const financeDivision = divisions.find(d => d.name === 'Finance');
    if (financeDivision) {
      sectionsToCreate.push(
        { name: 'Accounts Payable', code: 'ACCPAY', division: financeDivision._id, description: 'Accounts Payable Department' },
        { name: 'Accounts Receivable', code: 'ACCREC', division: financeDivision._id, description: 'Accounts Receivable Department' },
        { name: 'Payroll', code: 'PAYROL', division: financeDivision._id, description: 'Payroll Management' }
      );
    }
    
    // Civil Engineering sections
    const civilDivision = divisions.find(d => d.name === 'Civil Engineering');
    if (civilDivision) {
      sectionsToCreate.push(
        { name: 'Structural Design', code: 'STRDES', division: civilDivision._id, description: 'Structural Design Team' },
        { name: 'Project Management', code: 'PROJMG', division: civilDivision._id, description: 'Project Management Office' },
        { name: 'Quality Control', code: 'QCNTRL', division: civilDivision._id, description: 'Quality Control Department' }
      );
    }
    
    // Create a super admin user to satisfy the createdBy requirement
    const User = require('./models/User');
    let superAdmin = await User.findOne({ role: 'super_admin' });
    
    if (!superAdmin) {
      console.log('Creating temporary super admin for section creation...');
      const bcrypt = require('bcryptjs');
      superAdmin = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'system@slpa.lk',
        employeeId: 'SYS001',
        password: await bcrypt.hash('admin123', 10),
        role: 'super_admin',
        isActive: true
      });
    }
    
    // Add createdBy to all sections
    sectionsToCreate.forEach(section => {
      section.createdBy = superAdmin._id;
    });
    
    const createdSections = await Section.insertMany(sectionsToCreate);
    console.log('✅ Sections created:', createdSections.length);
    
    // Display created sections
    console.log('\n📂 Created sections:');
    for (const section of createdSections) {
      const populatedSection = await Section.findById(section._id).populate('division');
      console.log(`- ${populatedSection.name} (Division: ${populatedSection.division.name})`);
    }
    
    console.log('\n🎉 Sections created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sections:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSections();
