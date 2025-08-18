const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { auth, authorize } = require('../middleware/auth');

// Note: auth middleware exports named functions; adjust if needed
// GET /api/roles
// GET /api/roles
router.get('/', auth, getRoles);

// POST /api/roles - only super_admin can create roles
router.post('/', auth, authorize('super_admin'), createRole);

module.exports = router;
