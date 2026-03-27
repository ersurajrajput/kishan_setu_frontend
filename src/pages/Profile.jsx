import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Globe, Edit3, ShoppingCart, Clock, LogOut, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';


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

const MY_LISTINGS = [
  { id: 1, crop: 'Desi Chickpeas (Chana)', qty: '800 kg', status: 'Active Listing' },
];

export default function Profile() {
  const [userInfo, setUserInfo] = useState(DUMMY_USER);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(DUMMY_USER);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          
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
        } else {
          navigate('/auth'); // Redirect to login if no user
          return;
        }

        // Fetch Orders and Listings concurrently
        const [ordersRes, listingsRes] = await Promise.all([
          api.get('/orders/my').catch(() => ({ data: [] })),
          api.get('/crops/my').catch(() => ({ data: [] }))
        ]);
        
        // Map Orders
        const fetchedOrders = ordersRes.data.map(o => ({
          id: o._id.substring(o._id.length - 8).toUpperCase(),
          crop: o.cropId?.cropName || 'Unknown Crop',
          date: new Date(o.createdAt).toLocaleDateString(),
          status: o.status,
          amount: `₹${(o.cropId?.price || 0) * parseInt(o.quantity || 0)}`
        }));
        setOrders(fetchedOrders.length ? fetchedOrders : ORDER_HISTORY);

        // Map Listings
        const fetchedListings = listingsRes.data.map(l => ({
          id: l._id,
          crop: l.cropName,
          qty: `${l.quantity}`,
          status: 'Active Listing'
        }));
        setListings(fetchedListings.length ? fetchedListings : MY_LISTINGS);

      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchUserData();
  }, [navigate]);

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
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
          <div className="h-32 bg-gradient-to-r from-brand-green to-green-700"></div>
          <div className="px-8 pb-8 relative -mt-16 sm:flex sm:items-end sm:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1595168051410-a292d37cace7?w=400&auto=format&fit=crop&q=60" 
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
                {listings.map(listing => (
                  <div key={listing.id} className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:border-brand-green hover:shadow-sm transition-all bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-brand-green" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{listing.crop}</h4>
                        <p className="text-sm text-gray-500">{listing.qty} • {listing.status}</p>
                      </div>
                    </div>
                    <button onClick={() => alert('Listing management coming soon.')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white bg-transparent transition-colors shadow-sm">Manage</button>
                  </div>
                ))}
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-green focus:border-brand-green outline-none"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-brand-green focus:border-brand-green outline-none"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>

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
                onClick={() => setIsEditing(false)}
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

    </div>
  );
}
