import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

export default function PatientManageAccess() {
  const [requests, setRequests] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [durationDays, setDurationDays] = useState(7);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, conRes] = await Promise.all([
        api.getPatientAccessRequests(),
        api.getPatientConsents()
      ]);
      setRequests(reqRes.requests || []);
      setConsents(conRes.consents || []);
    } catch (err) {
      console.error('Error fetching consent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-poll every 2.5s for real-time responsiveness when doctors request access
    const interval = setInterval(() => {
      Promise.all([
        api.getPatientAccessRequests(),
        api.getPatientConsents()
      ]).then(([reqRes, conRes]) => {
        setRequests(reqRes.requests || []);
        setConsents(conRes.consents || []);
      }).catch(err => {
        // Silent catch for background poll
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (requestId, doctorName) => {
    setActionLoading(true);
    try {
      const res = await api.approveAccessRequest(requestId, durationDays);
      setMessage({ type: 'success', text: res.message });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Reason for declining access request (optional):', 'Declined by patient');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await api.rejectAccessRequest(requestId, reason);
      setMessage({ type: 'info', text: res.message });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (consentId, doctorName) => {
    const confirm = window.confirm(`Revoke medical record access for ${doctorName}? Their access will be immediately blocked on the server.`);
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await api.revokeConsent(consentId, 'Revoked by patient via security dashboard');
      setMessage({ type: 'warning', text: res.message });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Cryptographic Patient Consent Manager</span>
          </div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Manage Doctor & Hospital Access
          </h2>
          <p className="text-xs text-navy-500 mt-1">
            You hold total sovereign control over your medical records. No practitioner can access your data without your explicit approval.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-surface hover:bg-navy-100 text-xs font-bold text-navy-700 flex items-center space-x-1.5 transition-colors border border-navy-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between animate-fade-in ${
          message.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' :
          message.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-normal">Dismiss</button>
        </div>
      )}

      {/* PENDING DOCTOR ACCESS REQUESTS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-navy-50 pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-navy-900">
              Pending Access Requests ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs text-navy-400">Requires Your Decision</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-surface/50 rounded-2xl border border-navy-50 text-xs text-navy-400">
            No incoming access requests pending at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-navy-900">{req.doctor_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {req.doctor_specialization}
                      </span>
                    </div>
                    <div className="text-xs text-navy-500 mt-0.5 flex items-center space-x-2">
                      <span>{req.hospital_name} ({req.hospital_city})</span>
                      <span>•</span>
                      <span>Requested: {(() => {
                        try {
                          const d = new Date(req.requested_at ? req.requested_at.replace(' ', 'T') : Date.now());
                          return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
                        } catch (e) {
                          return 'Recently';
                        }
                      })()}</span>
                    </div>
                    <div className="mt-2 text-xs text-navy-700 bg-white p-2.5 rounded-xl border border-amber-200">
                      <strong>Clinical Justification: </strong>"{req.purpose}"
                    </div>
                  </div>
                </div>

                {/* Duration & Approve/Reject actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white outline-none"
                  >
                    <option value={1}>Valid for 24 Hours</option>
                    <option value={7}>Valid for 7 Days</option>
                    <option value={30}>Valid for 30 Days</option>
                    <option value={90}>Valid for 90 Days</option>
                  </select>

                  <button
                    onClick={() => handleApprove(req.id, req.doctor_name)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Access</span>
                  </button>

                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE DOCTOR CONSENT PERMISSIONS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-navy-50 pb-4">
          <div className="flex items-center space-x-2">
            <Unlock className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-navy-900">
              Active Authorized Doctors ({consents.filter(c => c.current_status === 'Active').length})
            </h3>
          </div>
          <span className="text-xs text-navy-400">Server-Enforced Access Gates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-100 text-navy-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Doctor & Specialization</th>
                <th className="pb-3">Originating Hospital</th>
                <th className="pb-3">Scope</th>
                <th className="pb-3">Granted Date</th>
                <th className="pb-3">Status / Expiration</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {consents.map((c) => {
                const isActive = c.current_status === 'Active';

                return (
                  <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 font-bold text-navy-900">
                      <div>{c.doctor_name}</div>
                      <div className="text-[11px] text-navy-400 font-normal">{c.doctor_specialization}</div>
                    </td>
                    <td className="py-3.5 text-navy-700">
                      {c.hospital_name}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-50 text-navy-700">
                        {c.access_level}
                      </span>
                    </td>
                    <td className="py-3.5 text-navy-500 font-mono">
                      {c.granted_at ? c.granted_at.substring(0, 10) : 'N/A'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : c.current_status === 'Revoked'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-navy-50 text-navy-500'
                      }`}>
                        {isActive ? `Active (until ${c.expires_at ? c.expires_at.substring(0, 10) : 'indefinite'})` : c.current_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {isActive ? (
                        <button
                          onClick={() => handleRevoke(c.id, c.doctor_name)}
                          className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-navy-400 text-xs italic">Deactivated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
