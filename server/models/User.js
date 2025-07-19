const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  role: { type: String, enum: ['donor', 'requester', 'admin'], default: 'donor' },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: '' }
  },
  isAvailable: { type: Boolean, default: true },
  lastDonationDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Database indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ bloodGroup: 1 });
userSchema.index({ isAvailable: 1 });
userSchema.index({ 'location.lat': 1, 'location.lng': 1 });
userSchema.index({ role: 1, bloodGroup: 1, isAvailable: 1 });
userSchema.index({ createdAt: -1 });

// No geospatial indexing - we'll use manual distance calculations
// This prevents the "Can't extract geo keys" error

module.exports = mongoose.model('User', userSchema); 