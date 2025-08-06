import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, setActiveSection, collapsed, userRole }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      roles: ['super_admin', 'admin', 'clerk', 'employee']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bi-file-earmark-text',
      roles: ['super_admin', 'admin', 'clerk'],
      submenu: [
        { id: 'unit-attendance', label: 'Unit Attendance Report' },
        { id: 'audit-report', label: 'Audit Report' },
        { id: 'meal-report', label: 'Meal Report' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: 'bi-people',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'divisions',
      label: 'Manage Divisions',
      icon: 'bi-building',
      roles: ['super_admin']
    },
    {
      id: 'sections',
      label: 'Manage Sections',
      icon: 'bi-diagram-3',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'roles',
      label: 'Role Access',
      icon: 'bi-shield-check',
      roles: ['super_admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      roles: ['super_admin', 'admin']
    }
  ];

  const hasAccess = (roles) => {
    return roles.includes(userRole);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="bi bi-clock-history"></i>
          {!collapsed && <span>SLPA</span>}
        </div>
      </div>

      <div className="user-info">
        <div className="user-avatar">
          <i className="bi bi-person-circle"></i>
        </div>
        {!collapsed && (
          <div className="user-details">
            <span className="user-role">Super_Ad (SA1001)</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (!hasAccess(item.roles)) return null;

          return (
            <div key={item.id} className="nav-item">
              <div
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <i className={`bi ${item.icon}`}></i>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.submenu && (
                  <i className="bi bi-chevron-down submenu-arrow"></i>
                )}
              </div>
              
              {!collapsed && item.submenu && activeSection === item.id && (
                <div className="submenu">
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.id}
                      className="submenu-item"
                      onClick={() => setActiveSection(subItem.id)}
                    >
                      <i className="bi bi-arrow-return-right"></i>
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-link" onClick={() => navigate('/logout')}>
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span>All Ports of Sri Lanka</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;