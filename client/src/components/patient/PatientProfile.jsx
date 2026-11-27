import React, { useState } from 'react';
import { api } from '../../services/api';
import { User, ShieldCheck, QrCode, Download, Phone, MapPin, Heart, FileText, CheckCircle2 } from 'lucide-react';
import SummaryExportModal from '../common/SummaryExportModal';

export default function PatientProfile({ user, patient, onOpenQr }) {
  const [summaryData, setSummaryData] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const data = await api.getPatientExportSummary();
      setSummaryData(data);
      setExportModalOpen(true);
    } catch (err) {
      alert('Failed to generate export: ' + err.message);
    } finally {
      setLoadingExport(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Patient Profile & Security</h2>
          <p className="text-xs text-navy-500">Manage identity credentials and portable export archives.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenQr}
            className="px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            <span>View QR Card</span>
          </button>

          <button
            onClick={handleExport}
            disabled={loadingExport}
            className="px-4 py-2.5 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{loadingExport ? 'Generating...' : 'Export Health Summary'}</span>
          </button>
        </div>
      </div>

      {/* Demographics Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-navy-900 border-b border-navy-50 pb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-navy-400 font-semibold uppercase">Full Legal Name</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{user?.full_name}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Unique Patient ID</span>
            <div className="font-bold text-sm text-teal-600 font-mono mt-1">{patient.patient_id}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Blood Group</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.blood_group}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Date of Birth</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.dob}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Gender</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.gender}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Email Address</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{user?.email}</div>
          </div>

          <div>
            <span className="text-navy-400 font-semibold uppercase">Phone Number</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{user?.phone || 'Not set'}</div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-navy-400 font-semibold uppercase">Residential Address</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.address || 'Metro Area'}</div>
          </div>
        </div>

        <h3 className="text-base font-bold text-navy-900 border-b border-navy-50 pb-3 pt-4">
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-navy-400 font-semibold uppercase">Contact Name</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.emergency_contact_name || 'N/A'}</div>
          </div>
          <div>
            <span className="text-navy-400 font-semibold uppercase">Relationship</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.emergency_contact_relation || 'N/A'}</div>
          </div>
          <div>
            <span className="text-navy-400 font-semibold uppercase">Phone</span>
            <div className="font-bold text-sm text-navy-900 mt-1">{patient.emergency_contact_phone || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Summary Export Modal */}
      <SummaryExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        summaryData={summaryData}
      />
    </div>
  );
}
