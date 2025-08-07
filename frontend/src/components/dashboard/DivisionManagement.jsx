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
      <div className="page-header">
        <h2><i className="bi bi-building"></i> Division Management</h2>
        <button 
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-circle"></i> Add Division
        </button>
      </div>

      <div className="divisions-grid">
        {divisions.length === 0 ? (
          <div className="no-divisions-message">
            <div className="no-data-content">
              <div className="no-data-icon">
                <i className="bi bi-building-x"></i>
              </div>
              <h3>No Divisions Found</h3>
              <p>There are no divisions in the database yet. Create your first division to get started.</p>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="bi bi-plus-circle"></i> Add First Division
              </button>
            </div>
          </div>
        ) : (
          <>
            {divisions.map(division => (
              <div key={division._id} className="division-card">
                <div className="division-header">
                  <h4>{division.name}</h4>
                  <div className="division-code">
                    <i className="bi bi-tag-fill"></i>
                    {division.code}
                  </div>
                </div>
                
                <div className="division-stats">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">{division.employeeCount || 0}</span>
                      <span className="stat-label">Employees</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon success">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">{division.isActive ? 'Active' : 'Inactive'}</span>
                      <span className="stat-label">Status</span>
                    </div>
                  </div>
                </div>
                
                <div className="actions">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(division)}
                  >
                    <i className="bi bi-pencil-square"></i> Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(division)}
                  >
                    <i className="bi bi-trash3"></i> Delete
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add New Division Card */}
            <div 
              className="division-card add-card"
              onClick={handleAdd}
            >
              <div className="add-content">
                <div className="add-icon">
                  <i className="bi bi-plus-circle"></i>
                </div>
                <h4>Add New Division</h4>
                <p>Create a new division to organize your workforce</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Division Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className={currentDivision ? "bi bi-pencil-square" : "bi bi-plus-circle"}></i> 
                {currentDivision ? 'Edit Division' : 'Add New Division'}
              </h2>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="division-form">
                <div className="form-group">
                  <label htmlFor="name">Division Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.name ? 'error' : ''}`}
                    placeholder="Enter division name"
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="code">Division Code *</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.code ? 'error' : ''}`}
                    placeholder="Enter division code (e.g., ENG, HR)"
                  />
                  {formErrors.code && <span className="error-text">{formErrors.code}</span>}
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-professional btn-secondary"
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-professional btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="bi bi-hourglass-split"></i> {currentDivision ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <i className={currentDivision ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                    {currentDivision ? 'Update Division' : 'Add Division'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionManagement;