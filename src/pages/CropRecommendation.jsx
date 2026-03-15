import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, Droplets, Sun, Sparkles, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function CropRecommendation() {
  const { register, handleSubmit } = useForm();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setRecommendations(null);
    
    try {
      const response = await api.post('/ai/recommend', data);
      
      // Map icons back onto response data
      const mappedRecs = response.data.recommendations.map(rec => {
        let icon = <Sparkles className="w-6 h-6 text-brand-green" />;
        let color = 'bg-green-50 border-green-200';
        
        if (rec.name.includes('Wheat') || rec.name.includes('Mustard')) {
           icon = <Sun className="w-6 h-6 text-brand-yellow" />;
           color = 'bg-yellow-50 border-yellow-200';
        } else if (rec.name.includes('Potato') || rec.name.includes('Tomato')) {
           icon = <Sprout className="w-6 h-6 text-brand-brown" />;
           color = 'bg-orange-50 border-orange-200';
        }

        return { ...rec, icon, color };
      });
      
      setRecommendations(mappedRecs);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <Activity className="h-8 w-8 text-brand-green" />
            Smart Crop Recommendation
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI analyzes historical data, weather forecasts, and market trends to suggest the most profitable crops for your specific farm conditions.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-max sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Farm Details</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("location", { required: true })}
                    placeholder="e.g. Punjab, Madhya Pradesh"
                    className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sprout className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("soilType", { required: true })}
                    className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Soil Type</option>
                    <option value="alluvial">Alluvial</option>
                    <option value="black">Black Soil</option>
                    <option value="red">Red Soil</option>
                    <option value="laterite">Laterite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upcoming Season</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sun className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("season", { required: true })}
                    className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Season</option>
                    <option value="kharif">Kharif (Monsoon)</option>
                    <option value="rabi">Rabi (Winter)</option>
                    <option value="zaid">Zaid (Summer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Water Availability</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplets className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("water", { required: true })}
                    className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Availability</option>
                    <option value="high">High (Canal/Tubewell)</option>
                    <option value="medium">Medium (Monsoon dependent)</option>
                    <option value="low">Low (Dry region)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Get AI Recommendation'
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Results Area */}
          <div className="md:col-span-7">
            
            {!recommendations && !loading && (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-400">Fill the details to see AI magic</h3>
                <p className="text-gray-400 mt-2 max-w-sm">We use data from 10k+ farmers and live mandi feeds to recommend your next crop.</p>
              </div>
            )}

            <AnimatePresence>
              {recommendations && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-green-50 border border-brand-green/30 text-green-900 p-4 rounded-xl flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-brand-green" />
                    <div>
                      <p className="font-bold">Analysis Complete!</p>
                      <p className="text-sm">Found 3 optimal crops for your land conditions.</p>
                    </div>
                  </div>

                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={rec.name}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-6 rounded-2xl border ${rec.color} relative overflow-hidden shadow-sm`}
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <div className="bg-white/80 backdrop-blur font-bold text-sm px-3 py-1 rounded-full shadow-sm flex gap-1 items-center">
                          {rec.match}% Match
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm">
                          {rec.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{rec.name}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Expected Yield</p>
                          <p className="font-bold text-gray-900 mt-1">{rec.yield}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Profit Potential</p>
                          <p className="font-bold text-brand-green mt-1 flex items-center gap-1">
                            {rec.profit} <TrendingUp className="w-4 h-4" />
                          </p>
                        </div>
                        <div className="col-span-2 bg-white/60 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Market Demand</p>
                          <p className="font-bold text-gray-900 mt-1">{rec.demand}</p>
                        </div>
                      </div>

                      <button className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-900 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-colors border border-gray-200 w-max">
                        View Detailed Guide <ArrowRight className="w-4 h-4" />
                      </button>

                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
