import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Calendar,
  Building2,
  Stethoscope,
  Filter,
  Search,
  FileText,
  Pill,
  Activity,
  Heart,
  ChevronDown,
  Download,
  AlertCircle
} from 'lucide-react';

export default function PatientMedicalTimeline() {
  const [records, setRecords] = useState([]);
  const [connectedHospitals, setConnectedHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getPatientMedicalHistory({
        hospitalId: selectedHospital,
        recordType: selectedType,
        search: searchTerm
      });
      setRecords(res.records || []);
      setConnectedHospitals(res.connectedHospitals || []);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedHospital, selectedType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-navy-900 tracking-tight">
              My Unified Medical History
            </h2>
            <p className="text-xs text-navy-500">
              Chronological clinical timeline aggregated from all connected healthcare institutions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800">
              {records.length} Verified Encounters
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-navy-100">
          {/* Hospital Filter */}
          <div>
            <label className="block text-[11px] font-bold text-navy-600 uppercase mb-1">
              Filter by Hospital
            </label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold focus:border-teal-500 outline-none"
            >
              <option value="all">All Hospitals (Unified Timeline)</option>
              {connectedHospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Record Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-navy-600 uppercase mb-1">
              Encounter Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold focus:border-teal-500 outline-none"
            >
              <option value="all">All Encounter Types</option>
              <option value="Outpatient Consultation">Outpatient Consultation</option>
              <option value="Emergency Care">Emergency Care</option>
              <option value="Diagnostic Review">Diagnostic Review</option>
              <option value="Inpatient Admission">Inpatient Admission</option>
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[11px] font-bold text-navy-600 uppercase mb-1">
              Search Diagnosis / Doctor
            </label>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 pr-8 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
              />
              <button type="submit" className="absolute right-2.5 top-2 text-navy-400 hover:text-teal-600">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 text-center text-navy-400 text-sm">
          Loading unified medical timeline...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-navy-100">
          <FileText className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-navy-800">No Medical Records Found</h4>
          <p className="text-xs text-navy-400 mt-1">
            Try adjusting your hospital or encounter filters.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-teal-200 ml-4 md:ml-8 pl-6 md:pl-8 space-y-8">
          {records.map((rec) => {
            const isExpanded = expandedRecordId === rec.id;

            return (
              <div key={rec.id} className="relative group">
                {/* Timeline node bullet */}
                <div className="absolute -left-[35px] md:-left-[43px] top-6 w-5 h-5 rounded-full bg-teal-500 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />

                {/* Timeline Record Card */}
                <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-premium hover:shadow-lg transition-all space-y-4">
                  {/* Originating Hospital Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-50 gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-navy-900">{rec.hospital_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-50 text-navy-600">
                            {rec.hospital_code}
                          </span>
                        </div>
                        <div className="text-[11px] text-navy-400">{rec.hospital_city}</div>
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

                  {/* Consultation Title & Doctor */}
                  <div>
                    <h3 className="text-xl font-bold text-navy-900 mb-1">{rec.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-navy-500">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Attending Physician: <strong>{rec.doctor_name}</strong> ({rec.doctor_specialization})</span>
                    </div>
                  </div>

                  {/* Vitals Summary Strip */}
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

                  {/* Diagnosis & Treatment */}
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
                        <span>Prescribed Medications ({rec.prescriptions.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rec.prescriptions.map((rx) => (
                          <div key={rx.id} className="p-2.5 rounded-xl bg-white border border-navy-100 text-xs shadow-xs">
                            <div className="font-bold text-navy-900">{rx.medication_name} ({rx.dosage})</div>
                            <div className="text-[11px] text-teal-700">{rx.frequency} • {rx.duration}</div>
                            {rx.instructions && <div className="text-[10px] text-navy-400 mt-0.5">{rx.instructions}</div>}
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
                        <span>Attached Diagnostic Tests ({rec.labReports.length})</span>
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
                                <span className="text-[10px] text-navy-400 font-mono">Attachment: PDF Report</span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
