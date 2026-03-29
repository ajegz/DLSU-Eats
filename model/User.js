const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isOwner: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' },
  joinedDate: { type: String, default: () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) },
  bio: { type: String, default: '' },
  visitedRestaurants: [{ type: String }],
  restaurantIds: {
    type: [String],
    default: [],
    validate: {
      validator(ids) {
        if (this.isOwner) return Array.isArray(ids) && ids.length === 1;
        return Array.isArray(ids) && ids.length === 0;
      },
      message: 'Owners must have exactly one restaurant assignment; non-owners must have none.'
    }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
