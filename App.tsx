
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import Admin from './components/Admin';
import AuthModal from './components/AuthModal';
import ClientProfile from './components/ClientProfile';
import { SiteProvider, useSiteContent } from './contexts/SiteContext';

function AppContent() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const { currentUser } = useSiteContent();

  const handleLoginSuccess = () => {
      // Logic handled inside AuthModal/Context, just need to close modals
      // Optionally redirect
      if (currentUser?.role === 'client') {
          setShowClientProfile(true);
      }
  };

  const handleOpenAuth = () => {
      // If already logged in, determine where to go
      if (currentUser) {
          if (currentUser.role === 'client') setShowClientProfile(true);
          if (currentUser.role === 'admin') setShowAdmin(true);
      } else {
          setShowAuth(true);
      }
  };

  return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header 
            onOpenAuth={handleOpenAuth} 
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenClientProfile={() => setShowClientProfile(true)}
        />
        <main>
          <Hero />
          <Services />
          <About />
          <Testimonials />
          <Contact />
        </main>
        <Footer onOpenAdmin={() => setShowAdmin(true)} />
        <AIChatWidget />
        
        {/* Modals */}
        <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            onLoginSuccess={handleLoginSuccess}
        />
        
        <ClientProfile 
            isOpen={showClientProfile} 
            onClose={() => setShowClientProfile(false)} 
        />
        
        {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
      </div>
  );
}

function App() {
  return (
    <SiteProvider>
      <AppContent />
    </SiteProvider>
  );
}

export default App;
