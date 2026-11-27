import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileText, Building2, Calendar, AlertCircle, CheckCircle2, Download } from 'lucide-react';

export default function PatientLabReports() {
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatientLabReports()
      .then(res => setLabReports(res.labReports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Diagnostic & Lab Reports</h2>
          <p className="text-xs text-navy-500">Radiology X-rays, blood panels, and spirometry records across all facilities.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 border border-teal-200 text-teal-800">
          {labReports.length} Reports
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-navy-400 text-sm">Loading lab reports...</div>
      ) : labReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-navy-100 text-navy-400">
          No laboratory reports found.
        </div>
      ) : (
        <div className="space-y-4">
          {labReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-navy-900">{report.test_name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.status === 'Normal' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="text-xs text-navy-500 mt-0.5">
                    Category: <span className="font-semibold text-teal-700">{report.category}</span> • Hospital: <span className="font-semibold">{report.hospital_name}</span>
                  </div>
                </div>

                <div className="text-xs text-navy-400 font-mono">
                  Test Date: {report.test_date}
                </div>
              </div>

              {/* Findings Summary */}
              <div className="text-xs text-navy-700 bg-surface/70 p-3.5 rounded-xl border border-navy-50">
                <span className="font-bold text-navy-900">Diagnostic Summary: </span>
                {report.findings_summary}
              </div>

              {/* Attached PDF Report Action */}
              {report.file_url && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                  <div className="flex items-center space-x-2 text-xs text-teal-900 font-semibold">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Attached Clinical PDF Document</span>
                  </div>
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg teal-gradient-bg text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
                  >
                    <span>View PDF Report ↗</span>
                  </a>
                </div>
              )}

              {/* Results Key-Values if available */}
              {report.results && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(report.results).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-navy-50/50 border border-navy-100">
                      <div className="text-[10px] uppercase font-bold text-navy-400 truncate">{key}</div>
                      <div className="font-bold text-navy-900 mt-0.5">{String(val)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
