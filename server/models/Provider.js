const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  image: String,
  category: {
    type: String,
    enum: ['traditional', 'continental', 'vegan', 'gluten-free', 'sweet', 'savory'],
    default: 'traditional'
  },
  available: {
    type: Boolean,
    default: true
  }
});

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  cuisine: {
    type: [String],
    default: []
  },
  serviceType: {
    delivery: {
      type: Boolean,
      default: true
    },
    pickup: {
      type: Boolean,
      default: false
    }
  },
  deliveryRadius: {
    type: Number,
    default: 5, // in kilometers
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  images: [{
    type: String
  }],
  menu: [menuItemSchema],
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  deliverySlots: [{
    time: String, // e.g., "07:00", "08:00"
    maxOrders: {
      type: Number,
      default: 10
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
providerSchema.index({ 'address.coordinates': '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);
