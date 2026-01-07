const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Menu item must belong to a provider'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a menu item name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String
  },
  category: {
    type: String,
    enum: ['traditional', 'continental', 'vegan', 'gluten-free', 'sweet', 'savory'],
    default: 'traditional'
  },
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  allergens: [{
    type: String,
    enum: ['dairy', 'eggs', 'nuts', 'gluten', 'soy', 'shellfish', 'fish']
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
menuItemSchema.index({ providerId: 1, available: 1 });
menuItemSchema.index({ providerId: 1, category: 1 });
menuItemSchema.index({ name: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('MenuItem', menuItemSchema);
