import React, { useState } from 'react';

const RoleAccessManagement = () => {
  const [roles] = useState([
    {
      name: 'super_admin',
      permissions: ['all_access', 'user_management', 'system_settings', 'reports']
    },
    {
      name: 'admin',
      permissions: ['user_management', 'reports', 'attendance_management']
    },
    {
      name: 'clerk',
      permissions: ['reports', 'attendance_view']
    },
    {
      name: 'employee',
      permissions: ['attendance_view', 'profile_edit']
    }
  ]);

  return (
    <div className="role-access-management">
      <div className="page-header">
        <h2><i className="bi bi-shield-check"></i> Role Access Management</h2>
      </div>

      <div className="roles-grid">
        {roles.map((role, index) => (
          <div key={index} className="role-card">
            <h4>{role.name.replace('_', ' ').toUpperCase()}</h4>
            <div className="permissions">
              <h6>Permissions:</h6>
              <ul>
                {role.permissions.map((permission, permIndex) => (
                  <li key={permIndex}>
                    <i className="bi bi-check-circle text-success"></i>
                    {permission.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn btn-outline-primary">
              <i className="bi bi-pencil"></i> Edit Permissions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleAccessManagement;