import React from 'react';
import {
  Layers,
  Share2,
  ShieldCheck,
  FolderLock,
  Stethoscope,
  Clock,
  History,
  Building2,
  CheckCircle2
} from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Unified Medical History',
    description: 'Consolidate clinical diagnoses, past surgical procedures, blood panels, and vital trends from every visiting clinic into one patient profile.',
    badge: 'Core Platform'
  },
  {
    icon: Share2,
    title: 'Cross-Hospital Sharing',
    description: 'Break data silos between independent healthcare providers. Encrypted record exchange happens in real-time under HL7 FHIR-inspired standards.',
    badge: 'Interoperability'
  },
  {
    icon: ShieldCheck,
    title: 'Patient Consent Engine',
    description: 'Patients hold the keys. Approve or deny doctor requests, enforce timed expiration (24h, 7d, 30d), or revoke access with one tap.',
    badge: 'Patient Control'
  },
  {
    icon: FolderLock,
    title: 'Secure Document Storage',
    description: 'Upload and store high-resolution laboratory PDFs, radiography X-rays, and prescription slips with strict server-side validation.',
    badge: 'HIPAA Inspired'
  },
  {
    icon: Stethoscope,
    title: 'Doctor Clinical Dashboard',
    description: 'A purpose-built interface for physicians: search patients by ID, submit consent requests, record consultations, and write digital prescriptions.',
    badge: 'Clinician Focused'
  },
  {
    icon: Clock,
    title: 'Interactive Medical Timeline',
    description: 'Filter complex health records chronologically by originating hospital, date range, or encounter type (outpatient, inpatient, emergency).',
    badge: 'Analytics'
  },
  {
    icon: History,
    title: 'Comprehensive Access History',
    description: 'Immutable audit logs track every search, consent grant, record view, and consultation entry with doctor identity, hospital, and timestamp.',
    badge: 'Audit & Compliance'
  },
  {
    icon: Building2,
    title: 'Hospital Management Hub',
    description: 'Healthcare facilities manage affiliated medical practitioners, oversee uploaded encounters, and track facility-wide interoperability statistics.',
    badge: 'Facility Portal'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-surface via-white to-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span>Enterprise Healthcare Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-800 tracking-tight">
            Engineered for Clinicians & Patients Alike.
          </h2>
          <p className="text-base md:text-lg text-navy-500 leading-relaxed">
            Every feature is designed to reduce medical errors, prevent duplicate testing, and ensure high-fidelity continuity of care across all provider networks.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl p-7 border border-navy-100 shadow-premium hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-navy-50 text-navy-600 border border-navy-100">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-navy-800 mb-2 group-hover:text-teal-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-navy-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-navy-50 flex items-center space-x-1.5 text-xs text-navy-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  <span>Fully Functional in Demo</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
