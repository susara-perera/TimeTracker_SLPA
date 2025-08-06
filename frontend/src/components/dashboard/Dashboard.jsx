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
      case 'add-user':
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

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-grid-1x2',
      roles: ['super_admin', 'admin', 'clerk', 'employee']
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'bi-people',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bi-graph-up',
      roles: ['super_admin', 'admin', 'clerk']
    },
    {
      id: 'divisions',
      label: 'Divisions',
      icon: 'bi-building',
      roles: ['super_admin']
    },
    {
      id: 'sections',
      label: 'Sections',
      icon: 'bi-diagram-3',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'roles',
      label: 'Roles',
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

  const quickActions = [
    {
      id: 'home',
      label: 'Home',
      icon: 'bi-house',
      color: 'primary',
      roles: ['super_admin', 'admin', 'clerk', 'employee']
    },
    {
      id: 'add-user',
      label: 'Add User',
      icon: 'bi-person-plus',
      color: 'success',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'divisions',
      label: 'Division Manage',
      icon: 'bi-building',
      color: 'warning',
      roles: ['super_admin']
    },
    {
      id: 'sections',
      label: 'Section Manage',
      icon: 'bi-diagram-3',
      color: 'purple',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'reports',
      label: 'Report Generation',
      icon: 'bi-graph-up',
      color: 'info',
      roles: ['super_admin', 'admin', 'clerk']
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
    return roles.includes(user?.role);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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

          {/* Main Navigation */}
          <div className="nav-menu">
            {menuItems.map((item) => {
              if (!hasAccess(item.roles)) return null;
              
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="nav-user">
            <div className="time-display">
              <div className="time">{currentTime.time}</div>
              <div className="date">{currentTime.date}</div>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-info">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role?.replace('_', ' ')}</div>
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
              console.log('Checking access for action:', action.id, 'User role:', user?.role, 'Action roles:', action.roles, 'Has access:', hasAccess(action.roles));
              // Temporarily show all buttons for debugging
              // if (!hasAccess(action.roles)) return null;
              
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
          <div className="greeting-text">
            {getGreeting()}, {user?.firstName}! 👋
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