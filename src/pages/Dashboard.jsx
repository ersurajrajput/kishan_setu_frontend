import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, TrendingUp, Package, ShoppingCart, Sprout } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertBox from '../components/AlertBox';
import { getContextualError } from '../utils/errorHandler';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      fill: true,
      label: 'Wheat Price Trend (₹/Quintal)',
      data: [2100, 2150, 2200, 2180, 2300, 2350],
      borderColor: '#2E7D32',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const [stats, setStats] = useState({
    totalCrops: 0,
    ordersReceived: 0,
    marketTrend: 'Up 4%',
    
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) {
          console.log('User ID not available yet');
          setLoading(false);
          return;
        }

        // Fetch products/listings by seller ID using the API
        const listingsRes = await api.get(`/product/seller/${userId}`)
          .catch(err => {
            console.error('Error fetching seller products:', err.response?.status);
            return { data: [] };
          });
        
        const listings = listingsRes.data || [];
        
        const cropsRes = await api.get('/crops/my').catch(() => ({ data: [] }));
        const ordersRes = await api.get('/orders/my').catch(() => ({ data: [] }));
        // const weatherRes = await api.get('/weather?city=Sehore').catch(() => ({ data: {} }));

        const crops = cropsRes.data || [];
        const orders = ordersRes.data || [];
        // const weather = weatherRes.data || {};

        // Store listings in state
        setListings(listings);

        // Calculate stats
        setStats({
          totalCrops: listings.length || crops.length,
          ordersReceived: orders.length || 0,
          marketTrend: 'Up 4%',
          // weather: weather.current ? `${Math.round(weather.current.temp)}°C / ${weather.current.condition}` : '28°C / Sunny',
        });

        // Generate notifications
        const newNotifications = [];
        // if (weather.alerts && weather.alerts.length > 0) {
        //   newNotifications.push({
        //     type: 'weather',
        //     icon: <CloudRain className="h-5 w-5 text-blue-500" />,
        //     title: 'Weather Alert',
        //     message: weather.alerts[0],
        //   });
        // }
        if (orders.length > 0) {
          newNotifications.push({
            type: 'order',
            icon: <ShoppingCart className="h-5 w-5 text-brand-green" />,
            title: 'New Order',
            message: `You have ${orders.length} order(s) to process.`,
          });
        }
        setNotifications(newNotifications);

      } catch (error) {
        const errorMessage = getContextualError('profile', error);
        setError(errorMessage);
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const dashboardCards = [
    { title: 'Total Crops Listed', value: stats.totalCrops.toString(), icon: <Package className="h-6 w-6 text-brand-green" />, color: 'bg-green-100' },
    { title: 'Orders Received', value: stats.ordersReceived.toString(), icon: <ShoppingCart className="h-6 w-6 text-blue-600" />, color: 'bg-blue-100' },
    { title: 'Market Prices', value: stats.marketTrend, icon: <TrendingUp className="h-6 w-6 text-brand-yellow" />, color: 'bg-yellow-100' },
    // { title: 'Weather', value: stats.weather, icon: <CloudRain className="h-6 w-6 text-indigo-600" />, color: 'bg-indigo-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Farmer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, get an overview of your farm's performance.</p>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <AlertBox
                  message={error}
                  type="error"
                  onDismiss={() => setError(null)}
                />
              </div>
            )}
            
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardCards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`rounded-xl p-3 ${card.color}`}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                          <dd className="text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Area */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Crop Price Trends</h3>
                <div className="h-64">
                  <Line options={chartOptions} data={chartData} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col"
              >
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Notifications</h3>
                <ul className="flex-1 space-y-4">
                  {notifications.length > 0 ? notifications.map((notif, idx) => (
                    <li key={idx} className="flex gap-4 items-start p-3 bg-blue-50 rounded-lg text-blue-900">
                      {notif.icon}
                      <div>
                        <p className="font-semibold text-sm">{notif.title}</p>
                        <p className="text-sm mt-1">{notif.message}</p>
                      </div>
                    </li>
                  )) : (
                    <li className="flex gap-4 items-start p-3 bg-gray-50 rounded-lg text-gray-500">
                      <Sprout className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">No new notifications</p>
                        <p className="text-sm mt-1">Your dashboard is up to date.</p>
                      </div>
                    </li>
                  )}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
