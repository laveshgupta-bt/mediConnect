import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Pill, Building2, Stethoscope, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatientPrescriptions()
      .then(res => setPrescriptions(res.prescriptions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Prescriptions & Regimens</h2>
          <p className="text-xs text-navy-500">Cross-hospital medication history and active dosages.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 border border-teal-200 text-teal-800">
          {prescriptions.length} Regimens
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-navy-400 text-sm">Loading medications...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-navy-100 text-navy-400">
          No prescriptions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl p-5 border border-navy-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-navy-900">{rx.medication_name}</h4>
                    <div className="text-xs font-bold text-teal-600">{rx.dosage}</div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rx.status === 'active' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-navy-50 text-navy-600'
                }`}>
                  {rx.status}
                </span>
              </div>

              <div className="text-xs text-navy-700 bg-surface/70 p-3 rounded-xl border border-navy-50 space-y-1">
                <div><strong>Regimen: </strong>{rx.frequency} • {rx.duration}</div>
                {rx.instructions && <div><strong>Instructions: </strong>{rx.instructions}</div>}
              </div>

              <div className="flex items-center justify-between text-[11px] text-navy-400 pt-1 border-t border-navy-50">
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-navy-400" />
                  <span>{rx.hospital_name}</span>
                </span>
                <span>Dr. {rx.doctor_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
