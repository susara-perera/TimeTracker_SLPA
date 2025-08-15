const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Division = require('../models/Division');
const Section = require('../models/Section');
const Meal = require('../models/Meal');
const AuditLog = require('../models/AuditLog');
const { createMySQLConnection } = require('../config/mysql');
const moment = require('moment');

// @desc    Generate attendance report
// @route   GET /api/reports/attendance
// @access  Private
const getAttendanceReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      filters = {},
      format = 'json',
      groupBy = 'user'
    } = req.body;

    // Validate date range
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (end.diff(start, 'days') > 365) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 365 days'
      });
    }

    // Build base query
    let attendanceQuery = {
      date: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    };

    // Apply role-based filters
    let userFilter = {};
    if (req.user.role !== 'super_admin') {
      if (req.user.role === 'admin' && req.user.division) {
        userFilter.division = req.user.division._id;
      } else if (req.user.role === 'clerk' && req.user.section) {
        userFilter.section = req.user.section._id;
      } else if (req.user.role === 'employee') {
        userFilter._id = req.user._id;
      }
    }

    // Apply additional filters
    if (filters.division) userFilter.division = filters.division;
    if (filters.section) userFilter.section = filters.section;
    if (filters.users && filters.users.length > 0) {
      userFilter._id = { $in: filters.users };
    }
    if (filters.status) attendanceQuery.status = filters.status;

    // Get filtered users
    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(user => user._id);
    
    if (userIds.length > 0) {
      attendanceQuery.user = { $in: userIds };
    }

    let reportData;

    if (groupBy === 'division') {
      reportData = await generateDivisionReport(attendanceQuery, start, end);
    } else if (groupBy === 'section') {
      reportData = await generateSectionReport(attendanceQuery, start, end);
    } else if (groupBy === 'date') {
      reportData = await generateDateReport(attendanceQuery, start, end);
    } else {
      reportData = await generateUserReport(attendanceQuery, start, end);
    }

    // Log report generation
    await AuditLog.createLog({
      user: req.user._id,
      action: 'report_generated',
      entity: { type: 'Report' },
      category: 'data_modification',
      severity: 'low',
      description: 'Attendance report generated',
      details: `Generated attendance report for ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        reportType: 'attendance',
        dateRange: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') },
        groupBy,
        filters
      }
    });

    if (format === 'csv') {
      return generateCSVResponse(res, reportData, 'attendance_report');
    } else if (format === 'excel') {
      return generateExcelResponse(res, reportData, 'attendance_report');
    }

    res.status(200).json({
      success: true,
      data: reportData,
      summary: {
        totalRecords: reportData.length,
        dateRange: {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD')
        },
        groupBy,
        filters
      }
    });

  } catch (error) {
    console.error('Generate attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating attendance report'
    });
  }
};

// @desc    Generate meal report
// @route   GET /api/reports/meal
// @access  Private
const getMealReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      filters = {},
      format = 'json',
      groupBy = 'user'
    } = req.body;

    // Validate date range
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (end.diff(start, 'days') > 365) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 365 days'
      });
    }

    // Build base query
    let mealQuery = {
      date: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    };

    // Apply role-based filters
    let userFilter = {};
    if (req.user.role !== 'super_admin') {
      if (req.user.role === 'admin' && req.user.division) {
        userFilter.division = req.user.division._id;
      } else if (req.user.role === 'clerk' && req.user.section) {
        userFilter.section = req.user.section._id;
      } else if (req.user.role === 'employee') {
        userFilter._id = req.user._id;
      }
    }

    // Apply additional filters
    if (filters.division) userFilter.division = filters.division;
    if (filters.section) userFilter.section = filters.section;
    if (filters.users && filters.users.length > 0) {
      userFilter._id = { $in: filters.users };
    }
    if (filters.mealType) mealQuery.mealType = filters.mealType;
    if (filters.location) mealQuery.location = filters.location;
    if (filters.paymentStatus) mealQuery.paymentStatus = filters.paymentStatus;

    // Get filtered users
    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(user => user._id);
    
    if (userIds.length > 0) {
      mealQuery.user = { $in: userIds };
    }

    let reportData;

    if (groupBy === 'mealType') {
      reportData = await generateMealTypeReport(mealQuery, start, end);
    } else if (groupBy === 'location') {
      reportData = await generateMealLocationReport(mealQuery, start, end);
    } else if (groupBy === 'date') {
      reportData = await generateMealDateReport(mealQuery, start, end);
    } else {
      reportData = await generateMealUserReport(mealQuery, start, end);
    }

    // Log report generation
    await AuditLog.createLog({
      user: req.user._id,
      action: 'report_generated',
      entity: { type: 'Report' },
      category: 'data_modification',
      severity: 'low',
      description: 'Meal report generated',
      details: `Generated meal report for ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        reportType: 'meal',
        dateRange: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') },
        groupBy,
        filters
      }
    });

    if (format === 'csv') {
      return generateCSVResponse(res, reportData, 'meal_report');
    } else if (format === 'excel') {
      return generateExcelResponse(res, reportData, 'meal_report');
    }

    res.status(200).json({
      success: true,
      data: reportData,
      summary: {
        totalRecords: reportData.length,
        dateRange: {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD')
        },
        groupBy,
        filters
      }
    });

  } catch (error) {
    console.error('Generate meal report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating meal report'
    });
  }
};

