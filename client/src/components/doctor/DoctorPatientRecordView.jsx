import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Building2,
  Calendar,
  Stethoscope,
  PlusCircle,
  FileText,
  Pill,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Activity,
  Heart,
  Clock,
  Unlock
} from 'lucide-react';
import DoctorAddRecordModal from './DoctorAddRecordModal';

export default function DoctorPatientRecordView({ patientId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPatientRecordsForDoctor(patientId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Access restricted');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [patientId]);

  if (loading) {
    return <div className="p-12 text-center text-navy-400 text-sm">Verifying server-side patient consent and loading records...</div>;
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-10 border-2 border-red-200 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-navy-900">Access Restricted</h3>
        <p className="text-xs text-navy-600 leading-relaxed">{error}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900"
        >
          Return to Patient Search
        </button>
      </div>
    );
  }

  const { patient, consent, hospitalsConnected = [], records = [], allergies = [], prescriptions = [], labReports = [] } = data || {};

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* Top Bar with Back and Add Record CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-navy-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Search</span>
        </button>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl teal-gradient-bg text-white font-bold text-xs shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Clinical Encounter & Rx</span>
        </button>
      </div>

      {/* Patient Header & Consent Ribbon */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-navy-50">
          <div className="flex items-center space-x-4">
            <img
              src={patient?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
              alt={patient?.full_name}
              className="w-16 h-16 rounded-2xl object-cover border border-navy-100"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-navy-900">{patient?.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {patient?.blood_group}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500 font-mono mt-1">
                <span>Patient ID: <strong className="text-teal-700">{patient?.patient_id}</strong></span>
                <span>DOB: {patient?.dob}</span>
                <span>Gender: {patient?.gender}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1 text-left sm:text-right">
            <div className="flex items-center space-x-1 sm:justify-end font-bold text-teal-800">
              <Unlock className="w-3.5 h-3.5 text-teal-600" />
              <span>Active Patient Consent Verified</span>
            </div>
            <div className="text-[11px] text-navy-600 font-mono">
              Access Scope: {consent?.access_level || 'Full Cross-Hospital History'}
            </div>
            <div className="text-[11px] text-navy-500">
              Valid until: {consent?.expires_at ? consent.expires_at.substring(0, 10) : 'Indefinite'}
            </div>
          </div>
        </div>

        {/* Connected Hospitals Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-navy-400 uppercase tracking-wider mr-2">Connected Facilities:</span>
          {hospitalsConnected.map(h => (
            <span key={h.id} className="px-3 py-1 rounded-xl bg-navy-50 text-navy-800 text-xs font-bold border border-navy-200 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{h.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Allergies Safety Notice */}
      {allergies.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
          <div className="flex items-center space-x-2 text-red-900 font-bold text-sm mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>CRITICAL CLINICAL NOTICE: Drug Allergies & Contraindications</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergies.map(alg => (
              <div key={alg.id} className="p-3 bg-white rounded-xl border border-red-100">
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

      {/* Unified Medical History Timeline across ALL 3+ Hospitals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">
            Unified Clinical History ({records.length} Encounters Across Connected Hospitals)
          </h3>
          <span className="text-xs text-navy-400 font-mono">Sorted Chronologically</span>
        </div>

        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec.id} className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-4">
              {/* Originating Hospital Badge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-50 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-navy-900">{rec.hospital_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-50 text-navy-600">
                        {rec.hospital_code}
                      </span>
                    </div>
                    <div className="text-xs text-navy-400">{rec.hospital_city}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-navy-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{rec.encounter_date}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {rec.record_type}
                  </span>
                </div>
              </div>

              {/* Consultation Details */}
              <div>
                <h4 className="text-xl font-bold text-navy-900 mb-1">{rec.title}</h4>
                <div className="text-xs text-navy-500 flex items-center space-x-2">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Attending: <strong>{rec.doctor_name}</strong> ({rec.doctor_specialization})</span>
                </div>
              </div>

              {/* Vitals Strip */}
              {rec.vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-surface border border-navy-50 text-xs">
                  {rec.vitals.bloodPressure && (
                    <div>
                      <span className="text-[10px] text-navy-400 uppercase font-semibold">BP</span>
                      <div className="font-bold text-navy-900">{rec.vitals.bloodPressure}</div>
                    </div>
                  )}
                  {rec.vitals.heartRate && (
                    <div>
                      <span className="text-[10px] text-navy-400 uppercase font-semibold">Heart Rate</span>
                      <div className="font-bold text-navy-900">{rec.vitals.heartRate}</div>
                    </div>
                  )}
                  {rec.vitals.spO2 && (
                    <div>
                      <span className="text-[10px] text-navy-400 uppercase font-semibold">SpO2</span>
                      <div className="font-bold text-navy-900">{rec.vitals.spO2}</div>
                    </div>
                  )}
                  {rec.vitals.temp && (
                    <div>
                      <span className="text-[10px] text-navy-400 uppercase font-semibold">Temp</span>
                      <div className="font-bold text-navy-900">{rec.vitals.temp}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis and Treatment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100">
                  <span className="font-bold text-teal-900 block mb-1">Diagnosis & ICD-10 Code:</span>
                  <p className="text-navy-800 font-semibold">{rec.diagnosis} <span className="font-mono text-teal-700">({rec.icd10_code || 'N/A'})</span></p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1">Treatment & Clinical Plan:</span>
                  <p className="text-navy-800">{rec.treatment}</p>
                </div>
              </div>

              {/* Clinical Notes */}
              {rec.clinical_notes && (
                <div className="text-xs text-navy-600 bg-surface/70 p-3 rounded-xl border border-navy-50">
                  <span className="font-bold text-navy-800">Clinical Observations: </span>
                  {rec.clinical_notes}
                </div>
              )}

              {/* Prescriptions Attached */}
              {rec.prescriptions && rec.prescriptions.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-navy-700 uppercase mb-2 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Prescriptions Issued ({rec.prescriptions.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rec.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-2.5 rounded-xl bg-white border border-navy-100 text-xs">
                        <div className="font-bold text-navy-900">{rx.medication_name} ({rx.dosage})</div>
                        <div className="text-[11px] text-teal-700">{rx.frequency} • {rx.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Reports Attached */}
              {rec.labReports && rec.labReports.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-navy-700 uppercase mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diagnostic Test Findings</span>
                  </div>
                  <div className="space-y-2">
                    {rec.labReports.map((lab) => (
                      <div key={lab.id} className="p-3 rounded-xl bg-surface border border-navy-100 text-xs">
                        <div className="flex items-center justify-between font-bold text-navy-900">
                          <span>{lab.test_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lab.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lab.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-navy-600 mt-1">{lab.findings_summary}</p>
                        {lab.file_url && (
                          <div className="mt-2 pt-2 border-t border-navy-100 flex items-center justify-between">
                            <span className="text-[10px] text-navy-400 font-mono flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>Clinical PDF Attachment</span>
                            </span>
                            <a
                              href={lab.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors"
                            >
                              <FileText className="w-3 h-3 text-teal-600" />
                              <span>View PDF ↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Record Modal */}
      <DoctorAddRecordModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        patientId={patientId}
        patientName={patient?.full_name}
        onRecordAdded={() => {
          setAddModalOpen(false);
          fetchRecords();
        }}
      />
    </div>
  );
}
