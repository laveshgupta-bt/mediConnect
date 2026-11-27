import React from 'react';
import {
  Activity,
  Building2,
  FileText,
  Pill,
  ShieldCheck,
  AlertCircle,
  QrCode,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';

export default function PatientOverview({ data, onNavigate, onOpenQr }) {
  if (!data) return null;

  const { patient, stats = {}, allergies = [], recentRecords = [], recentLabs = [] } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Patient Identity Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <img
            src={patient.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
            alt={patient.full_name}
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">{patient.full_name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-400 text-navy-950">
                {patient.blood_group}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-200 mt-1 font-mono">
              <span>Patient ID: <strong className="text-teal-300">{patient.patient_id}</strong></span>
              <span>DOB: {patient.dob}</span>
              <span>Gender: {patient.gender}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={onOpenQr}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4 text-teal-300" />
            <span>Digital QR ID</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-teal-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Total Records</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.totalRecords || 0}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">Unified EHR Items</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Hospital Visits</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.hospitalVisits || 0}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">Distinct Facilities</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Active Prescriptions</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.activePrescriptions || 0}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Cross-Hospital Rx</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Active Consents</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.activeConsents || 0}</div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">Authorized Doctors</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-400">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats.pendingRequests || 0}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {stats.pendingRequests > 0 ? (
              <button
                onClick={() => onNavigate('access')}
                className="underline font-bold text-amber-800"
              >
                Review Requests ➔
              </button>
            ) : (
              'All Caught Up'
            )}
          </div>
        </div>
      </div>

      {/* Allergies Alert Banner */}
      {allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center space-x-2 text-red-800 font-bold text-sm mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>CRITICAL CLINICAL SAFETY: Known Drug Allergies</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergies.map(alg => (
              <div key={alg.id} className="p-3 bg-white rounded-xl border border-red-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-red-900">{alg.allergen}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                    {alg.severity}
                  </span>
                </div>
                <div className="text-xs text-navy-600 mt-1">Reaction: {alg.reaction}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Consultations & Recent Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Consultations */}
        <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Recent Medical Consultations</h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1"
              >
                <span>View All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentRecords.map(rec => (
                <div key={rec.id} className="p-4 rounded-xl border border-navy-100 bg-surface/50 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy-900">{rec.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {rec.hospital_name}
                    </span>
                  </div>
                  <div className="text-xs text-navy-500 mb-2">
                    {rec.encounter_date} • {rec.doctor_name} ({rec.doctor_specialization})
                  </div>
                  <div className="text-xs text-navy-700 bg-white p-2 rounded-lg border border-navy-50">
                    <strong>Diagnosis: </strong>{rec.diagnosis}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Lab Reports */}
        <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Recent Lab & Diagnostic Reports</h3>
              <button
                onClick={() => onNavigate('labs')}
                className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1"
              >
                <span>All Lab Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentLabs.map(lab => (
                <div key={lab.id} className="p-4 rounded-xl border border-navy-100 bg-surface/50 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy-900">{lab.test_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      lab.status === 'Normal' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                  <div className="text-xs text-navy-500 mb-2">
                    {lab.test_date} • {lab.hospital_name} • {lab.category}
                  </div>
                  <div className="text-xs text-navy-600 line-clamp-2">
                    {lab.findings_summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
