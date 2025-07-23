import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import DonorSidebar from '../components/DonorSidebar';
import Header from '../components/Header';
import BloodCompatibilityChart from '../components/BloodCompatibilityChart';

function DonorDashboard() {
  const [donationStats, setDonationStats] = useState({});
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    compatibility: 'all' // 'all', 'compatible', 'incompatible'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await api.get('/profile');
        setUser(userRes.data);
        
        const statsRes = await api.get('/donation/stats');
        setDonationStats(statsRes.data);
        const nearbyRes = await api.get('/donation/nearby-requests');
        setNearbyRequests(nearbyRes.data);
        
        // Fetch confirmed requests that can be chatted with
        try {
          const confirmedRes = await api.get('/donation/confirmed-requests');
          setConfirmedRequests(confirmedRes.data);
        } catch (err) {
          // Confirmed requests endpoint not available
        }
        
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfirmRequest = async (requesterId) => {
    try {
      const response = await api.post(`/donation/confirm/${requesterId}`);
      toast.success('Request confirmed successfully!');
      // Refresh nearby requests
      const nearbyRes = await api.get('/donation/nearby-requests');
      setNearbyRequests(nearbyRes.data);
      
      // Refresh confirmed requests
      try {
        const confirmedRes = await api.get('/donation/confirmed-requests');
        setConfirmedRequests(confirmedRes.data);
      } catch (err) {
        // Confirmed requests endpoint not available
      }
    } catch (err) {
      if (err.response?.data?.error === 'INCOMPATIBLE_BLOOD_GROUP') {
        const { donorBloodGroup, requestedBloodGroup } = err.response.data;
        toast.error(`Cannot confirm: ${donorBloodGroup} is not compatible with ${requestedBloodGroup}`);
      } else {
        toast.error('Failed to confirm request');
      }
    }
  };

  const handleChat = (userId) => {
    if (!userId) {
      toast.error('Cannot start chat: User ID not found');
      return;
    }
    navigate(`/chat/${userId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter and sort nearby requests
  const filteredNearbyRequests = nearbyRequests.filter(request => {
    // Filter by blood group
    if (filters.bloodGroup && request.bloodGroup !== filters.bloodGroup) {
      return false;
    }
    
    // Filter by compatibility
    if (filters.compatibility === 'compatible' && !request.isCompatible) {
      return false;
    }
    if (filters.compatibility === 'incompatible' && request.isCompatible) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by compatibility first (compatible requests first), then by distance
    if (a.isCompatible !== b.isCompatible) {
      return b.isCompatible ? 1 : -1;
    }
    return (a.dist?.calculated || 0) - (b.dist?.calculated || 0);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-red-50 text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} />
      <DonorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-800">Donor Dashboard</h1>
          
          {/* Blood Group Compatibility Chart */}
          <div className="mb-6">
            <BloodCompatibilityChart />
          </div>

          {/* Donation Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="bg-white p-4 sm:p-6 rounded shadow-md border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-red-600">{donationStats.totalDonations || 0}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded shadow-md border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Active Requests</h3>
              <p className="text-3xl font-bold text-red-600">{donationStats.activeRequests || 0}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded shadow-md border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Blood Group</h3>
              <p className="text-3xl font-bold text-red-600">{donationStats.bloodGroup || 'N/A'}</p>
            </div>
          </div>
          
          {/* Confirmed Requests (Can Chat) */}
          {confirmedRequests.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded shadow-md border border-red-200 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Confirmed Requests</h2>
              <div className="space-y-4">
                {confirmedRequests.map(request => (
                  <div key={request._id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Requester: {request.requesterDetails?.name || request.recipientId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">Blood Group: {request.requesterDetails?.bloodGroup || request.bloodGroup || 'Not specified'}</p>
                        <p className="text-sm text-gray-600">Status: {request.status}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(request.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Location: {request.requesterDetails?.location?.address || 'Not specified'}</p>
                        <p className="text-sm text-gray-600">Distance: {request.requesterDetails?.distance ? `${request.requesterDetails.distance}km` : 'Unknown'}</p>
                      </div>
                      <button 
                        onClick={() => handleChat(request.recipientId?._id || request.recipientId)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Chat with Requester
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Nearby Requests */}
          <div className="bg-white p-4 sm:p-6 rounded shadow-md border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Nearby Requests</h2>
            
            {/* Filters */}
            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter Requests</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={filters.bloodGroup}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Blood Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Compatibility</label>
                  <select
                    name="compatibility"
                    value={filters.compatibility}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Requests</option>
                    <option value="compatible">Compatible Only</option>
                    <option value="incompatible">Incompatible Only</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Showing {filteredNearbyRequests.length} of {nearbyRequests.length} requests
              </div>
            </div>
            
            {filteredNearbyRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredNearbyRequests.map(request => (
                  <div key={request._id} className={`p-4 border rounded-lg ${
                    request.isCompatible 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Requester: {request.name}</p>
                        <p className="text-sm text-gray-600">Blood Group: {request.bloodGroup}</p>
                        <p className="text-sm text-gray-600">Distance: {request.dist?.calculated ? (request.dist.calculated/1000).toFixed(1) : 'Unknown'}km</p>
                        <p className="text-sm text-gray-600">Location: {request.location?.address || 'Not specified'}</p>
                        <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                        <p className={`text-sm font-medium ${
                          request.isCompatible ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {request.compatibilityMessage}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => handleConfirmRequest(request.recipientId._id || request.recipientId)}
                          disabled={!request.isCompatible}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            request.isCompatible
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                          title={request.isCompatible ? 'Confirm this request' : 'Blood groups are not compatible'}
                        >
                          {request.isCompatible ? 'Confirm Request' : 'Incompatible'}
                        </button>
                        <button 
                          onClick={() => handleChat(request._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                          title="Chat with requester"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {nearbyRequests.length === 0 
                  ? 'No nearby requests at the moment.' 
                  : 'No requests match your current filters.'}
              </p>
            )}
          </div>




        </main>
      </div>
    </div>
  );
}

export default DonorDashboard; 