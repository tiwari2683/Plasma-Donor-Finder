// Reverse geocoding utility to convert coordinates to address
export const reverseGeocode = async (lat, lng) => {
  try {
    // Using OpenStreetMap Nominatim API (free and no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PlasmaDonorFinder/1.0' // Required by Nominatim
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Extract address components
    const address = data.display_name || '';
    
    return {
      address,
      success: true
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: '',
      success: false,
      error: error.message
    };
  }
};

// Get current location with address
export const getCurrentLocationWithAddress = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        try {
          // Get address from coordinates
          const geocodeResult = await reverseGeocode(lat, lng);
          
          resolve({
            lat,
            lng,
            address: geocodeResult.address,
            success: true
          });
        } catch (error) {
          // If geocoding fails, still return coordinates
          resolve({
            lat,
            lng,
            address: '',
            success: false,
            error: error.message
          });
        }
      },
      (error) => {
        reject(new Error('Failed to get your location'));
      },
      {
        timeout: 10000,
        enableHighAccuracy: true
      }
    );
  });
}; 