import React, { useState, useEffect, useRef } from 'react';
import { Heart, Activity, Wind, Database, ShieldCheck, ChevronRight, ChevronLeft, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import HospitalWalkthroughScene from '../three/HospitalWalkthroughScene';

const JOURNEY_STEPS = [
  {
    step: 1,
    progress: 0.05,
    hospital: 'City Care Hospital',
    department: 'Cardiology Center',
    code: 'HOSP-CCH',
    doctor: 'Dr. Priya Patel (Cardiologist)',
    icon: Heart,
    color: 'border-red-500 text-red-600 bg-red-50',
    accentColor: '#E53E3E',
    encounter: 'Cardiovascular Evaluation & Essential Hypertension',
    details: 'Patient Rahul Sharma diagnosed with primary hypertension (BP 142/92). Lisinopril 10mg initiated. Encounter encrypted and stored into patient’s unified MediConnect record.',
    tag: 'Originating Record #1'
  },
  {
    step: 2,
    progress: 0.28,
    hospital: 'Sunrise Medical Centre',
    department: 'Orthopedics & Sports Injury',
    code: 'HOSP-SMC',
    doctor: 'Dr. Amit Verma (Orthopedic Surgeon)',
    icon: Activity,
    color: 'border-blue-500 text-blue-600 bg-blue-50',
    accentColor: '#3182CE',
    encounter: 'Right Ankle Ligamentous Sprain',
    details: 'Patient suffers sports injury 3 months later. Dr. Verma accesses prior cardiology notes, identifies aspirin/NSAID contraindications, and safely prescribes Etoricoxib.',
    tag: 'Originating Record #2'
  },
  {
    step: 3,
    progress: 0.52,
    hospital: 'Global Health Hospital',
    department: 'Pulmonology & Respiratory Care',
    code: 'HOSP-GHH',
    doctor: 'Dr. Sarah Jenkins (Senior Pulmonologist)',
    icon: Wind,
    color: 'border-teal-500 text-teal-600 bg-teal-50',
    accentColor: '#38B2AC',
    encounter: 'Bronchial Asthma Exacerbation',
    details: 'Rahul suffers winter wheezing. Dr. Jenkins reviews previous lipid panels and ECGs instantly without forcing Rahul to repeat costly diagnostic tests.',
    tag: 'Originating Record #3'
  },
  {
    step: 4,
    progress: 0.75,
    hospital: 'MediConnect Core Hub',
    department: 'Cryptographic Consent & FHIR Sync',
    code: 'NET-HUB',
    doctor: 'Automated Consent Engine',
    icon: Database,
    color: 'border-teal-600 text-teal-700 bg-teal-50',
    accentColor: '#16A6A1',
    encounter: 'Zero-Knowledge Permission Registry',
    details: 'All records from 3 distinct hospital silos are unified into one immutable FHIR R4 clinical timeline. No doctor can read data without active patient consent.',
    tag: 'Interoperability Engine'
  },
  {
    step: 5,
    progress: 0.98,
    hospital: 'Metropolitan Medical Institute',
    department: 'Acute Care & Demonstration Portal',
    code: 'HOSP-MMI',
    doctor: 'Dr. Rajesh Kumar (Emergency Physician)',
    icon: ShieldCheck,
    color: 'border-amber-500 text-amber-600 bg-amber-50',
    accentColor: '#DD6B20',
    encounter: 'New Patient Encounter & Access Request',
    details: 'Dr. Rajesh searches Rahul Sharma by Patient ID. System prompts for consent. Once approved by Rahul, all records across City Care, Sunrise, and Global Health unlock instantly!',
    tag: 'Live Demo Scenario'
  }
];

export default function WalkthroughSection() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0.05);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [is3DMode, setIs3DMode] = useState(true);

  // Scroll listener to update 3D progress smoothly
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height - windowHeight;

      if (totalHeight <= 0) return;

      // Calculate fraction scrolled through this section
      const scrolled = -rect.top;
      const fraction = Math.min(Math.max(scrolled / totalHeight, 0), 1);
      setScrollProgress(fraction);

      // Determine active journey step
      if (fraction < 0.2) setActiveStepIndex(0);
      else if (fraction < 0.45) setActiveStepIndex(1);
      else if (fraction < 0.68) setActiveStepIndex(2);
      else if (fraction < 0.88) setActiveStepIndex(3);
      else setActiveStepIndex(4);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToStep = (index) => {
    setActiveStepIndex(index);
    const targetProg = JOURNEY_STEPS[index].progress;
    setScrollProgress(targetProg);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const targetY = currentScrollY + rect.top + targetProg * (rect.height - window.innerHeight);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const activeStep = JOURNEY_STEPS[activeStepIndex];

  return (
    <section
      id="cinematic-experience"
      ref={containerRef}
      className="relative w-full bg-navy-950 text-white min-h-[350vh] border-t border-navy-800"
    >
      {/* Sticky Fullscreen 3D Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden">
        {/* Background gradient and subtle grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 opacity-95 pointer-events-none" />

        {/* Top Header Overlay */}
        <div className="relative z-20 px-6 py-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 glass-panel-dark">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Cinematic 3D Journey
              </span>
              <span className="text-xs text-navy-300 font-mono">
                HL7 FHIR Interoperability Demo
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Rahul Sharma’s Journey Across Connected Hospitals
            </h2>
          </div>

          {/* Interactive controls & 3D Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium glass-panel-dark border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all flex items-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{is3DMode ? 'Switch to 2D Cards' : 'Switch to 3D Scene'}</span>
            </button>

            {/* Step navigation buttons */}
            <div className="flex items-center space-x-1 bg-navy-800/80 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => jumpToStep(Math.max(0, activeStepIndex - 1))}
                disabled={activeStepIndex === 0}
                className="p-1 rounded text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                title="Previous Hospital"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono font-medium text-teal-300">
                {activeStepIndex + 1} / {JOURNEY_STEPS.length}
              </span>
              <button
                onClick={() => jumpToStep(Math.min(JOURNEY_STEPS.length - 1, activeStepIndex + 1))}
                disabled={activeStepIndex === JOURNEY_STEPS.length - 1}
                className="p-1 rounded text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                title="Next Hospital"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Stage: 3D Scene or Graceful Fallback */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {is3DMode ? (
            <div className="w-full h-full">
              <HospitalWalkthroughScene progress={scrollProgress} />
            </div>
          ) : (
            /* Graceful 2D Visual Timeline Fallback */
            <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
              <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-4">
                {JOURNEY_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === activeStepIndex;
                  return (
                    <div
                      key={step.step}
                      onClick={() => jumpToStep(idx)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-navy-800/90 border-teal-400 shadow-glow-teal scale-105'
                          : 'bg-navy-900/60 border-white/10 hover:border-white/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="w-5 h-5 text-teal-400" />
                        <span className="text-xs font-bold font-mono text-teal-300">#{step.step}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate">{step.hospital}</h4>
                      <p className="text-xs text-navy-300 mt-1 line-clamp-2">{step.encounter}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Clinical Encounter HUD Card */}
          <div className="absolute left-6 bottom-8 md:left-12 max-w-md w-[calc(100%-3rem)] md:w-auto z-20 pointer-events-auto">
            <div className="glass-panel-dark border border-white/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {activeStep.tag}
                </span>
                <span className="text-xs font-mono text-navy-300">{activeStep.code}</span>
              </div>

              <div className="flex items-start space-x-3 mb-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 mt-0.5">
                  <activeStep.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeStep.hospital}</h3>
                  <p className="text-xs text-teal-300 font-medium">{activeStep.department}</p>
                  <p className="text-xs text-navy-300 mt-0.5">{activeStep.doctor}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950/60 border border-white/10 mb-3">
                <p className="text-xs font-semibold text-white mb-1">{activeStep.encounter}</p>
                <p className="text-xs text-navy-200 leading-relaxed">{activeStep.details}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-navy-400 pt-1 border-t border-white/10">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Records Synced & Encrypted</span>
                </span>
                <span className="font-mono text-teal-400 font-bold">
                  Scroll or scrub ➔
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Progress Scrubber */}
        <div className="relative z-20 px-6 py-4 md:px-12 bg-navy-950/90 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-4 w-full md:w-2/3">
            <span className="text-xs font-mono text-navy-300 shrink-0">Journey Progress</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scrollProgress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setScrollProgress(val);
                if (val < 0.2) setActiveStepIndex(0);
                else if (val < 0.45) setActiveStepIndex(1);
                else if (val < 0.68) setActiveStepIndex(2);
                else if (val < 0.88) setActiveStepIndex(3);
                else setActiveStepIndex(4);
              }}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-navy-800 rounded-lg"
            />
            <span className="text-xs font-mono text-teal-300 shrink-0">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-navy-300">
            <span>Scroll down or drag slider to advance character</span>
          </div>
        </div>
      </div>
    </section>
  );
}
