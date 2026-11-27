import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Building2, Activity, Play, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HeroHospitalCanvas from '../three/HeroHospitalCanvas';

export default function HeroSection({ onOpenAuth, onExploreClick }) {
  const { user } = useAuth();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-[#F7FAFC] via-[#EDF2F7] to-[#F7FAFC]">
      {/* Decorative background grid and blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Value Prop & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Next-Gen Healthcare Interoperability</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.12]">
                Your Health History.{' '}
                <span className="medical-gradient-text">Connected Everywhere.</span>
              </h1>
              <p className="text-lg md:text-xl text-navy-500 leading-relaxed font-normal">
                Why should your medical history stop at hospital doors? MediConnect unifies fragmented hospital records into one secure, patient-controlled timeline.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-7 py-4 rounded-xl teal-gradient-bg text-white font-semibold text-base shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-2 group"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-white" />
                    <span>{user.role === 'doctor' ? 'Open Doctor Console' : 'View My Medical History'}</span>
                  </>
                ) : (
                  <>
                    <span>Explore MediConnect</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="px-6 py-4 rounded-xl bg-white border border-navy-200 text-navy-800 font-semibold text-base hover:bg-navy-50 hover:border-navy-300 transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 text-teal-600 fill-teal-600" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 border-t border-navy-200/60 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-navy-800">3+</div>
                <div className="text-xs text-navy-400 font-medium mt-0.5">Connected Hospitals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">100%</div>
                <div className="text-xs text-navy-400 font-medium mt-0.5">Patient Consent Driven</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy-800">FHIR R4</div>
                <div className="text-xs text-navy-400 font-medium mt-0.5">Standard Architecture</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Hospital Environment */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-gradient-to-tr from-white/80 via-white/40 to-teal-50/60 border border-white/80 shadow-premium p-2 backdrop-blur-xl">
              <HeroHospitalCanvas />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
