import React from 'react';
import {
  Users,
  Clock,
  FilePlus2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function DoctorOverview({ data, onNavigate, onSelectPatient }) {
  if (!data) return null;

  const { doctor, stats = {}, recentConsultations = [], activeConsents = [] } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Doctor Identity Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-blue-300 font-bold text-2xl uppercase shadow-md">
            <Stethoscope className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Dr. {doctor?.user_id ? data.doctor.specialization : 'Physician'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {doctor?.specialization}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-200 mt-1 font-mono">
              <span>Doctor ID: <strong className="text-teal-300">{doctor?.doctor_id}</strong></span>
              <span>License: {doctor?.license_number}</span>
              <span>Facility: <strong className="text-white">{doctor?.hospital_name}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('search')}
          className="px-5 py-3 rounded-xl teal-gradient-bg text-white font-bold text-xs shadow-glow-teal hover:opacity-95 transition-all flex items-center space-x-2 z-10"
        >
          <span>Search & Query Patients</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Decorative glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Doctor Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Patients Accessed</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.patientsAccessed || 0}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">Cross-Hospital Cohort</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Active Consents</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.activeConsentsCount || 0}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">Authorized Patients</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Consultations Added</span>
            <FilePlus2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.totalConsultations || 0}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Encounters Authored</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.pendingRequests || 0}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Awaiting Patient Consent</div>
        </div>
      </div>

      {/* Active Patient Consents List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-50 pb-4">
          <h3 className="text-base font-bold text-navy-900">
            Patients Currently Authorized For Your Care ({activeConsents.length})
          </h3>
          <span className="text-xs text-navy-400 font-mono">Server Enforced</span>
        </div>

        {activeConsents.length === 0 ? (
          <div className="p-8 text-center bg-surface/50 rounded-2xl border border-navy-50 text-xs text-navy-400">
            No active patient consents right now. Use Search Patients to query and request access.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeConsents.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectPatient(c.patient_id)}
                className="p-4 rounded-2xl border border-navy-100 hover:border-teal-400 hover:shadow-md cursor-pointer transition-all bg-surface/30 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-navy-900 group-hover:text-teal-700 transition-colors">
                    {c.patient_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800">
                    {c.patient_code}
                  </span>
                </div>
                <div className="text-xs text-navy-500 mb-3">
                  Valid until: {c.expires_at ? c.expires_at.substring(0, 10) : 'N/A'}
                </div>
                <div className="text-xs font-bold text-teal-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Unified Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Consultations Authoring Feed */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-50 pb-4">
          <h3 className="text-base font-bold text-navy-900">
            Your Recent Consultations Added ({recentConsultations.length})
          </h3>
          <span className="text-xs text-navy-400">Synchronized into Patient Timeline</span>
        </div>

        {recentConsultations.length === 0 ? (
          <div className="p-8 text-center bg-surface/50 rounded-2xl border border-navy-50 text-xs text-navy-400">
            No clinical records authored yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentConsultations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl border border-navy-100 bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-navy-900">{rec.title}</div>
                  <div className="text-navy-500 mt-0.5">
                    Patient: <strong className="text-navy-800">{rec.patient_name}</strong> ({rec.patient_code}) • {rec.encounter_date}
                  </div>
                  <div className="text-navy-600 mt-1 font-medium">Diagnosis: {rec.diagnosis}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {rec.hospital_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
