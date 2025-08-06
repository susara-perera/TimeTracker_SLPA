import React, { useState, useEffect } from 'react';

const DivisionManagement = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setDivisions([
      { id: 1, name: 'Engineering', description: 'Technical Department', employeeCount: 120 },
      { id: 2, name: 'HR', description: 'Human Resources', employeeCount: 25 },
      { id: 3, name: 'Finance', description: 'Financial Department', employeeCount: 35 }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="division-management">
      <div className="page-header">
        <h2><i className="bi bi-building"></i> Division Management</h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Add Division
        </button>
      </div>

      <div className="divisions-grid">
        {divisions.map(division => (
          <div key={division.id} className="division-card">
            <h4>{division.name}</h4>
            <p>{division.description}</p>
            <div className="employee-count">
              <strong>{division.employeeCount}</strong> employees
            </div>
            <div className="actions">
              <button className="btn btn-sm btn-outline-primary">Edit</button>
              <button className="btn btn-sm btn-outline-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DivisionManagement;