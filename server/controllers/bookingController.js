const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      userId: req.user.id
    };

    // Verify provider exists
    const provider = await Provider.findById(bookingData.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('providerId', 'businessName images address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

// Get provider's bookings
exports.getProviderBookings = async (req, res) => {
  try {
    // Get provider profile
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const bookings = await Booking.find({ providerId: provider._id })
      .populate('userId', 'name email phone address')
      .sort('-deliveryDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

// Get single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('providerId', 'businessName images address');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider || booking.providerId._id.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking'
        });
      }
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only provider or admin can update status
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    if (provider && booking.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking'
    });
  }
};

// Add review to booking
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    booking.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await booking.save();

    // Update provider rating
    const provider = await Provider.findById(booking.providerId);
    const allBookings = await Booking.find({
      providerId: provider._id,
      'review.rating': { $exists: true }
    });

    const totalRating = allBookings.reduce((sum, b) => sum + b.review.rating, 0);
    const avgRating = totalRating / allBookings.length;

    provider.rating = {
      average: avgRating,
      count: allBookings.length
    };

    await provider.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
};
