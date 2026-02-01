import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GameModesSection from './components/GameModesSection';
import Footer from './components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500/30 flex flex-col">

      <Navbar />
      
      {/* Main Content - grows to push footer down */}
      <div className="flex-grow">
        <HeroSection />
        <GameModesSection />
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
