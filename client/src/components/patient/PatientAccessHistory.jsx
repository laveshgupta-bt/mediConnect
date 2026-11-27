import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, ShieldCheck, AlertTriangle, Eye, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PatientAccessHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatientAccessHistory()
      .then(res => setHistory(res.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Access History & Audit Logs</h2>
          <p className="text-xs text-navy-500">
            Immutable compliance record of every doctor, hospital, and timestamp that queried your health record.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 border border-teal-200 text-teal-800">
          {history.length} Audit Events
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-navy-400 text-sm">Loading security audit trail...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-navy-100 text-navy-400">
          No access events recorded.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-navy-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-navy-100 text-navy-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Actor / Physician</th>
                  <th className="py-3 px-6">Hospital Facility</th>
                  <th className="py-3 px-6">Action Performed</th>
                  <th className="py-3 px-6">Details / Clinical Scope</th>
                  <th className="py-3 px-6 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6 text-navy-500 font-mono whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-4 px-6 font-bold text-navy-900">
                      <div>{log.actor_name || 'System / Patient'}</div>
                      <div className="text-[10px] text-navy-400 font-normal uppercase">{log.actor_role}</div>
                    </td>
                    <td className="py-4 px-6 text-navy-700">
                      {log.hospital_name || 'MediConnect Core Gateway'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-100 text-navy-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-navy-600 max-w-xs">
                      {log.details}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                        log.status === 'WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
