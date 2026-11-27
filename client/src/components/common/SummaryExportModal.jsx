import React from 'react';
import { X, Printer, Download, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export default function SummaryExportModal({ isOpen, onClose, summaryData }) {
  if (!isOpen || !summaryData) return null;

  const { patient, records = [], prescriptions = [], allergies = [], labReports = [] } = summaryData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-navy-100 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-navy-100 flex items-center justify-between bg-surface rounded-t-3xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-navy-800">
              Verified Medical History Export Summary
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-navy-200 text-navy-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-navy-800 print:p-0">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-navy-800 gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight text-navy-900">
                Medi<span className="text-teal-600">Connect</span>
              </div>
              <div className="text-xs uppercase font-mono tracking-wider text-navy-500">
                National Healthcare Interoperability Network
              </div>
            </div>
            <div className="text-right font-mono text-xs text-navy-500">
              <div>Document ID: MC-EXP-{Date.now().toString().slice(-6)}</div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>Status: Verified by Cryptographic Ledger</div>
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface border border-navy-100 text-xs">
            <div>
              <div className="text-navy-400 font-semibold uppercase">Patient Name</div>
              <div className="font-bold text-sm text-navy-900 mt-0.5">{patient?.full_name}</div>
            </div>
            <div>
              <div className="text-navy-400 font-semibold uppercase">Unique Patient ID</div>
              <div className="font-bold text-sm text-teal-600 font-mono mt-0.5">{patient?.patient_id}</div>
            </div>
            <div>
              <div className="text-navy-400 font-semibold uppercase">Blood Group & Gender</div>
              <div className="font-bold text-sm text-navy-900 mt-0.5">{patient?.blood_group} ({patient?.gender})</div>
            </div>
            <div>
              <div className="text-navy-400 font-semibold uppercase">Date of Birth</div>
              <div className="font-bold text-sm text-navy-900 mt-0.5">{patient?.dob}</div>
            </div>
          </div>

          {/* Allergies Alert */}
          {allergies.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-700 uppercase mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Known Critical Allergies & Adverse Reactions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {allergies.map((a, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border border-red-100">
                    <span className="font-bold text-red-800">{a.allergen}</span> ({a.severity}) — <span className="text-navy-600">{a.reaction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Encounters across Connected Hospitals */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-navy-700 mb-3 border-b border-navy-100 pb-1">
              Cross-Hospital Clinical Encounters ({records.length})
            </h4>
            <div className="space-y-4">
              {records.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-navy-100 bg-white shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-navy-900">{r.title}</div>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
                      {r.hospital_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-navy-500 font-medium">
                    <span>Date: {r.encounter_date}</span>
                    <span>Physician: {r.doctor_name} ({r.doctor_specialization})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-navy-50">
                    <div>
                      <span className="font-semibold text-navy-700">Diagnosis (ICD-10): </span>
                      <span>{r.diagnosis} ({r.icd10_code || 'N/A'})</span>
                    </div>
                    <div>
                      <span className="font-semibold text-navy-700">Treatment Plan: </span>
                      <span>{r.treatment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Prescriptions */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-navy-700 mb-3 border-b border-navy-100 pb-1">
              Active Prescriptions & Regimen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {prescriptions.map((p, i) => (
                <div key={i} className="p-3 rounded-xl border border-navy-100 bg-surface">
                  <div className="font-bold text-navy-900">{p.medication_name} {p.dosage}</div>
                  <div className="text-teal-700 font-medium mt-0.5">{p.frequency} • {p.duration}</div>
                  <div className="text-navy-400 mt-1">Prescribed at: {p.hospital_name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-navy-100 text-[11px] text-navy-400 flex items-center justify-between">
            <span>Official MediConnect Demonstration Export • Verified Interoperable FHIR Record</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
