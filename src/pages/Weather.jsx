// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle, MapPin, Navigation, Search, Sprout, TrendingUp, Loader2 } from 'lucide-react';
// import api from '../services/api';
// import AlertBox from '../components/AlertBox';
// import { getHumanReadableError, getContextualError } from '../utils/errorHandler';

// export default function WeatherDashboard() {
//   const [weatherData, setWeatherData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [location, setLocation] = useState('');
//   const [searchCity, setSearchCity] = useState('');
//   const [showLocationInput, setShowLocationInput] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [profitableCrops, setProfitableCrops] = useState(null);
//   const [cropsLoading, setCropsLoading] = useState(false);
//   const [showCrops, setShowCrops] = useState(false);
//   const [error, setError] = useState(null);
//   const [cropsError, setCropsError] = useState(null);

//   // Load saved location on mount
//   useEffect(() => {
//   const savedCoords = localStorage.getItem('coords');

//   if (savedCoords) {
//     const { lat, lon } = JSON.parse(savedCoords);
//     fetchWeather(lat, lon);
//   } else {
//     // fallback → auto detect location
//     getCurrentLocation();
//   }
// }, []);

//   const fetchWeather = async (lat, lon) => {
//   setLoading(true);
//   setError(null);

//   try {
//     const { data } = await api.get(
//       `/weather/by-coords?lat=${lat}&lon=${lon}`
//     );

//     // ✅ Normalize response
//     const formattedData = {
//       location: data.name || "Your Location",
//       current: {
//         temp: data.main?.temp,
//         humidity: data.main?.humidity,
//         windSpeed: data.wind?.speed,
//         condition: data.weather?.[0]?.description,
//         rainProb: data.clouds?.all
//       },
//       metadata: {
//         month: new Date().toLocaleString('default', { month: 'long' }),
//         season: "Unknown"
//       },
//       alerts: []
//     };

//     setWeatherData(formattedData);
//     setLocation(formattedData.location);
//     localStorage.setItem('coords', JSON.stringify({ lat, lon }));

//   } catch (error) {
//     const errorMessage = getContextualError('weather', error);
//     setError(errorMessage);
//     console.error("Error fetching weather:", error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Get current location using Geolocation API
//   const getCurrentLocation = () => {
//   if (!navigator.geolocation) {
//     setError('Geolocation is not supported by your browser.');
//     return;
//   }

//   setLocationLoading(true);
//   setError(null);

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const lat = position.coords.latitude;
//       const lon = position.coords.longitude;

//       fetchWeather(lat, lon);
//       setShowLocationInput(false);
//       setLocationLoading(false);
//     },
//     (error) => {
//       console.error("Geolocation error:", error);
//       setError('Location access denied. Please allow location permission.');
//       setLocationLoading(false);
//     }
//   );
// };

  

//   // Fetch profitable crops based on weather
//   const fetchProfitableCrops = async () => {
//     setCropsLoading(true);
//     setCropsError(null);
//     setShowCrops(true);
//     try {
//       const payload = {
//         location: weatherData?.location || location,
//         weather: weatherData?.current,
//         month: weatherData?.metadata?.month,
//         season: weatherData?.metadata?.season
//       };

//       const { data } = await api.post('/ai/recommend-by-weather', payload);
//       setProfitableCrops(data.recommendations);
//     } catch (error) {
//       const errorMessage = getContextualError('recommendation', error);
//       setCropsError(errorMessage);
//       console.error("Error fetching profitable crops:", error);
//     } finally {
//       setCropsLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//           className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full"
//         />
//       </div>
//     );
//   }

//   const currentTemp = weatherData?.current?.temp || 28;
//   const condition = weatherData?.current?.condition || "Partly Cloudy";
//   const humidity = weatherData?.current?.humidity || 60;
//   const windSpeed = weatherData?.current?.windSpeed || 12;
//   const alerts = weatherData?.alerts || [];
//   const currentMonth = weatherData?.metadata?.month || new Date().toLocaleString('default', { month: 'long' });
//   const currentSeason = weatherData?.metadata?.season || 'Unknown';

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Error Alert */}
//         {error && (
//           <div className="mb-6">
//             <AlertBox
//               message={error}
//               type="error"
//               onDismiss={() => setError(null)}
//             />
//           </div>
//         )}

