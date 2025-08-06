import React, { useState } from 'react';

const ReportGeneration = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const generateReport = () => {
    console.log('Generating report:', reportType, dateRange);
    // Implement report generation logic
  };

  return (
    <div className="report-generation">
      <div className="page-header">
        <h2><i className="bi bi-file-earmark-text"></i> Report Generation</h2>
      </div>

      <div className="report-forms">
        <div className="form-group">
          <label>Report Type</label>
          <select 
            className="form-control"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="attendance">Attendance Report</option>
            <option value="audit">Audit Report</option>
            <option value="meal">Meal Report</option>
          </select>
        </div>

        <div className="date-range">
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <button 
          className="btn btn-success"
          onClick={generateReport}
        >
          <i className="bi bi-download"></i> Generate Report
        </button>
      </div>
    </div>
  );
};

export default ReportGeneration;