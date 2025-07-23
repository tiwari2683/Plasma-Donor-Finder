import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import RequesterSidebar from '../components/RequesterSidebar';
import Header from '../components/Header';
import { getCurrentLocationWithAddress } from '../utils/geocoding';

function Search() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [usedLocation, setUsedLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [showAllDonors, setShowAllDonors] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState({
    bloodGroup: '',
    address: '',
    radius: 20, // Default to 20km
    lat: '',
    lng: ''
  });
  
  const [filters, setFilters] = useState({
    availableOnly: false,
    maxDistance: 20,
    bloodGroupFilter: '',
    autoApply: false,
    sortBy: 'distance' // 'distance', 'compatibility', 'availability'
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Blood group compatibility mapping
  const bloodCompatibility = {
    'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], description: 'Can receive from A+, A-, O+, O-' },
    'A-': { canReceiveFrom: ['A-', 'O-'], description: 'Can receive from A-, O-' },
    'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], description: 'Can receive from B+, B-, O+, O-' },
    'B-': { canReceiveFrom: ['B-', 'O-'], description: 'Can receive from B-, O-' },
    'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], description: 'Universal recipient - can receive from all blood groups' },
    'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], description: 'Can receive from A-, B-, AB-, O-' },
    'O+': { canReceiveFrom: ['O+', 'O-'], description: 'Can receive from O+, O-' },
    'O-': { canReceiveFrom: ['O-'], description: 'Can only receive from O-' }
  };

  // Check if a donor can donate to the requested blood group
  const isCompatible = (donorBloodGroup, requestedBloodGroup) => {
    const compatibility = bloodCompatibility[requestedBloodGroup];
    return compatibility?.canReceiveFrom?.includes(donorBloodGroup) || false;
  };

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const userRes = await api.get('/profile');
        setUser(userRes.data);
      } catch (err) {
        // Silent fail for user data fetch
      }
    };
    fetchUser();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setSearch(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
    } else {
      setSearch(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Auto-apply filters if enabled
    if (filters.autoApply) {
      setTimeout(() => applyFilters(), 100); // Small delay to ensure state is updated
    } else {
      // Reset filters applied state when filters change
      setFiltersApplied(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    // Filter by availability
    if (filters.availableOnly) {
      filtered = filtered.filter(donor => donor.isAvailable);
    }

    // Filter by max distance
    if (filters.maxDistance) {
      filtered = filtered.filter(donor => (donor.distance || 0) <= filters.maxDistance);
    }

    // Filter by blood group
    if (filters.bloodGroupFilter) {
      filtered = filtered.filter(donor => donor.bloodGroup === filters.bloodGroupFilter);
    }

    // Sort results
    filtered.sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      } else if (filters.sortBy === 'compatibility' && search.bloodGroup) {
        const aCompatible = isCompatible(a.bloodGroup, search.bloodGroup);
        const bCompatible = isCompatible(b.bloodGroup, search.bloodGroup);
        if (aCompatible !== bCompatible) {
          return bCompatible ? 1 : -1; // Compatible first
        }
        return (a.distance || 0) - (b.distance || 0); // Then by distance
      } else if (filters.sortBy === 'availability') {
        if (a.isAvailable !== b.isAvailable) {
          return b.isAvailable ? 1 : -1; // Available first
        }
        return (a.distance || 0) - (b.distance || 0); // Then by distance
      }
      return 0;
    });

    setFilteredResults(filtered);
    setFiltersApplied(true);
    toast.success(`Applied filters: ${filtered.length} donors found`);
  };

  const clearFilters = () => {
    setFilteredResults([]);
    setFiltersApplied(false);
    setFilters({
      availableOnly: false,
      maxDistance: 20,
      bloodGroupFilter: '',
      autoApply: false,
      sortBy: 'distance'
    });
    toast.info('Filters cleared');
  };

  const handleUseMyLocation = async () => {
    setSearching(true);
    setSearchError('');
    
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      setSearching(false);
      return;
    }

    try {
      const locationData = await getCurrentLocationWithAddress();
      
      setUsedLocation({ 
        lat: locationData.lat, 
        lng: locationData.lng,
        address: locationData.address 
      });
      setSearch(prev => ({ 
        ...prev, 
        lat: locationData.lat, 
        lng: locationData.lng 
      }));
      
      if (locationData.address) {
        toast.success('Location and address obtained successfully!');
      } else {
        toast.success('Location obtained successfully! Address not available.');
      }
    } catch (error) {
      setSearchError('Failed to get your location. Please enter your address manually.');
      toast.error('Failed to get your location');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchAllDonors = async () => {
    setSearching(true);
    setSearchError('');
    setResults([]);

    try {
      // Use provided coordinates or default to a central location
      const searchLat = search.lat || 19.0760; // Default to Mumbai coordinates
      const searchLng = search.lng || 72.8777;
      
      const params = {
        lat: searchLat,
        lng: searchLng,
        radius: 20 // Fixed 20km radius
      };

      console.log('Show All Donors parameters:', params);

      const response = await api.get('/search/donors', { params });
      console.log('Show All Donors response:', response.data);
      setResults(response.data);
      setFilteredResults(response.data); // Set filtered results to all results initially
      setFiltersApplied(false); // Reset filters applied state
      setShowAllDonors(true);
      
      if (response.data.length === 0) {
        toast.info('No donors found within 20km of the specified location.');
      } else {
        toast.success(`Found ${response.data.length} donor(s) within 20km`);
      }
    } catch (error) {
      console.error('Show All Donors error:', error);
      setSearchError('Failed to search for donors. Please try again.');
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchError('');
    setResults([]);

    try {
      const params = {
        bloodGroup: search.bloodGroup,
        radius: search.radius
      };

      // Use location from geolocation if available, otherwise use address
      if (usedLocation) {
        params.lat = usedLocation.lat;
        params.lng = usedLocation.lng;
      } else if (search.lat && search.lng) {
        params.lat = search.lat;
        params.lng = search.lng;
      } else if (search.address) {
        params.address = search.address;
      } else {
        setSearchError('Please provide a location or use "Use My Current Location"');
        setSearching(false);
        return;
      }

      console.log('Search parameters:', params);

      const response = await api.get('/search/donors', { params });
      console.log('Search response:', response.data);
      setResults(response.data);
      setFilteredResults(response.data); // Set filtered results to all results initially
      setFiltersApplied(false); // Reset filters applied state
      
      if (response.data.length === 0) {
        toast.info('No donors found in your area. Try increasing the search radius.');
      } else {
        toast.success(`Found ${response.data.length} donor(s) in your area`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search for donors. Please try again.');
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleRequest = async (donorId) => {
    try {
      await api.post(`/donation/request/${donorId}`, { bloodGroup: search.bloodGroup });
      toast.success('Request sent successfully!');
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const getDistanceColor = (distance) => {
    if (distance <= 5) return 'text-green-600 font-semibold';
    if (distance <= 15) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getAvailabilityBadge = (available) => {
    return available ? 
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span> :
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Unavailable</span>;
  };

  return (
    <div className="min-h-screen flex bg-red-50 text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} />
      <RequesterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-800">Find Plasma Donors</h1>
          
          {/* Search Form */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Search Criteria</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              
              {/* Blood Group Selection */}
              <div>
                <label className="block text-red-700 font-semibold mb-2">Blood Group Needed</label>
                <select
                  name="bloodGroup"
                  value={search.bloodGroup}
                  onChange={handleSearchChange}
                  className="w-full border p-3 rounded border-red-300 focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
                  required
                >
                  <option value="">Select Blood Group You Need</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg} - {bloodCompatibility[bg]?.description}</option>
                  ))}
                </select>
                {search.bloodGroup && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs text-blue-700">
                    <strong>Compatibility:</strong> {bloodCompatibility[search.bloodGroup]?.description}
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <label className="block text-red-700 font-semibold mb-2">Location</label>
                
                {/* Coordinate Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      name="lat"
                      value={search.lat}
                      onChange={handleSearchChange}
                      step="any"
                      className="w-full border p-2 rounded border-red-300 focus:ring-2 focus:ring-red-600 text-sm"
                      placeholder="e.g. 19.0760"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      name="lng"
                      value={search.lng}
                      onChange={handleSearchChange}
                      step="any"
                      className="w-full border p-2 rounded border-red-300 focus:ring-2 focus:ring-red-600 text-sm"
                      placeholder="e.g. 72.8777"
                    />
                  </div>
                </div>
                
                {/* Address Input */}
                <input
                  type="text"
                  name="address"
                  value={search.address}
                  onChange={handleSearchChange}
                  className="w-full border p-3 rounded border-red-300 focus:ring-2 focus:ring-red-600 text-sm sm:text-base"
                  placeholder="Enter your address or city"
                />
                
                {/* Location Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition text-sm sm:text-base flex items-center justify-center"
                    onClick={handleUseMyLocation}
                    disabled={searching}
                  >
                    {searching ? 'Getting Location...' : '📍 Use My Current Location'}
                  </button>
                  
                  <button
                    type="button"
                    className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition text-sm sm:text-base flex items-center justify-center"
                    onClick={handleSearchAllDonors}
                    disabled={searching}
                  >
                    {searching ? 'Searching...' : '🔍 Show All Donors (20km)'}
                  </button>
                </div>
              </div>

              {/* Search Radius */}
              <div>
                <label className="block text-red-700 font-semibold mb-2">
                  Search Radius: {search.radius} km
                </label>
                <input
                  type="range"
                  name="radius"
                  min="5"
                  max="100"
                  value={search.radius}
                  onChange={handleSearchChange}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5km</span>
                  <span>50km</span>
                  <span>100km</span>
                </div>
              </div>

              {/* Search Button */}
              <button 
                type="submit" 
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold shadow hover:bg-red-700 transition text-sm sm:text-base"
                disabled={searching}
              >
                {searching ? '🔍 Searching...' : '🔍 Search for Donors'}
              </button>

              {/* Location Status */}
              {usedLocation && (
                <div className="text-sm text-gray-700 p-3 bg-green-50 rounded border border-green-200">
                  <span className="font-semibold">📍 Search Location: </span>
                  <span>{usedLocation.address || `Lat: ${usedLocation.lat.toFixed(4)}, Lng: ${usedLocation.lng.toFixed(4)}`}</span>
                </div>
              )}
              
              {searchError && (
                <div className="text-red-500 p-3 bg-red-50 rounded border border-red-200">
                  ⚠️ {searchError}
                </div>
              )}
            </form>
          </div>

          {/* Filters */}
          {results.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-red-700">Filters</h2>
                {filtersApplied && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Filters Applied
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="availableOnly"
                      checked={filters.availableOnly}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Available donors only</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Distance</label>
                  <select
                    name="maxDistance"
                    value={filters.maxDistance}
                    onChange={handleFilterChange}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Blood Group Filter</label>
                  <select
                    name="bloodGroupFilter"
                    value={filters.bloodGroupFilter}
                    onChange={handleFilterChange}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="">All Blood Groups</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Additional Filter Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full border p-2 rounded text-sm"
                  >
                    <option value="distance">Distance (Nearest First)</option>
                    <option value="compatibility">Compatibility (If blood group selected)</option>
                    <option value="availability">Availability (Available First)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoApply"
                      checked={filters.autoApply}
                      onChange={handleFilterChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Auto-apply filters</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  🔍 Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
                >
                  🗑️ Clear Filters
                </button>
                {filtersApplied && (
                  <span className="text-sm text-gray-600 flex items-center">
                    Showing {filteredResults.length} of {results.length} donors
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-700">
              Results ({filteredResults.length} donors found)
            </h2>
            
            {/* Search Summary */}
            {filteredResults.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Search Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {search.bloodGroup ? (
                    <>
                      <div className="text-center">
                        <div className="font-bold text-green-600">
                          {filteredResults.filter(d => isCompatible(d.bloodGroup, search.bloodGroup)).length}
                        </div>
                        <div className="text-gray-600">Compatible</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">
                          {filteredResults.filter(d => !isCompatible(d.bloodGroup, search.bloodGroup)).length}
                        </div>
                        <div className="text-gray-600">Incompatible</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {filteredResults.length}
                      </div>
                      <div className="text-gray-600">Total Donors</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold text-blue-600">
                      {filteredResults.filter(d => d.distance <= 10).length}
                    </div>
                    <div className="text-gray-600">Within 10km</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">
                      {filteredResults.filter(d => d.isAvailable).length}
                    </div>
                    <div className="text-gray-600">Available</div>
                  </div>
                </div>
                {!search.bloodGroup && (
                  <div className="mt-2 text-xs text-gray-600">
                    💡 Select a blood group above to see compatibility information
                  </div>
                )}
              </div>
            )}
            
            {searching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for donors in your area...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">No donors found in your area</p>
                <p className="text-gray-500 text-sm mt-2">Try increasing the search radius or checking back later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults
                  .map(donor => ({
                    ...donor,
                    isCompatible: search.bloodGroup ? isCompatible(donor.bloodGroup, search.bloodGroup) : true,
                    compatibilityMessage: search.bloodGroup 
                      ? (isCompatible(donor.bloodGroup, search.bloodGroup)
                          ? `✅ Compatible: ${donor.bloodGroup} can donate to ${search.bloodGroup}`
                          : `❌ Incompatible: ${donor.bloodGroup} cannot donate to ${search.bloodGroup}`)
                      : `📋 Blood Group: ${donor.bloodGroup}`
                  }))
                  .sort((a, b) => {
                    // Sort by compatibility first (if blood group selected), then by distance
                    if (search.bloodGroup && a.isCompatible !== b.isCompatible) {
                      return b.isCompatible ? 1 : -1;
                    }
                    return (a.distance || 0) - (b.distance || 0);
                  })
                  .map(donor => (
                  <div key={donor._id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    search.bloodGroup 
                      ? (donor.isCompatible 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50')
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-red-700 text-lg">{donor.name}</h3>
                          <span className="text-lg font-bold text-red-600">({donor.bloodGroup})</span>
                          {getAvailabilityBadge(donor.isAvailable)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">📍</span>
                            <span>{donor.location?.address || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">📏</span>
                            <span className={getDistanceColor(donor.distance || 0)}>
                              {donor.distance ? `${donor.distance.toFixed(1)} km away` : 'Distance unknown'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className={`text-sm font-medium ${
                            search.bloodGroup 
                              ? (donor.isCompatible ? 'text-green-700' : 'text-red-700')
                              : 'text-gray-700'
                          }`}>
                            {donor.compatibilityMessage}
                          </p>
                        </div>
                        
                        {donor.lastDonationDate && (
                          <div className="mt-2 text-xs text-gray-500">
                            Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleRequest(donor._id)}
                          disabled={search.bloodGroup && !donor.isCompatible}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            search.bloodGroup && !donor.isCompatible
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                          title={search.bloodGroup && !donor.isCompatible 
                            ? 'Blood groups are not compatible' 
                            : 'Request plasma from this donor'}
                        >
                          {search.bloodGroup && !donor.isCompatible ? 'Incompatible' : 'Request Plasma'}
                        </button>
                        <button
                          onClick={() => navigate(`/chat/${donor._id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Search; 