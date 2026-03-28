import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, Droplets, Sun, Sparkles, TrendingUp, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import AlertBox from '../components/AlertBox';
import { getHumanReadableError, getContextualError } from '../utils/errorHandler';

// Human-readable error messages
const ERROR_MESSAGES = {
  'location': {
    required: 'Please enter your region/state to get recommendations',
    invalid: 'Location must be a valid region name (e.g., Punjab, Madhya Pradesh)'
  },
  'soilType': {
    required: 'Please select a soil type for accurate recommendations',
    invalid: 'Please select one of the available soil types'
  },
  'season': {
    required: 'Please select the upcoming season',
    invalid: 'Please select a valid season (Kharif, Rabi, or Zaid)'
  },
  'water': {
    required: 'Please indicate your water availability',
    invalid: 'Please select a valid water availability level'
  },
  'upcomingSeason': {
    required: 'Please specify the upcoming season',
    invalid: 'Invalid season selected'
  },
  'waterAvailability': {
    required: 'Please indicate water availability',
    invalid: 'Invalid water availability level'
  }
};

const getFieldError = (fieldName, errorType = 'required') => {
  return ERROR_MESSAGES[fieldName]?.[errorType] || 'This field is required';
};

export default function CropRecommendation() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    mode: 'onBlur',
    defaultValues: {
      region: '',
      soilType: '',
      upcomingSeason: '',
      waterAvailability: ''
    }
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setApiError(null);
    setRecommendations(null);
    
    try {
      // Validate all fields are filled
      if (!data.region?.trim()) {
        setError(getFieldError('location', 'required'));
        setLoading(false);
        return;
      }
      if (!data.soilType) {
        setError(getFieldError('soilType', 'required'));
        setLoading(false);
        return;
      }
      if (!data.upcomingSeason) {
        setError(getFieldError('upcomingSeason', 'required'));
        setLoading(false);
        return;
      }
      if (!data.waterAvailability) {
        setError(getFieldError('waterAvailability', 'required'));
        setLoading(false);
        return;
      }

      // Prepare payload matching backend expectations
      const payload = {
        region: data.region,
        soilType: data.soilType,
        upcomingSeason: data.upcomingSeason,
        waterAvailability: data.waterAvailability
      };

      const response = await api.post('/ai/recommend', payload);
      
      // Validate response
      if (!response.data || !response.data.crops) {
        throw new Error('Invalid response from server');
      }

      // Map icons onto response data
      const mappedRecs = response.data.crops.map(rec => {
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
      setApiError(null);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      
      // Handle different error scenarios with human-readable messages
      let errorMessage = 'Unable to get recommendations. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid input. Please check your farm details and try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Recommendation service is currently unavailable. Please try again later.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error while processing your request. Our team has been notified. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setApiError(errorMessage);
      setError(errorMessage);
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
            
            {error && (
              <div className="mb-6">
                <AlertBox
                  message={error}
                  type="error"
                  onDismiss={() => setError(null)}
                />
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region / State <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("region", { 
                      required: true,
                      validate: (value) => value?.trim().length > 0 || true
                    })}
                    placeholder="e.g. Punjab, Madhya Pradesh, Karnataka"
                    className={`block w-full pl-10 border rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border-gray-300 bg-gray-50 focus:bg-white ${errors.region ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.region && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('location', 'required')}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Type <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sprout className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("soilType", { required: true })}
                    className={`block w-full pl-10 border rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border-gray-300 bg-gray-50 focus:bg-white ${errors.soilType ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select Soil Type</option>
                    <option value="black soil">Black Soil</option>
                    <option value="alluvial">Alluvial</option>
                    <option value="red">Red Soil</option>
                    <option value="laterite">Laterite</option>
                  </select>
                </div>
                {errors.soilType && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('soilType', 'required')}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upcoming Season <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sun className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("upcomingSeason", { required: true })}
                    className={`block w-full pl-10 border rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border-gray-300 bg-gray-50 focus:bg-white ${errors.upcomingSeason ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select Season</option>
                    <option value="Kharif (Monsoon)">Kharif (Monsoon)</option>
                    <option value="Rabi (Winter)">Rabi (Winter)</option>
                    <option value="Zaid (Summer)">Zaid (Summer)</option>
                  </select>
                </div>
                {errors.upcomingSeason && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('upcomingSeason', 'required')}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Availability <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplets className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("waterAvailability", { required: true })}
                    className={`block w-full pl-10 border rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border-gray-300 bg-gray-50 focus:bg-white ${errors.waterAvailability ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select Availability</option>
                    <option value="high">High (Canal/Tubewell)</option>
                    <option value="medium">Medium (Monsoon dependent)</option>
                    <option value="low">Low (Dry region)</option>
                  </select>
                </div>
                {errors.waterAvailability && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {getFieldError('waterAvailability', 'required')}
                  </span>
                )}
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
