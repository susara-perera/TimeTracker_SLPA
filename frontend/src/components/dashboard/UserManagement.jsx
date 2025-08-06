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
    division: '',
    section: ''
  });

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        setLoading(false);
        // Mock data for now - replace with actual API call
        setUsers([
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
          },
          {
            id: 2,
            firstName: 'John',
            lastName: 'Silva',
            email: 'john.silva@slpa.lk',
            role: 'admin',
            employeeId: 'JS002',
            status: 'active',
            division: 'Operations',
            section: 'Marine'
          },
          {
            id: 3,
            firstName: 'Mary',
            lastName: 'Fernando',
            email: 'mary.fernando@slpa.lk',
            role: 'clerk',
            employeeId: 'MF003',
            status: 'active',
            division: 'Finance',
            section: 'Accounts'
          }
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      role: 'employee',
      password: '',
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
      <div className="page-header">
        <h2><i className="bi bi-people"></i> User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={handleAddUser}
        >
          <i className="bi bi-plus-circle"></i> Add User
        </button>
      </div>

      <div className="users-table-container">
        <div className="table-responsive">
          <table className="table table-striped">
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
                  <td>{user.employeeId}</td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{user.division || 'N/A'}</td>
                  <td>{user.section || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
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

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-person-plus"></i>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    className="form-control"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="clerk">Clerk</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Division</label>
                  <select
                    name="division"
                    className="form-control"
                    value={formData.division}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Division</option>
                    <option value="Administration">Administration</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">Human Resources</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select
                    name="section"
                    className="form-control"
                    value={formData.section}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Section</option>
                    <option value="IT">IT</option>
                    <option value="Marine">Marine</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
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