// @desc    Generate audit report
// @route   GET /api/reports/audit
// @access  Private (admin, super_admin)
const getAuditReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      filters = {},
      format = 'json',
      groupBy = 'action'
    } = req.body;

    // Validate date range
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (end.diff(start, 'days') > 90) {
      return res.status(400).json({
        success: false,
        message: 'Date range for audit reports cannot exceed 90 days'
      });
    }

    // Build base query
    let auditQuery = {
      createdAt: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    };

    // Apply filters
    if (filters.action) auditQuery.action = filters.action;
    if (filters.category) auditQuery.category = filters.category;
    if (filters.severity) auditQuery.severity = filters.severity;
    if (filters.user) auditQuery.user = filters.user;
    if (filters.entityType) auditQuery['entity.type'] = filters.entityType;
    if (filters.isSecurityRelevant !== undefined) auditQuery.isSecurityRelevant = filters.isSecurityRelevant;

    let reportData;

    if (groupBy === 'user') {
      reportData = await generateAuditUserReport(auditQuery, start, end);
    } else if (groupBy === 'category') {
      reportData = await generateAuditCategoryReport(auditQuery, start, end);
    } else if (groupBy === 'severity') {
      reportData = await generateAuditSeverityReport(auditQuery, start, end);
    } else if (groupBy === 'date') {
      reportData = await generateAuditDateReport(auditQuery, start, end);
    } else {
      reportData = await generateAuditActionReport(auditQuery, start, end);
    }

    // Log report generation
    await AuditLog.createLog({
      user: req.user._id,
      action: 'report_generated',
      entity: { type: 'Report' },
      category: 'data_modification',
      severity: 'medium',
      description: 'Audit report generated',
      details: `Generated audit report for ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        reportType: 'audit',
        dateRange: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') },
        groupBy,
        filters
      }
    });

    if (format === 'csv') {
      return generateCSVResponse(res, reportData, 'audit_report');
    } else if (format === 'excel') {
      return generateExcelResponse(res, reportData, 'audit_report');
    }

    res.status(200).json({
      success: true,
      data: reportData,
      summary: {
        totalRecords: reportData.length,
        dateRange: {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD')
        },
        groupBy,
        filters
      }
    });

  } catch (error) {
    console.error('Generate audit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating audit report'
    });
  }
};

// Helper function to generate user-based attendance report
const generateUserReport = async (attendanceQuery, start, end) => {
  return await Attendance.aggregate([
    { $match: attendanceQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $lookup: {
        from: 'divisions',
        localField: 'userInfo.division',
        foreignField: '_id',
        as: 'divisionInfo'
      }
    },
    {
      $lookup: {
        from: 'sections',
        localField: 'userInfo.section',
        foreignField: '_id',
        as: 'sectionInfo'
      }
    },
    {
      $group: {
        _id: '$user',
        employeeInfo: { $first: '$userInfo' },
        divisionInfo: { $first: { $arrayElemAt: ['$divisionInfo', 0] } },
        sectionInfo: { $first: { $arrayElemAt: ['$sectionInfo', 0] } },
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateDays: {
          $sum: { $cond: [{ $gt: ['$lateMinutes', 0] }, 1, 0] }
        },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertime: { $sum: '$overtime' },
        totalLateMinutes: { $sum: '$lateMinutes' },
        averageCheckInTime: { $avg: '$checkIn.time' },
        averageCheckOutTime: { $avg: '$checkOut.time' }
      }
    },
    {
      $project: {
        employee: {
          id: '$employeeInfo._id',
          firstName: '$employeeInfo.firstName',
          lastName: '$employeeInfo.lastName',
          employeeId: '$employeeInfo.employeeId',
          email: '$employeeInfo.email'
        },
        division: {
          name: '$divisionInfo.name',
          code: '$divisionInfo.code'
        },
        section: {
          name: '$sectionInfo.name',
          code: '$sectionInfo.code'
        },
        attendance: {
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          attendanceRate: {
            $round: [
              { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
              2
            ]
          }
        },
        workHours: {
          totalWorkingHours: { $round: ['$totalWorkingHours', 2] },
          totalOvertime: { $round: ['$totalOvertime', 2] },
          totalLateMinutes: 1,
          averageWorkingHours: {
            $round: [{ $divide: ['$totalWorkingHours', '$totalDays'] }, 2]
          }
        },
        timing: {
          averageCheckInTime: 1,
          averageCheckOutTime: 1
        }
      }
    },
    { $sort: { 'employee.firstName': 1, 'employee.lastName': 1 } }
  ]);
};

// Helper function to generate division-based attendance report
const generateDivisionReport = async (attendanceQuery, start, end) => {
  return await Attendance.aggregate([
    { $match: attendanceQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $lookup: {
        from: 'divisions',
        localField: 'userInfo.division',
        foreignField: '_id',
        as: 'divisionInfo'
      }
    },
    { $unwind: '$divisionInfo' },
    {
      $group: {
        _id: '$userInfo.division',
        divisionInfo: { $first: '$divisionInfo' },
        totalRecords: { $sum: 1 },
        uniqueEmployees: { $addToSet: '$user' },
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateDays: {
          $sum: { $cond: [{ $gt: ['$lateMinutes', 0] }, 1, 0] }
        },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertime: { $sum: '$overtime' }
      }
    },
    {
      $project: {
        division: {
          id: '$divisionInfo._id',
          name: '$divisionInfo.name',
          code: '$divisionInfo.code'
        },
        statistics: {
          totalRecords: 1,
          employeeCount: { $size: '$uniqueEmployees' },
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          attendanceRate: {
            $round: [
              { $multiply: [{ $divide: ['$presentDays', '$totalRecords'] }, 100] },
              2
            ]
          },
          totalWorkingHours: { $round: ['$totalWorkingHours', 2] },
          totalOvertime: { $round: ['$totalOvertime', 2] },
          averageWorkingHours: {
            $round: [{ $divide: ['$totalWorkingHours', '$totalRecords'] }, 2]
          }
        }
      }
    },
    { $sort: { 'division.name': 1 } }
  ]);
};

// Helper function to generate date-based attendance report
const generateDateReport = async (attendanceQuery, start, end) => {
  return await Attendance.aggregate([
    { $match: attendanceQuery },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        totalRecords: { $sum: 1 },
        uniqueEmployees: { $addToSet: '$user' },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
        },
        lateCount: {
          $sum: { $cond: [{ $gt: ['$lateMinutes', 0] }, 1, 0] }
        },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertime: { $sum: '$overtime' }
      }
    },
    {
      $project: {
        date: '$_id',
        statistics: {
          totalRecords: 1,
          employeeCount: { $size: '$uniqueEmployees' },
          presentCount: 1,
          absentCount: 1,
          lateCount: 1,
          attendanceRate: {
            $round: [
              { $multiply: [{ $divide: ['$presentCount', '$totalRecords'] }, 100] },
              2
            ]
          },
          totalWorkingHours: { $round: ['$totalWorkingHours', 2] },
          totalOvertime: { $round: ['$totalOvertime', 2] }
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

// Helper function to generate meal user report
const generateMealUserReport = async (mealQuery, start, end) => {
  return await Meal.aggregate([
    { $match: mealQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $group: {
        _id: '$user',
        employeeInfo: { $first: '$userInfo' },
        totalMeals: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalActualAmount: { $sum: '$actualAmount' },
        mealsByType: {
          $push: '$mealType'
        },
        avgRating: { $avg: '$rating.overall' }
      }
    },
    {
      $project: {
        employee: {
          id: '$employeeInfo._id',
          firstName: '$employeeInfo.firstName',
          lastName: '$employeeInfo.lastName',
          employeeId: '$employeeInfo.employeeId'
        },
        mealStats: {
          totalMeals: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          totalActualAmount: { $round: ['$totalActualAmount', 2] },
          averageAmount: {
            $round: [{ $divide: ['$totalActualAmount', '$totalMeals'] }, 2]
          },
          averageRating: { $round: ['$avgRating', 1] }
        }
      }
    },
    { $sort: { 'employee.firstName': 1 } }
  ]);
};

// Helper function to generate audit action report
const generateAuditActionReport = async (auditQuery, start, end) => {
  return await AuditLog.aggregate([
    { $match: auditQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        users: { $addToSet: '$user' },
        categories: { $addToSet: '$category' },
        severities: { $addToSet: '$severity' },
        securityRelevantCount: {
          $sum: { $cond: ['$isSecurityRelevant', 1, 0] }
        },
        latestOccurrence: { $max: '$createdAt' },
        oldestOccurrence: { $min: '$createdAt' }
      }
    },
    {
      $project: {
        action: '$_id',
        statistics: {
          count: 1,
          uniqueUsers: { $size: '$users' },
          categories: 1,
          severities: 1,
          securityRelevantCount: 1,
          securityRelevantPercentage: {
            $round: [
              { $multiply: [{ $divide: ['$securityRelevantCount', '$count'] }, 100] },
              2
            ]
          },
          latestOccurrence: 1,
          oldestOccurrence: 1
        }
      }
    },
    { $sort: { 'statistics.count': -1 } }
  ]);
};

// Helper function to generate CSV response
const generateCSVResponse = (res, data, filename) => {
  // This is a simplified CSV generation
  // In production, use a proper CSV library like 'fast-csv'
  let csv = '';
  
  if (data.length > 0) {
    // Get headers from first object
    const headers = Object.keys(flattenObject(data[0]));
    csv += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const flatRow = flattenObject(row);
      const values = headers.map(header => 
        JSON.stringify(flatRow[header] || '')
      );
      csv += values.join(',') + '\n';
    });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.csv"`);
  res.send(csv);
};

