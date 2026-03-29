const mongoose = require('mongoose');

const ownerResponseSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  media: [{ type: String }],
  date: { type: String, required: true },
  helpful: { type: Number, default: 0 },
  unhelpful: { type: Number, default: 0 },
  votedBy: [{ type: String }],
  edited: { type: Boolean, default: false },
  ownerResponse: { type: ownerResponseSchema, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
