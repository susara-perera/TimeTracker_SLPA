const fetch = require('node-fetch');

async function testDivisionSectionsAPI() {
  try {
    // First, get all divisions to get a division ID
    console.log('1. Fetching all divisions...');
    const divisionsResponse = await fetch('http://localhost:5000/api/divisions');
    const divisionsData = await divisionsResponse.json();
    console.log('Divisions response:', JSON.stringify(divisionsData, null, 2));
    
    if (divisionsData && divisionsData.data && divisionsData.data.length > 0) {
      const firstDivisionId = divisionsData.data[0]._id;
      console.log('\n2. Testing sections for division:', firstDivisionId);
      
      // Test the corrected API endpoint
      const sectionsResponse = await fetch(`http://localhost:5000/api/divisions/${firstDivisionId}/sections`);
      const sectionsData = await sectionsResponse.json();
      console.log('Sections response:', JSON.stringify(sectionsData, null, 2));
    }
    
    // Also test getting all sections
    console.log('\n3. Fetching all sections...');
    const allSectionsResponse = await fetch('http://localhost:5000/api/sections');
    const allSectionsData = await allSectionsResponse.json();
    console.log('All sections response:', JSON.stringify(allSectionsData, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDivisionSectionsAPI();
