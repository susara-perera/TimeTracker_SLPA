// Test role deletion
const testRoleDelete = async () => {
  try {
    console.log('Testing role deletion...');
    
    // First create a test role
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found - user needs to be logged in');
      return;
    }

    // Create a test role
    const createResponse = await fetch('http://localhost:5000/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        value: 'test_role_delete',
        label: 'Test Role for Deletion'
      })
    });

    console.log('Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('Created test role:', createResult.data);
      
      // Now try to delete it
      const deleteResponse = await fetch(`http://localhost:5000/api/roles/${createResult.data._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', deleteResponse.status);
      const deleteResult = await deleteResponse.text();
      console.log('Delete result:', deleteResult);
      
      if (deleteResponse.ok) {
        console.log('✅ Role deletion test successful!');
      } else {
        console.error('❌ Role deletion failed:', deleteResult);
      }
    } else {
      const createError = await createResponse.text();
      console.error('Failed to create test role:', createError);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run test when this script is executed
testRoleDelete();
