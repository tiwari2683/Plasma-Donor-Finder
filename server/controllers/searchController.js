const User = require('../models/User');

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Search donors by blood group, location, radius, and availability
exports.searchDonors = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, radius = 10, isAvailable } = req.query;
    if (!lat || !lng) return res.status(400).json({ msg: 'Latitude and longitude are required' });

    console.log('Search parameters:', { lat, lng, radius, isAvailable });

    // Build query - search for all donors, let client filter by blood group compatibility
    const query = {
      role: 'donor',
      'location.lat': { $exists: true, $ne: null },
      'location.lng': { $exists: true, $ne: null }
      // Removed bloodGroup filter to allow searching all donors
    };

    // Only filter by availability if explicitly requested
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Get all donors and filter by distance
    const allDonors = await User.find(query).select('-password');
    
    console.log(`Found ${allDonors.length} donors in database`);
    
    // Filter by distance
    const donors = allDonors
      .map(donor => {
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          donor.location.lat, 
          donor.location.lng
        );
        return {
          ...donor.toObject(),
          distance: distance // Keep distance in kilometers
        };
      })
      .filter(donor => donor.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    console.log(`Found ${donors.length} donors within ${radius}km radius`);
    console.log('Donors found:', donors.map(d => ({ 
      name: d.name, 
      bloodGroup: d.bloodGroup, 
      distance: d.distance,
      isAvailable: d.isAvailable,
      location: d.location 
    })));

    res.json(donors);
  } catch (err) {
    console.error('Search donors error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Search recipients by blood group, location, and radius
exports.searchRecipients = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ msg: 'Latitude and longitude are required' });

    // Build query
    const query = {
      role: 'requester',
      'location.lat': { $exists: true, $ne: null },
      'location.lng': { $exists: true, $ne: null },
      ...(bloodGroup && { bloodGroup })
    };

    // Get all recipients and filter by distance
    const allRecipients = await User.find(query).select('-password');
    
    // Filter by distance
    const recipients = allRecipients
      .map(recipient => {
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          recipient.location.lat, 
          recipient.location.lng
        );
        return {
          ...recipient.toObject(),
          distance: distance // Keep distance in kilometers
        };
      })
      .filter(recipient => recipient.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(recipients);
  } catch (err) {
    console.error('Search recipients error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 

// Debug endpoint to check all donors
exports.debugDonors = async (req, res) => {
  try {
    const allDonors = await User.find({ role: 'donor' }).select('-password');
    
    const donorsWithInfo = allDonors.map(donor => ({
      id: donor._id,
      name: donor.name,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      isAvailable: donor.isAvailable,
      location: donor.location,
      role: donor.role,
      createdAt: donor.createdAt
    }));
    
    res.json({
      totalDonors: allDonors.length,
      donors: donorsWithInfo
    });
  } catch (err) {
    console.error('Debug donors error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 

// Test distance calculation
exports.testDistance = async (req, res) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.query;
    
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return res.status(400).json({ 
        msg: 'Please provide lat1, lng1, lat2, lng2 parameters' 
      });
    }
    
    const distance = calculateDistance(
      parseFloat(lat1), 
      parseFloat(lng1), 
      parseFloat(lat2), 
      parseFloat(lng2)
    );
    
    res.json({
      point1: { lat: lat1, lng: lng1 },
      point2: { lat: lat2, lng: lng2 },
      distance: distance,
      distanceKm: distance,
      distanceMeters: distance * 1000
    });
  } catch (err) {
    console.error('Test distance error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 

// Show all donors without any filters (for debugging)
exports.showAllDonors = async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password');
    const donors = allUsers.filter(user => user.role === 'donor');
    
    res.json({
      totalUsers: allUsers.length,
      totalDonors: donors.length,
      allUsers: allUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        isAvailable: user.isAvailable,
        location: user.location
      }))
    });
  } catch (err) {
    console.error('Show all donors error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}; 