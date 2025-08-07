import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: 'employee',
    password: '',
    confirmPassword: '',
    division: '',
    section: ''
  });
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    // Fetch users and divisions from API
    const fetchData = async () => {
      try {
        setLoading(false);
        
        // Fetch users - replace with actual API call
        const usersResponse = [
          {
            id: 1,
            firstName: 'Susara',
            lastName: 'Perera',
            email: 'susara_perera@admin',
            role: 'super_admin',
            employeeId: 'SP001',
            status: 'active',
            division: 'Administration',
            section: 'IT'
          }
        ];
        setUsers(usersResponse);
        
        // Fetch divisions - replace with actual API call
        try {
          const token = localStorage.getItem('token');
          const divisionsResponse = await fetch('/api/divisions', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (divisionsResponse.ok) {
            const divisionsData = await divisionsResponse.json();
            setDivisions(divisionsData.data || []);
          } else {
            // Fallback to mock data if API fails
            setDivisions([
              { _id: '1', name: 'Administration', code: 'ADM' },
              { _id: '2', name: 'Operations', code: 'OPS' },
              { _id: '3', name: 'Finance', code: 'FIN' },
              { _id: '4', name: 'Engineering', code: 'ENG' },
              { _id: '5', name: 'Human Resources', code: 'HR' },
              { _id: '6', name: 'Security', code: 'SEC' },
              { _id: '7', name: 'Marine Services', code: 'MAR' }
            ]);
          }
        } catch (divisionError) {
          console.error('Error fetching divisions:', divisionError);
          // Use mock data as fallback
          setDivisions([
            { _id: '1', name: 'Administration', code: 'ADM' },
            { _id: '2', name: 'Operations', code: 'OPS' },
            { _id: '3', name: 'Finance', code: 'FIN' },
            { _id: '4', name: 'Engineering', code: 'ENG' },
            { _id: '5', name: 'Human Resources', code: 'HR' },
            { _id: '6', name: 'Security', code: 'SEC' },
            { _id: '7', name: 'Marine Services', code: 'MAR' }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      role: 'employee',
      password: '',
      confirmPassword: '',
      division: '',
      section: ''
    });
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      password: '',
      confirmPassword: '',
      division: user.division || '',
      section: user.section || ''
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      // TODO: Implement actual API call to delete user
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password confirmation for new users
    if (!editingUser && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.employeeId || !formData.role) {
      alert('Please fill in all required fields!');
      return;
    }
    
    if (!editingUser && !formData.password) {
      alert('Password is required for new users!');
      return;
    }
    
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, id: editingUser.id, status: user.status }
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Date.now(), // Temporary ID
        status: 'active'
      };
      setUsers([...users, newUser]);
    }
    
    setShowAddModal(false);
    setEditingUser(null);
    // TODO: Implement actual API call
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Professional Section Header */}
      <div className="section-header">
        <h2><i className="bi bi-people"></i> User Management</h2>
        <button 
          className="btn-professional btn-primary"
          onClick={handleAddUser}
        >
          <i className="bi bi-plus-circle"></i> Add User
        </button>
      </div>

      {/* Professional Users Table */}
      <div className="professional-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Division</th>
                <th>Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.employeeId}</strong></td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.replace('_', '-')}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{user.division || 'N/A'}</td>
                  <td>{user.section || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-professional btn-primary"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn-professional btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="no-data">
            <p>No users found. Click "Add User" to create the first user.</p>
          </div>
        )}
      </div>

      {/* Professional Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="bi bi-person-plus" style={{ color: 'var(--primary)' }}></i>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                className="modal-close btn-professional btn-danger"
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 12px', fontSize: '16px' }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@slpa.lk"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    className="form-input"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g., EMP001"
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Division *</label>
                  <select
                    name="division"
                    className="form-select"
                    value={formData.division}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map(division => (
                      <option key={division._id || division.id} value={division._id || division.id}>
                        {division.name} ({division.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="administrative_clerk">Administrative Clerk</option>
                    <option value="clerk">Clerk</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <select
                  name="section"
                  className="form-select"
                  value={formData.section}
                  onChange={handleInputChange}
                >
                  <option value="">Select Section</option>
                  <option value="IT">IT</option>
                  <option value="Marine">Marine</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Security">Security</option>
                  <option value="Administration">Administration</option>
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Confirm password"}
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '20px', marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn-professional btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'var(--gray-500)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-professional btn-success"
                >
                  <i className="bi bi-check-circle"></i>
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;