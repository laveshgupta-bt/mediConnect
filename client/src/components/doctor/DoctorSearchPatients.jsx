import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { syncEvent } from '../../services/crossTabSync';
import {
  Search,
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
  Lock,
  Unlock,
  Building2,
  Calendar
} from 'lucide-react';
import EmergencyAccessModal from './EmergencyAccessModal';

export default function DoctorSearchPatients({ onSelectPatient }) {
  const [query, setQuery] = useState('MC-PAT-7701');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestedId, setRequestedId] = useState(null);

  // Request Access Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [purpose, setPurpose] = useState('Routine consultation & comprehensive medication review');
  const [durationDays, setDurationDays] = useState(7);
  const [requestLoading, setRequestLoading] = useState(false);

  // Emergency Modal
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Auto-poll & Cross-Window Real-Time Listener for instant approval sync across tabs
  useEffect(() => {
    const unbind = syncEvent.listen((evt) => {
      if (evt.type === 'REQUEST_APPROVED' || evt.type === 'CONSENT_GRANTED') {
        if (query.trim()) {
          api.searchPatients(query.trim()).then(res => setResults(res.patients || []));
        }
      }
    });

    const hasPending = results.some(p => p.pendingRequest && !p.hasConsent);
    if (!hasPending || !query.trim()) return unbind;

    const interval = setInterval(() => {
      api.searchPatients(query.trim()).then(res => {
        setResults(res.patients || []);
      }).catch(err => {
        // Silent catch for background poll
      });
    }, 2500);

    return () => {
      unbind();
      clearInterval(interval);
    };
  }, [results, query]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.searchPatients(query);
      setResults(res.patients || []);
      if (res.patients.length === 0) {
        setError(`No patient found matching "${query}". Try searching "MC-PAT-7701" or "Rahul".`);
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (patient) => {
    setSelectedPatient(patient);
    setRequestModalOpen(true);
  };

  const openEmergencyModal = (patient) => {
    setSelectedPatient(patient);
    setEmergencyModalOpen(true);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      const res = await api.requestDoctorAccess(selectedPatient.id, purpose, durationDays);
      syncEvent.broadcast('REQUEST_SENT', { patientId: selectedPatient.id });
      alert(res.message);
      setRequestModalOpen(false);
      handleSearch(); // Refresh results to update pending status
    } catch (err) {
      alert('Request error: ' + err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Search Patient Registry
          </h2>
          <p className="text-xs text-navy-500">
            Query patients across participating hospitals using their Unique Patient ID or legal name.
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Patient ID (e.g. MC-PAT-7701) or Name (Rahul Sharma)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-navy-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm font-medium"
            />
            <Search className="w-5 h-5 text-navy-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl teal-gradient-bg text-white font-bold text-sm shadow-glow-teal hover:opacity-95 transition-all shrink-0 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Searching...' : 'Search Patient'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Search Chips */}
        <div className="flex items-center space-x-2 text-xs text-navy-500 pt-1">
          <span className="font-semibold">Demo shortcut:</span>
          <button
            type="button"
            onClick={() => { setQuery('MC-PAT-7701'); }}
            className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-mono hover:bg-teal-100"
          >
            MC-PAT-7701 (Rahul Sharma)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {results.map((patient) => {
          const hasConsent = patient.hasConsent;
          const hasPending = !!patient.pendingRequest;

          return (
            <div
              key={patient.id}
              className={`bg-white rounded-3xl p-6 md:p-8 border-2 shadow-premium transition-all ${
                hasConsent ? 'border-teal-400' : 'border-navy-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Patient Profile Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={patient.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                    alt={patient.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border border-navy-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-navy-900">{patient.full_name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {patient.blood_group}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500 font-mono mt-1">
                      <span>Patient ID: <strong className="text-navy-900">{patient.patient_id}</strong></span>
                      <span>DOB: {patient.dob}</span>
                      <span>Gender: {patient.gender}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-navy-500 mt-2">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Connected Hospitals: <strong>{patient.connectedHospitalsCount}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Medical Records: <strong>{patient.totalRecordsCount}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consent Status & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {hasConsent ? (
                    <div className="space-y-2 text-right">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        <Unlock className="w-3.5 h-3.5 text-teal-600" />
                        <span>Access Authorized</span>
                      </div>
                      <button
                        onClick={() => onSelectPatient(patient.id)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl teal-gradient-bg text-white font-bold text-xs shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Medical History</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-start sm:justify-end space-x-1.5 text-xs text-amber-700 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {hasPending ? 'Consent Request Pending Authorization' : 'Access Restricted: Consent Required'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasPending ? (
                          <div className="flex flex-col sm:items-end gap-1">
                            <span className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border-2 border-amber-300 text-xs font-bold flex items-center space-x-1.5 shadow-sm animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Request Sent — Awaiting Patient Approval</span>
                            </span>
                            <span className="text-[10px] text-teal-700 font-semibold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                              <span>Live sync active: Unlocks automatically when approved</span>
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openRequestModal(patient)}
                            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Request Patient Consent</span>
                          </button>
                        )}

                        {/* Emergency Break-Glass Button */}
                        <button
                          onClick={() => openEmergencyModal(patient)}
                          className="px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors flex items-center space-x-1"
                          title="Simulate Emergency Break-Glass Override"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Emergency Override</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consent Request Modal */}
      {requestModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-navy-100 p-6 md:p-8 space-y-4">
            <h3 className="text-xl font-bold text-navy-900">
              Request Clinical Access Consent
            </h3>
            <p className="text-xs text-navy-500">
              Submit a formal request to <strong>{selectedPatient.full_name}</strong> ({selectedPatient.patient_id}).
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  Clinical Purpose / Reason *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Routine cardiology follow-up & medication review"
                  className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  Requested Duration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                >
                  <option value={1}>24 Hours (Immediate Consultation)</option>
                  <option value={7}>7 Days (Follow-up Care)</option>
                  <option value={30}>30 Days (Ongoing Treatment)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-navy-100 text-xs font-bold text-navy-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="px-5 py-2 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 disabled:opacity-50"
                >
                  {requestLoading ? 'Submitting...' : 'Send Access Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Override Modal */}
      <EmergencyAccessModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        patient={selectedPatient}
        onSuccess={() => {
          handleSearch();
          if (selectedPatient) onSelectPatient(selectedPatient.id);
        }}
      />
    </div>
  );
}
