import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, MapPin, Droplets, Sun, Sparkles,
  ArrowRight, Activity, AlertCircle,
  WifiOff, RefreshCw, Leaf, Wheat, Apple
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const SOIL_TYPES = [
  { value: 'black soil', label: 'Black Soil' },
  { value: 'alluvial',   label: 'Alluvial' },
  { value: 'red',        label: 'Red Soil' },
  { value: 'laterite',   label: 'Laterite' },
];

const SEASONS = [
  { value: 'Kharif (Monsoon)', label: 'Kharif (Monsoon)' },
  { value: 'Rabi (Winter)',    label: 'Rabi (Winter)' },
  { value: 'Zaid (Summer)',    label: 'Zaid (Summer)' },
];

const WATER_LEVELS = [
  { value: 'high',   label: 'High (Canal / Tubewell)' },
  { value: 'medium', label: 'Medium (Monsoon dependent)' },
  { value: 'low',    label: 'Low (Dry region)' },
];

const HTTP_ERRORS = {
  400: 'The information you entered seems incorrect. Please review and try again.',
  401: 'You are not authorised to use this feature. Please log in again.',
  403: 'Access denied. Please contact support if this continues.',
  404: 'The recommendation service could not be reached. Please try again later.',
  408: 'The request took too long. Please check your connection and retry.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'Our server ran into a problem. Please try again in a few minutes.',
  502: 'Service is temporarily unavailable. Please try again later.',
  503: 'The recommendation engine is under maintenance. Please check back soon.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Handles your backend shape: { crops: [ { name, description } ] }
 * Also handles other common shapes just in case.
 */
const normaliseCrops = (data) => {
  if (Array.isArray(data?.crops))       return data.crops;        // ✅ your shape
  if (Array.isArray(data?.data?.crops)) return data.data.crops;
  if (Array.isArray(data))              return data;
  if (Array.isArray(data?.data))        return data.data;
  return null;
};

const buildErrorMessage = (err) => {
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout'))
      return 'The request timed out. Please check your internet connection and try again.';
    return 'Network error — please check your internet connection and try again.';
  }
  const status = err.response?.status;
  const apiMsg = err.response?.data?.message || err.response?.data?.error;
  if (apiMsg && typeof apiMsg === 'string' && apiMsg.length < 200 && !apiMsg.includes('\n'))
    return apiMsg;
  return HTTP_ERRORS[status] || `Unexpected error (${status}). Please try again.`;
};

const getCropStyle = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('wheat') || n.includes('mustard') || n.includes('maize') || n.includes('corn'))
    return { color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-500', Icon: Wheat };
  if (n.includes('potato') || n.includes('tomato') || n.includes('onion') || n.includes('vegetable'))
    return { color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-500', Icon: Apple };
  if (n.includes('rice') || n.includes('paddy') || n.includes('sugarcane') || n.includes('cotton'))
    return { color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', Icon: Leaf };
  return { color: 'bg-green-50 border-green-200', iconColor: 'text-green-600', Icon: Sprout };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }) {
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="text-red-500 text-xs mt-1 flex items-center gap-1"
      role="alert"
    >
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </motion.p>
  );
}

function ErrorBanner({ message, onRetry, onDismiss }) {
  const isNetwork =
    message?.toLowerCase().includes('network') ||
    message?.toLowerCase().includes('connection') ||
    message?.toLowerCase().includes('internet') ||
    message?.toLowerCase().includes('timeout');

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {isNetwork
          ? <WifiOff className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        }
        <div className="flex-1">
          <p className="font-semibold text-red-800">Something went wrong</p>
          <p className="text-red-700 mt-0.5">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-red-400 hover:text-red-600 transition-colors text-base leading-none"
        >
          ✕
        </button>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="self-start flex items-center gap-1.5 text-red-700 font-semibold hover:text-red-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      )}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="h-6 w-40 rounded bg-gray-200" />
      </div>
      <div className="h-16 rounded-lg bg-gray-100" />
      <div className="h-8 w-36 rounded-lg bg-gray-200" />
    </div>
  );
}

