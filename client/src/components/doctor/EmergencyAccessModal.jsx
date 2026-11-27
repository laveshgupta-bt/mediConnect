import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Lock, X } from 'lucide-react';
import { api } from '../../services/api';

export default function EmergencyAccessModal({ isOpen, onClose, patient, onSuccess }) {
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  const handleEmergencyOverride = async (e) => {
    e.preventDefault();
    if (justification.trim().length < 15) {
      setError('Clinical justification must be at least 15 characters describing the medical emergency.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.emergencyAccess(patient.id, justification);
      alert(res.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Emergency override failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-red-300 overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-red-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-100 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span>High-Priority Compliance Warning</span>
          </div>
          <h3 className="text-xl font-black">
            Emergency Break-Glass Override
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Mandatory audit logging active. Use strictly in acute life-threatening emergencies.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleEmergencyOverride} className="p-6 md:p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Target Patient: {patient.full_name} ({patient.patient_id})</span>
            </div>
            <p className="text-navy-700">
              Activating Break-Glass grants temporary 24-hour access to the patient's full medical history without patient pre-approval. An unalterable audit incident will be recorded with your physician ID and hospital license.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-800 mb-1">
              Mandatory Clinical Emergency Justification *
            </label>
            <textarea
              required
              rows={4}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Unconscious patient brought to ER with severe anaphylaxis and acute respiratory distress. Immediate verification of drug allergies and current cardiovascular prescriptions required."
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-xs leading-relaxed"
            />
            <span className="text-[11px] text-navy-400 mt-1 block">
              Minimum 15 characters required for legal and clinical compliance.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-navy-100 text-navy-700 font-bold text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging & Activating...' : 'Execute Break-Glass Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
