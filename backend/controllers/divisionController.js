const Division = require('../models/Division');
const Section = require('../models/Section');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all divisions
// @route   GET /api/divisions
// @access  Private
const getDivisions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = req.query.limit ? parseInt(req.query.limit) : 1000, // Increased default limit to 1000
      sort = 'name',
      order = 'asc',
      search,
      isActive
    } = req.query;

    // Build query
    let query = {};

    // Role-based filtering - removed restrictions for now to get all data
    // if (req.user.role === 'admin' && req.user.division) {
    //   query._id = req.user.division._id;
    // } else if (req.user.role === 'clerk' && req.user.division) {
    //   query._id = req.user.division._id;
    // }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Sort order
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    console.log('Fetching divisions with query:', query);
    
    const divisions = await Division.find(query)
      .populate('manager', 'firstName lastName email employeeId')
      .populate('employeeCount')
      .populate('sectionCount')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Division.countDocuments(query);

    console.log(`Found ${divisions.length} divisions out of ${total} total`);
    console.log('Division data:', divisions.map(d => ({ 
      id: d._id, 
      name: d.name, 
      code: d.code, 
      isActive: d.isActive,
      employeeCount: d.employeeCount,
      manager: d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : 'No manager'
    })));

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: divisions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get divisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting divisions',
      error: error.message
    });
  }
};

// @desc    Get single division
// @route   GET /api/divisions/:id
// @access  Private
const getDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id)
      .populate('manager', 'firstName lastName email employeeId')
      .populate('employeeCount')
      .populate('sectionCount');

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'admin' || req.user.role === 'clerk') {
      if (!req.user.division || req.user.division._id.toString() !== division._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get division statistics
    const stats = await Division.getDivisionStats(division._id);

    res.status(200).json({
      success: true,
      data: {
        ...division.toObject(),
        stats
      }
    });

  } catch (error) {
    console.error('Get division error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting division'
    });
  }
};

// @desc    Create division
// @route   POST /api/divisions
// @access  Private
const createDivision = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check if division code already exists
    const existingDivision = await Division.findOne({ 
      $or: [{ code: code.toUpperCase() }, { name }] 
    });

    if (existingDivision) {
      return res.status(400).json({
        success: false,
        message: 'Division with this code or name already exists'
      });
    }

    // Create division with only name and code
    const division = new Division({
      name,
      code: code.toUpperCase()
    });

    await division.save();

    // Log division creation
    await AuditLog.createLog({
      user: req.user._id,
      action: 'division_created',
      entity: { type: 'Division', id: division._id, name: division.name },
      category: 'data_modification',
      severity: 'medium',
      description: 'New division created',
      details: `Created division: ${division.name} (${division.code})`,
      changes: {
        after: { name, code: code.toUpperCase() }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: division
    });

  } catch (error) {
    console.error('Create division error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Division with this code or name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating division'
    });
  }
};

// @desc    Update division
// @route   PUT /api/divisions/:id
// @access  Private (super_admin only)
const updateDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Store old values for audit
    const oldValues = {
      name: division.name,
      code: division.code,
      description: division.description,
      manager: division.manager,
      isActive: division.isActive
    };

    const {
      name,
      code,
      description,
      manager,
      location,
      workingHours,
      budget,
      contact,
      settings,
      isActive
    } = req.body;

    // Update fields
    if (name !== undefined) division.name = name;
    if (code !== undefined) division.code = code.toUpperCase();
    if (description !== undefined) division.description = description;
    if (location !== undefined) division.location = { ...division.location, ...location };
    if (workingHours !== undefined) division.workingHours = { ...division.workingHours, ...workingHours };
    if (budget !== undefined) division.budget = { ...division.budget, ...budget };
    if (contact !== undefined) division.contact = { ...division.contact, ...contact };
    if (settings !== undefined) division.settings = { ...division.settings, ...settings };
    if (isActive !== undefined) division.isActive = isActive;

    // Handle manager change
    if (manager !== undefined) {
      // Remove division from old manager
      if (division.manager) {
        await User.findByIdAndUpdate(division.manager, { $unset: { division: 1 } });
      }

      // Validate new manager
      if (manager) {
        const managerUser = await User.findById(manager);
        if (!managerUser) {
          return res.status(400).json({
            success: false,
            message: 'Manager not found'
          });
        }

        if (!['admin', 'super_admin'].includes(managerUser.role)) {
          return res.status(400).json({
            success: false,
            message: 'Manager must be an admin or super admin'
          });
        }

        // Assign division to new manager
        await User.findByIdAndUpdate(manager, { division: division._id });
      }

      division.manager = manager;
    }

    await division.save();

    // Log division update
    await AuditLog.createLog({
      user: req.user._id,
      action: 'division_updated',
      entity: { type: 'Division', id: division._id, name: division.name },
      category: 'data_modification',
      severity: 'medium',
      description: 'Division updated',
      details: `Updated division: ${division.name} (${division.code})`,
      changes: {
        before: oldValues,
        after: req.body
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    // Populate manager before sending response
    await division.populate('manager', 'firstName lastName email employeeId');

    res.status(200).json({
      success: true,
      message: 'Division updated successfully',
      data: division
    });

  } catch (error) {
    console.error('Update division error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Division code or name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating division'
    });
  }
};

