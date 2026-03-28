import { Outlet, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, List, Bot, Sprout, CloudRain, User } from 'lucide-react';
import Navbar from './Navbar';

const sidebarLinks = [
  { name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
  { name: 'Sell Crop', icon: <ShoppingCart className="h-5 w-5" />, path: '/sell' },
  { name: 'My Listings', icon: <List className="h-5 w-5" />, path: '/my-listings' },
  { name: 'AI Assistant', icon: <Bot className="h-5 w-5" />, path: '/ai-assistant' },
  { name: 'Crop Recommendation', icon: <Sprout className="h-5 w-5" />, path: '/recommendation' },
  // { name: 'Weather Alerts', icon: <CloudRain className="h-5 w-5" />, path: '/weather' },
  { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
];

export default function DashboardLayout() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block fixed h-screen mt-16 overflow-y-auto">
        <div className="h-full flex flex-col pt-5 pb-4">
          {/* Logo/Branding */}
          <div className="px-4 mb-6">
            <span className="font-heading font-bold text-xl">
              Kisaan<span className="text-brand-green">Setu</span>
            </span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {sidebarLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'bg-green-50 text-brand-green border-l-4 border-brand-green'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200`}
              >
                <span
                  className={`mr-3 flex-shrink-0 ${
                    isActive(item.path)
                      ? 'text-brand-green'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
