// Test script to verify role delete functionality
const testRoleDelete = async () => {
  try {
    // First, let's get all roles to see what's available
    console.log('Fetching roles...');
    const rolesResponse = await fetch('http://localhost:5000/api/roles', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('Available roles:', rolesData.data);
      
      // Find a role that's not a system role for testing
      const testRole = rolesData.data.find(role => 
        !['super_admin', 'admin', 'employee', 'clerk', 'administrative_clerk'].includes(role.value)
      );
      
      if (testRole) {
        console.log('Testing delete for role:', testRole);
        
        const deleteResponse = await fetch(`http://localhost:5000/api/roles/${testRole._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Delete response status:', deleteResponse.status);
        const result = await deleteResponse.text();
        console.log('Delete result:', result);
      } else {
        console.log('No custom roles found for testing');
      }
    } else {
      console.error('Failed to fetch roles:', rolesResponse.status);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testRoleDelete();
