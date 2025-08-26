const fetch = require('node-fetch');

async function testRoleAPI() {
  const baseURL = 'http://localhost:5000/api';
  let authToken = null;
  
  try {
    console.log('🔐 Testing authentication first...');
    
    // First, let's try to authenticate (you'll need valid credentials)
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com', // You may need to update this
        password: 'admin123' // You may need to update this
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      console.log('✓ Authentication successful');
    } else {
      console.log('⚠️ Authentication failed, testing without token');
    }
    
    console.log('\n📋 Testing GET /api/roles...');
    const getRolesResponse = await fetch(`${baseURL}/roles`, {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });
    
    if (getRolesResponse.ok) {
      const rolesData = await getRolesResponse.json();
      console.log('✓ GET roles successful:', rolesData);
    } else {
      console.log('❌ GET roles failed:', getRolesResponse.status, await getRolesResponse.text());
    }
    
    console.log('\n➕ Testing POST /api/roles...');
    const createRoleResponse = await fetch(`${baseURL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        value: 'test_api_role',
        label: 'Test API Role',
        description: 'Testing role creation via API'
      })
    });
    
    if (createRoleResponse.ok) {
      const newRoleData = await createRoleResponse.json();
      console.log('✓ POST role successful:', newRoleData);
      
      const roleId = newRoleData.data._id;
      
      console.log('\n📝 Testing PUT /api/roles/:id...');
      const updateRoleResponse = await fetch(`${baseURL}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          label: 'Updated Test API Role',
          description: 'Updated description',
          permissions: { users: { read: true, create: false } }
        })
      });
      
      if (updateRoleResponse.ok) {
        const updatedRoleData = await updateRoleResponse.json();
        console.log('✓ PUT role successful:', updatedRoleData);
      } else {
        console.log('❌ PUT role failed:', updateRoleResponse.status, await updateRoleResponse.text());
      }
      
      console.log('\n🗑️ Testing DELETE /api/roles/:id...');
      const deleteRoleResponse = await fetch(`${baseURL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      
      if (deleteRoleResponse.ok) {
        const deleteData = await deleteRoleResponse.json();
        console.log('✓ DELETE role successful:', deleteData);
      } else {
        console.log('❌ DELETE role failed:', deleteRoleResponse.status, await deleteRoleResponse.text());
      }
      
    } else {
      console.log('❌ POST role failed:', createRoleResponse.status, await createRoleResponse.text());
    }
    
    console.log('\n✅ API testing completed!');
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

testRoleAPI();
