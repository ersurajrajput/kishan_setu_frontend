import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, Star, Phone, Leaf, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const DUMMY_CROPS = [
  { id: 1, name: 'Premium Sharbati Wheat', farmer: 'Ramesh Singh', location: 'Sehore, MP', price: 28, quantity: '500 kg', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60', type: 'Grains', rating: 4.8 },
  { id: 2, name: 'Organic Red Onions', farmer: 'Surya Patel', location: 'Nashik, MH', price: 15, quantity: '2000 kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=60', type: 'Vegetables', rating: 4.5 },
  { id: 3, name: 'Alphonso Mangoes', farmer: 'Deshmukh Farms', location: 'Ratnagiri, MH', price: 150, quantity: '100 boxes', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=60', type: 'Fruits', rating: 4.9 },
  { id: 4, name: 'Desi Chickpeas (Chana)', farmer: 'Abdul Rahman', location: 'Bikaner, RJ', price: 65, quantity: '800 kg', image: 'https://images.unsplash.com/photo-1515589654462-a9881e198eea?w=600&auto=format&fit=crop&q=60', type: 'Pulses', rating: 4.2 },
  { id: 5, name: 'Basmati Rice', farmer: 'Gurpreet Singh', location: 'Amritsar, PB', price: 85, quantity: '1500 kg', image: 'https://plus.unsplash.com/premium_photo-1667056075429-1ad8808d4baf?q=80&w=2070&auto=format&fit=crop', type: 'Grains', rating: 4.7 },
  { id: 6, name: 'Fresh Tomatoes', farmer: 'Kishan Lal', location: 'Kolar, KA', price: 18, quantity: '3000 kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=60', type: 'Vegetables', rating: 4.1 },
];

const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses'];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const { data } = await api.get('/crops');
        
        // Map backend data to frontend expected shape
        const mappedCrops = data.map(c => ({
          id: c._id,
          name: c.cropName,
          farmer: c.farmerId ? c.farmerId.name : 'Unknown Farmer',
          phone: c.farmerId ? c.farmerId.phone : '',
          location: c.location,
          price: c.price,
          quantity: c.quantity,
          image: c.image && c.image.startsWith('/uploads') 
            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${c.image}` 
            : c.image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=60',
          type: c.category || 'Other',
          rating: 4.5,
        }));
        
        setCrops(mappedCrops);
      } catch (error) {
        console.error("Error fetching crops:", error);
        setCrops([]); // Show empty state instead of dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleOrder = async (cropId) => {
    try {
      await api.post('/orders', {
        cropId: cropId,
        quantity: "1" // Simplified for prototype
      });
      alert('Order placed successfully! The farmer will contact you soon.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order. Please try again.');
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchCategory = activeCategory === 'All' || crop.type === activeCategory;
    const matchSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || crop.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Direct Marketplace</h1>
            <p className="text-gray-500 mt-2">Buy fresh produce directly from farmers.</p>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-lg flex items-center gap-3 relative">
            <div className="relative w-full">
              <input 
                type="text"
                placeholder="Search crops, location..."
                className="w-full pl-12 pr-4 py-3 border-gray-300 rounded-xl shadow-sm focus:ring-brand-green focus:border-brand-green border bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <button className="bg-white p-3 border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 flex-shrink-0">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Categories (Filter Panel) */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-brand-green text-white shadow-md transform scale-105' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        {loading ? (
             <div className="flex justify-center items-center py-20">
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                 className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full"
               />
             </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredCrops.map((crop) => (
              <motion.div
                key={crop.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden group flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-brand-green shadow-sm">
                    ₹{crop.price} / kg
                  </div>
                  <div className="absolute top-3 right-3 bg-brand-yellow px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {crop.rating}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{crop.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" /> {crop.location}
                  </div>
                  
                  <div className="mt-auto bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Farmer</span>
                      <span className="font-semibold text-gray-900">{crop.farmer}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block text-xs">Available Qty</span>
                      <span className="font-semibold text-brand-green">{crop.quantity}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={() => handleOrder(crop.id)}
                      disabled={Number(crop.quantity) <= 0}
                      className={`flex-1 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${Number(crop.quantity) <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-green text-white hover:bg-green-700'}`}
                    >
                      <ShoppingBag className="w-4 h-4" /> {Number(crop.quantity) <= 0 ? 'Out of Stock' : 'Order'}
                    </button>
                    <button 
                      onClick={() => alert(`Contact Farmer at: ${crop.phone || 'N/A'}`)}
                      className="bg-brand-green/10 text-brand-green font-semibold px-4 py-3 rounded-xl hover:bg-brand-green hover:text-white transition-colors flex items-center justify-center"
                      title="Contact Farmer"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredCrops.length === 0 && (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No crops found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}

      </div>
    </div>
  );
}