// Helper function to generate Excel response
const generateExcelResponse = (res, data, filename) => {
  // This would typically use a library like 'xlsx' or 'exceljs'
  // For now, return JSON with appropriate headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}_${Date.now()}.json"`);
  res.json({
    success: true,
    message: 'Excel export not implemented yet. Returning JSON data.',
    data
  });
};

// Helper function to flatten nested objects for CSV
const flattenObject = (obj, prefix = '') => {
  let flattened = {};
  
  for (let key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], prefix + key + '.'));
    } else {
      flattened[prefix + key] = obj[key];
    }
  }
  
  return flattened;
};

// @desc    Get unit attendance report
// @route   GET /api/reports/unit-attendance
// @access  Private
const getUnitAttendanceReport = async (req, res) => {
  try {
    const { date, division, section } = req.query;
    const targetDate = date ? moment(date) : moment();
    
    const filter = {
      date: {
        $gte: targetDate.startOf('day').toDate(),
        $lte: targetDate.endOf('day').toDate()
      }
    };

    if (division) filter.division = division;
    if (section) filter.section = section;

    const attendanceRecords = await Attendance.find(filter)
      .populate('user', 'firstName lastName employeeId')
      .populate('division', 'name')
      .populate('section', 'name');

    const unitSummary = {
      totalEmployees: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.isLate).length
    };

    res.json({
      success: true,
      data: {
        date: targetDate.format('YYYY-MM-DD'),
        summary: unitSummary,
        records: attendanceRecords
      }
    });
  } catch (error) {
    console.error('Unit attendance report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating unit attendance report'
    });
  }
};

