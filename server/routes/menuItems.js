const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require('../controllers/menuItemController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/all', getAllMenuItems); // Search all menu items across providers
router.get('/provider/:providerId', getMenuItems); // Get menu items for a specific provider
router.get('/:id', getMenuItem); // Get single menu item

// Protected routes (require authentication)
router.post('/provider/:providerId', protect, authorize('provider', 'admin'), createMenuItem);
router.put('/:id', protect, authorize('provider', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteMenuItem);
router.patch('/:id/toggle-availability', protect, authorize('provider', 'admin'), toggleAvailability);

module.exports = router;
