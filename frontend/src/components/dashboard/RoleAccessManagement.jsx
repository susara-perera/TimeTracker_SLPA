import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './RoleAccessManagement.css';

const RoleAccessManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    permissions: {}
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({});
  const { user } = useContext(AuthContext);
  const isSuperAdmin = user?.role === 'super_admin';

  // Show professional success modal for permission updates
  const showPermissionSuccessModal = (roleData, userCount, permissionCount) => {
    setSuccessDetails({
      roleName: roleData?.label || 'Unknown Role',
      userCount: userCount || 0,
      permissionCount: permissionCount || 0,
      timestamp: new Date().toLocaleString()
    });
    setShowSuccessModal(true);
  };

  // Available roles (moved to state so runtime additions are possible)
  const [availableRoles, setAvailableRoles] = useState([
    { value: 'super_admin', label: 'Super Admin', description: 'Highest level system administrator' },
    { value: 'admin', label: 'Administrator', description: 'System administrator with management rights' },
    { value: 'administrative_clerk', label: 'Administrative Clerk', description: 'Administrative support staff' },
    { value: 'clerk', label: 'Clerk', description: 'General office clerk' },
    { value: 'employee', label: 'Employee', description: 'Regular system user' }
  ]);

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
        { id: 'read', name: 'View Reports', description: 'Access and view reports' }
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
      category: 'sections', 
      name: 'Section Management', 
      permissions: [
        { id: 'create', name: 'Create Sections', description: 'Add new sections within divisions' },
        { id: 'read', name: 'View Sections', description: 'View section information and lists' },
        { id: 'update', name: 'Update Sections', description: 'Edit section details and assignments' },
        { id: 'delete', name: 'Delete Sections', description: 'Remove sections from divisions' }
      ]
    },
    { 
      category: 'roles', 
      name: 'Role & Permission Management', 
      permissions: [
       
        { id: 'read', name: 'View Roles & Permissions', description: 'Access role and permission management pages' },
        { id: 'update', name: 'Update Role Permissions', description: 'Modify permissions assigned to roles' },
        
      ]
    },
     { 
      category: 'rolesManage', 
      name: 'Roles Management', 
      permissions: [
        { id: 'create', name: 'Create Roles', description: 'Add new user roles to the system' },
        { id: 'read', name: 'View Roles & Permissions', description: 'Access roles and permissions management pages' },
        { id: 'update', name: 'Update Role Permissions', description: 'Modify roles' },
        { id: 'delete', name: 'Delete Roles', description: 'Remove roles ' }
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

    // Load roles from backend
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/roles', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const result = await res.json();
          if (Array.isArray(result.data) && result.data.length) {
            // include the database id so we can fetch role permissions
            setAvailableRoles(result.data.map(r => ({ id: r._id, value: r.value, label: r.label, description: r.description || '' })));
          }
        } else {
          console.warn('Failed to fetch roles from backend, using defaults');
        }
      } catch (err) {
        console.warn('Error fetching roles:', err);
      }
    })();

    // Listen for roles added via other components
    const handler = (e) => {
      const payload = e?.detail;
      if (payload && payload.value && payload.label) {
        // Avoid duplicates
        setAvailableRoles(prev => {
          if (prev.find(r => r.value === payload.value)) return prev;
          return [...prev, { value: payload.value, label: payload.label, description: '' }];
        });
      }
    };

    window.addEventListener('roleAdded', handler);
    return () => window.removeEventListener('roleAdded', handler);
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
      // Find available role metadata (contains id)
      const roleMeta = availableRoles.find(r => r.value === roleValue);
      const roleId = roleMeta?.id;
      setSelectedRoleId(roleId || '');

      if (roleId) {
        (async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            });

            if (res.ok) {
              const result = await res.json();
              const roleDoc = result.data;
              setFormData({ permissions: roleDoc.permissions || {} });
              updateSelectAllStatus(roleDoc.permissions || {});
            } else {
              // fallback to user-based permissions if role doc cannot be fetched
              const userWithRole = users.find(u => u.role === roleValue);
              setFormData({ permissions: userWithRole?.permissions || {} });
              updateSelectAllStatus(userWithRole?.permissions || {});
            }
          } catch (err) {
            console.warn('Error fetching role document:', err);
            const userWithRole = users.find(u => u.role === roleValue);
            setFormData({ permissions: userWithRole?.permissions || {} });
            updateSelectAllStatus(userWithRole?.permissions || {});
          }
        })();
      } else {
        // If no role id available, fallback to user-based permissions
        const userWithRole = users.find(u => u.role === roleValue);
        setFormData({ permissions: userWithRole?.permissions || {} });
        updateSelectAllStatus(userWithRole?.permissions || {});
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
  if (!isSuperAdmin) return; // prevent non-super-admin from making changes
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

  // Show confirmation modal instead of immediate submit
  const openConfirm = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setMessage('Only Super Admin can modify role permissions');
      setMessageType('error');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      return;
    }

    if (!selectedRole) {
      setMessage('Please select a role first');
      setMessageType('error');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      return;
    }

    setShowConfirm(true);
  };

  // Confirm and perform save: persist to role doc then update users
  const confirmAndSave = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      // Persist permissions to role document (if we have an id)
      const token = localStorage.getItem('token');
      let roleSaved = false;
      let savedRoleResponse = null;
      if (selectedRoleId) {
        const res = await fetch(`http://localhost:5000/api/permissions/roles/${selectedRoleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ permissions: formData.permissions })
        });

        const resJson = await res.json().catch(() => ({}));
        if (!res.ok) {
          // include server message if available
          throw new Error(resJson.message || 'Failed to save role permissions');
        }

        roleSaved = true;
        savedRoleResponse = resJson.data || null;

        // Update local formData with authoritative permissions returned (if any)
        if (savedRoleResponse && savedRoleResponse.permissions) {
          setFormData({ permissions: savedRoleResponse.permissions });
        }
      }

      // Now update users with the selected role
      const usersWithRole = users.filter(u => u.role === selectedRole);
      if (usersWithRole.length === 0) {
        // If we saved the role document, treat that as a successful save even if no users exist for the role
        if (roleSaved) {
          const permissionCount = getTotalEnabledPermissions();
          
          // Show professional success modal for role permissions saved
          showPermissionSuccessModal(selectedRoleData, 0, permissionCount);
          
          setMessage(`Role permissions saved successfully. No users found with role ${selectedRoleData?.label}`);
          setMessageType('success');
          setToastVisible(true);
          setTimeout(() => setToastVisible(false), 4000);
          setTimeout(() => { setMessage(''); setMessageType(''); }, 5000);
          setSubmitting(false);
          return;
        }

        setMessage('No users found with the selected role');
        setMessageType('error');
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
        setSubmitting(false);
        return;
      }

      // Use auth token for user updates as well (backend typically requires auth)
      const updatePromises = usersWithRole.map(user =>
        fetch(`http://localhost:5000/api/users/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ permissions: formData.permissions })
        }).then(async r => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})), userId: user._id }))
      );

      const results = await Promise.all(updatePromises);
      const failed = results.filter(r => !r.ok);

      if (failed.length === 0) {
        setUsers(prevUsers => prevUsers.map(u => u.role === selectedRole ? { ...u, permissions: formData.permissions } : u));
        
        // Calculate permission count
        const permissionCount = getTotalEnabledPermissions();
        
        // Show professional success modal
        showPermissionSuccessModal(selectedRoleData, usersWithRole.length, permissionCount);
        
        // Also set the regular message for backup
        setMessage(`Permissions updated successfully for ${usersWithRole.length} user(s)`);
        setMessageType('success');
        setToastVisible(true);
        console.log('RoleAccessManagement: permissions updated successfully for users', usersWithRole.map(u => u._id));
        
        setTimeout(() => setToastVisible(false), 4000);
        // Auto-hide message area too
        setTimeout(() => { setMessage(''); setMessageType(''); }, 5000);
        // Notify the app that permissions have changed so current sessions can refresh
        try {
          window.dispatchEvent(new CustomEvent('permissionsChanged', { detail: { role: selectedRole } }));
        } catch (e) { /* ignore */ }
      } else {
        // Build an informative message
        const failedIds = failed.map(f => f.userId).slice(0, 5);
        // collect server messages from failed responses
        const serverMsgs = failed.map(f => (f.body && f.body.message) ? `${f.userId}: ${f.body.message}` : `${f.userId}: status ${f.status}`).slice(0,5);
        setMessage(`Updated ${usersWithRole.length - failed.length}/${usersWithRole.length} users. Failed for: ${failedIds.join(', ')}${failed.length > 5 ? '...' : ''}`);
        setMessageType('error');
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 7000);
        console.warn('RoleAccessManagement: some user updates failed', failed);
        try { window.alert(`Updated ${usersWithRole.length - failed.length}/${usersWithRole.length} users. Some updates failed.\nDetails:\n${serverMsgs.join('\n')}`); } catch (e) {}
        // Even on partial failure, notify app (some users may have new permissions)
        try {
          window.dispatchEvent(new CustomEvent('permissionsChanged', { detail: { role: selectedRole } }));
        } catch (e) { /* ignore */ }
      }

    } catch (err) {
      console.error('Error saving permissions:', err);
      setMessage(err.message || 'Error updating role permissions');
      setMessageType('error');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
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
            <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="header-text">
                <div className="icon-wrapper-large">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h1 className="page-title">Role Access Management</h1>
                <p className="page-subtitle">Configure permissions for user roles - changes apply to all users with the selected role</p>
              </div>
              
              {isSuperAdmin && (
                <button
                  className="btn-professional btn-secondary"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'role-management' }))}
                  title="Manage Roles"
                  style={{ padding: '10px 16px', fontSize: '14px' }}
                >
                  <i className="bi bi-gear"></i> Manage Roles
                </button>
              )}
            </div>
          </div>
          
          <div className="card-body-custom">
            {/* Toast popup */}
            {toastVisible && message && (
              <div className={`toast-popup ${messageType === 'success' ? 'toast-success' : 'toast-error'}`}>
                <i className={`bi ${messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} mr-2`}></i>
                {message}
              </div>
            )}

            {/* Inline message area */}
            {message && !toastVisible && (
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
                disabled={!isSuperAdmin}
                title={!isSuperAdmin ? 'Only Super Admin can change selected role' : ''}
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

              {!isSuperAdmin && (
                <div className="alert alert-warning mt-3">
                  <i className="bi bi-lock-fill mr-2"></i>
                  You do not have permission to modify role permissions. Contact a Super Admin for changes.
                </div>
              )}
            </div>

            {/* Permissions Configuration */}
            {selectedRole && (
              <div className="form-section">
                <form onSubmit={openConfirm}>
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
                                disabled={!isSuperAdmin}
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
                      disabled={submitting || !isSuperAdmin}
                      title={!isSuperAdmin ? 'Only Super Admin can apply changes' : ''}
                      onClick={openConfirm}
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Confirm Permission Changes</h4>
            </div>
            <div className="modal-body">
              <p>You're about to apply the selected permissions to <strong>{selectedRoleUserCount}</strong> user(s) with the role <strong>{selectedRoleData?.label}</strong>.</p>
              <p>This action will update both the role's permission document and the users' effective permissions. Are you sure you want to continue?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-professional btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-professional btn-success" onClick={confirmAndSave}>Yes, apply changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Permission Update Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '600px', 
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            border: '2px solid #28a745',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(40, 167, 69, 0.2)',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              padding: '25px 30px',
              borderRadius: '10px 10px 0 0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '24px' }}>
                Permission Update Completed
              </h2>
              <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                System Access Control Updated Successfully
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: '30px' }}>
              <div style={{ 
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <h4 style={{ 
                  color: '#495057',
                  marginBottom: '15px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  <i className="bi bi-info-circle" style={{ color: '#28a745', marginRight: '8px' }}></i>
                  Update Summary
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Role Updated:</strong>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                      {successDetails.roleName}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Users Affected:</strong>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                      {successDetails.userCount} {successDetails.userCount === 1 ? 'User' : 'Users'}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Permissions Granted:</strong>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                      {successDetails.permissionCount} Permissions
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: '#6c757d', fontSize: '14px' }}>Updated At:</strong>
                    <div style={{ fontSize: '14px', color: '#495057' }}>
                      {successDetails.timestamp}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '25px'
              }}>
                <p style={{ 
                  margin: 0,
                  color: '#155724',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <i className="bi bi-check-circle-fill" style={{ marginRight: '8px' }}></i>
                  <strong>All permission changes have been successfully applied to the system.</strong>
                  {successDetails.userCount > 0 && (
                    <span> Affected users will see the updated permissions on their next login or page refresh.</span>
                  )}
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn-professional btn-success"
                  onClick={() => setShowSuccessModal(false)}
                  style={{ 
                    padding: '12px 40px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '150px'
                  }}
                >
                  <i className="bi bi-check2-circle"></i> Acknowledged
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAccessManagement;