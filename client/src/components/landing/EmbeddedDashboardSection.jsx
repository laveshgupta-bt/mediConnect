import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { syncEvent } from '../../services/crossTabSync';
import {
  LayoutDashboard,
  Clock,
  Pill,
  FileText,
  ShieldCheck,
  History,
  User,
  Search,
  PlusCircle,
  Eye,
  RefreshCw,
  Stethoscope,
  Building2,
  Lock,
  Unlock,
  AlertTriangle,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell
} from 'lucide-react';

import PatientOverview from '../patient/PatientOverview';
import PatientMedicalTimeline from '../patient/PatientMedicalTimeline';
import PatientPrescriptions from '../patient/PatientPrescriptions';
import PatientLabReports from '../patient/PatientLabReports';
import PatientManageAccess from '../patient/PatientManageAccess';
import PatientAccessHistory from '../patient/PatientAccessHistory';
import PatientProfile from '../patient/PatientProfile';
import QRCodeModal from '../patient/QRCodeModal';

import DoctorOverview from '../doctor/DoctorOverview';
import DoctorSearchPatients from '../doctor/DoctorSearchPatients';
import DoctorPatientRecordView from '../doctor/DoctorPatientRecordView';
import DoctorAccessHistory from '../doctor/DoctorAccessHistory';
import DoctorAddRecordModal from '../doctor/DoctorAddRecordModal';

import WalkthroughSection from './WalkthroughSection';

