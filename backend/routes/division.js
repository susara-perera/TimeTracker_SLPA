const express = require('express');
const {
  getDivisions,
  getDivision,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionEmployees,
  getDivisionSections,
  getDivisionStats,
  toggleDivisionStatus
} = require('../controllers/divisionController');
const { 
  auth, 
  authorize, 
  checkPermission,
  auditTrail 
} = require('../middleware/auth');
const { divisionValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/divisions
// @desc    Get all divisions
// @access  Private
router.get(
  '/',
  auth,
  queryValidation.pagination,
  auditTrail('divisions_viewed', 'Division'),
  getDivisions
);

// @route   GET /api/divisions/:id
// @desc    Get single division
// @access  Private
router.get(
  '/:id',
  auth,
  auditTrail('division_viewed', 'Division'),
  getDivision
);

// @route   GET /api/divisions/:id/employees
// @desc    Get division employees
// @access  Private
router.get(
  '/:id/employees',
  auth,
  queryValidation.pagination,
  auditTrail('division_employees_viewed', 'Division'),
  getDivisionEmployees
);

// @route   GET /api/divisions/:id/sections
// @desc    Get division sections
// @access  Private
router.get(
  '/:id/sections',
  auth,
  queryValidation.pagination,
  auditTrail('division_sections_viewed', 'Division'),
  getDivisionSections
);

// @route   GET /api/divisions/:id/stats
// @desc    Get division statistics
// @access  Private
router.get(
  '/:id/stats',
  auth,
  auditTrail('division_stats_viewed', 'Division'),
  getDivisionStats
);

// @route   POST /api/divisions
// @desc    Create division
// @access  Private (super_admin only)
router.post(
  '/',
  auth,
  authorize('super_admin'),
  checkPermission('divisions', 'create'),
  divisionValidation.create,
  auditTrail('division_created', 'Division'),
  createDivision
);

// @route   PUT /api/divisions/:id
// @desc    Update division
// @access  Private (super_admin only)
router.put(
  '/:id',
  auth,
  authorize('super_admin'),
  checkPermission('divisions', 'update'),
  divisionValidation.update,
  auditTrail('division_updated', 'Division'),
  updateDivision
);

// @route   DELETE /api/divisions/:id
// @desc    Delete division
// @access  Private (super_admin only)
router.delete(
  '/:id',
  auth,
  authorize('super_admin'),
  checkPermission('divisions', 'delete'),
  auditTrail('division_deleted', 'Division'),
  deleteDivision
);

// @route   PATCH /api/divisions/:id/toggle-status
// @desc    Toggle division status
// @access  Private (super_admin only)
router.patch(
  '/:id/toggle-status',
  auth,
  authorize('super_admin'),
  checkPermission('divisions', 'update'),
  auditTrail('division_status_toggled', 'Division'),
  toggleDivisionStatus
);

module.exports = router;
