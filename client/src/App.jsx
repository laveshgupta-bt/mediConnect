import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/landing/HeroSection';
import EmbeddedDashboardSection from './components/landing/EmbeddedDashboardSection';
import ProblemSection from './components/landing/ProblemSection';
import SolutionDiagram from './components/landing/SolutionDiagram';
import HowItWorksSection from './components/landing/HowItWorksSection';
import FeaturesSection from './components/landing/FeaturesSection';
import LoginSelectionSection from './components/landing/LoginSelectionSection';
import AuthModal from './components/AuthModal';
import HospitalManagementView from './components/hospital/HospitalManagementView';
import DemoBanner from './components/common/DemoBanner';
import GeminiChatBubble from './components/chat/GeminiChatBubble';

export default function App() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('patient');
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);

  // If user navigated or scanned QR to /qr-view or ?view=qr
  if (typeof window !== 'undefined' && (window.location.pathname === '/qr-view' || window.location.search.includes('view=qr'))) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-sm w-full bg-navy-900 border-2 border-teal-500/60 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase tracking-wider">
            MediConnect Verification Status
          </div>
          <h2 className="text-xl font-black text-white">Student / Patient ID</h2>
          <p className="text-xs text-navy-200">
            Digital identity verification module is currently under active development.
          </p>
          <div className="bg-white p-3 rounded-2xl shadow-inner">
            <img src="/work-in-progress.png" alt="Work in Progress" className="w-full h-auto rounded-xl mx-auto shadow" />
          </div>
          <div className="pt-2">
            <a href="/" className="inline-block px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors">
              ← Return to MediConnect Network
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenAuth = (role = 'patient') => {
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const scrollToDashboard = () => {
    const el = document.getElementById('dashboard-section') || document.getElementById('cinematic-experience');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // When user logs in or registers, smoothly scroll them to their dashboard
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        scrollToDashboard();
      }, 400);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl teal-gradient-bg flex items-center justify-center animate-spin">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <div className="text-sm font-bold tracking-wider font-mono text-teal-300">
          INITIALIZING MEDICONNECT HEALTHCARE GRID...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-navy-800">
      {/* Global Navigation - "3D Corridor" is replaced by "Dashboard" when logged in! */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenHospitals={() => setHospitalModalOpen(true)}
      />

      {/* 1. Hero Section with 3D Hospital Reception Canvas */}
      <HeroSection
        onOpenAuth={handleOpenAuth}
        onExploreClick={scrollToDashboard}
      />

      {/* 2. IN PLACE OF 3D CORRIDOR:
             - When logged in as Patient: Patient Dashboard (All medical history across hospitals)
             - When logged in as Doctor: Doctor Console with extra privileges (Fill diseases, prescriptions, consent, break-glass)
             - When not logged in: 3D Walking Corridor journey
      */}
      <EmbeddedDashboardSection />

      {/* 3. The Problem Statement */}
      <ProblemSection />

      {/* 4. Our Solution — Visual Ecosystem Diagram */}
      <SolutionDiagram />

      {/* 5. How It Works (4 Steps) */}
      <HowItWorksSection onOpenAuth={handleOpenAuth} />

      {/* 6. Key Features Grid */}
      <FeaturesSection />

      {/* 7. Login Selection Cards */}
      <LoginSelectionSection
        onSelectRole={handleOpenAuth}
        onQuickDemo={() => {}}
      />

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authRole}
      />

      <HospitalManagementView
        isOpen={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
      />

      {/* Interactive Evaluation Scenario Banner */}
      <DemoBanner />

      {/* Floating Gemini AI Clinical Chat Bubble (Right Hand Bottom Side) */}
      <GeminiChatBubble />
    </div>
  );
}
