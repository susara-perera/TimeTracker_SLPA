const { createMySQLConnection } = require('./config/mysql');

async function checkDivisionMapping() {
  try {
    console.log('🔍 Checking Division ID Mapping Issue...\n');

    // 1. Check what MongoDB divisions exist
    console.log('1. Fetching MongoDB divisions...');
    const http = require('http');
    
    const getMongoDBDivisions = () => {
      return new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/api/divisions',
          method: 'GET'
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
    };

    const mongoResponse = await getMongoDBDivisions();
    console.log(`Found ${mongoResponse.data.length} MongoDB divisions:`);
    
    const informationSystemDiv = mongoResponse.data.find(div => 
      div.name && div.name.toUpperCase().includes('INFORMATION')
    );
    
    if (informationSystemDiv) {
      console.log(`- INFORMATION SYSTEMS: MongoDB ID = ${informationSystemDiv._id}, Name = "${informationSystemDiv.name}"`);
    } else {
      console.log('❌ No INFORMATION SYSTEMS division found in MongoDB');
      return;
    }

    // 2. Check MySQL divisions
    console.log('\n2. Checking MySQL divisions...');
    const connection = await createMySQLConnection();
    
    const [mysqlDivisions] = await connection.execute(`
      SELECT division_id, division_name 
      FROM divisions 
      WHERE division_name LIKE '%INFORMATION%'
    `);
    
    console.log('MySQL INFORMATION divisions:');
    mysqlDivisions.forEach(div => {
      console.log(`- MySQL ID = ${div.division_id}, Name = "${div.division_name}"`);
    });

    // 3. Test the problematic endpoint
    console.log('\n3. Testing problematic endpoint...');
    console.log(`MongoDB ID: ${informationSystemDiv._id}`);
    console.log(`Should map to MySQL ID: ${mysqlDivisions[0]?.division_id || 'NOT FOUND'}`);
    
    await connection.end();

    // 4. The solution
    console.log('\n💡 SOLUTION:');
    console.log('The frontend needs to send MySQL division ID instead of MongoDB division ID');
    console.log('OR we need to create a mapping system between MongoDB and MySQL IDs');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkDivisionMapping();
