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
      setError(`Please enter Employee ID for individual ${reportType} reports`);
      return;
    }

    console.log('Generating report with:', {
      reportType,
      reportScope,
      employeeId,
      divisionId,
      sectionId,
      dateRange
    });

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
          endpoint = '/api/reports/meal';
          requestData = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            filters: {},
            groupBy: 'date'
          };
          // Add division filter for meal reports
          if (divisionId && divisionId !== 'all') {
            requestData.filters.divisionId = divisionId;
          }
          break;
        case 'audit':
          endpoint = '/api/reports/audit';
          break;
        default:
          endpoint = '/api/reports/mysql/attendance';
      }

      console.log('Making request to:', `http://localhost:5000${endpoint}`);
      console.log('Request data:', requestData);

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
      console.log('Response:', { status: response.status, data });

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

  const exportReport = (format) => {
    console.log('Export function called with format:', format);
    console.log('Report data:', reportData);
    console.log('Report scope:', reportScope);
    
    if (!reportData || !reportData.data) {
      console.error('No report data available for export');
      setError('No data to export. Please generate a report first.');
      return;
    }

    if (!reportData.data.length) {
      console.error('Empty report data');
      setError('No records found to export');
      return;
    }

    try {
      if (format === 'csv') {
        exportToCSV();
      } else if (format === 'json') {
        exportToJSON();
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Error occurred while exporting data');
    }
  };

  const exportToCSV = () => {
    const headers = getCSVHeaders();
    const rows = reportData.data.map(record => getCSVRow(record));
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    downloadFile(csvContent, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportToJSON = () => {
    const jsonData = {
      reportType,
      reportScope,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: reportData.summary,
      data: reportData.data
    };
    
    downloadFile(JSON.stringify(jsonData, null, 2), `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const getCSVHeaders = () => {
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

  const getCSVRow = (record) => {
    if (reportType === 'meal') {
      const items = record.items?.map(item => `${item.name} (${item.quantity})`).join('; ') || 'Standard Meal';
      const quantity = record.items?.reduce((total, item) => total + item.quantity, 0) || 1;
      const mealTime = new Date(record.mealTime || record.meal_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
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

  const printReport = () => {
    console.log('Print function called');
    console.log('Report data:', reportData);
    console.log('Report scope:', reportScope);
    
    if (!reportData || !reportData.data) {
      console.error('No report data available for printing');
      setError('No data to print. Please generate a report first.');
      return;
    }

    if (!reportData.data.length) {
      console.error('Empty report data');
      setError('No records found to print');
      return;
    }

    try {
      console.log('Starting print process...');
      // Get employee info from first record for individual reports
      const firstRecord = reportData.data[0];
      const isIndividualReport = reportScope === 'individual';
      
      console.log('First record:', firstRecord);
      console.log('Is individual report:', isIndividualReport);
      
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
              <div class="report-title">${
                reportType === 'meal' 
                  ? (isIndividualReport ? 'Individual Meal Report' : 'Group Meal Report')
                  : (isIndividualReport ? 'Unit Attendance Report' : 'Group Attendance Report')
              }</div>
              <div class="report-subtitle">${
                reportType === 'meal' 
                  ? 'All Meal Consumption Records'
                  : 'All Granted(ID & FP) Records'
              }</div>
              
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
                <tr>`;
      
      if (reportType === 'meal') {
        if (isIndividualReport) {
          printContent += `
                    <th style="width: 15%;">Date</th>
                    <th style="width: 12%;">Time</th>
                    <th style="width: 15%;">Meal Type</th>
                    <th style="width: 18%;">Location</th>
                    <th style="width: 10%;">Quantity</th>
                    <th style="width: 30%;">Items</th>`;
        } else {
          printContent += `
                    <th style="width: 10%;">Emp No</th>
                    <th style="width: 15%;">Emp Name</th>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 10%;">Time</th>
                    <th style="width: 12%;">Meal Type</th>
                    <th style="width: 12%;">Location</th>
                    <th style="width: 8%;">Quantity</th>
                    <th style="width: 21%;">Items</th>`;
        }
      } else {
        if (isIndividualReport) {
          printContent += `
                    <th style="width: 18%;">Date</th>
                    <th style="width: 12%;">Time</th>
                    <th style="width: 10%;">Function</th>
                    <th style="width: 20%;">Status</th>
                    <th style="width: 40%;">Verification</th>`;
        } else {
          printContent += `
                    <th style="width: 12%;">Emp No</th>
                    <th style="width: 20%;">Emp Name</th>
                    <th style="width: 15%;">Date</th>
                    <th style="width: 10%;">Time</th>
                    <th style="width: 8%;">Function</th>
                    <th style="width: 35%;">Event Description</th>`;
        }
      }
      
      printContent += `
                </tr>
              </thead>
              <tbody>`;

      if (reportType === 'meal') {
        if (isIndividualReport) {
          // For individual meal reports, group by date
          const mealGroupedData = {};
          reportData.data.forEach(record => {
            const dateKey = record.date || record.meal_date || record.mealTime;
            if (!mealGroupedData[dateKey]) {
              mealGroupedData[dateKey] = [];
            }
            mealGroupedData[dateKey].push(record);
          });

          const sortedDates = Object.keys(mealGroupedData).sort();
          
          sortedDates.forEach(date => {
            const records = mealGroupedData[date];
            const day = new Date(date).getDate().toString().padStart(2, '0');
            const month = new Date(date).toLocaleDateString('en-GB', { month: 'short' });
            const year = new Date(date).getFullYear().toString().slice(-2);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = `${day}-${month}-${year}`;
            
            // Sort records by time for each date
            records.sort((a, b) => {
              const aTime = new Date(a.mealTime || a.meal_time).getTime();
              const bTime = new Date(b.mealTime || b.meal_time).getTime();
              return aTime - bTime;
            });
            
            records.forEach((record, index) => {
              const showDate = index === 0;
              const mealTime = new Date(record.mealTime || record.meal_time).toLocaleTimeString('en-GB', { 
                hour: '2-digit', minute: '2-digit' 
              });
              const items = record.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'Standard Meal';
              const quantity = record.items?.reduce((total, item) => total + item.quantity, 0) || 1;
              
              printContent += `
                  <tr>
                    <td class="${showDate ? 'date-cell' : 'date-cell-empty'}">
                      ${showDate ? `${formattedDate}<br/>${dayName}` : ''}
                    </td>
                    <td style="text-align: center;">${mealTime}</td>
                    <td style="text-align: center; text-transform: capitalize;">${record.mealType || record.meal_type}</td>
                    <td style="text-align: center; text-transform: capitalize;">${record.location || 'Cafeteria'}</td>
                    <td style="text-align: center; font-weight: bold;">${quantity}</td>
                    <td style="font-size: 9px; padding: 3px;">${items}</td>
                  </tr>`;
            });
          });
        } else {
          // For group meal reports, show all records with employee info
          reportData.data.forEach((record, index) => {
            const date = new Date(record.date || record.meal_date || record.mealTime);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('en-GB', { month: 'short' });
            const year = date.getFullYear().toString().slice(-2);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = `${day}-${month}-${year}`;
            
            const mealTime = new Date(record.mealTime || record.meal_time).toLocaleTimeString('en-GB', { 
              hour: '2-digit', minute: '2-digit' 
            });
            const items = record.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'Standard Meal';
            const quantity = record.items?.reduce((total, item) => total + item.quantity, 0) || 1;
            const empName = record.user?.firstName && record.user?.lastName 
              ? `${record.user.firstName} ${record.user.lastName}`
              : record.employee_name || 'Unknown';
            
            printContent += `
                <tr>
                  <td style="font-weight: bold; text-align: center;">${record.user?.employeeId || record.employee_id || 'N/A'}</td>
                  <td style="text-align: left; padding-left: 8px;">${empName}</td>
                  <td style="text-align: center;">${formattedDate}<br/>${dayName}</td>
                  <td style="text-align: center;">${mealTime}</td>
                  <td style="text-align: center; text-transform: capitalize;">${record.mealType || record.meal_type}</td>
                  <td style="text-align: center; text-transform: capitalize;">${record.location || 'Cafeteria'}</td>
                  <td style="text-align: center; font-weight: bold;">${quantity}</td>
                  <td style="font-size: 9px; padding: 3px;">${items}</td>
                </tr>`;
          });
        }
      } else {
        // Attendance report logic
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
        // Group report - group by date and show employee details
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
          records.sort((a, b) => {
            // Sort by employee ID first, then by time
            const aEmpId = String(a.employee_ID || a.employee_id || '');
            const bEmpId = String(b.employee_ID || b.employee_id || '');
            const empCompare = aEmpId.localeCompare(bEmpId);
            if (empCompare !== 0) return empCompare;
            const aTime = String(a.time_ || '');
            const bTime = String(b.time_ || '');
            return aTime.localeCompare(bTime);
          });
          
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
                  <td style="font-weight: bold; text-align: center;">${record.employee_ID || record.employee_id || 'N/A'}</td>
                  <td style="text-align: left; padding-left: 8px;">${record.employee_name || record.name || 'Unknown'}</td>
                  <td class="${showDate ? 'date-cell' : 'date-cell-empty'}">
                    ${showDate ? `${formattedDate}<br/>${dayName}` : ''}
                  </td>
                  <td>${record.time_ || ''}</td>
                  <td class="function-col">${functionCode}</td>
                  <td style="text-align: left; padding-left: 5px;">${status} Granted(ID & F COM0002)</td>
                </tr>`;
          });
        });
        } // End of attendance group report
      } // End of attendance report logic

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

      console.log('Print content prepared, opening print window...');
      
      // Open print window
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Could not open print window. Please check if popup blocker is enabled.');
      }
      
      console.log('Print window opened successfully');
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      console.log('Content written to print window');
      
      // Wait for content to load then print
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
          console.log('Print dialog opened successfully');
          setError(''); // Clear any previous errors
        } catch (printErr) {
          console.error('Error during print:', printErr);
          printWindow.close();
          throw new Error('Failed to open print dialog');
        }
      }, 250);

    } catch (err) {
      console.error('Print error:', err);
      setError(`Failed to print report: ${err.message}`);
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
              {reportType === 'meal' && (
                <div className="field-help" style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#e8f4fd',
                  border: '1px solid #bee5eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#0c5460'
                }}>
                  <strong>🍽️ Meal Report Instructions:</strong>
                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
                    <li>Choose a <strong>Division</strong> to filter meals by department (or select "All Divisions")</li>
                    <li>Pick a <strong>Date Range</strong> to analyze meal consumption patterns</li>
                    <li>Use <strong>Quick Date Selection</strong> buttons for common date ranges</li>
                    <li>Report shows all meal bookings with employee details and meal information</li>
                  </ul>
                </div>
              )}
            </div>

            {(reportType === 'attendance' || reportType === 'audit') && (
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

            {reportType === 'meal' && (
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
            )}

            {reportScope === 'group' && (reportType === 'attendance') && (
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

            {reportScope === 'individual' && (reportType === 'attendance') && (
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

            {/* Quick Date Selectors */}
            <div className="form-field">
              <label className="field-label">Quick Date Selection</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setDateRange({ startDate: today, endDate: today });
                  }}
                >
                  📅 Today
                </button>
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    setDateRange({ startDate: yesterdayStr, endDate: yesterdayStr });
                  }}
                >
                  📆 Yesterday
                </button>
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    setDateRange({ 
                      startDate: weekAgo.toISOString().split('T')[0], 
                      endDate: today.toISOString().split('T')[0] 
                    });
                  }}
                >
                  📊 Last 7 Days
                </button>
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today);
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    setDateRange({ 
                      startDate: monthAgo.toISOString().split('T')[0], 
                      endDate: today.toISOString().split('T')[0] 
                    });
                  }}
                >
                  📈 Last 30 Days
                </button>
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
                {(reportScope === 'group' && reportType === 'attendance') && (
                  <span className="filter-info">
                    {reportData.summary?.division_filter && (
                      <span className="division-info"> - {reportData.summary.division_filter}</span>
                    )}
                    {reportData.summary?.section_filter && (
                      <span className="section-info"> - {reportData.summary.section_filter}</span>
                    )}
                  </span>
                )}
                {reportType === 'meal' && (
                  <span className="filter-info">
                    {/* Show selected division for meal reports */}
                    {divisionId !== 'all' && (
                      <span className="division-info"> - {
                        divisions.find(d => d.division_id === divisionId)?.division_name || `Division ID: ${divisionId}`
                      }</span>
                    )}
                  </span>
                )}
              </h3>
            </div>

            {/* Statistics Grid */}
            <div className="stats-grid">
              {reportType === 'attendance' && (
                <>
                  {reportScope === 'individual' ? (
                    <>
                      {/* Individual Report Stats */}
                      <div className="stat-card">
                        <span className="stat-number">{reportData.data?.[0]?.employee_ID || 'N/A'}</span>
                        <span className="stat-label">Employee ID</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{reportData.data?.[0]?.employee_name || 'Unknown'}</span>
                        <span className="stat-label">Employee Name</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{reportData.summary.total_records}</span>
                        <span className="stat-label">Total Records</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{`${dateRange.startDate} - ${dateRange.endDate}`}</span>
                        <span className="stat-label">Time Range</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Group Report Stats */}
                      <div className="stat-card">
                        <span className="stat-number">{
                          divisionId === 'all' ? 'All Divisions' : 
                          divisions.find(d => d.division_id === divisionId)?.division_name || `Division ID: ${divisionId}`
                        }</span>
                        <span className="stat-label">Division</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{
                          sectionId === 'all' ? 'All Sections' : 
                          sections.find(s => s.section_id === sectionId)?.section_name || `Section ID: ${sectionId}`
                        }</span>
                        <span className="stat-label">Section</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{reportData.summary.total_records}</span>
                        <span className="stat-label">Total Records</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-number">{reportData.summary.unique_employees}</span>
                        <span className="stat-label">Unique Employees</span>
                      </div>
                    </>
                  )}
                </>
              )}
              
              {reportType === 'meal' && (
                <>
                  {/* Meal Report Stats */}
                  <div className="stat-card">
                    <span className="stat-number">{reportData.data?.length || 0}</span>
                    <span className="stat-label">Total Meals</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {reportData.data ? 
                        new Set(reportData.data.map(meal => 
                          meal.user?.employeeId || meal.employee_id
                        )).size : 0}
                    </span>
                    <span className="stat-label">Unique Employees</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {reportData.data?.filter(meal => 
                        (meal.mealType || meal.meal_type) === 'breakfast'
                      ).length || 0}
                    </span>
                    <span className="stat-label">Breakfast</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {reportData.data?.filter(meal => 
                        (meal.mealType || meal.meal_type) === 'lunch'
                      ).length || 0}
                    </span>
                    <span className="stat-label">Lunch</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {reportData.data?.filter(meal => 
                        (meal.mealType || meal.meal_type) === 'dinner'
                      ).length || 0}
                    </span>
                    <span className="stat-label">Dinner</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {reportData.data?.filter(meal => 
                        (meal.mealType || meal.meal_type) === 'snack'
                      ).length || 0}
                    </span>
                    <span className="stat-label">Snacks</span>
                  </div>
                  {/* Additional stats for filtered reports */}
                  {divisionId !== 'all' && (
                    <div className="stat-card" style={{background: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)'}}>
                      <span className="stat-number" style={{fontSize: '0.9rem'}}>
                        {divisions.find(d => d.division_id === divisionId)?.division_name || 'Selected Division'}
                      </span>
                      <span className="stat-label">Division Filter</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Data Section */}
            <div className="data-section">
              <div className="data-header">
                {/* <h4 className="data-title">Unit Attendance Report</h4> */}
                <span className="record-count">{reportData.data.length} records</span>
              </div>

              {reportData.data.length > 0 ? (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {reportType === 'attendance' && (
                          <>
                            {reportScope === 'individual' ? (
                              <>
                                <th style={{width: '20%'}}>PUNCH DATE</th>
                                <th style={{width: '15%'}}>PUNCH TIME</th>
                                <th style={{width: '15%'}}>FUNCTION</th>
                                <th style={{width: '20%'}}>EVENT DESCRIPTION</th>
                                <th style={{width: '30%'}}>REMARKS</th>
                              </>
                            ) : (
                              <>
                                <th style={{width: '10%'}}>EMP NO</th>
                                <th style={{width: '20%'}}>EMP NAME</th>
                                <th style={{width: '15%'}}>PUNCH DATE</th>
                                <th style={{width: '10%'}}>PUNCH TIME</th>
                                <th style={{width: '10%'}}>FUNCTION</th>
                                <th style={{width: '35%'}}>EVENT DESCRIPTION</th>
                              </>
                            )}
                          </>
                        )}
                        {reportType === 'meal' && (
                          <>
                            <th style={{width: '10%'}}>EMP NO</th>
                            <th style={{width: '15%'}}>EMP NAME</th>
                            <th style={{width: '12%'}}>MEAL DATE</th>
                            <th style={{width: '10%'}}>MEAL TIME</th>
                            <th style={{width: '12%'}}>MEAL TYPE</th>
                            <th style={{width: '12%'}}>LOCATION</th>
                            <th style={{width: '8%'}}>QUANTITY</th>
                            <th style={{width: '21%'}}>ITEMS</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportType === 'attendance' && (() => {
                        if (reportScope === 'individual') {
                          // Individual report - show by date without employee columns
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
                            // Sort records by time only for individual reports
                            records.sort((a, b) => {
                              const aTime = String(a.time_ || '');
                              const bTime = String(b.time_ || '');
                              return aTime.localeCompare(bTime);
                            });
                            
                            records.forEach((record, index) => {
                              const showDate = index === 0;
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
                        } else {
                          // Group report - show with employee columns
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
                            // Sort records by employee ID first, then by time
                            records.sort((a, b) => {
                              const aEmpId = String(a.employee_ID || a.employee_id || '');
                              const bEmpId = String(b.employee_ID || b.employee_id || '');
                              const empCompare = aEmpId.localeCompare(bEmpId);
                              if (empCompare !== 0) return empCompare;
                              const aTime = String(a.time_ || '');
                              const bTime = String(b.time_ || '');
                              return aTime.localeCompare(bTime);
                            });
                            
                            records.forEach((record, index) => {
                              const showDate = index === 0;
                              const date = new Date(record.date_);
                              const day = date.getDate().toString().padStart(2, '0');
                              const month = date.toLocaleDateString('en-GB', { month: 'short' });
                              const year = date.getFullYear().toString().slice(-2);
                              const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
                              const formattedDate = `${day}-${month}-${year}`;

                              rows.push(
                                <tr key={`${dateKey}-${index}`} className={showDate ? 'date-group-row' : 'time-row'}>
                                  <td className="employee-id-column" style={{fontWeight: 'bold', textAlign: 'center'}}>
                                    {record.employee_ID || record.employee_id || 'N/A'}
                                  </td>
                                  <td className="employee-name-column" style={{textAlign: 'left', paddingLeft: '8px'}}>
                                    {record.employee_name || record.name || 'Unknown'}
                                  </td>
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
                                  <td className="event-description" style={{textAlign: 'left', paddingLeft: '5px'}}>
                                    {record.scan_type?.toUpperCase() === 'IN' ? 'ON' : 'OFF'}  Granted(ID & F COM0002)
                                  </td>
                                </tr>
                              );
                            });
                          });
                          return rows;
                        }
                      })()}
                      
                      {reportType === 'meal' && (() => {
                        // Meal report - show with employee columns
                        const rows = [];
                        reportData.data.forEach((record, index) => {
                          const date = new Date(record.date || record.meal_date || record.mealTime);
                          const day = date.getDate().toString().padStart(2, '0');
                          const month = date.toLocaleDateString('en-GB', { month: 'short' });
                          const year = date.getFullYear().toString().slice(-2);
                          const formattedDate = `${day}-${month}-${year}`;

                          rows.push(
                            <tr key={index}>
                              <td className="employee-id-column" style={{fontWeight: 'bold', textAlign: 'center'}}>
                                {record.user?.employeeId || record.employee_id || 'N/A'}
                              </td>
                              <td className="employee-name-column" style={{textAlign: 'left', paddingLeft: '8px'}}>
                                {record.user?.firstName && record.user?.lastName 
                                  ? `${record.user.firstName} ${record.user.lastName}`
                                  : record.employee_name || 'Unknown'}
                              </td>
                              <td className="date-cell" style={{textAlign: 'center'}}>
                                {formattedDate}
                              </td>
                              <td className="time-column" style={{textAlign: 'center'}}>
                                {new Date(record.mealTime || record.meal_time).toLocaleTimeString('en-GB', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </td>
                              <td className="meal-type-column" style={{textAlign: 'center', textTransform: 'capitalize'}}>
                                {record.mealType || record.meal_type}
                              </td>
                              <td className="location-column" style={{textAlign: 'center', textTransform: 'capitalize'}}>
                                {record.location || 'Cafeteria'}
                              </td>
                              <td className="quantity-column" style={{textAlign: 'center', fontWeight: 'bold'}}>
                                {record.items?.reduce((total, item) => total + item.quantity, 0) || 1}
                              </td>
                              <td className="items-column" style={{fontSize: '0.8rem'}}>
                                {record.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'Standard Meal'}
                              </td>
                            </tr>
                          );
                        });
                        return rows;
                      })()}
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