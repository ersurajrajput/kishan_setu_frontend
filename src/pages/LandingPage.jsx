import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Bot, Sprout, CloudRain, ShieldCheck, TrendingUp, Users, X, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <ShoppingCart className="h-8 w-8 text-brand-green" />,
    title: 'Marketplace',
    description: 'Directly connect with genuine buyers. No middlemen, better profits.'
  },
  {
    icon: <Bot className="h-8 w-8 text-brand-green" />,
    title: 'AI Farming Assistant',
    description: 'Get 24/7 personalized answers to all your farming queries.'
  },
  {
    icon: <Sprout className="h-8 w-8 text-brand-green" />,
    title: 'Smart Crop Recommendation',
    description: 'Data-driven insights to plant the right crop at the right time.'
  },
  {
    icon: <CloudRain className="h-8 w-8 text-brand-green" />,
    title: 'Weather Alerts',
    description: 'Real-time hyper-local weather alerts to protect your harvest.'
  }
];

const steps = [
  { title: "Farmer lists crop", description: "Quickly scan and upload your produce details." },
  { title: "Buyers discover produce", description: "Verified buyers see and bid for your crops." },
  { title: "Direct order placement", description: "Confirm the deal instantly and securely." },
  { title: "AI helps improve yield", description: "Continuous guidance for your next harvest." }
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background mock using CSS / Framer */}
        <motion.div 
          className="absolute inset-0 z-0 bg-gradient-to-br from-brand-green/20 to-brand-green/90"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        >
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" 
            alt="Farm" 
            className="w-full h-full object-cover mix-blend-overlay opacity-50"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Empowering Farmers with Technology
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-10 drop-shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            KisaanSetu connects farmers directly with buyers while providing AI-powered farming guidance.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/sell" className="bg-brand-yellow text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center gap-2">
              Sell Your Crop <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/marketplace" className="bg-white text-brand-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
              Explore Marketplace
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">The Challenge vs The Future</h2>
            <p className="text-xl text-gray-600">How KisaanSetu is revolutionizing agriculture.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              className="bg-red-50 p-8 rounded-2xl border border-red-100"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" /> Traditional Problems
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-red-900">
                  <span className="bg-red-200 p-1 rounded-full mt-1"><X className="h-4 w-4" /></span>
                  Middlemen exploitation and unfair cuts
                </li>
                <li className="flex items-start gap-3 text-red-900">
                  <span className="bg-red-200 p-1 rounded-full mt-1"><X className="h-4 w-4" /></span>
                  Low crop prices due to information asymmetry
                </li>
                <li className="flex items-start gap-3 text-red-900">
                  <span className="bg-red-200 p-1 rounded-full mt-1"><X className="h-4 w-4" /></span>
                  Lack of modern farming knowledge
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-green-50 p-8 rounded-2xl border border-green-100 shadow-xl shadow-green-900/5 relative overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Leaf className="w-32 h-32 text-brand-green" />
              </div>
              <h3 className="text-2xl font-bold text-brand-green mb-6 flex items-center gap-2 relative z-10">
                <Sprout className="h-6 w-6" /> Our Solutions
              </h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3 text-green-900">
                  <span className="bg-green-200 p-1 rounded-full mt-1"><Check className="h-4 w-4 text-brand-green" /></span>
                  Direct digital marketplace
                </li>
                <li className="flex items-start gap-3 text-green-900">
                  <span className="bg-green-200 p-1 rounded-full mt-1"><Check className="h-4 w-4 text-brand-green" /></span>
                  AI farming assistant & Smart crop recommendations
                </li>
                <li className="flex items-start gap-3 text-green-900">
                  <span className="bg-green-200 p-1 rounded-full mt-1"><Check className="h-4 w-4 text-brand-green" /></span>
                  Hyper-local Weather-based farming alerts
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-brand-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600">Everything you need to grow and sell better.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-brand-light-bg w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-yellow/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">A simple timeline to profitability.</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-brand-green/20 via-brand-green to-brand-green/20 -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  className="relative z-10 flex flex-col items-center text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="w-16 h-16 rounded-full bg-brand-green text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg border-4 border-white">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Counters */}
      <section className="py-20 bg-brand-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Farmers Connected', value: '10,000+' },
              { label: 'Buyers Registered', value: '5,000+' },
              { label: 'Crops Listed', value: '50,000+' },
              { label: 'Transactions Completed', value: '1M+' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-4"
              >
                <div className="text-4xl lg:text-5xl font-heading font-bold mb-2 text-brand-yellow">
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-wider font-semibold opacity-90">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Join the Agricultural Revolution
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Whether you're looking to sell your harvest for what it's truly worth, or sourcing the best quality produce directly from farms.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register?role=farmer" className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg">
              Register as Farmer
            </Link>
            <Link to="/register?role=buyer" className="bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-sm">
              Register as Buyer
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// A simple local Check icon component to avoid extra imports if missed
function Check(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
