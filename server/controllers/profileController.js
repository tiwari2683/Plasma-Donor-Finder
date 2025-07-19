const User = require('../models/User');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent email and password update here for simplicity
    delete updates.email;
    delete updates.password;
    
    // Handle location data carefully
    if (updates.location) {
      // Ensure location data is properly formatted
      updates.location = {
        lat: updates.location.lat ? parseFloat(updates.location.lat) : null,
        lng: updates.location.lng ? parseFloat(updates.location.lng) : null,
        address: updates.location.address || ''
      };
    }
    
    // Use findByIdAndUpdate with proper options
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { 
        new: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).select('-password');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get current user's availability
exports.getAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('isAvailable');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ available: user.isAvailable });
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update current user's availability
exports.updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { isAvailable: available }, 
      { new: true }
    ).select('isAvailable');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ available: user.isAvailable });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 