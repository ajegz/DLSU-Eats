const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  insideCampus: { type: Boolean, default: false },
  address: { type: String, default: '' },
  description: { type: String, default: '' },
  foodStyles: [{ type: String }],
  priceRange: { type: String, default: '₱' },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  hours: { type: String, default: 'N/A' },
  phone: { type: String, default: 'N/A' },
  image: { type: String, default: '' },
  grabAvailable: { type: Boolean, default: false },
  foodPandaAvailable: { type: Boolean, default: false },
  grabLink: { type: String, default: '' },
  foodPandaLink: { type: String, default: '' },
  walkingTime: { type: String, default: '' },
  distance: { type: String, default: '' },
  ownerId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
