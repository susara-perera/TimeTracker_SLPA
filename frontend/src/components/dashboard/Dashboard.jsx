import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import ReportGeneration from './ReportGeneration';
import DivisionManagement from './DivisionManagement';
import SectionManagement from './SectionManagement';
import RoleAccessManagement from './RoleAccessManagement';
import RoleManagement from './RoleManagement';
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
      case 'role-management':
        return <RoleManagement />;
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

  const hasAccess = (roles) => {
    // For now, return true to show all navigation items
    // TODO: Implement proper role checking when user authentication is fixed
    return true;
    // return roles.includes(user?.role);
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
              if (!hasAccess(action.roles)) return null;
              
              return (
                <button
                  key={action.id}
                  className={`quick-btn ${action.color}`}
                  onClick={() => handleQuickAction(action.id)}
                  title={action.label}
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