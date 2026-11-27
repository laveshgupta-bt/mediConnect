import React from 'react';
import { UserPlus, UploadCloud, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Patient Creates Account',
    description: 'The patient registers on MediConnect and receives a cryptographically signed Patient ID (e.g. MC-PAT-7701) and digital emergency health QR code.',
    icon: UserPlus,
    color: 'from-teal-500/10 to-teal-500/20 text-teal-600 border-teal-200'
  },
  {
    step: '02',
    title: 'Hospitals Upload Records',
    description: 'Participating hospitals upload clinical consultation encounters, diagnoses, medications, and laboratory imaging directly to the patient’s profile.',
    icon: UploadCloud,
    color: 'from-blue-500/10 to-blue-500/20 text-blue-600 border-blue-200'
  },
  {
    step: '03',
    title: 'Patient Grants Access',
    description: 'When visiting a new clinic or specialist, the doctor requests permission. The patient approves or sets a strict expiration (e.g. 7 days). Access can be revoked anytime.',
    icon: ShieldCheck,
    color: 'from-indigo-500/10 to-indigo-500/20 text-indigo-600 border-indigo-200'
  },
  {
    step: '04',
    title: 'Doctor Views Unified History',
    description: 'The authorized physician reviews past treatments, medications, and lab reports from all previous hospitals in one seamless chronological clinical timeline.',
    icon: Stethoscope,
    color: 'from-teal-600/10 to-cyan-600/20 text-teal-700 border-teal-300'
  }
];

export default function HowItWorksSection({ onOpenAuth }) {
  return (
    <section id="how-it-works" className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span>Seamless 4-Step Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-800 tracking-tight">
            How MediConnect Works.
          </h2>
          <p className="text-base md:text-lg text-navy-500 leading-relaxed">
            Eliminating fragmented medical records, reducing duplicate diagnostics, and empowering patient-controlled healthcare data portability.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl p-7 border border-navy-100 shadow-premium hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-navy-200 group-hover:text-teal-500 transition-colors">
                    {step.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-navy-50 flex items-center text-xs font-semibold text-teal-600 group-hover:text-teal-700">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
