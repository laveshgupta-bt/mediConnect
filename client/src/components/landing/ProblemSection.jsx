import React from 'react';
import { DatabaseZap, Repeat, Clock, AlertTriangle, FileX, ShieldAlert } from 'lucide-react';

const PROBLEMS = [
  {
    icon: DatabaseZap,
    title: 'Disconnected Records',
    tagline: 'Siloed Hospital Databases',
    description: 'Every hospital maintains its own isolated database. When a patient switches facilities, their previous consultations, lab tests, and imaging records are completely invisible to the new doctor.',
    stat: '72%',
    statDesc: 'of doctors report wasted time searching for past records',
    color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200'
  },
  {
    icon: Repeat,
    title: 'Repeated Information',
    tagline: 'Fatiguing Manual Recounts',
    description: 'Patients must repeatedly explain complex past surgeries, drug allergies, and chronic conditions from memory. Critical details are easily missed or misremembered during stressful moments.',
    stat: '4.2x',
    statDesc: 'unnecessary duplicate lab and imaging tests ordered yearly',
    color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200'
  },
  {
    icon: Clock,
    title: 'Delayed Treatment',
    tagline: 'Dangerous Blindspots in Critical Care',
    description: 'Without real-time access to past prescriptions and allergies, emergency clinicians risk prescribing contraindicated drugs or must delay urgent therapies until past medical history is verified.',
    stat: '44%',
    statDesc: 'of adverse drug interactions occur due to incomplete medication history',
    color: 'from-red-500/10 to-rose-500/10 text-red-600 border-red-200'
  }
];

export default function ProblemSection() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>The Healthcare Data Fragmentation Crisis</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-800 tracking-tight">
            Your Medical History Shouldn't Stop at Hospital Doors.
          </h2>
          <p className="text-base md:text-lg text-navy-500 leading-relaxed">
            In modern healthcare, patients cross between general clinics, diagnostic centers, and specialized hospitals. Yet their records remain locked inside proprietary institutional silos.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROBLEMS.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-navy-100 shadow-premium hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prob.color} border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-1">
                    {prob.tagline}
                  </div>
                  <h3 className="text-2xl font-bold text-navy-800 mb-3">
                    {prob.title}
                  </h3>
                  <p className="text-sm text-navy-500 leading-relaxed mb-6">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-navy-100 bg-surface/50 -mx-8 -mb-8 p-6 rounded-b-3xl">
                  <div className="text-2xl font-extrabold text-navy-800">
                    {prob.stat}
                  </div>
                  <div className="text-xs text-navy-400 font-medium">
                    {prob.statDesc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