//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl font-heading font-bold text-gray-900">Weather Dashboard</h1>
//             <div className="flex items-center gap-2 mt-1">
//               <MapPin className="w-4 h-4 text-gray-500" />
//               {showLocationInput ? (
//                 <form onSubmit={handleLocationSearch} className="flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={searchCity}
//                     onChange={(e) => setSearchCity(e.target.value)}
//                     placeholder="Enter city name..."
//                     className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
//                     autoFocus
//                   />
//                   <button type="submit" className="text-brand-green hover:text-green-700">
//                     <Search className="w-4 h-4" />
//                   </button>
//                 </form>
//               ) : (
//                 <span
//                   className="text-gray-500 cursor-pointer hover:text-brand-green flex items-center gap-1"
//                   onClick={() => setShowLocationInput(true)}
//                 >
//                   {location}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={getCurrentLocation}
//               disabled={locationLoading}
//               className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600 hover:text-brand-green hover:border-brand-green transition-colors"
//             >
//               {locationLoading ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Navigation className="w-4 h-4" />
//               )}
//               {locationLoading ? 'Getting location...' : 'Use My Location'}
//             </button>
//             <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
//               {currentMonth}
//             </div>
//           </div>
//         </div>

//         {/* Actionable Alerts */}
//         {alerts.length > 0 && alerts.map((alert, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-4 flex gap-4 items-start shadow-sm"
//           >
//             <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
//             <div>
//               <h3 className="text-lg font-bold text-red-900">Weather Alert</h3>
//               <p className="text-red-800 mt-1">{alert}</p>
//             </div>
//           </motion.div>
//         ))}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">

//           {/* Main Weather Card */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
//           >
//             <div className="absolute top-0 right-0 opacity-20 transform translate-x-1/4 -translate-y-1/4">
//               <CloudRain className="w-64 h-64" />
//             </div>

//             <div className="relative z-10">
//               <h2 className="text-xl font-medium opacity-90 mb-2">Today</h2>
//               <div className="flex items-end gap-2">
//                 <span className="text-7xl font-bold font-heading">{Math.round(currentTemp)}°</span>
//                 <span className="text-2xl opacity-90 mb-2">C</span>
//               </div>
//               <p className="text-xl font-medium mt-4 flex items-center gap-2">
//                 <CloudRain className="w-6 h-6" /> {condition}
//               </p>
//             </div>

//             <div className="relative z-10 mt-12 bg-white/20 backdrop-blur-md rounded-2xl p-4 grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-2">
//                 <Thermometer className="w-5 h-5 opacity-80" />
//                 <div>
//                   <p className="text-xs opacity-80">Feels like</p>
//                   <p className="font-bold">{Math.round(currentTemp + 2)}°C</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Wind className="w-5 h-5 opacity-80" />
//                 <div>
//                   <p className="text-xs opacity-80">Wind</p>
//                   <p className="font-bold">{windSpeed} km/h</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Droplets className="w-5 h-5 opacity-80" />
//                 <div>
//                   <p className="text-xs opacity-80">Humidity</p>
//                   <p className="font-bold">{humidity}%</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Cloud className="w-5 h-5 opacity-80" />
//                 <div>
//                   <p className="text-xs opacity-80">Cloud Cover</p>
//                   <p className="font-bold">{weatherData?.current?.rainProb || 90}%</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Forecast & Farming Advice */}
//           <div className="lg:col-span-2 space-y-8">

