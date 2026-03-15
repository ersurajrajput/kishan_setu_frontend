import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserInfo(JSON.parse(user));
    } else {
      setUserInfo(null);
    }
  }, [location.pathname]); // Update state when route changes

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-brand-green" />
              <span className="font-heading font-bold text-xl text-gray-900">
                Kisaan<span className="text-brand-green">Setu</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-600 hover:text-brand-green font-medium transition-colors">Marketplace</Link>
            <Link to="/knowledge" className="text-gray-600 hover:text-brand-green font-medium transition-colors">Knowledge Hub</Link>
            <div className="flex items-center space-x-4">
              {userInfo ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="text-brand-green font-medium hover:text-opacity-80 transition-colors">Dashboard</Link>
                  <Link to="/profile" className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors shadow-sm">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-brand-green font-medium hover:text-opacity-80 transition-colors">Login</Link>
                  <Link to="/register" className="bg-brand-green text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors shadow-sm">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/marketplace" className="block px-3 py-2 text-gray-700 hover:text-brand-green hover:bg-gray-50 rounded-md font-medium" onClick={() => setIsOpen(false)}>Marketplace</Link>
            <Link to="/knowledge" className="block px-3 py-2 text-gray-700 hover:text-brand-green hover:bg-gray-50 rounded-md font-medium" onClick={() => setIsOpen(false)}>Knowledge Hub</Link>
            {userInfo ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-brand-green hover:bg-gray-50 rounded-md font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="block px-3 py-2 bg-brand-green text-white font-medium rounded-md mx-3 mt-4 text-center" onClick={() => setIsOpen(false)}>Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-brand-green font-medium hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block px-3 py-2 bg-brand-green text-white font-medium rounded-md mx-3 mt-4 text-center" onClick={() => setIsOpen(false)}>Join Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
