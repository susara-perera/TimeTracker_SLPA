const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const findOriginalUsers = async () => {
  try {
    console.log('🔍 Searching for your original users across all databases...');
    
    const targetUserIds = [
      '68916e55a7e38c0bcbb07bfd',
      '689aac0d2c82ae6ee8dc53e7', 
      '689aac92e285eb58ac012d9f',
      '689ebb067f15f1a2e6209f99',
      '68a2c035389ca9582607ca66',
      '68a6cc9eb8151b2e398aeca1',
      '68a6d6147f49c91353e34915',
      '68a6ec1beb1a3285b66119f0'
    ];
    
    const databases = ['slpa', 'slpa_db', 'attendance_system', 'slpa_timetracker', 'slpa_attendance'];
    
    for (const dbName of databases) {
      console.log(`\n🔍 Checking database: ${dbName}`);
      
      try {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        
        const users = await usersCollection.find({}).toArray();
        console.log(`Found ${users.length} users in ${dbName}`);
        
        // Check if any of our target users exist
        const foundTargetUsers = users.filter(user => 
          targetUserIds.includes(user._id.toString())
        );
        
        if (foundTargetUsers.length > 0) {
          console.log(`✅ Found ${foundTargetUsers.length} of your original users in ${dbName}!`);
          foundTargetUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user._id}`);
          });
          
          if (foundTargetUsers.length >= 6) {
            console.log(`\n🎯 This looks like your original database: ${dbName}`);
            await client.close();
            return { database: dbName, users: foundTargetUsers };
          }
        }
        
        await client.close();
      } catch (error) {
        console.log(`❌ Error accessing ${dbName}: ${error.message}`);
      }
    }
    
    console.log('\n❌ Could not find your original users in any database');
    return null;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

findOriginalUsers().then(result => {
  if (result) {
    console.log(`\n✅ Found your original users in: ${result.database}`);
  }
});
