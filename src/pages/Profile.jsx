import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Globe, Edit3, ShoppingCart, Clock, LogOut, ChevronRight, CheckCircle, ShieldCheck, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertBox from '../components/AlertBox';
import { getHumanReadableError, getContextualError } from '../utils/errorHandler';

const DUMMY_USER = {
  name: 'Ramesh Singh',
  phone: '+91 98765 43210',
  location: 'Village Pipliya, Sehore, Madhya Pradesh',
  role: 'Farmer',
  language: 'English',
  joined: 'March 2026',
  verified: true
};

const ORDER_HISTORY = [
  { id: 'ORD-1042', crop: 'Premium Sharbati Wheat', date: '10 Mar 2026', status: 'Delivered', amount: '₹14,000' },
  { id: 'ORD-1041', crop: 'Organic Red Onions', date: '02 Mar 2026', status: 'Processing', amount: '₹4,500' },
];

export default function Profile() {
  const { user } = useAuth();
  const userId = user?.id;

  const [userInfo, setUserInfo] = useState(DUMMY_USER);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [allListingsData, setAllListingsData] = useState([]); // Store full product data
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(DUMMY_USER);
  const [isEditingListing, setIsEditingListing] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  const [editListingForm, setEditListingForm] = useState(null);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1595168051410-a292d37cace7?w=400&auto=format&fit=crop&q=60');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingListing, setUploadingListing] = useState(false);
  const [managingListingId, setManagingListingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          
          // Get userId from localStorage as fallback since AuthContext might not be ready
          const currentUserId = parsed.id || userId;
          
          // Safely handle role - provide fallback if null or undefined
          const role = parsed.role && parsed.role.length > 0 
            ? parsed.role.charAt(0).toUpperCase() + parsed.role.slice(1)
            : DUMMY_USER.role;
          
          const newUserInfo = {
            name: parsed.name || DUMMY_USER.name,
            phone: parsed.phone || DUMMY_USER.phone,
            role: role,
            location: parsed.location || DUMMY_USER.location,
          };
          setUserInfo(newUserInfo);
          setEditForm(newUserInfo);

          // Fetch Orders and Listings concurrently
          const [ordersRes, listingsRes] = await Promise.all([
            api.get('/orders/my').catch(() => ({ data: [] })),
            currentUserId ? api.get(`/product/seller/${currentUserId}`)
              .catch(err => {
                console.error('Error fetching seller products:', err.response?.status);
                return { data: [] };
              })
            : Promise.resolve({ data: [] })
          ]);
          
          console.log('Seller ID:', currentUserId);
          console.log('Listings Response:', listingsRes);
          const fetchedOrders = ordersRes.data.map(o => ({
            id: o._id.substring(o._id.length - 8).toUpperCase(),
            crop: o.cropId?.cropName || 'Unknown Crop',
            date: new Date(o.createdAt).toLocaleDateString(),
            status: o.status,
            amount: `₹${(o.cropId?.price || 0) * parseInt(o.quantity || 0)}`
          }));
          setOrders(fetchedOrders.length ? fetchedOrders : ORDER_HISTORY);

          // Map Listings from products endpoint
          const listingsData = listingsRes.data || [];
          
          // Handle both array and single object responses
          const listingsArray = Array.isArray(listingsData) 
            ? listingsData 
            : (listingsData && typeof listingsData === 'object' ? [listingsData] : []);
          
          // Store full product data for editing
          setAllListingsData(listingsArray);
          
          const fetchedListings = listingsArray
            .map(l => ({
              id: l._id || l.id,
              crop: l.name || l.cropName,
              qty: `${l.quantity} ${l.unit || 'kg'}`,
              status: 'Active Listing',
              price: l.price
            }));
          setListings(fetchedListings);
        } else {
          navigate('/auth'); // Redirect to login if no user
          return;
        }

      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchUserData();
  }, [navigate, userId]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const handleSaveProfile = () => {
    setUserInfo(editForm);
    // Ideally update local storage and make a backend API call here
    const current = JSON.parse(localStorage.getItem('userInfo')) || {};
    localStorage.setItem('userInfo', JSON.stringify({ ...current, name: editForm.name, phone: editForm.phone, location: editForm.location }));
    setIsEditing(false);
  };

  const validateProfileImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      setError(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use an image smaller than 5MB.`);
      return false;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please select an image file (PNG, JPG, GIF, etc.)');
      return false;
    }
    
    return true;
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateProfileImageFile(file)) {
        return;
      }
      
      setProfileImageFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImageFile) {
      setError('Please select an image first');
      return;
    }

    setUploadingImage(true);
    setError(null);
    
    try {
      // Validate file size again before upload
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (profileImageFile.size > maxSize) {
        setError(`Image is too large (${(profileImageFile.size / 1024 / 1024).toFixed(2)}MB). Please use an image smaller than 5MB.`);
        setUploadingImage(false);
        return;
      }

      // Upload to Cloudinary via FormData
      const formData = new FormData();
      formData.append('file', profileImageFile);
      formData.append('upload_preset', 'kisaan_setu'); // This should be configured in your Cloudinary account
      
      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dqvvk5sof/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const cloudinaryUrl = cloudinaryResponse.data.secure_url;

      // Update profile with the new image URL from Cloudinary
      const currentUserId = userId || JSON.parse(localStorage.getItem('userInfo') || '{}').id;
      
      if (currentUserId) {
        // Optional: Save the profile image URL to the backend
        await api.post('/profile/update', {
          userId: currentUserId,
          profileImageUrl: cloudinaryUrl
        }).catch(err => {
          // If backend profile update fails, we still have the Cloudinary URL
          console.warn('Could not save profile image URL to backend:', err);
        });
      }

      setProfileImage(cloudinaryUrl);
      setSuccessMessage('Profile picture updated successfully!');
      setProfileImageFile(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      
      if (error.response?.status === 413) {
        setError('Image is too large. Please use an image smaller than 5MB.');
      } else if (error.response?.data?.error?.message) {
        setError(`Upload error: ${error.response.data.error.message}`);
      } else {
        const errorMessage = getHumanReadableError(error) || 'Failed to upload profile picture. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        setError(null);
        await api.delete(`/product/${listingId}`);
        setSuccessMessage('Listing deleted successfully');
        // Refresh listings
        setListings(listings.filter(l => l.id !== listingId));
        setAllListingsData(allListingsData.filter(l => (l._id || l.id) !== listingId));
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        const errorMessage = getHumanReadableError(error);
        setError(errorMessage);
      }
    }
  };

  const handleEditListing = (listingId) => {
    const productData = allListingsData.find(p => (p._id || p.id) === listingId);
    if (productData) {
      setEditListingForm({
        id: productData._id || productData.id,
        name: productData.name || productData.cropName,
        quantity: productData.quantity,
        price: productData.price,
        location: productData.location,
        type: productData.type,
        imageUrl: productData.imageUrl,
        currentImageFile: null
      });
      setEditingListingId(listingId);
      setIsEditingListing(true);
    }
  };

  const handleEditListingImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditListingForm({
        ...editListingForm,
        currentImageFile: file
      });
    }
  };

  const handleUpdateListing = async () => {
    if (!editListingForm) return;

    setUploadingListing(true);
    setError(null);

    try {
      // Validate all required fields
      if (!editListingForm.name?.trim()) {
        setError('Product name is required.');
        setUploadingListing(false);
        return;
      }
      if (!editListingForm.quantity || parseFloat(editListingForm.quantity) <= 0) {
        setError('Quantity must be greater than 0.');
        setUploadingListing(false);
        return;
      }
      if (!editListingForm.price || parseFloat(editListingForm.price) <= 0) {
        setError('Price must be greater than 0.');
        setUploadingListing(false);
        return;
      }
      if (!editListingForm.location?.trim()) {
        setError('Location is required.');
        setUploadingListing(false);
        return;
      }
      if (!editListingForm.type) {
        setError('Product type is required.');
        setUploadingListing(false);
        return;
      }
      let imageUrl = editListingForm.imageUrl;

      // Upload new image if provided
      if (editListingForm.currentImageFile) {
        const formDataImage = new FormData();
        formDataImage.append('file', editListingForm.currentImageFile);
        formDataImage.append('upload_preset', 'kisaan_setu');

        const cloudinaryResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/ddhnyvjzd/image/upload',
          formDataImage,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        imageUrl = cloudinaryResponse.data.secure_url;
      }

      // Update product with multipart form data
      const formData = new FormData();
      formData.append('id', editListingForm.id);
      formData.append('name', editListingForm.name);
      formData.append('quantity', editListingForm.quantity);
      formData.append('price', editListingForm.price);
      formData.append('location', editListingForm.location);
      formData.append('type', editListingForm.type);
      if (editListingForm.currentImageFile) {
        formData.append('image', editListingForm.currentImageFile);
      }

      await api.put('/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Listing updated successfully');
      setIsEditingListing(false);
      setEditingListingId(null);
      setEditListingForm(null);

      // Refresh listings
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const currentUserId = parsed.id;
        
        const listingsRes = await api.get(`/product/seller/${currentUserId}`);
        const listingsData = listingsRes.data || [];
        const listingsArray = Array.isArray(listingsData) 
          ? listingsData 
          : (listingsData && typeof listingsData === 'object' ? [listingsData] : []);
        
        setAllListingsData(listingsArray);
        
        const fetchedListings = listingsArray
          .map(l => ({
            id: l._id || l.id,
            crop: l.name || l.cropName,
            qty: `${l.quantity} ${l.unit || 'kg'}`,
            status: 'Active Listing',
            price: l.price
          }));
        setListings(fetchedListings);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const errorMessage = getHumanReadableError(error) || 'Failed to update listing';
      setError(errorMessage);
      console.error('Error updating listing:', error);
    } finally {
      setUploadingListing(false);
    }
  };

  const downloadOrderReport = () => {
    if (orders.length === 0) {
      alert("No orders to download.");
      return;
    }
    
    // Create CSV content
    const headers = ["Order ID", "Crop", "Date", "Status", "Amount"];
    const rows = orders.map(order => [
      `ORD-${order.id}`,
      `"${order.crop}"`,
      `"${order.date}"`,
      order.status,
      `"${order.amount}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kisaansetu_order_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Error and Success Alerts */}
        <div className="space-y-4 mb-6">
          {error && (
            <AlertBox
              message={error}
              type="error"
              onDismiss={() => setError(null)}
            />
          )}
          {successMessage && (
            <AlertBox
              message={successMessage}
              type="success"
              onDismiss={() => setSuccessMessage(null)}
            />
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
          <div className="h-32 bg-gradient-to-r from-brand-green to-green-700"></div>
          <div className="px-8 pb-8 relative -mt-16 sm:flex sm:items-end sm:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src={profileImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {userInfo.name && (
                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-brand-green fill-green-50" />
                </div>
              )}
            </div>
            
            <div className="mt-6 sm:mt-0 sm:flex-1 pt-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900 sm:text-4xl">
                    {userInfo.name}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
                    {userInfo.role} Account <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Joined {userInfo.joined}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                  <button onClick={() => setIsEditing(true)} className="bg-brand-light-bg text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-2 shadow-sm">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar (Contact & Settings) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Contact Information</h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 text-gray-600">
                  <Phone className="w-5 h-5 text-brand-green mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{userInfo.phone}</p>
                    <p className="text-xs text-brand-green bg-green-50 px-2 py-0.5 rounded-md inline-block mt-1 font-semibold border border-green-100">Verified</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-gray-600">
                  <MapPin className="w-5 h-5 text-brand-green mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{userInfo.location}</p>
                    <p className="text-xs text-gray-400 mt-1">Farm Address</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Preferences</h3>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Language</p>
                    <p className="text-sm text-gray-500">{DUMMY_USER.language}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 font-medium hover:bg-red-50 -mx-6 px-6 py-3 w-[calc(100%+3rem)] transition-colors mt-2">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>

          {/* Right Main Content (History & Listings) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Current Listings */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-brand-green" /> My Active Listings
                </h3>
              </div>

              <div className="space-y-4">
                {listings.length > 0 ? (
                  listings.map(listing => (
                    <div key={listing.id} className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:border-brand-green hover:shadow-sm transition-all bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-brand-green" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{listing.crop}</h4>
                          <p className="text-sm text-gray-500">{listing.qty} • ₹{listing.price}/kg • {listing.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditListing(listing.id)} className="px-4 py-2 border border-brand-green text-brand-green rounded-lg text-sm font-medium hover:bg-green-50 bg-transparent transition-colors shadow-sm flex items-center gap-2">
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDeleteListing(listing.id)} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 bg-transparent transition-colors shadow-sm">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-100 rounded-2xl p-8 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No active listings yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start selling by creating your first listing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <Clock className="w-6 h-6 text-brand-brown" /> Order History
                </h3>
                <button onClick={downloadOrderReport} className="text-sm font-bold text-brand-green hover:underline">Download Report</button>
              </div>

              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-green">ORD-{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{order.crop}</div>
                          <div className="text-sm text-gray-500">{order.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                          {order.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full p-8 relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={profileImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="sr-only"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                    {profileImageFile && (
                      <button
                        onClick={handleUploadProfileImage}
                        disabled={uploadingImage}
                        className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50"
                      >
                        {uploadingImage ? 'Uploading...' : 'Save Picture'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-green focus:border-brand-green outline-none"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-green focus:border-brand-green outline-none"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-green focus:border-brand-green outline-none"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setProfileImageFile(null);
                }}
                className="px-5 py-2 mt-4 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="px-5 py-2 mt-4 bg-brand-green text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {isEditingListing && editListingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full p-8 relative">
            <button
              onClick={() => {
                setIsEditingListing(false);
                setEditingListingId(null);
                setEditListingForm(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h2>

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editListingForm.name}
                  onChange={(e) => setEditListingForm({ ...editListingForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quantity (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editListingForm.quantity}
                    onChange={(e) => setEditListingForm({ ...editListingForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price (₹/kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editListingForm.price}
                    onChange={(e) => setEditListingForm({ ...editListingForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editListingForm.location}
                  onChange={(e) => setEditListingForm({ ...editListingForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={editListingForm.type}
                  onChange={(e) => setEditListingForm({ ...editListingForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  {editListingForm.imageUrl && (
                    <img
                      src={editListingForm.imageUrl}
                      alt="Product"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditListingImageChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditingListing(false);
                  setEditingListingId(null);
                  setEditListingForm(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateListing}
                disabled={uploadingListing}
                className="flex-1 px-4 py-2 bg-brand-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingListing ? 'Updating...' : 'Update Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
