import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Bug, FlaskConical, Landmark, Search, PlayCircle, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'crop-guides', label: 'Crop Guides', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'pest-control', label: 'Pest Control', icon: <Bug className="w-5 h-5" /> },
  { id: 'fertilizers', label: 'Fertilizer Advice', icon: <FlaskConical className="w-5 h-5" /> },
  { id: 'schemes', label: 'Govt. Schemes', icon: <Landmark className="w-5 h-5" /> },
];

const ARTICLES = [
  {
    id: 1,
    title: 'PM-KISAN Samman Nidhi Yojana: How to Apply & Check Status',
    category: 'schemes',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=60',
    description: 'A complete step-by-step guide to applying for the Rs. 6000 annual income support scheme for farmers in India.'
  },
  {
    id: 2,
    title: 'Integrated Pest Management for Fall Armyworm in Maize',
    category: 'pest-control',
    readTime: '8 min read',
    isVideo: true,
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600&auto=format&fit=crop&q=60',
    description: 'Learn organic and chemical methods to control Fall Armyworm infestations before they destroy your Maize crop.'
  },
  {
    id: 3,
    title: 'Top 5 High-Yielding Wheat Varieties for Northern Plains',
    category: 'crop-guides',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60',
    description: 'Discover the best heat-tolerant and high-yielding wheat varieties developed by ICAR to maximize your Rabi harvest.'
  },
  {
    id: 4,
    title: 'Understanding NPK Ratios: The Right Fertilizer for Your Soil',
    category: 'fertilizers',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop&q=60',
    description: 'A simple guide to understanding Nitrogen, Phosphorus, and Potassium ratios and how to calculate fertilizer requirements.'
  },
  {
    id: 5,
    title: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance) Details',
    category: 'schemes',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=60',
    description: 'Secure your crops against natural calamities. Understand the premium rates and claim settlement process.'
  },
  {
    id: 6,
    title: 'Drip Irrigation Setup Guide for Orchards and Vegetables',
    category: 'crop-guides',
    readTime: '10 min read',
    isVideo: true,
    image: 'https://images.unsplash.com/photo-1530836369250-ef71a35921bf?w=600&auto=format&fit=crop&q=60',
    description: 'Save water and increase yield by 30%. Watch this full tutorial on setting up a low-cost drip irrigation system.'
  }
];

export default function KnowledgeHub() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = ARTICLES.filter(article => {
    const matchCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-6 drop-shadow-sm">
            Farmer Knowledge Hub
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Access expert guides, pest control strategies, and the latest government schemes to modernize your farming practices.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text"
              placeholder="Search for 'Urea dosage', 'Crop insurance'..."
              className="w-full pl-12 pr-6 py-4 border-gray-300 rounded-2xl shadow-md focus:ring-brand-green focus:border-brand-green border bg-white transition-shadow focus:shadow-lg text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-8 custom-scrollbar justify-start md:justify-center px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id 
                  ? 'bg-brand-green text-white shadow-lg transform scale-105' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green hover:text-brand-green hover:shadow-md'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-brand-green uppercase tracking-wider shadow-sm">
                    {CATEGORIES.find(c => c.id === article.category)?.label || 'General'}
                  </div>

                  {/* Video Indicator */}
                  {article.isVideo && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                      <div className="bg-white/90 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8 text-brand-green ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-gray-400 font-medium mb-3">{article.readTime}</p>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-brand-green transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {article.description}
                  </p>
                  
                  <div className="mt-auto">
                    <button onClick={() => setSelectedArticle(article)} className="flex items-center gap-2 font-bold text-brand-green group-hover:gap-3 transition-all">
                      Read Complete Article <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No resources found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
          </div>
        )}

      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="relative h-64 sm:h-80 flex-shrink-0">
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-colors"
                >
                  <Search className="w-5 h-5 hidden" /> {/* Hidden search icon to prevent import errors, use generic X below */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                {selectedArticle.isVideo && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full w-20 h-20 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-brand-green ml-1" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-green-100 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {CATEGORIES.find(c => c.id === selectedArticle.category)?.label || 'General'}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">{selectedArticle.readTime}</span>
                </div>
                
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6 leading-tight">
                  {selectedArticle.title}
                </h2>
                
                <div className="prose prose-lg prose-green max-w-none text-gray-700">
                  <p className="lead text-xl text-gray-600 mb-8 font-medium">
                    {selectedArticle.description}
                  </p>
                  
                  {/* Dummy Extended Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Introduction</h3>
                  <p className="mb-6">
                    Agriculture is the backbone of the economy, and staying updated with the latest practices is crucial. 
                    This guide provides comprehensive insights into maximizing your yield while maintaining soil health. 
                    Proper implementation of these techniques has shown a 25-30% increase in overall productivity for average sized farms.
                  </p>
                  
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-8 my-8">
                    <h4 className="font-bold text-green-900 flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5" /> Key Takeaways
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-green-800">
                      <li>Always test your soil before applying fertilizers.</li>
                      <li>Monitor local weather forecasts to schedule irrigation.</li>
                      <li>Use integrated pest management to reduce chemical dependency.</li>
                      <li>Keep accurate records of crop yields and expenses.</li>
                    </ul>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h3>
                  <p>
                    By following the step-by-step procedures outlined above, you can ensure a healthy, profitable harvest. 
                    Remember that farming is a localized practice, so adapt these generalized guidelines to fit your specific agro-climatic zone.
                  </p>
                </div>
              </div>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