export default function EmbeddedDashboardSection() {
  const { user, patient, doctor } = useAuth();
  const [show3DCorridor, setShow3DCorridor] = useState(false);

  // Patient states
  const [patientTab, setPatientTab] = useState('history'); // Default directly to medical history as requested!
  const [patientDashboardData, setPatientDashboardData] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [quickDuration, setQuickDuration] = useState(7);
  const [actionNotice, setActionNotice] = useState(null);

  // Doctor states
  const [doctorTab, setDoctorTab] = useState('search'); // Default to search/fill records
  const [doctorDashboardData, setDoctorDashboardData] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load patient data if logged in as patient
  const loadPatientData = async (silent = false) => {
    if (!user || user.role !== 'patient') return;
    if (!silent) setLoading(true);
    try {
      const data = await api.getPatientDashboard();
      setPatientDashboardData(data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load doctor data if logged in as doctor
  const loadDoctorData = async (silent = false) => {
    if (!user || user.role !== 'doctor') return;
    if (!silent) setLoading(true);
    try {
      const data = await api.getDoctorDashboard();
      setDoctorDashboardData(data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Live real-time polling and multi-window sync across tabs
  useEffect(() => {
    const unbind = syncEvent.listen((evt) => {
      if (user?.role === 'patient' && evt.type === 'REQUEST_SENT') {
        loadPatientData(true);
      } else if (user?.role === 'doctor' && (evt.type === 'REQUEST_APPROVED' || evt.type === 'CONSENT_GRANTED')) {
        loadDoctorData(true);
      }
    });

    if (user?.role === 'patient') {
      loadPatientData();
      const interval = setInterval(() => {
        loadPatientData(true);
      }, 2000);
      return () => {
        unbind();
        clearInterval(interval);
      };
    } else if (user?.role === 'doctor') {
      loadDoctorData();
      const interval = setInterval(() => {
        loadDoctorData(true);
      }, 3000);
      return () => {
        unbind();
        clearInterval(interval);
      };
    }

    return unbind;
  }, [user]);

  // Quick 1-click Approval from top banner
  const handleQuickApprove = async (requestId, doctorName) => {
    setActionLoading(true);
    try {
      const res = await api.approveAccessRequest(requestId, quickDuration);
      syncEvent.broadcast('REQUEST_APPROVED', { requestId, doctorName });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setActionNotice({
        type: 'success',
        text: `✓ Sovereign Consent Granted to ${doctorName}! Access authorized across all hospitals for ${quickDuration} days.`
      });
      await loadPatientData(true);
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick 1-click Reject from top banner
  const handleQuickReject = async (requestId, doctorName) => {
    if (!window.confirm(`Decline access request from ${doctorName}?`)) return;
    setActionLoading(true);
    try {
      const res = await api.rejectAccessRequest(requestId, 'Declined by patient');
      syncEvent.broadcast('REQUEST_REJECTED', { requestId, doctorName });
      setActionNotice({
        type: 'warning',
        text: `Declined access request from ${doctorName}.`
      });
      await loadPatientData(true);
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // If user explicitly wants to view the 3D corridor, or if user is NOT logged in:
  if (!user || show3DCorridor) {
    return (
      <div className="relative">
        {user && (
          <div className="sticky top-20 z-30 bg-navy-900/90 text-white p-3 px-6 border-b border-teal-500/30 flex items-center justify-between backdrop-blur-md">
            <span className="text-xs text-navy-200">
              Viewing 3D Corridor Experience as <strong>{user.full_name}</strong>
            </span>
            <button
              onClick={() => setShow3DCorridor(false)}
              className="px-4 py-1.5 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 transition-all flex items-center space-x-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Return to {user.role === 'doctor' ? 'Doctor Console' : 'Patient Dashboard'}</span>
            </button>
          </div>
        )}
        <WalkthroughSection />
      </div>
    );
  }

  // ==========================================
  // PATIENT EMBEDDED DASHBOARD (Section in place of 3D corridor)
  // ==========================================
  if (user.role === 'patient') {
    return (
      <section id="dashboard-section" className="py-16 md:py-24 bg-[#F7FAFC] border-t-2 border-teal-500/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Top Section Header & View Toggle */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-premium mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-black text-navy-900 tracking-tight">
                    Patient Dashboard — {user.full_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {patient?.blood_group || 'O+'}
                  </span>
                </div>
                <div className="text-xs text-navy-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-mono">
                  <span>Unique Patient ID: <strong className="text-teal-700">{patient?.patient_id || 'MC-PAT-7701'}</strong></span>
                  <span>•</span>
                  <span>Connected Facilities: <strong>3 Hospitals</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors flex items-center space-x-1.5"
              >
                <QrCode className="w-4 h-4 text-teal-600" />
                <span>My Emergency QR ID</span>
              </button>

              <button
                onClick={() => setShow3DCorridor(true)}
                className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>View 3D Corridor</span>
              </button>
            </div>
          </div>

          {/* Action Notice Toast */}
          {actionNotice && (
            <div className={`p-4 rounded-2xl mb-6 text-xs font-bold border flex items-center justify-between shadow-sm animate-fade-in ${
              actionNotice.type === 'success' ? 'bg-teal-50 border-teal-300 text-teal-900' :
              actionNotice.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900' :
              'bg-red-50 border-red-300 text-red-900'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{actionNotice.text}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="text-xs font-semibold underline hover:opacity-80 ml-4">
                Dismiss
              </button>
            </div>
          )}

          {/* 🚨 UNMISSABLE HIGH-PRIORITY ACTION REQUIRED BANNER FOR INCOMING REQUESTS */}
          {patientDashboardData?.pendingRequestsList?.length > 0 && (
            <div className="mb-8 rounded-3xl p-6 md:p-7 bg-gradient-to-r from-amber-50/95 via-white to-teal-50/90 border-2 border-amber-400 shadow-xl relative overflow-hidden animate-fade-in">
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white flex items-center space-x-1.5 shadow-sm animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <Bell className="w-3.5 h-3.5" />
                      <span>ACTION REQUIRED: {patientDashboardData.pendingRequestsList.length} INCOMING DOCTOR ACCESS REQUEST</span>
                    </span>
                    <span className="text-xs font-semibold text-amber-900 hidden sm:inline">
                      A visiting physician is requesting consent to view your medical history
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-navy-500">
                    Live Real-Time Sync Active
                  </span>
                </div>

                <div className="space-y-3">
                  {patientDashboardData.pendingRequestsList.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-teal-400"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl teal-gradient-bg text-white flex items-center justify-center shrink-0 shadow-glow-teal font-bold">
                          <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-black text-navy-900">{req.doctor_name}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                              {req.doctor_specialization || 'Medical Specialist'}
                            </span>
                            <span className="text-xs text-navy-400 font-mono bg-navy-50 px-2 py-0.5 rounded">
                              Lic: {req.doctor_license || 'Verified'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-navy-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center space-x-1 text-teal-800 font-extrabold">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{req.hospital_name}</span>
                            </span>
                            <span>•</span>
                            <span>City: <strong>{req.hospital_city}</strong></span>
                            <span>•</span>
                            <span className="text-navy-400">
                              Requested: {(() => {
                                try {
                                  const d = new Date(req.requested_at ? req.requested_at.replace(' ', 'T') : Date.now());
                                  return isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch (e) {
                                  return 'Recently';
                                }
                              })()}
                            </span>
                          </div>
                          <div className="mt-2.5 text-xs text-navy-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                            <span className="font-extrabold text-amber-950 uppercase tracking-wider text-[10px] mr-1">
                              Clinical Purpose:
                            </span>
                            <span className="font-medium">"{req.purpose || 'Reviewing patient medical history for clinical care and diagnostic continuity'}"</span>
                          </div>
                        </div>
                      </div>

                      {/* Direct 1-Click Action Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-amber-100">
                        <div className="flex flex-col text-[11px] font-bold text-navy-600">
                          <label className="text-[10px] font-extrabold text-navy-400 uppercase mb-1">
                            Validity Period
                          </label>
                          <select
                            value={quickDuration}
                            onChange={(e) => setQuickDuration(Number(e.target.value))}
                            className="px-3 py-2 rounded-xl border-2 border-navy-200 text-xs font-bold bg-white text-navy-900 outline-none focus:border-teal-500 shadow-sm"
                          >
                            <option value={1}>24 Hours</option>
                            <option value={7}>7 Days (Standard)</option>
                            <option value={30}>30 Days</option>
                            <option value={90}>90 Days</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleQuickApprove(req.id, req.doctor_name)}
                          disabled={actionLoading}
                          className="px-6 py-3 rounded-xl teal-gradient-bg text-white font-black text-xs shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 group hover:scale-[1.02]"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>Approve Access ({quickDuration} Days) ✓</span>
                        </button>

                        <button
                          onClick={() => handleQuickReject(req.id, req.doctor_name)}
                          disabled={actionLoading}
                          className="px-4 py-3 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs border border-red-300 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Navigation Pills for Patient */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-navy-100 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setPatientTab('history')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'history'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Medical History (All Hospitals)</span>
            </button>

            <button
              onClick={() => setPatientTab('overview')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'overview'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Vitals</span>
            </button>

            <button
              onClick={() => setPatientTab('access')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'access'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Manage Doctor Access</span>
              {patientDashboardData?.pendingRequestsList?.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-bounce shadow-sm flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{patientDashboardData.pendingRequestsList.length} ACTION REQUIRED</span>
                </span>
              ) : patientDashboardData?.stats?.pendingRequests > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-navy-950 font-bold animate-pulse">
                  {patientDashboardData.stats.pendingRequests}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setPatientTab('prescriptions')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'prescriptions'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Prescriptions</span>
            </button>

            <button
              onClick={() => setPatientTab('labs')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'labs'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Lab Reports</span>
            </button>

            <button
              onClick={() => setPatientTab('audit')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'audit'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Access History (Audit Log)</span>
            </button>

            <button
              onClick={() => setPatientTab('profile')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                patientTab === 'profile'
                  ? 'teal-gradient-bg text-white shadow-glow-teal'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & PDF Export</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="transition-all">
            {patientTab === 'history' && <PatientMedicalTimeline />}
            {patientTab === 'overview' && (
              <PatientOverview
                data={patientDashboardData}
                onNavigate={setPatientTab}
                onOpenQr={() => setQrModalOpen(true)}
              />
            )}
            {patientTab === 'access' && <PatientManageAccess />}
            {patientTab === 'prescriptions' && <PatientPrescriptions />}
            {patientTab === 'labs' && <PatientLabReports />}
            {patientTab === 'audit' && <PatientAccessHistory />}
            {patientTab === 'profile' && (
              <PatientProfile
                user={user}
                patient={patient}
                onOpenQr={() => setQrModalOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Emergency QR Modal */}
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          patient={patient}
          user={user}
        />
      </section>
    );
  }

  // ==========================================
  // DOCTOR EMBEDDED DASHBOARD (Section in place of 3D corridor)
  // With Extra Privileges: Search Patients, Request Consent, Fill Diseases/Prescriptions, Break-Glass
  // ==========================================
  if (user.role === 'doctor') {
    return (
      <section id="dashboard-section" className="py-16 md:py-24 bg-[#F0F4F8] border-t-2 border-blue-500/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Doctor Header Banner with Privileges Badge */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-premium mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-black text-navy-900 tracking-tight">
                    Doctor Console — {user.full_name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {doctor?.specialization || 'Clinician'}
                  </span>
                </div>
                <div className="text-xs text-navy-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-mono">
                  <span>Facility: <strong className="text-navy-900">{doctor?.hospital_name || 'Metropolitan Medical'}</strong></span>
                  <span>•</span>
                  <span>Doctor ID: <strong className="text-blue-700">{doctor?.doctor_id}</strong></span>
                </div>
              </div>
            </div>

            {/* Doctor Extra Privileges Banner */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Doctor Privileges Active: Patient Record Query & Prescription Authoring</span>
              </div>

              <button
                onClick={() => setShow3DCorridor(true)}
                className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>View 3D Corridor</span>
              </button>
            </div>
          </div>

          {/* Interactive Navigation Pills for Doctor */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-navy-200 text-xs font-bold scrollbar-none">
            <button
              onClick={() => { setDoctorTab('search'); setSelectedPatientId(null); }}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                doctorTab === 'search' && !selectedPatientId
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Patient & Request Consent</span>
            </button>

            {selectedPatientId && (
              <button
                onClick={() => setDoctorTab('records')}
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                  doctorTab === 'records'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Patient Medical History (Consent Verified)</span>
              </button>
            )}

            <button
              onClick={() => setDoctorTab('overview')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                doctorTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Doctor Overview & Cohorts</span>
            </button>

            <button
              onClick={() => setDoctorTab('audit')}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
                doctorTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Clinical Access Audit Trail</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="transition-all">
            {doctorTab === 'search' && !selectedPatientId && (
              <DoctorSearchPatients
                onSelectPatient={(pId) => {
                  setSelectedPatientId(pId);
                  setDoctorTab('records');
                }}
              />
            )}

            {doctorTab === 'records' && selectedPatientId && (
              <DoctorPatientRecordView
                patientId={selectedPatientId}
                onBack={() => {
                  setSelectedPatientId(null);
                  setDoctorTab('search');
                }}
              />
            )}

            {doctorTab === 'overview' && (
              <DoctorOverview
                data={doctorDashboardData}
                onNavigate={setDoctorTab}
                onSelectPatient={(pId) => {
                  setSelectedPatientId(pId);
                  setDoctorTab('records');
                }}
              />
            )}

            {doctorTab === 'audit' && <DoctorAccessHistory />}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
