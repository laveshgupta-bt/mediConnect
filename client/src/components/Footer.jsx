import React from 'react';
import { Shield, Lock, Activity, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 pt-16 pb-12 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-900">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Medi<span className="text-teal-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-navy-400 max-w-md leading-relaxed">
              MediConnect is a centralized, secure, interoperable healthcare platform that allows patients to maintain their medical history in one place and enables authorized doctors from different hospitals to access that information with patient consent.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>One Patient. One Medical History. Multiple Hospitals.</span>
            </div>
          </div>

          {/* Connected Hospitals in Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Hospitals
            </h4>
            <ul className="space-y-2 text-xs text-navy-400">
              <li>City Care Hospital (Cardiology & Internal)</li>
              <li>Sunrise Medical Centre (Orthopedics)</li>
              <li>Global Health Hospital (Pulmonology & Care)</li>
              <li>Metropolitan Medical (Emergency)</li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Architecture Standards
            </h4>
            <ul className="space-y-2 text-xs text-navy-400">
              <li>HL7 FHIR R4-Inspired Schemas</li>
              <li>Role-Based Access Control (RBAC)</li>
              <li>Full Cryptographic Audit Trail</li>
              <li>Time-Bound Patient Consent Management</li>
              <li>Zero-Knowledge Medical Data Siloing</li>
            </ul>
          </div>
        </div>

        {/* Prototype Disclaimer Banner as required by Section 10 */}
        <div className="mt-8 p-4 rounded-2xl bg-navy-900/60 border border-navy-800 text-xs text-navy-400 leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Demonstration Prototype Notice: </span>
              This system uses synthetic fictional patient data for demonstration of healthcare interoperability concepts. Not approved for clinical diagnostics or real patient treatment.
            </div>
          </div>
          <div className="text-xs text-navy-500 font-mono shrink-0">
            v2.4.0 (2026 Build)
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-500">
          <div>© 2026 MediConnect Health Interoperability Platform. All rights reserved.</div>
          <div className="mt-2 sm:mt-0">Designed for seamless cross-hospital care continuity.</div>
        </div>
      </div>
    </footer>
  );
}
