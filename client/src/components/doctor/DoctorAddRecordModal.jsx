import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Plus, Trash2, Stethoscope, Pill, FileText, CheckCircle2, Upload, Paperclip, FileCheck } from 'lucide-react';

export default function DoctorAddRecordModal({ isOpen, onClose, patientId, patientName, onRecordAdded }) {
  const [encounterDate, setEncounterDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordType, setRecordType] = useState('Outpatient Consultation');
  const [title, setTitle] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('Z00.00');
  const [treatment, setTreatment] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [hr, setHr] = useState('72 bpm');
  const [temp, setTemp] = useState('98.6 °F');
  const [spO2, setSpO2] = useState('99%');
  const [weight, setWeight] = useState('75.0 kg');

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState([
    { medication_name: '', dosage: '', frequency: 'Once daily after breakfast', duration: '14 days', instructions: '' }
  ]);

  // Attached PDF reports
  const [attachedReports, setAttachedReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddRx = () => {
    setPrescriptions([
      ...prescriptions,
      { medication_name: '', dosage: '', frequency: 'Once daily after meals', duration: '14 days', instructions: '' }
    ]);
  };

  const handleRemoveRx = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleRxChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  // PDF File Handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validPdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (validPdfs.length < files.length) {
      alert('Please select valid PDF documents only.');
    }

    const newItems = validPdfs.map(f => ({
      id: 'pdf-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      file: f,
      name: f.name,
      sizeFormatted: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      category: 'Diagnostic Lab Report',
      findings_summary: ''
    }));

    setAttachedReports(prev => [...prev, ...newItems]);
    e.target.value = null;
  };

  const handleRemoveReport = (id) => {
    setAttachedReports(prev => prev.filter(r => r.id !== id));
  };

  const handleReportChange = (id, field, value) => {
    setAttachedReports(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !diagnosis || !treatment) {
      setError('Encounter title, diagnosis, and treatment plan are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const validPrescriptions = prescriptions.filter(p => p.medication_name.trim() !== '');

      // Upload attached PDF files if any
      let uploadedLabReports = [];
      if (attachedReports.length > 0) {
        for (const report of attachedReports) {
          try {
            const uploadRes = await api.uploadDocument(report.file);
            uploadedLabReports.push({
              test_name: report.title || report.name,
              category: report.category,
              test_date: encounterDate,
              findings_summary: report.findings_summary || `Attached medical PDF document: ${report.name}`,
              file_url: uploadRes.fileUrl,
              status: 'Normal'
            });
          } catch (uploadErr) {
            console.warn('PDF upload warning:', uploadErr);
            uploadedLabReports.push({
              test_name: report.title || report.name,
              category: report.category,
              test_date: encounterDate,
              findings_summary: report.findings_summary || `Attached medical PDF document: ${report.name}`,
              file_url: null,
              status: 'Normal'
            });
          }
        }
      }

      const payload = {
        patientId,
        encounter_date: encounterDate,
        record_type: recordType,
        title,
        chief_complaint: chiefComplaint,
        vitals: {
          bloodPressure: bp,
          heartRate: hr,
          temp: temp,
          spO2: spO2,
          weight: weight
        },
        diagnosis,
        icd10_code: icd10Code,
        treatment,
        clinical_notes: clinicalNotes,
        prescriptions: validPrescriptions,
        labReports: uploadedLabReports
      };

      const res = await api.addMedicalRecord(payload);
      alert(res.message);
      if (onRecordAdded) onRecordAdded();
    } catch (err) {
      setError(err.message || 'Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-navy-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-navy-100 flex items-center justify-between bg-surface rounded-t-3xl">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl teal-gradient-bg flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Record Clinical Encounter</h3>
              <p className="text-xs text-navy-500">Patient: <strong>{patientName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-navy-200 text-navy-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">Encounter Date</label>
              <input
                type="date"
                required
                value={encounterDate}
                onChange={(e) => setEncounterDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">Encounter Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
              >
                <option value="Outpatient Consultation">Outpatient Consultation</option>
                <option value="Emergency Care">Emergency Care</option>
                <option value="Diagnostic Review">Diagnostic Review</option>
                <option value="Inpatient Admission">Inpatient Admission</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">ICD-10 Code</label>
              <input
                type="text"
                value={icd10Code}
                onChange={(e) => setIcd10Code(e.target.value)}
                placeholder="e.g. I10 or J45.41"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-700 mb-1">Encounter Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow-up Evaluation for Bronchial Asthma & Medication Reconciliation"
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-700 mb-1">Symptoms / Chief Complaint</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Mild shortness of breath during morning jogging, nocturnal dry cough"
              className="w-full px-4 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
            />
          </div>

          {/* Vitals Input Strip */}
          <div className="p-4 rounded-2xl bg-surface border border-navy-100 space-y-2">
            <label className="block text-[11px] font-bold text-navy-600 uppercase">Patient Vitals at Encounter</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-navy-400">BP</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-navy-200 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-navy-400">Heart Rate</span>
                <input
                  type="text"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-navy-200 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-navy-400">SpO2</span>
                <input
                  type="text"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-navy-200 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-navy-400">Temp</span>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-navy-200 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-navy-400">Weight</span>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-navy-200 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">Clinical Diagnosis *</label>
              <textarea
                required
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Mild persistent bronchial asthma, stable hypertension"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">Treatment Plan *</label>
              <textarea
                required
                rows={2}
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="e.g. Continue maintenance inhaler, monitor peak flow weekly, lifestyle check"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-700 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Detailed physical exam findings, patient contraindications..."
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
            />
          </div>

          {/* Prescriptions Dynamic Inputs */}
          <div className="space-y-3 pt-3 border-t border-navy-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-800 flex items-center space-x-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Issue Digital Prescriptions</span>
              </span>
              <button
                type="button"
                onClick={handleAddRx}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            {prescriptions.map((rx, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-surface border border-navy-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-700">Medication #{idx + 1}</span>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRx(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={rx.medication_name}
                      onChange={(e) => handleRxChange(idx, 'medication_name', e.target.value)}
                      placeholder="Medication name (e.g. Montelukast)"
                      className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={rx.dosage}
                      onChange={(e) => handleRxChange(idx, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g. 10 mg)"
                      className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={rx.duration}
                      onChange={(e) => handleRxChange(idx, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 30 days)"
                      className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={rx.frequency}
                    onChange={(e) => handleRxChange(idx, 'frequency', e.target.value)}
                    placeholder="Frequency (e.g. Once daily at bedtime)"
                    className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={rx.instructions}
                    onChange={(e) => handleRxChange(idx, 'instructions', e.target.value)}
                    placeholder="Special instructions (e.g. Take with water)"
                    className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Attach PDF Reports & Diagnostic Documents */}
          <div className="space-y-3 pt-3 border-t border-navy-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-navy-800">
                    Attach Medical Reports & Diagnostic PDFs
                  </span>
                  <span className="text-[10px] text-navy-400 block -mt-0.5">
                    Attach lab panels, radiology X-ray/MRI scans, or clinical summaries (PDF)
                  </span>
                </div>
              </div>

              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>+ Add PDF Report</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Drag & Drop or Empty State */}
            {attachedReports.length === 0 ? (
              <label className="border-2 border-dashed border-navy-200 hover:border-teal-400 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface/40 text-center group">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 group-hover:bg-teal-100 text-teal-600 flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs font-bold text-navy-800 group-hover:text-teal-700">
                  Click to browse or drop medical PDF reports here
                </span>
                <span className="text-[10px] text-navy-400 mt-1">
                  Supports PDF documents (Blood panels, Spirometry, Radiology scans, Pathology) up to 15 MB
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                {attachedReports.map((report) => (
                  <div key={report.id} className="p-3.5 rounded-2xl bg-surface border-2 border-teal-200/80 space-y-2.5 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-black uppercase tracking-wider">
                          PDF
                        </span>
                        <div>
                          <span className="font-bold text-navy-900">{report.name}</span>
                          <span className="text-[10px] text-navy-400 ml-2">({report.sizeFormatted})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveReport(report.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-navy-600 block mb-0.5">Report / Test Title *</label>
                        <input
                          type="text"
                          value={report.title}
                          onChange={(e) => handleReportChange(report.id, 'title', e.target.value)}
                          placeholder="e.g. Complete Blood Count (CBC) Panel"
                          className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-navy-600 block mb-0.5">Category</label>
                        <select
                          value={report.category}
                          onChange={(e) => handleReportChange(report.id, 'category', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white font-medium"
                        >
                          <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                          <option value="Radiology & Imaging (X-Ray / MRI / CT)">Radiology & Imaging (X-Ray / MRI / CT)</option>
                          <option value="Cardiology & ECG">Cardiology & ECG</option>
                          <option value="Pulmonology & Spirometry">Pulmonology & Spirometry</option>
                          <option value="Discharge Summary & Clinical Notes">Discharge Summary & Clinical Notes</option>
                          <option value="Pathology Review">Pathology Review</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-navy-600 block mb-0.5">Clinical Findings / Summary</label>
                      <input
                        type="text"
                        value={report.findings_summary}
                        onChange={(e) => handleReportChange(report.id, 'findings_summary', e.target.value)}
                        placeholder="e.g. Normal platelet and hemoglobin count, mild eosinophilia."
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-navy-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface hover:bg-navy-100 text-xs font-bold text-navy-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Saving to Database...' : 'Save Consultation Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