// @desc    Get division report
// @route   GET /api/reports/division/:divisionId
// @access  Private
const getDivisionReport = async (req, res) => {
  try {
    const { divisionId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
    const end = endDate ? moment(endDate) : moment();

    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    const attendanceRecords = await Attendance.find({
      division: divisionId,
      date: { $gte: start.toDate(), $lte: end.toDate() }
    }).populate('user', 'firstName lastName');

    const summary = {
      totalDays: end.diff(start, 'days') + 1,
      totalRecords: attendanceRecords.length,
      averageAttendance: attendanceRecords.filter(r => r.status === 'present').length,
      division: division.name
    };

    res.json({
      success: true,
      data: {
        summary,
        records: attendanceRecords
      }
    });
  } catch (error) {
    console.error('Division report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating division report'
    });
  }
};

// @desc    Get user activity report
// @route   GET /api/reports/user-activity
// @access  Private (administrator and super_admin only)
const getUserActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
    const end = endDate ? moment(endDate) : moment();

    const filter = {
      timestamp: { $gte: start.toDate(), $lte: end.toDate() }
    };

    if (userId) filter.userId = userId;

    const activities = await AuditLog.find(filter)
      .populate('userId', 'firstName lastName')
      .sort({ timestamp: -1 });

    const summary = {
      totalActivities: activities.length,
      uniqueUsers: [...new Set(activities.map(a => a.userId?._id))].length,
      period: `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`
    };

    res.json({
      success: true,
      data: {
        summary,
        activities
      }
    });
  } catch (error) {
    console.error('User activity report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating user activity report'
    });
  }
};

