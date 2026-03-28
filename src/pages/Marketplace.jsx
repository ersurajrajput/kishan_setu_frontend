import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Filter,
  Star,
  Phone,
  Leaf,
  ShoppingBag,
} from "lucide-react";
import api from "../services/api";
import AlertBox from "../components/AlertBox";
import { getHumanReadableError, getContextualError } from "../utils/errorHandler";

const CATEGORIES = ["All", "Grains", "Vegetables", "Fruits", "Pulses"];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [orderingCropId, setOrderingCropId] = useState(null);

  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/product");

        // Map backend data to frontend expected shape
        const safeValue = (value, fallback = "NA") => {
          return value === null || value === undefined || value === ""
            ? fallback
            : value;
        };

        const mappedCrops = (Array.isArray(data) ? data : []).map((c) => ({
          id: safeValue(c.id, ""),
          name: safeValue(c.name),
          farmer: safeValue(c.sellerName, "Unknown Seller"),
          phone: "Contact via app",
          sellerId: safeValue(c.sellerId || c.id, ""),
          location: safeValue(c.location),
          price: safeValue(c.price, 0),
          quantity: safeValue(c.quantity, 0),
          image: safeValue(
            c.imageUrl,
            "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=60",
          ),
          type: safeValue(c.type, "Other"),
          rating: 4.5,
        }));

        setCrops(mappedCrops);
      } catch (error) {
        const errorMessage = getContextualError('marketplace', error);
        setError(errorMessage);
        setCrops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleOrder = async (cropId) => {
    try {
      const orderQuantity = quantities[cropId] || 1;
      if (orderQuantity <= 0) {
        setError("Please enter a valid quantity (greater than 0).");
        return;
      }

      setOrderingCropId(cropId);
      await api.post("/orders", {
        cropId: cropId,
        quantity: orderQuantity.toString(),
      });
      
      setSuccessMessage("Order placed successfully! The farmer will contact you soon.");
      setQuantities({ ...quantities, [cropId]: 1 });
      
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      const errorMessage = getHumanReadableError(error);
      setError(errorMessage);
    } finally {
      setOrderingCropId(null);
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const matchCategory =
      activeCategory === "All" || crop.type === activeCategory;
    const matchSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Error and Success Alerts */}
        <div className="mb-6 space-y-4">
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

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Direct Marketplace
            </h1>
            <p className="text-gray-500 mt-2">
              Buy fresh produce directly from farmers.
            </p>
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-brand-green text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-brand-green hover:text-brand-green"
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
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
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
                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-brand-green shadow-sm">
                      ₹{crop.price} / kg
                    </div>
                    <div className="absolute top-3 right-3 bg-brand-yellow px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {crop.rating}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {crop.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" /> {crop.location}
                    </div>

                    <div className="mt-auto bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Farmer
                        </span>
                        <span className="font-semibold text-gray-900">
                          {crop.farmer}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-xs">
                          Available Qty
                        </span>
                        <span className="font-semibold text-brand-green">
                          {crop.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="mb-4 flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        Qty:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Number(crop.quantity)}
                        value={quantities[crop.id] || 1}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [crop.id]: parseInt(e.target.value) || 1,
                          })
                        }
                        disabled={Number(crop.quantity) <= 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="flex gap-2 w-full mt-4">
                      <button
                        onClick={() => handleOrder(crop.id)}
                        disabled={Number(crop.quantity) <= 0}
                        className={`flex-1 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${Number(crop.quantity) <= 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-brand-green text-white hover:bg-green-700"}`}
                      >
                        <ShoppingBag className="w-4 h-4" />{" "}
                        {Number(crop.quantity) <= 0 ? "Out of Stock" : "Order"}
                      </button>
                      <button
                        onClick={() =>
                          alert(`Contact Farmer at: ${crop.phone || "N/A"}`)
                        }
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
            <h3 className="text-xl font-medium text-gray-900">
              No crops found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
