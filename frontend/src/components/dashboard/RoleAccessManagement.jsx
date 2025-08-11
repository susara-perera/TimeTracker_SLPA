import React, { useState, useEffect } from 'react';
import './RoleAccessManagement.css';

// Mock roles data - moved outside component to avoid useEffect dependency issues
const mockRoles = [
  {
    _id: '1',
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Highest level access with all system permissions',
    permissions: ['add_user', 'generate_report', 'manage_division', 'manage_section', 'role_access', 'settings'],
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    _id: '2',
    name: 'administrator',
    displayName: 'Administrator',
    description: 'Administrative access with management capabilities',
    permissions: ['add_user', 'generate_report', 'manage_division', 'manage_section', 'role_access'],
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    _id: '3',
    name: 'administrative_clerk',
    displayName: 'Administrative Clerk',
    description: 'Administrative support with limited management access',
    permissions: ['generate_report', 'manage_section'],
    isSystem: false,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    _id: '4',
    name: 'clerk',
    displayName: 'Clerk',
    description: 'Basic clerical access for data entry and viewing',
    permissions: ['generate_report'],
    isSystem: false,
    isActive: true,
    createdAt: '2024-01-01'
  }
];

const RoleAccessManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Available permissions list
  const availablePermissions = [
    { id: 'all_access', name: 'All Access', description: 'Full system access and administration' },
    { id: 'add_user', name: 'Add User', description: 'Create and add new users to the system' },
    { id: 'generate_report', name: 'Generate Report', description: 'Create and generate system reports' },
    { id: 'manage_division', name: 'Manage Division', description: 'Create, edit and manage company divisions' },
    { id: 'manage_section', name: 'Manage Section', description: 'Create, edit and manage department sections' },
    { id: 'role_access', name: 'Role Access', description: 'Manage user roles and access permissions' },
    { id: 'settings', name: 'Settings', description: 'Access and configure system settings' }
  ];

  useEffect(() => {
    // Fetch roles data
    const fetchData = async () => {
      try {
        setRoles(mockRoles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle role selection
  const handleRoleSelect = (e) => {
    const roleValue = e.target.value;
    setSelectedRole(roleValue);
    
    if (roleValue) {
      const role = roles.find(r => r.name === roleValue);
      if (role) {
        setFormData(prev => ({
          ...prev,
          permissions: role.permissions || []
        }));
        updateSelectAllStatus(role.permissions || []);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: []
      }));
      setSelectAll(false);
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(p => p !== permissionId)
      : [...formData.permissions, permissionId];
    
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
    
    if (newSelectAll) {
      const allPermissionIds = availablePermissions.map(p => p.id);
      setFormData(prev => ({
        ...prev,
        permissions: allPermissionIds
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: []
      }));
    }
  };

  // Update select all status
  const updateSelectAllStatus = (permissions) => {
    const allPermissionIds = availablePermissions.map(p => p.id);
    setSelectAll(permissions.length === allPermissionIds.length && allPermissionIds.length > 0);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the role in state
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.name === selectedRole 
            ? { ...role, permissions: formData.permissions, updatedAt: new Date().toISOString() }
            : role
        )
      );
      
      setMessage('Access control updated successfully!');
      setMessageType('success');
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
    } catch (error) {
      console.error('Error updating permissions:', error);
      setMessage('Error updating access control. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
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

  const selectedRoleData = roles.find(r => r.name === selectedRole);
  const currentPermissions = selectedRoleData ? selectedRoleData.permissions : [];

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
            <p className="page-subtitle">Configure user role permissions and access control</p>
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
                <span className="stats-number">{roles.length}</span>
                <span className="stats-label">Total Roles</span>
              </div>
              <div className="stats-item">
                <span className="stats-number">{availablePermissions.length}</span>
                <span className="stats-label">Available Permissions</span>
              </div>
              {selectedRole && (
                <div className="stats-item">
                  <span className="stats-number">{currentPermissions.length}</span>
                  <span className="stats-label">Granted Permissions</span>
                </div>
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
                {roles.map(role => (
                  <option key={role._id} value={role.name}>
                    {role.displayName} ({role.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Permissions Configuration */}
            {selectedRole && (
              <div className="form-section">
                <form onSubmit={handleSubmit}>
                  <h3 style={{ color: '#333', marginBottom: '20px', fontWeight: '600' }}>
                    <i className="bi bi-shield-alt text-primary mr-2"></i>
                    Configure Access Permissions for: <span style={{ color: '#667eea' }}>{selectedRoleData?.displayName}</span>
                  </h3>

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
                      {formData.permissions.length}/{availablePermissions.length} permissions selected
                    </span>
                  </div>

                  {/* Permissions Grid */}
                  <div className="checkbox-grid">
                    {availablePermissions.map(permission => (
                      <div 
                        key={permission.id} 
                        className={`checkbox-item ${formData.permissions.includes(permission.id) ? 'selected' : ''}`}
                        onClick={() => handlePermissionChange(permission.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          id={`perm_${permission.id}`}
                        />
                        <span className="checkmark"></span>
                        <label htmlFor={`perm_${permission.id}`}>
                          <div className="permission-title">
                            <i className="bi bi-file-text text-muted mr-2"></i>
                            {permission.name}
                          </div>
                          <div className="permission-description">
                            {permission.description}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

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
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save mr-2"></i>
                          Save Access Configuration
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