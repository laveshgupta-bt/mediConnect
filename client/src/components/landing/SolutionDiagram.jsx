import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck, Key, RefreshCw, FileText, CheckCircle2, Lock } from 'lucide-react';

const HOSPITALS = [
  {
    id: 'cch',
    name: 'Hospital A: City Care',
    city: 'Metro City',
    specialty: 'Cardiology Records',
    code: 'HOSP-CCH',
    badge: 'Cardio Notes & Lipid Panel',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'smc',
    name: 'Hospital B: Sunrise Medical',
    city: 'Pune',
    specialty: 'Orthopedics Records',
    code: 'HOSP-SMC',
    badge: 'Ankle X-Ray & Treatment Plan',
    color: 'from-teal-600 to-emerald-700'
  },
  {
    id: 'ghh',
    name: 'Hospital C: Global Health',
    city: 'Mumbai',
    specialty: 'Pulmonology Records',
    code: 'HOSP-GHH',
    badge: 'Asthma Spirometry & Inhalers',
    color: 'from-cyan-600 to-blue-700'
  }
];

export default function SolutionDiagram() {
  const [activeHospital, setActiveHospital] = useState('cch');
  const [consentGranted, setConsentGranted] = useState(true);

  return (
    <section className="py-24 bg-navy-950 text-white relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Cryptographic Consent Engine</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            One Connected Healthcare Ecosystem.
          </h2>
          <p className="text-base md:text-lg text-navy-200 leading-relaxed">
            Hospitals exchange medical records securely through MediConnect's FHIR-inspired interoperability layer — unlocked exclusively when authorized by patient consent.
          </p>
        </div>

        {/* Interactive Visual Network Diagram */}
        <div className="bg-navy-900/80 rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Top Status Bar: Patient Consent Simulator */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-8 mb-8 border-b border-white/10 gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-mono tracking-wider text-teal-300">Consent Authorization Status</div>
                <div className="text-sm font-bold text-white">
                  Rahul Sharma (Patient ID: MC-PAT-7701)
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-navy-300 font-medium">Consent Active:</span>
              <button
                onClick={() => setConsentGranted(!consentGranted)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  consentGranted
                    ? 'bg-teal-500 text-navy-950 shadow-glow-teal'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {consentGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Consent Granted (Full History)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Consent Revoked / Locked</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Core Interactive Diagram Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-center">
            {/* Left Node: Hospital A */}
            <div
              onClick={() => setActiveHospital('cch')}
              className={`lg:col-span-2 p-6 rounded-2xl border cursor-pointer transition-all ${
                activeHospital === 'cch'
                  ? 'bg-navy-800 border-teal-400 shadow-glow-teal scale-102'
                  : 'bg-navy-950/70 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">HOSPITAL A</span>
                <span className="text-xs text-navy-400 font-mono">HOSP-CCH</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">City Care Hospital</h4>
              <p className="text-xs text-navy-300 mb-3">Metro Healthcare Group</p>
              <div className="p-2.5 rounded-lg bg-navy-900 border border-white/10 text-xs text-teal-300">
                Cardiology notes, BP vitals & Lipid panel
              </div>
            </div>

            {/* Middle Conduit to Center */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center">
              <div className="text-xs font-mono text-teal-400 mb-1">Encrypted HL7</div>
              <div className="w-full flex items-center justify-center">
                <div className={`h-1 w-full rounded-full transition-all duration-700 ${consentGranted ? 'bg-gradient-to-r from-blue-500 via-teal-400 to-teal-400 animate-pulse' : 'bg-red-500/40'}`} />
                <ArrowRight className={`w-5 h-5 -ml-2 ${consentGranted ? 'text-teal-400' : 'text-red-400'}`} />
              </div>
            </div>

            {/* Central Engine Node: MediConnect */}
            <div className="lg:col-span-1 flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-b from-teal-900/60 to-navy-900/90 border border-teal-400/50 shadow-glow-teal relative">
              <div className="w-14 h-14 rounded-2xl teal-gradient-bg flex items-center justify-center text-white mb-3 shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">MediConnect</h4>
              <div className="text-[11px] font-mono text-teal-300 mb-2">Interop Engine</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                consentGranted ? 'bg-teal-400 text-navy-950' : 'bg-red-500 text-white'
              }`}>
                {consentGranted ? 'SYNCED' : 'BLOCKED'}
              </span>
            </div>

            {/* Middle Conduit from Center */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center">
              <div className="text-xs font-mono text-teal-400 mb-1">FHIR Bundle</div>
              <div className="w-full flex items-center justify-center">
                <div className={`h-1 w-full rounded-full transition-all duration-700 ${consentGranted ? 'bg-gradient-to-r from-teal-400 via-teal-400 to-emerald-400 animate-pulse' : 'bg-red-500/40'}`} />
                <ArrowRight className={`w-5 h-5 -ml-2 ${consentGranted ? 'text-teal-400' : 'text-red-400'}`} />
              </div>
            </div>

            {/* Right Nodes: Hospital B and Hospital C */}
            <div className="lg:col-span-2 space-y-4">
              <div
                onClick={() => setActiveHospital('smc')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeHospital === 'smc'
                    ? 'bg-navy-800 border-teal-400 shadow-glow-teal scale-102'
                    : 'bg-navy-950/70 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">HOSPITAL B</span>
                  <span className="text-xs text-navy-400 font-mono">HOSP-SMC</span>
                </div>
                <h5 className="text-sm font-bold text-white">Sunrise Medical Centre</h5>
                <p className="text-xs text-navy-300">Orthopedics & Digital X-Ray</p>
              </div>

              <div
                onClick={() => setActiveHospital('ghh')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeHospital === 'ghh'
                    ? 'bg-navy-800 border-teal-400 shadow-glow-teal scale-102'
                    : 'bg-navy-950/70 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">HOSPITAL C</span>
                  <span className="text-xs text-navy-400 font-mono">HOSP-GHH</span>
                </div>
                <h5 className="text-sm font-bold text-white">Global Health Hospital</h5>
                <p className="text-xs text-navy-300">Pulmonology & Spirometry</p>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-navy-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>
                {consentGranted
                  ? 'Active interoperability stream enabled: Doctors at any authorized hospital see Rahul’s complete cross-hospital history.'
                  : 'Zero-Knowledge Barrier: All cross-hospital queries denied until patient explicitly grants authorization.'}
              </span>
            </div>
            <div className="font-mono text-teal-300 text-xs">
              Protocol: REST / HL7 FHIR R4 JSON
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
