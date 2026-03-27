import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Globe, User, Mail, Lock, Briefcase, Sprout, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('farmer');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const redirectByRole = (role) => {
  if (role === 'farmer') navigate('/dashboard');
  else if (role === 'buyer') navigate('/marketplace');
  else navigate('/');
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    let userData;
    if (isLogin) {
      userData = await authService.login(email, password);
    } else {
      // Validate form before signup
      if (!name.trim()) {
        throw new Error('Full name is required');
      }
      userData = await authService.register(name, email, password, role);
    }
    
    // Redirect based on role
    redirectByRole(userData.role);
  } catch (err) {
    setError(err.message || 'An error occurred. Please try again.');
    console.error('Auth error:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-brand-light-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-green/10 -skew-y-6 transform origin-top-left -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2">
          <Leaf className="h-10 w-10 text-brand-green" />
          <span className="font-heading font-bold text-3xl text-gray-900">
            Kisaan<span className="text-brand-green">Setu</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-gray-900">
          {isLogin ? 'Welcome back to the farm' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-medium text-brand-green hover:text-green-700 transition-colors"
          >
            {isLogin ? 'Register now' : 'Log in instead'}
          </button>
        </p>
      </div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative">

          {/* Language Selector */}
          <div className="absolute top-4 right-4 flex items-center gap-1 text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            <Globe className="h-4 w-4" />
            <span>English</span>
          </div>

          <form className="space-y-6 mt-4" onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Name — Register only */}
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role Selector — Register only */}
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="role-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setRole('farmer')}
                      className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                        role === 'farmer'
                          ? 'border-brand-green bg-green-50 text-brand-green shadow-sm'
                          : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      <Sprout className="h-6 w-6" />
                      <span className="font-medium">Farmer</span>
                    </div>
                    <div
                      onClick={() => setRole('buyer')}
                      className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                        role === 'buyer'
                          ? 'border-brand-green bg-green-50 text-brand-green shadow-sm'
                          : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      <Briefcase className="h-6 w-6" />
                      <span className="font-medium">Buyer</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me + Forgot password — Login only */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => alert('Forgot password flow coming soon!')}
                    className="font-medium text-brand-green hover:text-green-700"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