function CropCard({ rec, index }) {
  const { color, iconColor, Icon } = getCropStyle(rec.name);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.015 }}
      className={`p-6 rounded-2xl border ${color} relative overflow-hidden shadow-sm`}
    >
      {/* Optional match badge — only shown if API sends it */}
      {rec.match != null && (
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur font-bold text-xs px-2.5 py-1 rounded-full shadow-sm text-gray-700">
            {rec.match}% Match
          </span>
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{rec.name}</h3>
      </div>

      {/* Description — always present in your API response */}
      {rec.description && (
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
            About this crop
          </p>
          <p className="text-gray-800 text-sm leading-relaxed">{rec.description}</p>
        </div>
      )}

      {/* Optional extra fields — only shown if API sends them in future */}
      {(rec.yield || rec.profit || rec.demand) && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {rec.yield && (
            <div className="bg-white/70 p-3 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-semibold">Expected Yield</p>
              <p className="font-bold text-gray-900 mt-1 text-sm">{rec.yield}</p>
            </div>
          )}
          {rec.profit && (
            <div className="bg-white/70 p-3 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-semibold">Profit Potential</p>
              <p className={`font-bold mt-1 text-sm ${iconColor}`}>{rec.profit}</p>
            </div>
          )}
          {rec.demand && (
            <div className="col-span-2 bg-white/70 p-3 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-semibold">Market Demand</p>
              <p className="font-bold text-gray-900 mt-1 text-sm">{rec.demand}</p>
            </div>
          )}
        </div>
      )}

      <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-800 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-colors border border-gray-200">
        View Detailed Guide <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CropRecommendation() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      region: '',
      soilType: '',
      upcomingSeason: '',
      waterAvailability: '',
    },
  });

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [submitError, setSubmitError]         = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError(null);
    setRecommendations(null);

    try {
      const payload = {
        region:            data.region.trim(),
        soilType:          data.soilType.trim(),
        upComingSeason:    data.upcomingSeason.trim(),
        waterAvailability: data.waterAvailability.trim(),
      };

      const response = await api.post('/crop-recommand', payload);

      // Remove these two lines once you've confirmed everything works
      console.log('API status:', response.status);
      console.log('API data:', JSON.stringify(response.data, null, 2));

      const crops = normaliseCrops(response.data);

      if (!crops || crops.length === 0) {
        setSubmitError(
          'No crop recommendations were found for your inputs. Try changing the region, soil type, or season.'
        );
        return;
      }

      setRecommendations(crops);
    } catch (err) {
      console.error('[CropRecommendation] error:', err);
      setSubmitError(buildErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Retry reuses the current form values without user having to re-fill
  const handleRetry = () => onSubmit(getValues());

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <Activity className="h-8 w-8 text-brand-green" />
            Smart Crop Recommendation
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI analyses historical data, weather forecasts, and market trends to suggest
            the most profitable crops for your specific farm conditions.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">

          {/* ── Form panel ─────────────────────────────────────────────────── */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-max sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Farm Details</h3>

            <AnimatePresence>
              {submitError && !loading && (
                <div className="mb-5">
                  <ErrorBanner
                    message={submitError}
                    onRetry={handleRetry}
                    onDismiss={() => setSubmitError(null)}
                  />
                </div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Region */}
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Region / State <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="region"
                    {...register('region', {
                      required: 'Please enter your region or state.',
                      validate: (v) =>
                        v.trim().length >= 2 || 'Please enter at least 2 characters.',
                    })}
                    placeholder="e.g. Punjab, Madhya Pradesh, Karnataka"
                    aria-invalid={!!errors.region}
                    className={`block w-full pl-10 py-3 border rounded-lg bg-gray-50 focus:bg-white
                      transition-colors focus:outline-none focus:ring-2
                      ${errors.region
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'
                      }`}
                  />
                </div>
                <AnimatePresence>
                  {errors.region && <FieldError message={errors.region.message} />}
                </AnimatePresence>
              </div>

              {/* Soil Type */}
              <div>
                <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Type <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sprout className="h-5 w-5 text-gray-400" />
                  </span>
                  <select
                    id="soilType"
                    {...register('soilType', { required: 'Please select a soil type.' })}
                    aria-invalid={!!errors.soilType}
                    className={`block w-full pl-10 py-3 border rounded-lg bg-gray-50 focus:bg-white
                      transition-colors focus:outline-none focus:ring-2
                      ${errors.soilType
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'
                      }`}
                  >
                    <option value="">Select Soil Type</option>
                    {SOIL_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.soilType && <FieldError message={errors.soilType.message} />}
                </AnimatePresence>
              </div>

              {/* Upcoming Season */}
              <div>
                <label htmlFor="upcomingSeason" className="block text-sm font-medium text-gray-700 mb-1">
                  Upcoming Season <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Sun className="h-5 w-5 text-gray-400" />
                  </span>
                  <select
                    id="upcomingSeason"
                    {...register('upcomingSeason', { required: 'Please select the upcoming season.' })}
                    aria-invalid={!!errors.upcomingSeason}
                    className={`block w-full pl-10 py-3 border rounded-lg bg-gray-50 focus:bg-white
                      transition-colors focus:outline-none focus:ring-2
                      ${errors.upcomingSeason
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'
                      }`}
                  >
                    <option value="">Select Season</option>
                    {SEASONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.upcomingSeason && <FieldError message={errors.upcomingSeason.message} />}
                </AnimatePresence>
              </div>

              {/* Water Availability */}
              <div>
                <label htmlFor="waterAvailability" className="block text-sm font-medium text-gray-700 mb-1">
                  Water Availability <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplets className="h-5 w-5 text-gray-400" />
                  </span>
                  <select
                    id="waterAvailability"
                    {...register('waterAvailability', { required: 'Please select water availability.' })}
                    aria-invalid={!!errors.waterAvailability}
                    className={`block w-full pl-10 py-3 border rounded-lg bg-gray-50 focus:bg-white
                      transition-colors focus:outline-none focus:ring-2
                      ${errors.waterAvailability
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'
                      }`}
                  >
                    <option value="">Select Availability</option>
                    {WATER_LEVELS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
                <AnimatePresence>
                  {errors.waterAvailability && <FieldError message={errors.waterAvailability.message} />}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl
                    shadow-md text-sm font-bold text-white bg-brand-green hover:bg-green-700
                    disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none
                    focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all"
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                      />
                      Analysing your farm…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Recommendation
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ── Results panel ──────────────────────────────────────────────── */}
          <div className="md:col-span-7 flex flex-col gap-6">

            {/* Empty state */}
            {!recommendations && !loading && !submitError && (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-dashed border-gray-300
                flex flex-col items-center justify-center text-center min-h-[400px]">
                <Sparkles className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">Fill in your farm details</h3>
                <p className="text-gray-400 mt-2 max-w-sm text-sm">
                  We use data from 10 000+ farmers and live mandi feeds to recommend your next crop.
                </p>
              </div>
            )}

            {/* Skeleton cards while loading */}
            {loading && (
              <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* Crop results */}
            <AnimatePresence>
              {recommendations && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-green-50 border border-brand-green/30 text-green-900 p-4 rounded-xl flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-brand-green shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Analysis complete!</p>
                      <p className="text-sm">
                        Found <strong>{recommendations.length}</strong> optimal crop
                        {recommendations.length !== 1 ? 's' : ''} for your land conditions.
                      </p>
                    </div>
                  </div>

                  {recommendations.map((rec, i) => (
                    <CropCard key={`${rec.name}-${i}`} rec={rec} index={i} />
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