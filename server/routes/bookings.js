const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getProviderBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  addReview
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/provider', protect, authorize('provider', 'admin'), getProviderBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/review', protect, addReview);

module.exports = router;
