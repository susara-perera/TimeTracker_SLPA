import React, { useState, useEffect } from 'react';
import './RoleAccessManagement.css';

const RoleAccessManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    permissions: {}
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Available roles
  const availableRoles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Highest level system administrator' },
    { value: 'admin', label: 'Administrator', description: 'System administrator with management rights' },
    { value: 'administrative_clerk', label: 'Administrative Clerk', description: 'Administrative support staff' },
    { value: 'clerk', label: 'Clerk', description: 'General office clerk' },
    { value: 'employee', label: 'Employee', description: 'Regular system user' }
  ];

  // Available permissions list based on User model
  const availablePermissions = [
    { 
      category: 'users', 
      name: 'User Management', 
      permissions: [
        { id: 'create', name: 'Create Users', description: 'Add new users to the system' },
        { id: 'read', name: 'View Users', description: 'View user information and lists' },
        { id: 'update', name: 'Update Users', description: 'Edit user information and profiles' },
        { id: 'delete', name: 'Delete Users', description: 'Remove users from the system' }
      ]
    },
    { 
      category: 'attendance', 
      name: 'Attendance Management', 
      permissions: [
        { id: 'create', name: 'Create Attendance', description: 'Add attendance records' },
        { id: 'read', name: 'View Attendance', description: 'View attendance records and reports' },
        { id: 'update', name: 'Update Attendance', description: 'Edit attendance records' },
        { id: 'delete', name: 'Delete Attendance', description: 'Remove attendance records' }
      ]
    },
    { 
      category: 'reports', 
      name: 'Reports Management', 
      permissions: [
        { id: 'create', name: 'Generate Reports', description: 'Create system reports' },
        { id: 'read', name: 'View Reports', description: 'Access and view reports' },
        { id: 'update', name: 'Update Reports', description: 'Modify report settings' },
        { id: 'delete', name: 'Delete Reports', description: 'Remove reports from system' }
      ]
    },
    { 
      category: 'divisions', 
      name: 'Division Management', 
      permissions: [
        { id: 'create', name: 'Create Divisions', description: 'Add new company divisions' },
        { id: 'read', name: 'View Divisions', description: 'View division information' },
        { id: 'update', name: 'Update Divisions', description: 'Edit division details' },
        { id: 'delete', name: 'Delete Divisions', description: 'Remove divisions' }
      ]
    },
    { 
      category: 'settings', 
      name: 'System Settings', 
      permissions: [
        { id: 'create', name: 'Create Settings', description: 'Add new system configurations' },
        { id: 'read', name: 'View Settings', description: 'Access system settings' },
        { id: 'update', name: 'Update Settings', description: 'Modify system configurations' },
        { id: 'delete', name: 'Delete Settings', description: 'Remove system settings' }
      ]
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error('Failed to fetch users');
        setMessage('Failed to load users');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error loading users');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection
  const handleRoleSelect = (e) => {
    const roleValue = e.target.value;
    setSelectedRole(roleValue);
    
    if (roleValue) {
      // Find a user with this role to get current permissions
      const userWithRole = users.find(u => u.role === roleValue);
      if (userWithRole) {
        setFormData({
          permissions: userWithRole.permissions || {}
        });
        updateSelectAllStatus(userWithRole.permissions || {});
      } else {
        // If no user with this role exists, start with empty permissions
        setFormData({
          permissions: {}
        });
        setSelectAll(false);
      }
    } else {
      setFormData({
        permissions: {}
      });
      setSelectAll(false);
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (category, permissionId) => {
    const newPermissions = { ...formData.permissions };
    
    if (!newPermissions[category]) {
      newPermissions[category] = {};
    }
    
    newPermissions[category][permissionId] = !newPermissions[category][permissionId];
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
    
    updateSelectAllStatus(newPermissions);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newPermissions = {};
    
    if (newSelectAll) {
      availablePermissions.forEach(category => {
        newPermissions[category.category] = {};
        category.permissions.forEach(perm => {
          newPermissions[category.category][perm.id] = true;
        });
      });
    } else {
      availablePermissions.forEach(category => {
        newPermissions[category.category] = {};
        category.permissions.forEach(perm => {
          newPermissions[category.category][perm.id] = false;
        });
      });
    }
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  // Update select all status
  const updateSelectAllStatus = (permissions) => {
    let totalPermissions = 0;
    let enabledPermissions = 0;
    
    availablePermissions.forEach(category => {
      category.permissions.forEach(perm => {
        totalPermissions++;
        if (permissions[category.category] && permissions[category.category][perm.id]) {
          enabledPermissions++;
        }
      });
    });
    
    setSelectAll(enabledPermissions === totalPermissions && totalPermissions > 0);
  };

  // Get total enabled permissions count
  const getTotalEnabledPermissions = () => {
    let count = 0;
    availablePermissions.forEach(category => {
      category.permissions.forEach(perm => {
        if (formData.permissions[category.category] && formData.permissions[category.category][perm.id]) {
          count++;
        }
      });
    });
    return count;
  };

  // Get total available permissions count
  const getTotalAvailablePermissions = () => {
    return availablePermissions.reduce((total, category) => total + category.permissions.length, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setMessage('Please select a role first');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    
    try {
      // Get all users with the selected role
      const usersWithRole = users.filter(user => user.role === selectedRole);
      
      if (usersWithRole.length === 0) {
        setMessage('No users found with the selected role');
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      // Update permissions for all users with this role
      const updatePromises = usersWithRole.map(user => 
        fetch(`http://localhost:5000/api/users/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            permissions: formData.permissions
          }),
        })
      );

      const responses = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        // Update the users in state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.role === selectedRole 
              ? { ...user, permissions: formData.permissions }
              : user
          )
        );
        
        setMessage(`Permissions updated successfully for all ${usersWithRole.length} users with role: ${selectedRole}`);
        setMessageType('success');
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } else {
        setMessage('Some users could not be updated. Please try again.');
        setMessageType('error');
      }
      
    } catch (error) {
      console.error('Error updating permissions:', error);
      setMessage('Error updating role permissions. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Get users count for selected role
  const getUsersCountForRole = () => {
    if (!selectedRole) return 0;
    return users.filter(user => user.role === selectedRole).length;
  };

  if (loading) {
    return (
      <div className="role-access-wrapper">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const selectedRoleData = availableRoles.find(r => r.value === selectedRole);
  const selectedRoleUserCount = getUsersCountForRole();

  return (
    <div className="role-access-wrapper">
      {/* Decorative Elements */}
      <div className="decorative-elements">
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
        <div className="geometric-shape shape-3"></div>
        <div className="geometric-shape shape-4"></div>
      </div>

      <div className="container-fluid px-4">
        <div className="main-card">
          <div className="card-header-custom">
            <div className="icon-wrapper-large">
              <i className="bi bi-shield-check"></i>
            </div>
            <h1 className="page-title">Role Access Management</h1>
            <p className="page-subtitle">Configure permissions for user roles - changes apply to all users with the selected role</p>
          </div>
          
          <div className="card-body-custom">
            {/* Success/Error Messages */}
            {message && (
              <div className={`alert ${messageType === 'success' ? 'alert-success-modern' : 'alert-error-modern'}`}>
                <i className={`bi ${messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} mr-2`}></i>
                {message}
              </div>
            )}

            {/* Stats Section */}
            <div className="stats-section">
              <div className="stats-item">
                <span className="stats-number">{availableRoles.length}</span>
                <span className="stats-label">Available Roles</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">{getTotalAvailablePermissions()}</span>
                <span className="stats-label">Available Permissions</span>
              </div>
              {selectedRole && (
                <>
                  <div className="stats-item">
                    <span className="stats-number">{selectedRoleUserCount}</span>
                    <span className="stats-label">Users with this Role</span>
                  </div>
                  <div className="stats-item">
                    <span className="stats-number">{getTotalEnabledPermissions()}</span>
                    <span className="stats-label">Granted Permissions</span>
                  </div>
                </>
              )}
            </div>

            {/* Role Selection */}
            <div className="form-section">
              <label htmlFor="role" className="form-label-modern">
                <i className="bi bi-person-gear text-primary mr-2"></i>Select Role to Manage
              </label>
              <select 
                name="role" 
                id="role" 
                className="form-control form-control-modern" 
                value={selectedRole}
                onChange={handleRoleSelect}
              >
                <option value="">-- Choose a role to configure --</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
              {selectedRole && (
                <small className="text-muted mt-2 d-block">
                  <i className="bi bi-info-circle mr-1"></i>
                  This will update permissions for {selectedRoleUserCount} user(s) with the role: {selectedRoleData?.label}
                </small>
              )}
            </div>

            {/* Permissions Configuration */}
            {selectedRole && (
              <div className="form-section">
                <form onSubmit={handleSubmit}>
                  <h3 style={{ color: '#333', marginBottom: '20px', fontWeight: '600' }}>
                    <i className="bi bi-shield-alt text-primary mr-2"></i>
                    Configure Access Permissions for Role: <span style={{ color: '#667eea' }}>{selectedRoleData?.label}</span>
                  </h3>

                  <div className="alert alert-info" style={{ backgroundColor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '6px', padding: '12px', marginBottom: '20px' }}>
                    <i className="bi bi-info-circle text-primary mr-2"></i>
                    <strong>Note:</strong> Changes will be applied to all {selectedRoleUserCount} user(s) with the role "{selectedRoleData?.label}"
                  </div>

                  {/* Select All Section */}
                  <div className="select-all-section">
                    <input 
                      type="checkbox" 
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all">
                      <i className="bi bi-check2-all mr-2"></i>Select All Permissions
                    </label>
                    <span className="permission-counter">
                      {getTotalEnabledPermissions()}/{getTotalAvailablePermissions()} permissions selected
                    </span>
                  </div>

                  {/* Permissions Grid by Category */}
                  {availablePermissions.map(category => (
                    <div key={category.category} className="permission-category">
                      <h4 className="category-title">
                        <i className="bi bi-folder text-primary mr-2"></i>
                        {category.name}
                      </h4>
                      <div className="checkbox-grid">
                        {category.permissions.map(permission => {
                          const isChecked = formData.permissions[category.category] && formData.permissions[category.category][permission.id];
                          return (
                            <div 
                              key={`${category.category}_${permission.id}`} 
                              className={`checkbox-item ${isChecked ? 'selected' : ''}`}
                              onClick={() => handlePermissionChange(category.category, permission.id)}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked || false}
                                onChange={() => handlePermissionChange(category.category, permission.id)}
                                id={`perm_${category.category}_${permission.id}`}
                              />
                              <span className="checkmark"></span>
                              <label htmlFor={`perm_${category.category}_${permission.id}`}>
                                <div className="permission-title">
                                  <i className="bi bi-file-text text-muted mr-2"></i>
                                  {permission.name}
                                </div>
                                <div className="permission-description">
                                  {permission.description}
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Submit Button */}
                  <div className="text-center mt-4">
                    <button 
                      type="submit" 
                      className="btn-save-modern"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm mr-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Updating {selectedRoleUserCount} user(s)...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save mr-2"></i>
                          Apply to All {selectedRoleUserCount} User(s) with Role: {selectedRoleData?.label}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default RoleAccessManagement;