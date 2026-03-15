import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-light-bg text-gray-900 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-heading font-bold text-2xl">
                Kisaan<span className="text-brand-green">Setu</span>
              </span>
            </div>
            <p className="text-gray-400">Bridging Farmers to Markets and Smart Farming.</p>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/marketplace" className="hover:text-brand-yellow transition-colors">Marketplace</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-brand-yellow transition-colors">AI Farming Assistant</Link></li>
              <li><Link to="/weather" className="hover:text-brand-yellow transition-colors">Weather Alerts</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>support@kisaansetu.in</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} KisaanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