//             {/* 7 Day Forecast */}
//             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-lg font-bold text-gray-900 mb-6">7-Day Forecast</h3>
//               <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
//                 {[
//                   { day: 'Mon', temp: 28, icon: <CloudRain className="w-8 h-8 text-blue-500" /> },
//                   { day: 'Tue', temp: 27, icon: <CloudRain className="w-8 h-8 text-blue-500" /> },
//                   { day: 'Wed', temp: 30, icon: <Cloud className="w-8 h-8 text-gray-400" /> },
//                   { day: 'Thu', temp: 32, icon: <Sun className="w-8 h-8 text-brand-yellow" /> },
//                   { day: 'Fri', temp: 33, icon: <Sun className="w-8 h-8 text-brand-yellow" /> },
//                   { day: 'Sat', temp: 31, icon: <Cloud className="w-8 h-8 text-gray-400" /> },
//                   { day: 'Sun', temp: 29, icon: <CloudRain className="w-8 h-8 text-blue-500" /> },
//                 ].map((f, i) => (
//                   <motion.div
//                     key={i}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.1 }}
//                     className={`flex flex-col items-center justify-center p-4 min-w-[100px] rounded-2xl ${i === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}
//                   >
//                     <span className="text-sm font-semibold text-gray-500 mb-3">{f.day}</span>
//                     {f.icon}
//                     <span className="mt-3 font-bold text-gray-900 text-lg">{f.temp}°</span>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             {/* Farming Recommendations */}
//             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
//               <h3 className="text-lg font-bold text-gray-900 mb-6">AI Farming Advice for the Week</h3>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
//                   <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2">
//                     <Droplets className="w-5 h-5 text-green-600" /> Irrigation
//                   </h4>
//                   <p className="text-sm text-green-800">No irrigation needed for the next 4 days due to expected rainfall. Save water and electricity.</p>
//                 </div>
//                 <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
//                   <h4 className="font-bold text-yellow-900 flex items-center gap-2 mb-2">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600" /> Pest Control
//                   </h4>
//                   <p className="text-sm text-yellow-800">High humidity may lead to fungal diseases in Tomatoes. Plan to spray organic fungicide by Friday.</p>
//                 </div>
//                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
//                   <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
//                     <CloudRain className="w-5 h-5 text-blue-600" /> Harvesting
//                   </h4>
//                   <p className="text-sm text-blue-800">Quickly harvest any mature perishable crops today before the thunderstorm arrives.</p>
//                 </div>
//                 <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
//                   <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
//                     <Sun className="w-5 h-5 text-purple-600" /> Sowing
//                   </h4>
//                   <p className="text-sm text-purple-800">Excellent conditions to sow Kharif season seeds next week once the soil moisture is optimal.</p>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* Profitable Crops Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-8"
//         >
//           <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <Sprout className="w-6 h-6 text-brand-green" />
//                   Profitable Crops for {currentMonth}
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Based on current weather conditions in {location}
//                 </p>
//               </div>
//               <button
//                 onClick={fetchProfitableCrops}
//                 disabled={cropsLoading}
//                 className="flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
//               >
//                 {cropsLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Analyzing...
//                   </>
//                 ) : (
//                   <>
//                     <TrendingUp className="w-5 h-5" />
//                     View Profitable Crops
//                   </>
//                 )}
//               </button>
//             </div>

//             {cropsError && (
//               <div className="mb-6">
//                 <AlertBox
//                   message={cropsError}
//                   type="error"
//                   onDismiss={() => setCropsError(null)}
//                 />
//               </div>
//             )}

//             <AnimatePresence>
//               {showCrops && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="overflow-hidden"
//                 >
//                   {cropsLoading ? (
//                     <div className="flex items-center justify-center py-12">
//                       <div className="text-center">
//                         <Loader2 className="w-12 h-12 text-brand-green animate-spin mx-auto mb-4" />
//                         <p className="text-gray-500">Analyzing weather and market data...</p>
//                       </div>
//                     </div>
//                   ) : profitableCrops && profitableCrops.length > 0 ? (
//                     <div className="grid md:grid-cols-3 gap-6">
//                       {profitableCrops.map((crop, index) => (
//                         <motion.div
//                           key={crop.name}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 hover:shadow-md transition-shadow"
//                         >
//                           <div className="flex items-center justify-between mb-4">
//                             <h4 className="text-xl font-bold text-gray-900">{crop.name}</h4>
//                             <span className="bg-brand-green text-white text-sm font-bold px-3 py-1 rounded-full">
//                               {crop.match}% Match
//                             </span>
//                           </div>

//                           {crop.reason && (
//                             <p className="text-sm text-green-800 mb-4">{crop.reason}</p>
//                           )}

//                           <div className="space-y-2">
//                             <div className="flex justify-between text-sm">
//                               <span className="text-gray-500">Expected Yield</span>
//                               <span className="font-semibold text-gray-900">{crop.yield}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span className="text-gray-500">Profit Potential</span>
//                               <span className="font-semibold text-brand-green">{crop.profit}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span className="text-gray-500">Market Demand</span>
//                               <span className="font-semibold text-gray-900">{crop.demand}</span>
//                             </div>
//                           </div>
//                         </motion.div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8 text-gray-500">
//                       Click "View Profitable Crops" to see AI recommendations based on current weather and location.
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// }

