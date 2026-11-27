import React from 'react';
import { User, Stethoscope, ArrowRight, ShieldCheck, Check, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginSelectionSection({ onSelectRole, onQuickDemo }) {
  const { quickDemoLogin } = useAuth();

  const handleQuickDemo = async (type) => {
    try {
      await quickDemoLogin(type);
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  return (
    <section id="login-selection" className="py-24 bg-gradient-to-b from-[#F7FAFC] via-[#F0F4F8] to-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-100/50 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Role-Based Portal Access</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy-800 tracking-tight">
            Welcome to Connected Healthcare
          </h2>
          <p className="text-base md:text-lg text-navy-500 leading-relaxed">
            Choose how you want to access MediConnect. Each role provides specialized, cryptographically secured clinical or personal features.
          </p>
        </div>

        {/* 2 Large Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* PATIENT LOGIN CARD */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-navy-100 shadow-premium hover:shadow-2xl hover:border-teal-400 transition-all duration-300 flex flex-col justify-between group">
            <div>
              {/* Header Badge & Illustration */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  Patient Portal
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-navy-800 mb-2">
                Patient Access
              </h3>
              <p className="text-sm text-navy-500 mb-6">
                Take complete ownership of your health records across all visiting hospitals.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-3 mb-8">
                {[
                  'View unified personal medical history across all hospitals',
                  'Manage diagnostic lab reports & imaging PDFs',
                  'Grant, set expiration, or instantly revoke doctor access',
                  'View comprehensive access history & compliance audit logs',
                  'Download verified clinical health summary (PDF export)'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs md:text-sm text-navy-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <div className="space-y-3 pt-6 border-t border-navy-100">
              <button
                onClick={() => onSelectRole('patient')}
                className="w-full py-4 px-6 rounded-xl teal-gradient-bg text-white font-bold text-base shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-2 group-hover:translate-y-[-1px]"
              >
                <span>Continue as Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-center text-xs text-navy-400">
                New to MediConnect? Sign up in 60 seconds
              </div>
            </div>
          </div>

          {/* DOCTOR LOGIN CARD */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-navy-100 shadow-premium hover:shadow-2xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group">
            <div>
              {/* Header Badge & Illustration */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  Doctor & Clinic Portal
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-navy-800 mb-2">
                Doctor Access
              </h3>
              <p className="text-sm text-navy-500 mb-6">
                Deliver faster, safer care with verified cross-hospital patient medical context.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-3 mb-8">
                {[
                  'Search patients securely using unique Patient ID',
                  'View authorized cross-hospital medical history & allergies',
                  'Request patient consent with specific clinical purpose',
                  'Record new consultations, ICD-10 diagnoses & vitals',
                  'Issue digital prescriptions and upload diagnostic reports'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs md:text-sm text-navy-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <div className="space-y-3 pt-6 border-t border-navy-100">
              <button
                onClick={() => onSelectRole('doctor')}
                className="w-full py-4 px-6 rounded-xl navy-gradient-bg text-white font-bold text-base shadow-premium hover:opacity-95 transition-all flex items-center justify-center space-x-2 group-hover:translate-y-[-1px]"
              >
                <span>Continue as Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-center text-xs text-navy-400">
                Hospital credentialed practitioners only
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Scenario Quick-Start Box */}
        <div className="max-w-4xl mx-auto glass-panel p-6 md:p-8 rounded-3xl border border-teal-200 shadow-xl bg-white/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Live Demonstration Evaluation Scenario
                </span>
              </div>
              <h4 className="text-lg font-bold text-navy-800 mt-1">
                Experience the Full Cross-Hospital Record Sharing Flow
              </h4>
              <p className="text-xs text-navy-500">
                Instantly launch pre-configured accounts without manual typing:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickDemo('patient')}
              className="p-3.5 rounded-xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100/80 text-left transition-all group"
            >
              <div className="text-xs font-bold text-teal-900 flex items-center justify-between">
                <span>Rahul Sharma (Patient)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-[11px] text-teal-700 mt-1">
                ID: MC-PAT-7701 (Records from 3 hospitals)
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('doctor_visiting')}
              className="p-3.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all group"
            >
              <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                <span>Dr. Rajesh Kumar (Demo Doctor)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-[11px] text-blue-700 mt-1">
                Metropolitan Medical (Requests Rahul's consent)
              </div>
            </button>

            <button
              onClick={() => handleQuickDemo('doctor_cardio')}
              className="p-3.5 rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100/80 text-left transition-all group"
            >
              <div className="text-xs font-bold text-navy-900 flex items-center justify-between">
                <span>Dr. Priya Patel (Cardiologist)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-[11px] text-navy-600 mt-1">
                City Care Hospital (Treating doctor)
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
