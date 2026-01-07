const MenuItem = require('../models/MenuItem');
const Provider = require('../models/Provider');

// Get all menu items for a provider
exports.getMenuItems = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { category, available, search } = req.query;

    let query = { providerId };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Text search on name and description
    if (search) {
      query.$text = { $search: search };
    }

    const menuItems = await MenuItem.find(query)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};

// Get all menu items (across all providers) - useful for search/discovery
exports.getAllMenuItems = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    let query = { available: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const menuItems = await MenuItem.find(query)
      .populate('providerId', 'businessName rating address')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    console.error('Get all menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};

// Get single menu item
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('providerId', 'businessName rating address');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item'
    });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Verify provider exists and user owns it
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add menu items to this provider'
      });
    }

    const menuItemData = {
      ...req.body,
      providerId
    };

    const menuItem = await MenuItem.create(menuItemData);

    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Verify ownership through provider
    const provider = await Provider.findById(menuItem.providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    // Prevent changing providerId
    delete req.body.providerId;

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Verify ownership through provider
    const provider = await Provider.findById(menuItem.providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};

// Toggle menu item availability
exports.toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Verify ownership
    const provider = await Provider.findById(menuItem.providerId);

    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling availability',
      error: error.message
    });
  }
};
