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
  const [employeeInfo, setEmployeeInfo] = useState(null);

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
      const response = await fetch('http://localhost:5000/api/divisions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
          setDivisions(data);
        } else if (data.data && Array.isArray(data.data)) {
          setDivisions(data.data);
        } else if (data.divisions && Array.isArray(data.divisions)) {
          setDivisions(data.divisions);
        } else {
          setDivisions([]);
        }
      } else {
        setDivisions([]);
      }
    } catch (err) {
      console.error('Error fetching divisions:', err);
      setDivisions([]);
    }
  };

  const fetchAllSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats for MongoDB
        let sectionsArray = [];
        if (Array.isArray(data)) {
          sectionsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          sectionsArray = data.data;
        } else if (data.sections && Array.isArray(data.sections)) {
          sectionsArray = data.sections;
        }
        
        setAllSections(sectionsArray);
        setSections(sectionsArray);
      } else {
        setAllSections([]);
        setSections([]);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      setAllSections([]);
      setSections([]);
    }
  };

  const fetchSectionsByDivision = async (divId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sections/division/${divId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats for MongoDB
        let sectionsArray = [];
        if (Array.isArray(data)) {
          sectionsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          sectionsArray = data.data;
        } else if (data.sections && Array.isArray(data.sections)) {
          sectionsArray = data.sections;
        }
        
        setSections(sectionsArray);
      } else {
        setSections([]);
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
      let apiUrl = '';
      let payload = {};

      if (reportType === 'attendance') {
        // Use MongoDB API for attendance reports
        apiUrl = 'http://localhost:5000/api/reports/attendance';
        payload = {
          report_type: reportScope,
          employee_id: reportScope === 'individual' ? employeeId : '',
          division_id: reportScope === 'group' ? (divisionId !== 'all' ? divisionId : '') : '',
          section_id: reportScope === 'group' ? (sectionId !== 'all' ? sectionId : '') : '',
          from_date: dateRange.startDate,
          to_date: dateRange.endDate
        };
      } else if (reportType === 'meal') {
        // Use MongoDB API for meal reports
        apiUrl = 'http://localhost:5000/api/meal-reports';
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
        apiUrl += `?${params}`;
      }

      let response;
      if (reportType === 'attendance') {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError('Invalid response from server.');
        setReportData(null);
        return;
      }

      if (!response.ok) {
        setError(data.message || `HTTP error! status: ${response.status}`);
        setReportData(null);
        return;
      }

      // Handle MongoDB response format
      const reportArray = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      if ((data.success && reportArray.length > 0) || (!data.hasOwnProperty('success') && reportArray.length > 0)) {
        setReportData({ ...data, data: reportArray });
        if (data.employee_info) {
          setEmployeeInfo(data.employee_info);
        }
        setError('');
      } else if (reportArray.length === 0) {
        setError('No records found for the selected criteria.');
        setReportData({ ...data, data: [] });
      } else {
        setError(data.message || 'Failed to generate report');
        setReportData(null);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
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

    if (format === 'pdf') {
      printReport();
    }
  };

  const getHeaders = () => {
    if (reportType === 'meal') {
      return reportScope === 'individual'
        ? ['Date', 'Time', 'Meal Type', 'Location', 'Quantity', 'Items']
        : ['Employee ID', 'Employee Name', 'Date', 'Time', 'Meal Type', 'Location', 'Quantity', 'Items'];
    } else {
      return ['Punch Date', 'Punch Time', 'Function', 'Event Description', 'Remarks'];
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
      // Format for attendance report to match your sample
      const eventDescription = `Granted(ID & F ${record.scan_type?.toUpperCase() === 'IN' ? 'ON' : 'OFF'})`;
      return [
        record.date_,
        record.time_,
        record.scan_type?.toUpperCase() === 'IN' ? 'F1-0' : 'F4-0',
        eventDescription,
        'COM0002'
      ];
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

  const printReport = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      alert('No data to print. Please generate a report first.');
      return;
    }
    
    // Create a new window for printing with formatted content
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const generatePrintContent = () => {
    const reportTitle = reportType === 'attendance' ? 'History Transaction Report' : 'Meal Consumption Report';
    const subtitle = reportType === 'attendance' ? 'All Granted(ID & FP) Records' : 'All Meal Records';
    
    let employeeHeader = '';
    if (reportScope === 'individual' && employeeInfo) {
      employeeHeader = `
        <div style="margin-bottom: 20px;">
          <div><strong>Emp No:</strong> ${employeeInfo.employee_id || employeeId}</div>
          <div><strong>Emp Name:</strong> ${employeeInfo.name || 'N/A'}</div>
        </div>
      `;
    }

    const headers = getHeaders();
    const tableRows = reportData.data.map(record => {
      const row = formatRow(record);
      return `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 11px; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .report-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
          .report-subtitle { font-size: 11px; margin-bottom: 15px; }
          .date-range { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 4px 6px; text-align: center; }
          th { background: #f5f5f5; font-weight: bold; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-block { text-align: center; min-width: 200px; }
          .signature-line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
          @media print {
            @page { margin: 0.5in; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">${reportTitle}</div>
          <div class="report-subtitle">${subtitle}</div>
          <div style="text-align: right; font-size: 10px;">
            <div>Printed Date: ${new Date().toLocaleDateString()}</div>
            <div>Printed Time: ${new Date().toLocaleTimeString()}</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
        
        ${employeeHeader}
        
        <div class="date-range">
          <strong>Date From:</strong> ${dateRange.startDate} <strong>To:</strong> ${dateRange.endDate}
        </div>
        
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="signature-section">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Authorized Signature</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Employee Signature</div>
          </div>
        </div>
      </body>
      </html>
    `;
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
                  {(Array.isArray(divisions) ? divisions : []).map(division => (
                    <option key={division._id || division.id} value={division._id || division.id}>
                      {division.name || division.division_name}
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
                  {(Array.isArray(sections) ? sections : []).map(section => (
                    <option key={section._id || section.id} value={section._id || section.id}>
                      {section.name || section.section_name}
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
                  onClick={() => exportReport('pdf')}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-file-earmark-pdf"></i>
                  Print PDF
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
                  Use print function to access all data.
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
