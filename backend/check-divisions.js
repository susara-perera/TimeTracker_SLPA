const mongoose = require('mongoose');
const Division = require('./models/Division');
const Section = require('./models/Section');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/slpa_attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkDivisionsAndSections = async () => {
  try {
    console.log('🔍 Checking divisions and sections...');
    
    const divisions = await Division.find({});
    const sections = await Section.find({});
    
    console.log(`📁 Found ${divisions.length} divisions:`);
    divisions.forEach(div => {
      console.log(`- ${div.name} (${div._id})`);
    });
    
    console.log(`\n📂 Found ${sections.length} sections:`);
    sections.forEach(sec => {
      console.log(`- ${sec.name} (${sec._id}) - Division: ${sec.division}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDivisionsAndSections();
