const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus
} = require('../controllers/userController');
const { 
  auth, 
  authorize, 
  checkPermission, 
  checkSelfOrAdmin,
  auditTrail 
} = require('../middleware/auth');
const { userValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin, super_admin, clerk)
router.get(
  '/',
  auth,
  authorize('super_admin', 'admin', 'clerk'),
  queryValidation.pagination,
  auditTrail('users_viewed', 'User'),
  getUsers
);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (admin, super_admin)
router.get(
  '/stats',
  auth,
  authorize('super_admin', 'admin'),
  auditTrail('user_stats_viewed', 'User'),
  getUserStats
);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get(
  '/:id',
  auth,
  checkSelfOrAdmin,
  auditTrail('user_viewed', 'User'),
  getUser
);

// @route   POST /api/users
// @desc    Create user
// @access  Private (admin, super_admin)
router.post(
  '/',
  auth,
  authorize('super_admin', 'admin'),
  checkPermission('users', 'create'),
  userValidation.create,
  auditTrail('user_created', 'User'),
  createUser
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put(
  '/:id',
  auth,
  checkSelfOrAdmin,
  userValidation.update,
  auditTrail('user_updated', 'User'),
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (super_admin only)
router.delete(
  '/:id',
  auth,
  authorize('super_admin'),
  checkPermission('users', 'delete'),
  auditTrail('user_deleted', 'User'),
  deleteUser
);

// @route   PATCH /api/users/:id/toggle-status
// @desc    Toggle user status (activate/deactivate)
// @access  Private (admin, super_admin)
router.patch(
  '/:id/toggle-status',
  auth,
  authorize('super_admin', 'admin'),
  checkPermission('users', 'update'),
  auditTrail('user_status_toggled', 'User'),
  toggleUserStatus
);

module.exports = router;