// @desc    Export report
// @route   GET /api/reports/export/:reportType
// @access  Private
const exportReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { format = 'pdf' } = req.query;

    // This is a simplified implementation
    // In a real application, you would generate actual PDF/Excel files
    const reportData = {
      type: reportType,
      format: format,
      generatedAt: new Date(),
      message: `${reportType} report in ${format} format would be generated here`
    };

    res.json({
      success: true,
      data: reportData,
      message: 'Report export initiated'
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error exporting report'
    });
  }
};

// @desc    Get report summary
// @route   GET /api/reports/summary
// @access  Private
const getReportSummary = async (req, res) => {
  try {
    const { period = 'monthly', date } = req.query;
    const targetDate = date ? moment(date) : moment();

    let start, end;
    switch (period) {
      case 'daily':
        start = targetDate.clone().startOf('day');
        end = targetDate.clone().endOf('day');
        break;
      case 'weekly':
        start = targetDate.clone().startOf('week');
        end = targetDate.clone().endOf('week');
        break;
      case 'monthly':
        start = targetDate.clone().startOf('month');
        end = targetDate.clone().endOf('month');
        break;
      case 'yearly':
        start = targetDate.clone().startOf('year');
        end = targetDate.clone().endOf('year');
        break;
      default:
        start = targetDate.clone().startOf('month');
        end = targetDate.clone().endOf('month');
    }

    const attendanceCount = await Attendance.countDocuments({
      date: { $gte: start.toDate(), $lte: end.toDate() }
    });

    const mealCount = await Meal.countDocuments({
      date: { $gte: start.toDate(), $lte: end.toDate() }
    });

    const userCount = await User.countDocuments({
      createdAt: { $gte: start.toDate(), $lte: end.toDate() }
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`,
        summary: {
          attendance: attendanceCount,
          meals: mealCount,
          users: userCount
        }
      }
    });
  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating report summary'
    });
  }
};

// @desc    Generate custom report
// @route   POST /api/reports/custom
// @access  Private (administrator and super_admin only)
const getCustomReport = async (req, res) => {
  try {
    const { reportType, criteria, startDate, endDate } = req.body;
    
    const start = moment(startDate);
    const end = moment(endDate);

    // This is a simplified implementation
    // In a real application, you would build dynamic queries based on criteria
    const customData = {
      reportType,
      criteria,
      period: `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`,
      generatedAt: new Date(),
      message: 'Custom report would be generated based on the provided criteria'
    };

    res.json({
      success: true,
      data: customData,
      message: 'Custom report generated successfully'
    });
  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error generating custom report'
    });
  }
};

// @desc    Generate MySQL-based attendance report (individual/group)
// @route   POST /api/reports/mysql/attendance
// @access  Private
const generateMySQLAttendanceReport = async (req, res) => {
  try {
    const {
      report_type = 'individual',
      employee_id = '',
      division_id = '',
      section_id = '',
      from_date,
      to_date
    } = req.body;

    // Validate required fields
    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required'
      });
    }

    // Validate employee ID for individual reports
    if (report_type === 'individual' && !employee_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required for individual reports'
      });
    }

    // Create MySQL connection
    const connection = await createMySQLConnection();

    let sql, params;

    if (report_type === 'group' && (division_id || section_id)) {
      // Group report with division or section filter
      let employeeFilter = '';
      let employeeParams = [];

      if (section_id && section_id !== 'all') {
        // Filter by specific section
        employeeFilter = 'AND e.section = ?';
        employeeParams.push(section_id);
      } else if (division_id && division_id !== 'all') {
        // Filter by specific division
        employeeFilter = 'AND e.division = ?';
        employeeParams.push(division_id);
      }

      sql = `SELECT 
              a.attendance_id,
              a.employee_ID,
              a.fingerprint_id,
              a.date_,
              a.time_,
              a.scan_type,
              e.employee_name,
              d.division_name,
              s.section_name
             FROM attendance a
             LEFT JOIN employees e ON a.employee_ID = e.employee_ID
             LEFT JOIN divisions d ON e.division = d.division_id
             LEFT JOIN sections s ON e.section = s.section_id
             WHERE a.date_ BETWEEN ? AND ? ${employeeFilter}
             ORDER BY a.date_ DESC, a.time_ DESC`;
      
      params = [from_date, to_date, ...employeeParams];
    } else {
      // Original logic for individual reports or all group reports
      sql = `SELECT 
              a.attendance_id,
              a.employee_ID,
              a.fingerprint_id,
              a.date_,
              a.time_,
              a.scan_type,
              e.employee_name,
              d.division_name,
              s.section_name
             FROM attendance a
             LEFT JOIN employees e ON a.employee_ID = e.employee_ID
             LEFT JOIN divisions d ON e.division = d.division_id
             LEFT JOIN sections s ON e.section = s.section_id
             WHERE a.date_ BETWEEN ? AND ?`;
      
      params = [from_date, to_date];

      // Add employee filter for individual reports
      if (report_type === 'individual') {
        sql += ` AND a.employee_ID = ?`;
        params.push(employee_id);
      }

      // Add ordering
      sql += ` ORDER BY a.date_ DESC, a.time_ DESC`;
    }

    // Execute query
    const [attendance_data] = await connection.execute(sql, params);

    // Calculate summary statistics
    const summary = {
      total_records: attendance_data.length,
      unique_employees: [...new Set(attendance_data.map(record => record.employee_ID))].length,
      in_scans: attendance_data.filter(record => 
        record.scan_type && record.scan_type.toUpperCase() === 'IN'
      ).length,
      out_scans: attendance_data.filter(record => 
        record.scan_type && record.scan_type.toUpperCase() === 'OUT'
      ).length,
      date_range: {
        from: from_date,
        to: to_date
      }
    };

    // Add division/section info to summary if filtered
    if (division_id && division_id !== 'all') {
      const [divisionInfo] = await connection.execute(
        'SELECT division_name FROM divisions WHERE division_id = ?', 
        [division_id]
      );
      if (divisionInfo.length > 0) {
        summary.division_filter = divisionInfo[0].division_name;
      }
    }

    if (section_id && section_id !== 'all') {
      const [sectionInfo] = await connection.execute(
        'SELECT section_name FROM sections WHERE section_id = ?', 
        [section_id]
      );
      if (sectionInfo.length > 0) {
        summary.section_filter = sectionInfo[0].section_name;
      }
    }

    // Prepare query parameters for export
    const query_params = {
      report_type,
      employee_id,
      division_id,
      section_id,
      from_date,
      to_date
    };

    // Close connection
    await connection.end();

    // Return response
    res.status(200).json({
      success: true,
      data: attendance_data,
      summary,
      query_params,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('MySQL Attendance Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the report: ' + error.message
    });
  }
};

// @desc    Generate MySQL-based meal report
// @route   POST /api/reports/mysql/meal
// @access  Private
const generateMySQLMealReport = async (req, res) => {
  try {
    const {
      report_type = 'all',
      employee_id = '',
      from_date,
      to_date
    } = req.body;

    // Validate required fields
    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: 'Date range is required'
      });
    }

    // Create MySQL connection
    const connection = await createMySQLConnection();

    // Build meal report query
    let sql = `SELECT 
                id,
                employee_id,
                meal_date,
                meal_type,
                booking_time,
                status
               FROM meal_bookings 
               WHERE meal_date BETWEEN ? AND ?`;
    
    let params = [from_date, to_date];

    // Add employee filter if specified
    if (report_type === 'individual' && employee_id) {
      sql += ` AND employee_id = ?`;
      params.push(employee_id);
    }

    // Add ordering
    sql += ` ORDER BY meal_date DESC, booking_time DESC`;

    // Execute query
    const [meal_data] = await connection.execute(sql, params);

    // Calculate summary statistics
    const summary = {
      total_bookings: meal_data.length,
      unique_employees: [...new Set(meal_data.map(record => record.employee_id))].length,
      breakfast_bookings: meal_data.filter(record => record.meal_type === 'breakfast').length,
      lunch_bookings: meal_data.filter(record => record.meal_type === 'lunch').length,
      dinner_bookings: meal_data.filter(record => record.meal_type === 'dinner').length,
      date_range: {
        from: from_date,
        to: to_date
      }
    };

    // Close connection
    await connection.end();

    res.status(200).json({
      success: true,
      data: meal_data,
      summary,
      message: 'Meal report generated successfully'
    });

  } catch (error) {
    console.error('MySQL Meal Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the meal report: ' + error.message
    });
  }
};

module.exports = {
  getAttendanceReport,
  getAuditReport,
  getMealReport,
  getUnitAttendanceReport,
  getDivisionReport,
  getUserActivityReport,
  exportReport,
  getReportSummary,
  getCustomReport,
  generateMySQLAttendanceReport,
  generateMySQLMealReport
};
