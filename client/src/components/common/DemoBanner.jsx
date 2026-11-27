import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Stethoscope, ChevronRight, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DemoBanner() {
  const { user, quickDemoLogin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSwitch = async (type) => {
    try {
      await quickDemoLogin(type);
    } catch (err) {
      alert('Demo switch error: ' + err.message);
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-2 rounded-full bg-navy-900 text-white text-xs font-bold border border-teal-400 shadow-glow-teal flex items-center space-x-1.5 hover:scale-105 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>Demo Scenario Guide</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-xl z-40 bg-navy-950/95 text-white p-4 rounded-2xl border-2 border-teal-500/60 shadow-2xl backdrop-blur-xl animate-fade-in text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center space-x-2 font-bold text-teal-300">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Live Evaluation Walkthrough</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-navy-400 hover:text-white p-0.5 rounded"
          title="Minimize guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-navy-200 text-[11px] leading-relaxed mb-2.5">
        <strong>Workflow:</strong> Visiting doctor <strong>Dr. Rajesh Kumar</strong> searches Rahul (<code>MC-PAT-7701</code>) and requests access. Patient <strong>Rahul Sharma</strong> receives a real-time prompt and approves with 1 click!
      </p>

      {/* Dynamic Context Hint */}
      <div className="mb-3 p-2 rounded-xl bg-white/5 border border-teal-500/30 text-[11px] text-teal-200 flex items-center space-x-1.5">
        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>
          {user?.role === 'doctor'
            ? "Doctor logged in. Search MC-PAT-7701, click 'Request Patient Consent', then switch to Rahul."
            : user?.role === 'patient'
            ? "Patient logged in. Notice the top banner when a doctor requests access — approve in 1 click!"
            : "Select a demo role below to experience cross-hospital consent & unified records."}
        </span>
      </div>

      {/* Quick 1-Click Role Switchers */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleSwitch('patient')}
          className="px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold text-[11px] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center space-x-1.5 truncate">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Login: Rahul (Patient)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>

        <button
          onClick={() => handleSwitch('doctor_visiting')}
          className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold text-[11px] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center space-x-1.5 truncate">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Login: Dr. Rajesh (Visiting)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

      {/* 🪟 Multi-Window Live Simulation Launcher */}
      <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-navy-300 font-bold uppercase tracking-wider">
          Multi-Window Live Test:
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open('/?role=doctor', '_blank')}
            className="px-2.5 py-1 rounded-lg bg-blue-600/40 hover:bg-blue-600/70 text-blue-200 border border-blue-400/40 text-[10px] font-bold flex items-center space-x-1 transition-all"
            title="Open Doctor Console in a separate window"
          >
            <span>↗ New Doctor Window</span>
          </button>
          <button
            onClick={() => window.open('/?role=patient', '_blank')}
            className="px-2.5 py-1 rounded-lg bg-teal-600/40 hover:bg-teal-600/70 text-teal-200 border border-teal-400/40 text-[10px] font-bold flex items-center space-x-1 transition-all"
            title="Open Patient Portal in a separate window"
          >
            <span>↗ New Patient Window</span>
          </button>
        </div>
      </div>
    </div>
  );
}
