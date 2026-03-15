import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SellCrop from './pages/SellCrop';
import Marketplace from './pages/Marketplace';
import AIFarmAssistant from './pages/AIFarmAssistant';
import CropRecommendation from './pages/CropRecommendation';
import Weather from './pages/Weather';
import KnowledgeHub from './pages/KnowledgeHub';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sell" element={<SellCrop />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="ai-assistant" element={<AIFarmAssistant />} />
          <Route path="recommendation" element={<CropRecommendation />} />
          <Route path="weather" element={<Weather />} />
          <Route path="knowledge" element={<KnowledgeHub />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
