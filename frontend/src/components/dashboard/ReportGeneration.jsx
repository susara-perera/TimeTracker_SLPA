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
  const canView = usePermission('reports', 'read');

  // Fetch divisions and sections on component mount
  useEffect(() => {
    fetchDivisions();
    fetchAllSections();
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
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDivisions(data.divisions || []);
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
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllSections(data.sections || []);
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const fetchSectionsByDivision = async (divisionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/mysql/sections?division_id=${divisionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
        setSectionId('all'); // Reset section selection
      }
    } catch (err) {
      console.error('Error fetching sections by division:', err);
    }
  };

  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (reportScope === 'individual' && !employeeId && reportType === 'attendance') {
      setError('Please enter Employee ID for individual reports');
      return;
    }

    setLoading(true);
    setError('');
    setReportData(null);

    try {
      let endpoint = '';
      let requestData = {
        from_date: dateRange.startDate,
        to_date: dateRange.endDate,
        report_type: reportScope
      };

      // Add employee ID for individual reports
      if (reportScope === 'individual' && employeeId) {
        requestData.employee_id = employeeId;
      }

      // Add division and section filters for group attendance reports
      if (reportScope === 'group' && reportType === 'attendance') {
        if (divisionId && divisionId !== 'all') {
          requestData.division_id = divisionId;
        }
        if (sectionId && sectionId !== 'all') {
          requestData.section_id = sectionId;
        }
      }

      // Determine endpoint based on report type
      switch (reportType) {
        case 'attendance':
          endpoint = '/api/reports/mysql/attendance';
          break;
        case 'meal':
          endpoint = '/api/reports/mysql/meal';
          break;
        case 'audit':
          endpoint = '/api/reports/audit';
          break;
        default:
          endpoint = '/api/reports/mysql/attendance';
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReportData(data);
        console.log('Report generated successfully:', data);
      } else {
        setError(data.message || 'Failed to generate report');
      }

    } catch (err) {
      console.error('Report generation error:', err);
      setError('Network error occurred while generating report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format = 'csv') => {
    if (!reportData || !reportData.data) {
      setError('No data to export');
      return;
    }

    try {
      let content = '';
      let filename = `${reportType}_report_${reportScope}`;
      
      // Add division/section info to filename if applicable
      if (reportScope === 'group' && reportType === 'attendance') {
        if (divisionId !== 'all') {
          const selectedDivision = divisions.find(d => d.division_id === divisionId);
          if (selectedDivision) {
            filename += `_${selectedDivision.division_name.replace(/\s+/g, '_')}`;
          }
        }
        if (sectionId !== 'all') {
          const selectedSection = sections.find(s => s.section_id === sectionId);
          if (selectedSection) {
            filename += `_${selectedSection.section_name.replace(/\s+/g, '_')}`;
          }
        }
      }
      
      filename += `_${dateRange.startDate}_to_${dateRange.endDate}`;

      if (format === 'csv') {
        // Generate CSV content
        if (reportType === 'attendance') {
          const headers = ['Attendance ID', 'Employee ID', 'Employee Name', 'Division', 'Section', 'Date', 'Time', 'Scan Type'];
          content = headers.join(',') + '\n';
          
          reportData.data.forEach(record => {
            const row = [
              record.attendance_id || '',
              record.employee_ID || '',
              record.employee_name || '',
              record.division_name || '',
              record.section_name || '',
              record.date_ || '',
              record.time_ || '',
              record.scan_type || ''
            ];
            content += row.map(field => `"${field}"`).join(',') + '\n';
          });
        } else if (reportType === 'meal') {
          const headers = ['ID', 'Employee ID', 'Meal Date', 'Meal Type', 'Booking Time', 'Status'];
          content = headers.join(',') + '\n';
          
          reportData.data.forEach(record => {
            const row = [
              record.id || '',
              record.employee_id || '',
              record.meal_date || '',
              record.meal_type || '',
              record.booking_time || '',
              record.status || ''
            ];
            content += row.map(field => `"${field}"`).join(',') + '\n';
          });
        }

        filename += '.csv';
      } else if (format === 'json') {
        content = JSON.stringify(reportData, null, 2);
        filename += '.json';
      }

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    }
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
          <p className="header-subtitle">
            Generate comprehensive attendance, meal, and audit reports with advanced filtering and export capabilities
          </p>
        </div>
      </div>

      <div className="report-container">
        {/* Report Controls */}
        <div className="report-controls">
          <div className="controls-header">
            <h2 className="controls-title">Report Configuration</h2>
            <p className="controls-subtitle">Configure your report parameters and generate detailed analytics</p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Report Type</label>
              <select 
                className="field-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="attendance">📊 Attendance Report</option>
                <option value="meal">🍽️ Meal Report</option>
                <option value="audit">🔍 Audit Report</option>
              </select>
            </div>

            {(reportType === 'attendance' || reportType === 'meal') && (
              <div className="form-field">
                <label className="field-label">Report Scope</label>
                <select 
                  className="field-input"
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value)}
                >
                  <option value="individual">👤 Individual Report</option>
                  <option value="group">👥 Group Report</option>
                </select>
              </div>
            )}

            {reportScope === 'group' && reportType === 'attendance' && (
              <>
                <div className="form-field">
                  <label className="field-label">Division Filter</label>
                  <select 
                    className="field-input"
                    value={divisionId}
                    onChange={(e) => setDivisionId(e.target.value)}
                  >
                    <option value="all">🏢 All Divisions</option>
                    {divisions.map((division) => (
                      <option key={division.division_id} value={division.division_id}>
                        📋 {division.division_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Section Filter</label>
                  <select 
                    className="field-input"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                  >
                    <option value="all">🏢 All Sections</option>
                    {sections.map((section) => (
                      <option key={section.section_id} value={section.section_id}>
                        📋 {section.section_name} {section.division_name ? `(${section.division_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {reportScope === 'individual' && (reportType === 'attendance' || reportType === 'meal') && (
              <div className="form-field">
                <label className="field-label">Employee ID</label>
                <input 
                  type="text"
                  className="field-input"
                  placeholder="Enter Employee ID (e.g., SA1001, 006, etc.)"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
            )}

            <div className="date-range-grid">
              <div className="form-field">
                <label className="field-label">Start Date</label>
                <input 
                  type="date"
                  className="field-input"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div className="form-field">
                <label className="field-label">End Date</label>
                <input 
                  type="date"
                  className="field-input"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

            <div className="action-section">
            {/* Permission banner: inform user which report actions are disabled */}
            {(!canGenerate || !canView) && (
              <div className="permission-banner">
                { !canGenerate && <span className="banner-item">You do not have permission to generate reports.</span> }
                { !canView && <span className="banner-item">You do not have permission to view/export reports.</span> }
                <span className="banner-help">Contact a Super Admin for access.</span>
              </div>
            )}
            <div>
              {error && (
                <div className="error-message">
                  <i className="bi bi-exclamation-triangle"></i>
                  {error}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {reportData && (
                <div className="export-actions">
                  <button 
                    className="export-btn csv"
                    onClick={() => { if (!canView) { setError('You do not have permission to export reports.'); return; } exportReport('csv'); }}
                    disabled={!canView}
                    title={!canView ? 'No permission to export' : 'Export CSV'}
                  >
                    <i className="bi bi-filetype-csv"></i>
                    Export CSV
                  </button>
                  <button 
                    className="export-btn json"
                    onClick={() => { if (!canView) { setError('You do not have permission to export reports.'); return; } exportReport('json'); }}
                    disabled={!canView}
                    title={!canView ? 'No permission to export' : 'Export JSON'}
                  >
                    <i className="bi bi-filetype-json"></i>
                    Export JSON
                  </button>
                </div>
              )}
              
              <button 
                className="generate-btn"
                onClick={() => { if (!canGenerate) { setError('You do not have permission to generate reports.'); return; } generateReport(); }}
                disabled={loading || !canGenerate}
                title={!canGenerate ? 'No permission to generate reports' : 'Generate Report'}
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-clockwise spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill"></i>
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {reportData ? (
          <div className="report-results">
            <div className="results-header">
              <h3 className="results-title">
                <i className="bi bi-clipboard-data"></i>
                Report Results
                {reportScope === 'group' && reportType === 'attendance' && (
                  <span className="filter-info">
                    {reportData.summary?.division_filter && (
                      <span className="division-info"> - {reportData.summary.division_filter}</span>
                    )}
                    {reportData.summary?.section_filter && (
                      <span className="section-info"> - {reportData.summary.section_filter}</span>
                    )}
                  </span>
                )}
              </h3>
            </div>

            {/* Statistics Grid */}
            <div className="stats-grid">
              {reportType === 'attendance' && (
                <>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.total_records}</span>
                    <span className="stat-label">Total Records</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.unique_employees}</span>
                    <span className="stat-label">Unique Employees</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.in_scans}</span>
                    <span className="stat-label">IN Scans</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.out_scans}</span>
                    <span className="stat-label">OUT Scans</span>
                  </div>
                </>
              )}
              
              {reportType === 'meal' && (
                <>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.total_bookings}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.unique_employees}</span>
                    <span className="stat-label">Unique Employees</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.breakfast_bookings}</span>
                    <span className="stat-label">Breakfast</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.lunch_bookings}</span>
                    <span className="stat-label">Lunch</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{reportData.summary.dinner_bookings}</span>
                    <span className="stat-label">Dinner</span>
                  </div>
                </>
              )}
            </div>

            {/* Data Section */}
            <div className="data-section">
              <div className="data-header">
                <h4 className="data-title">Detailed Records</h4>
                <span className="record-count">{reportData.data.length} records</span>
              </div>

              {reportData.data.length > 0 ? (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {reportType === 'attendance' && (
                          <>
                            <th>Attendance ID</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Division</th>
                            <th>Section</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                          </>
                        )}
                        {reportType === 'meal' && (
                          <>
                            <th>ID</th>
                            <th>Employee ID</th>
                            <th>Meal Date</th>
                            <th>Meal Type</th>
                            <th>Booking Time</th>
                            <th>Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.slice(0, 100).map((record, index) => (
                        <tr key={index}>
                          {reportType === 'attendance' && (
                            <>
                              <td>{record.attendance_id}</td>
                              <td>{record.employee_ID}</td>
                              <td>{record.employee_name || 'Unknown'}</td>
                              <td>{record.division_name || 'Unknown'}</td>
                              <td>{record.section_name || 'Unknown'}</td>
                              <td>{record.date_}</td>
                              <td>{record.time_}</td>
                              <td>
                                <span className={`status-badge ${record.scan_type?.toUpperCase() === 'IN' ? 'badge-in' : 'badge-out'}`}>
                                  {record.scan_type}
                                </span>
                              </td>
                            </>
                          )}
                          {reportType === 'meal' && (
                            <>
                              <td>{record.id}</td>
                              <td>{record.employee_id}</td>
                              <td>{record.meal_date}</td>
                              <td>{record.meal_type}</td>
                              <td>{record.booking_time}</td>
                              <td>{record.status}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {reportData.data.length > 100 && (
                    <div className="pagination-info">
                      Showing first 100 records of {reportData.data.length} total records. 
                      Use export function to download complete data.
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h4 className="empty-title">No Data Found</h4>
                  <p className="empty-text">No records found for the selected criteria. Try adjusting your filters.</p>
                </div>
              )}
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
    </div>
  );
};

export default ReportGeneration;