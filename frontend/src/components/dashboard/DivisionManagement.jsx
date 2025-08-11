import React, { useState, useEffect } from 'react';

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDivision, setCurrentDivision] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch divisions from API
  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('Fetching divisions from API...');
      const response = await fetch('http://localhost:5000/api/divisions?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Divisions count:', data.data ? data.data.length : 0);
        console.log('Division details:', data.data);
        setDivisions(data.data || []);
      } else {
        console.error('Failed to fetch divisions:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setDivisions([]);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setDivisions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Division name is required';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Division code is required';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = currentDivision 
        ? `http://localhost:5000/api/divisions/${currentDivision._id}`
        : 'http://localhost:5000/api/divisions';
      
      // Prepare the data
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim()
      };

      console.log('Submitting division data:', submitData);
      console.log('Using URL:', url);
      console.log('Method:', currentDivision ? 'PUT' : 'POST');
      
      const response = await fetch(url, {
        method: currentDivision ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        await fetchDivisions(); // Refresh the list
        handleCloseModal();
        alert(currentDivision ? 'Division updated successfully!' : 'Division created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        
        // Handle validation errors specifically
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          alert(`Validation failed:\n${errorMessages}`);
        } else {
          alert(errorData.message || `Failed to ${currentDivision ? 'update' : 'add'} division`);
        }
      }
    } catch (error) {
      console.error('Error submitting division:', error);
      alert(`Error ${currentDivision ? 'updating' : 'adding'} division. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening edit modal
  const handleEdit = (division) => {
    console.log('Editing division:', division);
    setCurrentDivision(division);
    setFormData({
      name: division.name || '',
      code: division.code || ''
    });
    setFormErrors({});
    setShowEditModal(true);
    console.log('Form data set to:', { name: division.name, code: division.code });
  };

  // Handle delete division
  const handleDelete = async (division) => {
    if (window.confirm(`Are you sure you want to delete "${division.name}" division? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/divisions/${division._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          await fetchDivisions(); // Refresh the list
          alert('Division deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete division');
        }
      } catch (error) {
        console.error('Error deleting division:', error);
        alert('Error deleting division. Please try again.');
      }
    }
  };

  // Handle opening add modal
  const handleAdd = () => {
    setCurrentDivision(null);
    setFormData({ name: '', code: '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Handle closing modals
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentDivision(null);
    setFormData({ name: '', code: '' });
    setFormErrors({});
  };

  // Use effect to fetch divisions on component mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="division-management">
      <div className="section-header">
        <h2><i className="bi bi-building"></i> Division Management</h2>
        <button 
          className="btn-professional btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-circle"></i> Add Division
        </button>
      </div>

      {/* Professional Divisions Table */}
      <div className="professional-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Division Code</th>
                <th>Division Name</th>
                <th>Employees</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.map(division => (
                <tr key={division._id}>
                  <td>
                    <span className="role-badge role-admin">
                      {division.code}
                    </span>
                  </td>
                  <td><strong>{division.name}</strong></td>
                  <td>{division.employeeCount || 0}</td>
                  <td>
                    <span className={`status-badge ${division.isActive ? 'status-active' : 'status-inactive'}`}>
                      {division.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {division.createdAt ? new Date(division.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-professional btn-primary"
                        onClick={() => handleEdit(division)}
                        title="Edit Division"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn-professional btn-danger"
                        onClick={() => handleDelete(division)}
                        title="Delete Division"
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

        {divisions.length === 0 && (
          <div className="no-data">
            <p>No divisions found. Click "Add Division" to create the first division.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Division Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className={`bi ${currentDivision ? "bi-pencil-square" : "bi-plus-circle"}`} style={{ color: 'var(--primary)' }}></i>
                {currentDivision ? 'Edit Division' : 'Add New Division'}
              </h3>
              <button 
                className="modal-close btn-professional btn-danger"
                onClick={handleCloseModal}
                style={{ padding: '8px 12px', fontSize: '16px' }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Division Name *</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter division name"
                  required
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Division Code *</label>
                <input
                  type="text"
                  name="code"
                  className={`form-input ${formErrors.code ? 'error' : ''}`}
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter division code (e.g., ENG, HR)"
                  required
                />
                {formErrors.code && <span className="error-text">{formErrors.code}</span>}
              </div>

              <div className="modal-footer" style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '20px', marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn-professional btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  style={{ background: 'var(--gray-500)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-professional btn-success"
                  disabled={submitting}
                >
                  <i className={`bi ${currentDivision ? "bi-check-circle" : "bi-plus-circle"}`}></i>
                  {submitting ? (
                    currentDivision ? 'Updating...' : 'Adding...'
                  ) : (
                    currentDivision ? 'Update Division' : 'Add Division'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionManagement;