import React, { useState } from 'react';
import { Shield, User, Stethoscope, ChevronDown, LogOut, LayoutDashboard, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth, onOpenHospitals }) {
  const { user, patient, doctor, logout, quickDemoLogin } = useAuth();
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoSwitch = async (type) => {
    setDemoDropdownOpen(false);
    try {
      await quickDemoLogin(type);
      // Smoothly scroll down to the dashboard section right away
      setTimeout(() => {
        scrollTo('dashboard-section');
      }, 300);
    } catch (err) {
      alert('Demo switch error: ' + err.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-navy-100/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-navy-800 flex items-center space-x-1">
              <span>Medi</span>
              <span className="text-teal-600">Connect</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-navy-400 -mt-1">
              Unified Healthcare Network
            </div>
          </div>
        </div>

        {/* Center Nav Links - "3D Corridor" changes to "Dashboard" when logged in! */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-navy-600">
          {user ? (
            /* Logged in: "Dashboard" button in place of "3D Corridor" with prominent easy-click styling */
            <button
              onClick={() => scrollTo('dashboard-section')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500/15 border-2 border-teal-500/40 text-teal-800 font-extrabold hover:bg-teal-500/25 transition-all flex items-center space-x-2 shadow-xs group"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600 group-hover:rotate-12 transition-transform" />
              <span>{user.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}</span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </button>
          ) : (
            /* Not logged in: standard "3D Corridor" link */
            <button
              onClick={() => scrollTo('cinematic-experience')}
              className="hover:text-teal-600 transition-colors"
            >
              3D Corridor
            </button>
          )}

          <button onClick={() => scrollTo('how-it-works')} className="hover:text-teal-600 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollTo('features')} className="hover:text-teal-600 transition-colors">
            Features
          </button>
          <button onClick={onOpenHospitals} className="hover:text-teal-600 transition-colors flex items-center space-x-1">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Connected Hospitals</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {demoDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-navy-100 shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-navy-400 border-b border-navy-50">
                  Select Demo Scenario Account
                </div>
                <button
                  onClick={() => handleDemoSwitch('patient')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50/70 transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-800">Rahul Sharma (Patient)</div>
                    <div className="text-[11px] text-navy-400">MC-PAT-7701 (All Medical History)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoSwitch('doctor_visiting')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-800">Dr. Rajesh Kumar (Demo Doctor)</div>
                    <div className="text-[11px] text-navy-400">Fill diseases, prescriptions, consent</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoSwitch('doctor_cardio')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-navy-50 transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-800">Dr. Priya Patel (Cardiologist)</div>
                    <div className="text-[11px] text-navy-400">City Care Hospital</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-center space-x-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-800">Hospital Registrar (Admin)</div>
                    <div className="text-[11px] text-navy-400">City Care Hospital Admin</div>
                  </div>
                </button>

                {/* Multi-Window Simultaneous Mode */}
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50/80 border-t border-b border-teal-200 mt-1 flex items-center justify-between">
                  <span>🪟 Multi-Window Live Mode</span>
                  <span className="text-[9px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-mono">SIMULTANEOUS</span>
                </div>

                <button
                  onClick={() => {
                    window.open('/?role=doctor', '_blank');
                    setDemoDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-blue-50/70 transition-colors flex items-center space-x-2 text-xs font-bold text-blue-800 mt-1"
                >
                  <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">↗</span>
                  <span>Launch Doctor in New Window</span>
                </button>

                <button
                  onClick={() => {
                    window.open('/?role=patient', '_blank');
                    setDemoDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-teal-50/70 transition-colors flex items-center space-x-2 text-xs font-bold text-teal-800"
                >
                  <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">↗</span>
                  <span>Launch Patient in New Window</span>
                </button>
              </div>
            )}
          </div>

          {/* User state */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-navy-800 leading-tight">{user.full_name}</span>
                <span className="text-[11px] uppercase font-bold text-teal-600 tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-navy-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('patient')}
              className="px-4 py-2.5 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
