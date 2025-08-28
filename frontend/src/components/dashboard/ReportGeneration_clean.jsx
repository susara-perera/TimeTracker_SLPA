import React, { useState, useEffect } from 'react';
import usePermission from '../../hooks/usePermission';
import './ReportGeneration.css';

const ReportGeneration = () => {
  const [reportType, setReportType] = useState('attendance');
  const [reportScope, setReportScope] = useState('individual');
  const [employeeId, setEmployeeId] = useState('');
  const [divisionId, setDivisionId] = useState('all');
  const [sectionId, setSectionId] = useState('all');
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // permission checks
  const canGenerate = usePermission('reports', 'create');

  // Fetch divisions and sections on component mount
  useEffect(() => {
    fetchDivisions();
    fetchAllSections();
    
    // Set default date range to today
    const today = new Date().toISOString().split('T')[0];
    setDateRange({
      startDate: today,
      endDate: today
    });
  }, []);

  // Fetch sections when division changes
  useEffect(() => {
    if (divisionId && divisionId !== 'all') {
      fetchSectionsByDivision(divisionId);
    } else {
      setSections(allSections);
      setSectionId('all');
    }
  }, [divisionId, allSections]);

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/mysql/divisions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDivisions(data);
      }
    } catch (err) {
      console.error('Error fetching divisions:', err);
    }
  };

  const fetchAllSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/mysql/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllSections(data);
        setSections(data);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const fetchSectionsByDivision = async (divId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/mysql/sections/division/${divId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (err) {
      console.error('Error fetching sections by division:', err);
      setSections([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!canGenerate) {
      setError('You do not have permission to generate reports');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (reportScope === 'individual' && !employeeId) {
      setError('Please enter an employee ID for individual reports');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = reportType === 'meal' ? 'meal-reports' : 'attendance-reports';
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        scope: reportScope,
        ...(reportScope === 'individual' && { employeeId }),
        ...(reportScope === 'group' && { 
          divisionId: divisionId !== 'all' ? divisionId : '',
          sectionId: sectionId !== 'all' ? sectionId : ''
        })
      });

      const response = await fetch(`http://localhost:5000/api/mysql/${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setReportData(data);
        setError('');
      } else {
        setError(data.message || 'Failed to generate report');
        setReportData(null);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      setError('No data to export. Please generate a report first.');
      return;
    }

    const headers = getHeaders();
    const rows = reportData.data.map(formatRow);
    
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      downloadFile(csvContent, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    } else if (format === 'json') {
      const jsonData = {
        reportType,
        reportScope,
        dateRange,
        generatedAt: new Date().toISOString(),
        data: reportData.data
      };
      
      downloadFile(JSON.stringify(jsonData, null, 2), `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    }
  };

  const getHeaders = () => {
    if (reportType === 'meal') {
      return reportScope === 'individual'
        ? ['Date', 'Time', 'Meal Type', 'Location', 'Quantity', 'Items']
        : ['Employee ID', 'Employee Name', 'Date', 'Time', 'Meal Type', 'Location', 'Quantity', 'Items'];
    } else {
      return reportScope === 'individual'
        ? ['Date', 'Time', 'Scan Type', 'Status']
        : ['Employee ID', 'Employee Name', 'Date', 'Time', 'Scan Type', 'Status'];
    }
  };

  const formatRow = (record) => {
    if (reportType === 'meal') {
      const mealTime = new Date(record.mealTime || record.meal_time).toLocaleTimeString();
      const items = record.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'Standard Meal';
      const quantity = record.items?.reduce((total, item) => total + item.quantity, 0) || 1;
      
      return reportScope === 'individual'
        ? [record.date || record.meal_date, mealTime, record.mealType || record.meal_type, record.location || 'Cafeteria', quantity, items]
        : [record.employee_id || record.user?.employeeId, record.employee_name || `${record.user?.firstName} ${record.user?.lastName}`, record.date || record.meal_date, mealTime, record.mealType || record.meal_type, record.location || 'Cafeteria', quantity, items];
    } else {
      return reportScope === 'individual'
        ? [record.date_, record.time_, record.scan_type, record.scan_type?.toUpperCase() === 'IN' ? 'ON' : 'OFF']
        : [record.employee_ID, record.employee_name, record.date_, record.time_, record.scan_type, record.scan_type?.toUpperCase() === 'IN' ? 'ON' : 'OFF'];
    }
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Print functionality - simplified placeholder
  const printReport = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      alert('No data to print. Please generate a report first.');
      return;
    }
    
    // Simple print functionality - opens print dialog with current page
    window.print();
  };

  return (
    <div className="report-generation">
      {/* Header Section */}
      <div className="report-header">
        <div className="header-content">
          <h1>
            <i className="bi bi-graph-up-arrow"></i>
            Report Generation Center
          </h1>
          <p className="header-subtitle">Generate comprehensive attendance and meal reports with advanced filtering options</p>
        </div>
      </div>

      {/* Report Configuration Form */}
      <div className="report-config">
        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-grid">
            {/* Report Type Selection */}
            <div className="form-group">
              <label htmlFor="reportType">
                <i className="bi bi-file-earmark-text"></i>
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-control"
              >
                <option value="attendance">Attendance Report</option>
                <option value="meal">Meal Report</option>
              </select>
            </div>

            {/* Report Scope Selection */}
            <div className="form-group">
              <label htmlFor="reportScope">
                <i className="bi bi-people"></i>
                Report Scope
              </label>
              <select
                id="reportScope"
                value={reportScope}
                onChange={(e) => setReportScope(e.target.value)}
                className="form-control"
              >
                <option value="individual">Individual Report</option>
                <option value="group">Group Report</option>
              </select>
            </div>

            {/* Employee ID (for individual reports) */}
            {reportScope === 'individual' && (
              <div className="form-group">
                <label htmlFor="employeeId">
                  <i className="bi bi-person-badge"></i>
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="form-control"
                  placeholder="Enter employee ID"
                  required
                />
              </div>
            )}

            {/* Division Selection (for group reports) */}
            {reportScope === 'group' && (
              <div className="form-group">
                <label htmlFor="divisionId">
                  <i className="bi bi-building"></i>
                  Division
                </label>
                <select
                  id="divisionId"
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Divisions</option>
                  {divisions.map(division => (
                    <option key={division.division_id} value={division.division_id}>
                      {division.division_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Section Selection (for group reports) */}
            {reportScope === 'group' && (
              <div className="form-group">
                <label htmlFor="sectionId">
                  <i className="bi bi-diagram-3"></i>
                  Section
                </label>
                <select
                  id="sectionId"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Sections</option>
                  {sections.map(section => (
                    <option key={section.section_id} value={section.section_id}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div className="form-group">
              <label htmlFor="startDate">
                <i className="bi bi-calendar3"></i>
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                <i className="bi bi-calendar3"></i>
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || !canGenerate}
              className="btn btn-primary btn-generate"
            >
              {loading ? (
                <>
                  <i className="bi bi-hourglass-split spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-play-circle"></i>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Report Results */}
      {reportData && reportData.data && reportData.data.length > 0 ? (
        <div className="report-results">
          <div className="results-header">
            <h3>
              <i className="bi bi-file-earmark-check"></i>
              Report Generated Successfully
            </h3>
            <div className="report-meta">
              <span className="record-count">
                <i className="bi bi-list-ol"></i>
                {reportData.data.length} records found
              </span>
              <span className="generated-time">
                <i className="bi bi-clock"></i>
                Generated at {new Date().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Export and Print Actions */}
          <div className="results-actions">
            <div className="action-group">
              <h4>
                <i className="bi bi-download"></i>
                Export Options
              </h4>
              <div className="action-buttons">
                <button
                  onClick={() => exportReport('csv')}
                  className="btn btn-outline-success"
                >
                  <i className="bi bi-file-earmark-spreadsheet"></i>
                  Export CSV
                </button>
                <button
                  onClick={() => exportReport('json')}
                  className="btn btn-outline-info"
                >
                  <i className="bi bi-file-earmark-code"></i>
                  Export JSON
                </button>
                <button
                  onClick={printReport}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-printer"></i>
                  Print Report
                </button>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="data-preview">
            <h4>
              <i className="bi bi-table"></i>
              Data Preview
            </h4>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    {getHeaders().map((header, index) => (
                      <th key={index} scope="col">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.slice(0, 10).map((record, index) => {
                    const row = formatRow(record);
                    return (
                      <tr key={index}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {reportData.data.length > 10 && (
                <p className="preview-note">
                  <i className="bi bi-info-circle"></i>
                  Showing first 10 records of {reportData.data.length} total records.
                  Use export functions to access all data.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : reportData && (!reportData.data || reportData.data.length === 0) ? (
        <div className="report-results">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-inbox"></i>
            </div>
            <h4 className="empty-title">No Data Found</h4>
            <p className="empty-text">No records found for the selected criteria. Try adjusting your filters.</p>
          </div>
        </div>
      ) : !loading && (
        <div className="report-results">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-file-earmark-bar-graph"></i>
            </div>
            <h4 className="empty-title">Ready to Generate Reports</h4>
            <p className="empty-text">Configure your report parameters above and click "Generate Report" to start.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;
