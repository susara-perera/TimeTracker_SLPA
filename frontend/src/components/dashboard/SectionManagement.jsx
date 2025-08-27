import React, { useState, useEffect } from 'react';
import usePermission from '../../hooks/usePermission';

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    division: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const canView = usePermission('sections', 'read');
  const canCreate = usePermission('sections', 'create');
  const canUpdate = usePermission('sections', 'update');
  const canDelete = usePermission('sections', 'delete');

  // Fetch sections and divisions
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Fetch sections from API
      try {
        console.log('Fetching sections from API...');
        const sectionsResponse = await fetch('http://localhost:5000/api/sections?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          console.log('Sections API Response:', sectionsData);
          console.log('Sections count:', sectionsData.data ? sectionsData.data.length : 0);
          setSections(sectionsData.data || []);
        } else {
          console.error('Failed to fetch sections:', sectionsResponse.status, sectionsResponse.statusText);
          const errorText = await sectionsResponse.text();
          console.error('Error details:', errorText);
          setSections([]);
        }
      } catch (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        setSections([]);
      }

      // Fetch divisions from API
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          // Use fallback data if no token
          setDivisions([
            { _id: '689443a4c8066bb7f0b32a44', name: 'Information Technology', code: 'IT' },
            { _id: '1', name: 'Administration', code: 'ADM' },
            { _id: '2', name: 'Operations', code: 'OPS' },
            { _id: '3', name: 'Finance', code: 'FIN' },
            { _id: '4', name: 'Engineering', code: 'ENG' },
            { _id: '5', name: 'Human Resources', code: 'HR' },
            { _id: '6', name: 'Security', code: 'SEC' },
            { _id: '7', name: 'Marine Services', code: 'MAR' }
          ]);
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
          console.log('Divisions API Response:', data);
          console.log('Divisions count:', data.data ? data.data.length : 0);
          setDivisions(data.data || []);
        } else {
          console.error('Failed to fetch divisions:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error details:', errorText);
          
          // Fallback to mock data if API fails
          setDivisions([
            { _id: '689443a4c8066bb7f0b32a44', name: 'Information Technology', code: 'IT' },
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
          { _id: '689443a4c8066bb7f0b32a44', name: 'Information Technology', code: 'IT' },
          { _id: '1', name: 'Administration', code: 'ADM' },
          { _id: '2', name: 'Operations', code: 'OPS' },
          { _id: '3', name: 'Finance', code: 'FIN' },
          { _id: '4', name: 'Engineering', code: 'ENG' },
          { _id: '5', name: 'Human Resources', code: 'HR' },
          { _id: '6', name: 'Security', code: 'SEC' },
          { _id: '7', name: 'Marine Services', code: 'MAR' }
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Helper function to get division name by ID
  const getDivisionName = (divisionId) => {
    // If divisionId is an object (populated), return its name directly
    if (typeof divisionId === 'object' && divisionId?.name) {
      return divisionId.name;
    }
    
    // Otherwise, find division by ID
    const division = divisions.find(div => (div._id || div.id) === divisionId);
    return division ? division.name : 'N/A';
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
      errors.name = 'Section name is required';
    }
    
    if (!formData.division) {
      errors.division = 'Division is required';
    }
    
    console.log('Form validation:', { formData, errors, divisionsCount: divisions.length });
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Front-end permission safeguard
    if (!canCreate && !canUpdate) {
      alert('You do not have permission to perform this action.');
      return;
    }

    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        setSubmitting(false);
        return;
      }

      // Prepare the data
      const submitData = {
        name: formData.name.trim(),
        division: formData.division,
        code: formData.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10), // Generate valid code from name
        status: 'active'
      };

      console.log('Submitting section data:', submitData);
      console.log('Token available:', !!token);
      console.log('Request URL:', currentSection ? 
        `http://localhost:5000/api/sections/${currentSection._id}` : 
        'http://localhost:5000/api/sections'
      );
      
      if (currentSection) {
        // Update existing section
        const response = await fetch(`http://localhost:5000/api/sections/${currentSection._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(submitData)
        });

        console.log('Update response status:', response.status);
        console.log('Update response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const updatedSection = await response.json();
          console.log('Section updated:', updatedSection);
          
          // Refresh data to get updated information
          await fetchData();
          alert('Section updated successfully!');
        } else {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            console.error('Failed to update section:', response.status, errorData);
            
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map(err => err.message).join(', ');
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (jsonError) {
            console.error('Error parsing response:', jsonError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
          alert(`Failed to update section: ${errorMessage}`);
        }
      } else {
        // Add new section
        const response = await fetch('http://localhost:5000/api/sections', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(submitData)
        });

        console.log('Create response status:', response.status);
        console.log('Create response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const newSection = await response.json();
          console.log('Section created:', newSection);
          
          // Refresh data to get updated information
          await fetchData();
          alert('Section created successfully!');
        } else {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            console.error('Failed to create section:', response.status, errorData);
            
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map(err => err.message).join(', ');
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (jsonError) {
            console.error('Error parsing response:', jsonError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
          alert(`Failed to create section: ${errorMessage}`);
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting section:', error);
      alert(`Error ${currentSection ? 'updating' : 'adding'} section. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening edit modal
  const handleEdit = (section) => {
    console.log('Editing section:', section);
    setCurrentSection(section);
    setFormData({
      name: section.name || '',
      division: section.division?._id || section.division || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Handle delete section
  const handleDelete = async (section) => {
    if (window.confirm(`Are you sure you want to delete "${section.name}" section? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Authentication token not found. Please log in again.');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/sections/${section._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          console.log('Section deleted:', section._id);
          
          // Refresh data to get updated information
          await fetchData();
          alert('Section deleted successfully!');
        } else {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            console.error('Failed to delete section:', response.status, errorData);
            
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map(err => err.message).join(', ');
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (jsonError) {
            console.error('Error parsing response:', jsonError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
          alert(`Failed to delete section: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error deleting section:', error);
        alert('Error deleting section. Please try again.');
      }
    }
  };

  // Handle opening add modal
  const handleAdd = () => {
    setCurrentSection(null);
    setFormData({ name: '', division: '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Handle closing modals
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentSection(null);
    setFormData({ name: '', division: '' });
    setFormErrors({});
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

    if (!canView) {
      return (
        <div className="section-management">
          <div className="section-header">
            <h2><i className="bi bi-diagram-3"></i> Section Management</h2>
          </div>
          <div className="professional-card">
            <div className="no-data">
              <p>You do not have permission to view sections. Contact a Super Admin for access.</p>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="section-management">
      {/* Professional Section Header */}
      <div className="section-header">
        <h2><i className="bi bi-diagram-3"></i> Section Management</h2>
        <button 
          className="btn-professional btn-primary"
          onClick={canCreate ? handleAdd : undefined}
          disabled={!canCreate}
          title={!canCreate ? 'You do not have permission to add sections' : 'Add Section'}
          style={{ cursor: canCreate ? 'pointer' : 'not-allowed' }}
        >
          <i className="bi bi-plus-circle"></i> Add Section
        </button>
      </div>

      {/* Professional Sections Table */}
      <div className="professional-card">
        <div className="table-responsive">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Section Name</th>
                <th>Division</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => (
                <tr key={section._id}>
                  <td><strong>{section.name}</strong></td>
                  <td>
                    <span className="role-badge role-admin">
                      {getDivisionName(section.division)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${(section.status === 'active' || section.isActive) ? 'status-active' : 'status-inactive'}`}>
                      {(section.status === 'active' || section.isActive) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {section.createdAt ? new Date(section.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-professional btn-primary"
                        onClick={canUpdate ? () => handleEdit(section) : undefined}
                        title={!canUpdate ? 'No permission to edit sections' : 'Edit Section'}
                        disabled={!canUpdate}
                        style={{ padding: '8px 12px', fontSize: '12px', cursor: canUpdate ? 'pointer' : 'not-allowed' }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn-professional btn-danger"
                        onClick={canDelete ? () => handleDelete(section) : undefined}
                        title={!canDelete ? 'No permission to delete sections' : 'Delete Section'}
                        disabled={!canDelete}
                        style={{ padding: '8px 12px', fontSize: '12px', cursor: canDelete ? 'pointer' : 'not-allowed' }}
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

        {sections.length === 0 && (
          <div className="no-data">
            <p>No sections found. Click "Add Section" to create the first section.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Section Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content professional-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className={`bi ${currentSection ? "bi-pencil-square" : "bi-plus-circle"}`} style={{ color: 'var(--primary)' }}></i>
                {currentSection ? 'Edit Section' : 'Add New Section'}
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
                <label className="form-label">Section Name *</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter section name"
                  required
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Division *</label>
                <select
                  name="division"
                  className={`form-select ${formErrors.division ? 'error' : ''}`}
                  value={formData.division}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(division => (
                    <option key={division._id} value={division._id}>
                      {division.name} ({division.code})
                    </option>
                  ))}
                </select>
                {formErrors.division && <span className="error-text">{formErrors.division}</span>}
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
                  disabled={submitting || (!canCreate && !canUpdate)}
                  aria-disabled={submitting || (!canCreate && !canUpdate)}
                  title={!canCreate && !canUpdate ? 'You do not have permission to perform this action' : ''}
                >
                  <i className={`bi ${currentSection ? "bi-check-circle" : "bi-plus-circle"}`}></i>
                  {submitting ? (
                    currentSection ? 'Updating...' : 'Adding...'
                  ) : (
                    currentSection ? 'Update Section' : 'Add Section'
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

export default SectionManagement;