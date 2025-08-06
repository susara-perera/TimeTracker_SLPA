import React, { useState, useEffect } from 'react';

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setSections([
      { id: 1, name: 'Software Development', division: 'Engineering', employeeCount: 45 },
      { id: 2, name: 'Quality Assurance', division: 'Engineering', employeeCount: 25 },
      { id: 3, name: 'Recruitment', division: 'HR', employeeCount: 12 }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="section-management">
      <div className="page-header">
        <h2><i className="bi bi-diagram-3"></i> Section Management</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Add Section
        </button>
      </div>

      <div className="sections-table-container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Section Name</th>
              <th>Division</th>
              <th>Employee Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <tr key={section.id}>
                <td>{section.name}</td>
                <td>{section.division}</td>
                <td>{section.employeeCount}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectionManagement;