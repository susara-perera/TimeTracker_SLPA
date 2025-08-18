const Role = require('../models/Role');

// @desc Get all roles
// @route GET /api/roles
// @access Private (admin, super_admin)
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ success: false, message: 'Server error getting roles' });
  }
};

// @desc Create a role
// @route POST /api/roles
// @access Private (admin, super_admin)
const createRole = async (req, res) => {
  try {
    const { value, label, description } = req.body;
    if (!value || !label) {
      return res.status(400).json({ success: false, message: 'Value and label are required' });
    }

    const existing = await Role.findOne({ value });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }

  const role = await Role.create({ value, label, name: label, description });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ success: false, message: 'Server error creating role' });
  }
};

module.exports = {
  getRoles,
  createRole
};