// @desc    Delete division
// @route   DELETE /api/divisions/:id
// @access  Private (super_admin only)
const deleteDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Check if division has employees
    const employeeCount = await User.countDocuments({ division: division._id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete division with ${employeeCount} employees. Please reassign or remove employees first.`
      });
    }

    // Check if division has sections
    const sectionCount = await Section.countDocuments({ division: division._id });
    if (sectionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete division with ${sectionCount} sections. Please delete sections first.`
      });
    }

    await Division.findByIdAndDelete(req.params.id);

    // Log division deletion
    await AuditLog.createLog({
      user: req.user._id,
      action: 'division_deleted',
      entity: { type: 'Division', id: division._id, name: division.name },
      category: 'data_modification',
      severity: 'high',
      description: 'Division deleted',
      details: `Deleted division: ${division.name} (${division.code})`,
      changes: {
        before: {
          name: division.name,
          code: division.code,
          description: division.description,
          manager: division.manager
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      requiresReview: true
    });

    res.status(200).json({
      success: true,
      message: 'Division deleted successfully'
    });

  } catch (error) {
    console.error('Delete division error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting division'
    });
  }
};

// @desc    Get division employees
// @route   GET /api/divisions/:id/employees
// @access  Private
const getDivisionEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'admin' || req.user.role === 'clerk') {
      if (!req.user.division || req.user.division._id.toString() !== division._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Build query
    let query = { division: division._id };
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [employees, total] = await Promise.all([
      User.find(query)
        .populate('section', 'name code')
        .select('-password')
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get division employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting division employees'
    });
  }
};

// @desc    Get division sections
// @route   GET /api/divisions/:id/sections
// @access  Private
const getDivisionSections = async (req, res) => {
  try {
    const { page = 1, limit = 1000, isActive } = req.query; // Increased limit for testing

    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Temporarily comment out access permissions for testing
    // if (req.user && (req.user.role === 'admin' || req.user.role === 'clerk')) {
    //   if (!req.user.division || req.user.division._id.toString() !== division._id.toString()) {
    //     return res.status(403).json({
    //       success: false,
    //       message: 'Access denied'
    //     });
    //   }
    // }

    // Build query
    let query = { division: division._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [sections, total] = await Promise.all([
      Section.find(query)
        .populate('supervisor', 'firstName lastName email employeeId')
        .populate('employeeCount')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Section.countDocuments(query)
    ]);

    console.log(`Found ${sections.length} sections for division ${division.name}`); // Debug log

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: sections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get division sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting division sections'
    });
  }
};

// @desc    Get division statistics
// @route   GET /api/divisions/:id/stats
// @access  Private
const getDivisionStats = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'admin' || req.user.role === 'clerk') {
      if (!req.user.division || req.user.division._id.toString() !== division._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const stats = await Division.getDivisionStats(division._id);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get division stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting division statistics'
    });
  }
};

// @desc    Toggle division status
// @route   PATCH /api/divisions/:id/toggle-status
// @access  Private (super_admin only)
const toggleDivisionStatus = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    const oldStatus = division.isActive;
    division.isActive = !division.isActive;
    await division.save();

    // Log status change
    await AuditLog.createLog({
      user: req.user._id,
      action: division.isActive ? 'division_activated' : 'division_deactivated',
      entity: { type: 'Division', id: division._id, name: division.name },
      category: 'data_modification',
      severity: 'medium',
      description: `Division ${division.isActive ? 'activated' : 'deactivated'}`,
      details: `${division.isActive ? 'Activated' : 'Deactivated'} division: ${division.name} (${division.code})`,
      changes: {
        before: { isActive: oldStatus },
        after: { isActive: division.isActive }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      message: `Division ${division.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: division.isActive }
    });

  } catch (error) {
    console.error('Toggle division status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling division status'
    });
  }
};

module.exports = {
  getDivisions,
  getDivision,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionEmployees,
  getDivisionSections,
  getDivisionStats,
  toggleDivisionStatus
};
