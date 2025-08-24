import React, { useState, useEffect } from 'react';
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

  const printReport = () => {
    if (!reportData || !reportData.data) {
      setError('No data to print');
      return;
    }

    try {
      // Get employee info from first record for individual reports
      const firstRecord = reportData.data[0];
      const isIndividualReport = reportScope === 'individual';
      
      // Group data by date for individual reports
      const groupedData = {};
      if (isIndividualReport) {
        reportData.data.forEach(record => {
          const date = record.date_;
          if (!groupedData[date]) {
            groupedData[date] = [];
          }
          groupedData[date].push(record);
        });
      }

      // Create print content matching the image format
      let printContent = `
        <html>
          <head>
            <title>Attendance Report</title>
            <style>
              @page {
                margin: 0.5in;
                size: A4;
              }
              
              body { 
                font-family: 'Courier New', monospace;
                margin: 0;
                padding: 0;
                font-size: 11px;
                line-height: 1.2;
                color: #000;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .report-header { 
                margin-bottom: 15px;
              }
              
              .report-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 3px;
                text-align: center;
              }
              
              .report-subtitle {
                font-size: 11px;
                margin-bottom: 10px;
                text-align: center;
              }
              
              .header-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              
              .left-info, .right-info {
                font-size: 10px;
              }
              
              .employee-info {
                margin-bottom: 10px;
                font-size: 11px;
              }
              
              .date-range {
                margin-bottom: 15px;
                font-size: 11px;
                text-align: center;
              }
              
              .data-table { 
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
                margin-bottom: 20px;
                border: 1px solid #000;
                table-layout: fixed;
              }
              
              .data-table th { 
                border: 1px solid #000;
                padding: 4px 6px;
                text-align: center;
                font-weight: bold;
                background: #f5f5f5;
                font-size: 10px;
              }
              
              .data-table td { 
                border: 1px solid #000;
                padding: 4px 6px;
                text-align: center;
                margin: 0;
                vertical-align: top;
                font-size: 10px;
              }
              
              .date-cell {
                text-align: left;
                vertical-align: top;
                padding: 4px 6px;
                font-weight: bold;
                line-height: 1.2;
              }
              
              .date-cell-empty {
                padding: 4px 6px;
                text-align: center;
              }
              
              .function-col {
                text-align: center;
                font-weight: bold;
              }
              
              .on-status {
                font-weight: bold;
              }
              
              .off-status {
                font-weight: bold;
              }
              
              .signature-section {
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                align-items: flex-end;
              }
              
              .signature-block {
                text-align: center;
                min-width: 150px;
              }
              
              .signature-line {
                border-bottom: 1px solid #000;
                height: 40px;
                margin-bottom: 5px;
                width: 100%;
              }
              
              .signature-label {
                font-size: 10px;
                font-weight: normal;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div class="report-title">Unit Attendance Report</div>
              <div class="report-subtitle">All Granted(ID & FP) Records</div>
              
              <div class="header-info">
                <div class="left-info">`;

      if (isIndividualReport && firstRecord) {
        printContent += `
                  <div>Emp No :- ${firstRecord.employee_ID || 'N/A'}</div>
                  <div>Emp Name :- ${firstRecord.employee_name || 'Unknown'}</div>`;
      }

      printContent += `
                </div>
                <div class="right-info">
                  <div>Printed Date : ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                  <div>Printed Time : ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                  <div>Page 1 of 1</div>
                </div>
              </div>
              
              <div class="date-range">
                <strong>Date From</strong> ${new Date(dateRange.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} 
                <strong style="margin-left: 40px;">To</strong> ${new Date(dateRange.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
              </div>
            </div>`;

      // Create table with proper format
      printContent += `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 18%;">Punch Date</th>
                  <th style="width: 12%;">Punch Time</th>
                  <th style="width: 10%;">Function</th>
                  <th style="width: 20%;">Event Description</th>
                  <th style="width: 40%;">Remarks</th>
                </tr>
              </thead>
              <tbody>`;

      if (isIndividualReport) {
        // Sort dates and group data properly
        const sortedDates = Object.keys(groupedData).sort();
        
        sortedDates.forEach(date => {
          const records = groupedData[date];
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
          const day = new Date(date).getDate().toString().padStart(2, '0');
          const month = new Date(date).toLocaleDateString('en-GB', { month: 'short' });
          const year = new Date(date).getFullYear().toString().slice(-2);
          const formattedDate = `${day}-${month}-${year}`;
          
          // Sort records by time for each date
          records.sort((a, b) => (a.time_ || '').localeCompare(b.time_ || ''));
          
          records.forEach((record, index) => {
            const isOnScan = record.scan_type?.toUpperCase() === 'IN';
            const functionCode = isOnScan ? 'F1-0' : 'F4-0';
            const status = isOnScan ? 'ON' : 'OFF';
            const showDate = index === 0; // Only show date on first row for each date group
            
            printContent += `
                <tr>
                  <td class="${showDate ? 'date-cell' : 'date-cell-empty'}">
                    ${showDate ? `${formattedDate}<br/>${dayName}` : ''}
                  </td>
                  <td>${record.time_ || ''}</td>
                  <td class="function-col">${functionCode}</td>
                  <td class="${isOnScan ? 'on-status' : 'off-status'}">${status}</td>
                  <td>Granted(ID & F) COM0002</td>
                </tr>`;
          });
        });
      } else {
        // Group report - group by date and show clean format
        const groupedData = {};
        reportData.data.forEach(record => {
          const dateKey = record.date_;
          if (!groupedData[dateKey]) {
            groupedData[dateKey] = [];
          }
          groupedData[dateKey].push(record);
        });

        const sortedDates = Object.keys(groupedData).sort();
        
        sortedDates.forEach(dateKey => {
          const records = groupedData[dateKey];
          records.sort((a, b) => (a.time_ || '').localeCompare(b.time_ || ''));
          
          records.forEach((record, index) => {
            const isOnScan = record.scan_type?.toUpperCase() === 'IN';
            const functionCode = isOnScan ? 'F1-0' : 'F4-0';
            const status = isOnScan ? 'ON' : 'OFF';
            const showDate = index === 0;
            
            const day = new Date(record.date_).getDate().toString().padStart(2, '0');
            const month = new Date(record.date_).toLocaleDateString('en-GB', { month: 'short' });
            const year = new Date(record.date_).getFullYear().toString().slice(-2);
            const dayName = new Date(record.date_).toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = `${day}-${month}-${year}`;
            
            printContent += `
                <tr>
                  <td class="${showDate ? 'date-cell' : 'date-cell-empty'}">
                    ${showDate ? `${formattedDate}<br/>${dayName}` : ''}
                  </td>
                  <td>${record.time_ || ''}</td>
                  <td class="function-col">${functionCode}</td>
                  <td class="${isOnScan ? 'on-status' : 'off-status'}">${status}</td>
                  <td>Granted(ID & F) COM0002</td>
                </tr>`;
          });
        });
      }

      printContent += `
              </tbody>
            </table>
            
            <div class="signature-section">
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">User</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature 1</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature 2</div>
              </div>
            </div>
          </body>
        </html>`;

      // Open print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

    } catch (err) {
      console.error('Print error:', err);
      setError('Failed to print report');
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
                    className="export-btn print"
                    onClick={printReport}
                  >
                    <i className="bi bi-printer"></i>
                    Print Report
                  </button>
                </div>
              )}
              
              <button 
                className="generate-btn"
                onClick={generateReport}
                disabled={loading}
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
                <h4 className="data-title">Unit Attendance Report</h4>
                <span className="record-count">{reportData.data.length} records</span>
              </div>

              {reportData.data.length > 0 ? (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {reportType === 'attendance' && (
                          <>
                            <th style={{width: '15%'}}>PUNCH DATE</th>
                            <th style={{width: '12%'}}>PUNCH TIME</th>
                            <th style={{width: '10%'}}>FUNCTION</th>
                            <th style={{width: '15%'}}>EVENT DESCRIPTION</th>
                            <th style={{width: '48%'}}>REMARKS</th>
                          </>
                        )}
                        {reportType === 'meal' && (
                          <>
                            <th style={{width: '8%'}}>ID</th>
                            <th style={{width: '12%'}}>EMPLOYEE ID</th>
                            <th style={{width: '15%'}}>MEAL DATE</th>
                            <th style={{width: '15%'}}>MEAL TYPE</th>
                            <th style={{width: '15%'}}>BOOKING TIME</th>
                            <th style={{width: '10%'}}>STATUS</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportType === 'attendance' && (() => {
                        // Group data by date for proper formatting
                        const groupedData = {};
                        reportData.data.forEach(record => {
                          const dateKey = record.date_;
                          if (!groupedData[dateKey]) {
                            groupedData[dateKey] = [];
                          }
                          groupedData[dateKey].push(record);
                        });

                        const sortedDates = Object.keys(groupedData).sort();
                        const rows = [];

                        sortedDates.forEach(dateKey => {
                          const records = groupedData[dateKey];
                          // Sort records by time
                          records.sort((a, b) => (a.time_ || '').localeCompare(b.time_ || ''));
                          
                          records.forEach((record, index) => {
                            const showDate = index === 0; // Only show date on first row for each date group
                            const date = new Date(record.date_);
                            const day = date.getDate().toString().padStart(2, '0');
                            const month = date.toLocaleDateString('en-GB', { month: 'short' });
                            const year = date.getFullYear().toString().slice(-2);
                            const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
                            const formattedDate = `${day}-${month}-${year}`;

                            rows.push(
                              <tr key={`${dateKey}-${index}`} className={showDate ? 'date-group-row' : 'time-row'}>
                                <td className={showDate ? 'date-cell-with-data' : 'date-cell-empty'}>
                                  {showDate && (
                                    <div>
                                      <div className="date-line">{formattedDate}</div>
                                      <div className="weekday-line">{weekday}</div>
                                    </div>
                                  )}
                                </td>
                                <td className="time-column">{record.time_}</td>
                                <td className="function-column">
                                  {record.scan_type?.toUpperCase() === 'IN' ? 'F1-0' : 'F4-0'}
                                </td>
                                <td className="event-description">
                                  {record.scan_type?.toUpperCase() === 'IN' ? 'ON' : 'OFF'}
                                </td>
                                <td className="remarks-column">Granted(ID & F) COM0002</td>
                              </tr>
                            );
                          });
                        });

                        return rows;
                      })()}
                      
                      {reportType === 'meal' && reportData.data.slice(0, 100).map((record, index) => (
                        <tr key={index}>
                          <td>{record.id}</td>
                          <td>{record.employee_id}</td>
                          <td>{record.meal_date}</td>
                          <td>{record.meal_type}</td>
                          <td>{record.booking_time}</td>
                          <td>{record.status}</td>
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