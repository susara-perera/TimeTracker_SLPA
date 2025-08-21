import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import ReportGeneration from './ReportGeneration';
import DivisionManagement from './DivisionManagement';
import SectionManagement from './SectionManagement';
import RoleAccessManagement from './RoleAccessManagement';
import Settings from './Settings';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'home':
        setActiveSection('dashboard');
        break;
      case 'users':
        setActiveSection('users');
        break;
      case 'reports':
        setActiveSection('reports');
        break;
      case 'divisions':
        setActiveSection('divisions');
        break;
      case 'sections':
        setActiveSection('sections');
        break;
      case 'roles':
        setActiveSection('roles');
        break;
      case 'settings':
        setActiveSection('settings');
        break;
      default:
        break;
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for external navigation events (e.g., from other components)
  React.useEffect(() => {
    const handler = (e) => {
      const target = e?.detail;
      if (typeof target === 'string') {
        setActiveSection(target);
      }
    };

    window.addEventListener('navigateTo', handler);
    return () => window.removeEventListener('navigateTo', handler);
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardStats onQuickAction={handleQuickAction} />;
      case 'users':
        return <UserManagement />;
      case 'reports':
      case 'unit-attendance':
      case 'audit-report':
      case 'meal-report':
        return <ReportGeneration />;
      case 'divisions':
        return <DivisionManagement />;
      case 'sections':
        return <SectionManagement />;
      case 'roles':
        return <RoleAccessManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardStats onQuickAction={handleQuickAction} />;
    }
  };

  const quickActions = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: 'bi-house',
      color: 'primary',
      roles: ['super_admin', 'admin', 'clerk', 'administrative_clerk', 'employee']
    },
    {
      id: 'users',
      label: 'Add User',
      icon: 'bi-people',
      color: 'success',
      roles: ['super_admin', 'admin', 'administrative_clerk']
    },
    {
      id: 'reports',
      label: 'Report Generation',
      icon: 'bi-graph-up',
      color: 'info',
      roles: ['super_admin', 'admin', 'clerk', 'administrative_clerk']
    },
    {
      id: 'divisions',
      label: 'Division Management',
      icon: 'bi-building',
      color: 'warning',
      roles: ['super_admin']
    },
    {
      id: 'sections',
      label: 'Section Management',
      icon: 'bi-diagram-3',
      color: 'purple',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: 'bi-shield-check',
      color: 'secondary',
      roles: ['super_admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      color: 'secondary',
      roles: ['super_admin', 'admin']
    }
  ];



  // Permission-aware access check: prefer explicit permission ticks, then fall back to role membership
  // Map quick action id -> permissions resource/action
  const permissionMap = {
    users: { resource: 'users', action: 'read' },
    reports: { resource: 'reports', action: 'read' },
    divisions: { resource: 'divisions', action: 'read' },
    sections: { resource: 'sections', action: 'read' },
    roles: { resource: 'roles', action: 'read' },
    settings: { resource: 'settings', action: 'read' }
  };

  // Debug: log permissions for troubleshooting role-based UI
  React.useEffect(() => {
    try {
      console.debug('Dashboard user:', user?.id || user?.email || user?.firstName, 'role:', user?.role);
      console.debug('Dashboard permissions:', user?.permissions);
    } catch (e) {
      // ignore
    }
  }, [user]);
  const checkPermission = (userObj, resource, action) => {
    if (!userObj || !userObj.permissions) return false;

    const perms = userObj.permissions;

    // Action aliases
    const actionAliases = {
      read: ['read', 'view'],
      create: ['create', 'add'],
      update: ['update', 'edit'],
      delete: ['delete', 'remove']
    };

    const actionsToCheck = actionAliases[action] || [action];

    const resourcesToCheck = [resource];
    // add simple singular/plural variants
    if (resource.endsWith('s')) resourcesToCheck.push(resource.slice(0, -1));
    else resourcesToCheck.push(resource + 's');

    for (const r of resourcesToCheck) {
      const rPerm = perms[r];
      if (rPerm === undefined) continue;

      // if permission entry is boolean, respect it
      if (typeof rPerm === 'boolean') {
        if (rPerm) return true;
        continue;
      }

      // if permission entry is an object mapping actions to booleans
      if (typeof rPerm === 'object' && rPerm !== null) {
        for (const a of actionsToCheck) {
          const val = rPerm[a];
          if (val === true || val === 'true' || val === 1) return true;
          if (Array.isArray(rPerm) && rPerm.includes(a)) return true;
        }
      }

      // if permission entry is an array of allowed actions
      if (Array.isArray(rPerm)) {
        for (const a of actionsToCheck) if (rPerm.includes(a)) return true;
      }
    }

    return false;
  };

  const hasAccess = (roles, actionId) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    const map = permissionMap[actionId];
    if (map) {
      // If the permission map specifies a primary action (e.g., read for reports), require it when an explicit
      // permission entry exists. Otherwise, fall back to checking other actions or role membership.
  const resourcesToCheck = [map.resource];
  if (map.resource.endsWith('s')) resourcesToCheck.push(map.resource.slice(0, -1));
  else resourcesToCheck.push(map.resource + 's');

      // If a specific action is defined in the map, prefer that check.
      if (map.action) {
        if (checkPermission(user, map.resource, map.action)) return true;
        // If explicit entry exists but mapped action denied, deny access. If no explicit entry, also deny because
        // the resource is protected by the permission catalog (require explicit ticks).
        return false;
      }

      // No mapped action or mapped action not decisive: check common actions (create/update/delete) as before
      const commonActions = ['read', 'create', 'update', 'delete'];
      for (const a of commonActions) {
        if (checkPermission(user, map.resource, a)) return true;
      }
      // If we reached here and there was any explicit permission entry but none matched, deny.
      // If there was no explicit entry, also deny because this resource is managed by the permission catalog.
      return false;
    }

    // If the resource is not in permissionMap, fall back to role membership.
    return Array.isArray(roles) && roles.includes(user.role);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="modern-dashboard">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          {/* Logo Section */}
          <div className="nav-brand">
            <div className="brand-icon">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="brand-text">
              <h1>TimeTrack</h1>
              <span>SLPA Attendance System</span>
            </div>
          </div>

          {/* User Section */}
          <div className="nav-user">
            <div className="welcome-message">
              <div className="greeting">{getGreeting()}</div>
              <div className="welcome-text">Welcome back, {user?.firstName || 'User'}! 👋</div>
            </div>
            
            <div className="time-display">
              <div className="time">{currentTime.time}</div>
              <div className="date">{currentTime.date}</div>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-info">
                <div className="user-name">{user?.firstName || 'User'} {user?.lastName || ''}</div>
                <div className="user-role">{user?.role?.replace('_', ' ') || 'Employee'}</div>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <i className="bi bi-power"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Quick Actions Bar */}
      <div className="quick-actions-bar">
        <div className="actions-container">
          <div className="actions-label">
            <i className="bi bi-lightning-charge"></i>
            <span>Quick Actions</span>
          </div>
          <div className="actions-list">
            {quickActions.map((action) => {
              const access = hasAccess(action.roles, action.id);
              const title = access ? action.label : `${action.label} — You do not have permission`;
              return (
                <button
                  key={action.id}
                  className={`quick-btn ${action.color}`}
                  onClick={() => access && handleQuickAction(action.id)}
                  title={title}
                  disabled={!access}
                  style={{ cursor: access ? 'pointer' : 'not-allowed' }}
                >
                  <i className={`bi ${action.icon}`}></i>
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;