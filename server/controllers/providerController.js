const Provider = require('../models/Provider');

// Get all providers with search and filtering
exports.getProviders = async (req, res) => {
  try {
    const { lat, lng, radius, cuisine, delivery, pickup, minRating } = req.query;

    let query = { active: true };

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    // Filter by service type
    if (delivery === 'true') {
      query['serviceType.delivery'] = true;
    }
    if (pickup === 'true') {
      query['serviceType.pickup'] = true;
    }

    // Filter by minimum rating
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Geospatial query for nearby providers
    if (lat && lng) {
      const radiusInKm = radius || 10;
      const radiusInMeters = radiusInKm * 1000;

      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    const providers = await Provider.find(query)
      .populate('userId', 'name email phone')
      .sort('-rating.average');

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error.message
    });
  }
};

// Get single provider by ID
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.status(200).json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching provider'
    });
  }
};

// Create provider profile
exports.createProvider = async (req, res) => {
  try {
    const providerData = {
      ...req.body,
      userId: req.user.id
    };

    const provider = await Provider.create(providerData);

    res.status(201).json({
      success: true,
      provider
    });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating provider',
      error: error.message
    });
  }
};

// Update provider profile
exports.updateProvider = async (req, res) => {
  try {
    let provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check ownership
    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this provider'
      });
    }

    provider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating provider'
    });
  }
};

// Delete provider
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check ownership
    if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this provider'
      });
    }

    await provider.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting provider'
    });
  }
};

// Get provider's own profile
exports.getMyProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    res.status(200).json({
      success: true,
      provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching provider profile'
    });
  }
};
