const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('../db/database');
const { authenticateToken, requireRole, verifyPatientConsent } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// Configure Multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = 'doc-' + Date.now() + '-' + uuidv4().substring(0, 6) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, JPG, PNG, and WEBP files are allowed.'));
    }
  }
});

// All routes require doctor authentication
router.use(authenticateToken);
router.use(requireRole('doctor'));

// GET /api/doctor/dashboard - Doctor metrics & overview
router.get('/dashboard', (req, res) => {
  try {
    const doctorId = req.doctor.id;

    // Total distinct patients accessed
    const patientsAccessed = db.prepare(`
      SELECT COUNT(DISTINCT patient_id) as count 
      FROM audit_logs 
      WHERE user_id = ? AND action IN ('VIEW_RECORD', 'ADD_RECORD') AND status = 'SUCCESS'
    `).get(req.user.id).count;

    // Pending consent requests made by this doctor
    const pendingRequests = db.prepare(`
      SELECT COUNT(*) as count 
      FROM access_requests 
      WHERE doctor_id = ? AND status = 'pending'
    `).get(doctorId).count;

    // Total consultations added by this doctor
    const totalConsultations = db.prepare(`
      SELECT COUNT(*) as count 
      FROM medical_records 
      WHERE doctor_id = ?
    `).get(doctorId).count;

    // Recent 5 consultations added by this doctor
    const recentConsultations = db.prepare(`
      SELECT 
        mr.*,
        p.patient_id as patient_code,
        u.full_name as patient_name,
        h.name as hospital_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN hospitals h ON mr.hospital_id = h.id
      WHERE mr.doctor_id = ?
      ORDER BY mr.created_at DESC
      LIMIT 5
    `).all(doctorId);

    // Active consents
    const activeConsents = db.prepare(`
      SELECT 
        cp.*,
        p.patient_id as patient_code,
        u.full_name as patient_name
      FROM consent_permissions cp
      JOIN patients p ON cp.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE cp.doctor_id = ? 
        AND cp.is_revoked = 0 
        AND (cp.expires_at > datetime('now') OR cp.expires_at IS NULL)
      ORDER BY cp.granted_at DESC
    `).all(doctorId);

    res.json({
      doctor: req.doctor,
      stats: {
        patientsAccessed,
        pendingRequests,
        totalConsultations,
        activeConsentsCount: activeConsents.length
      },
      recentConsultations,
      activeConsents
    });
  } catch (err) {
    console.error('Doctor dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve doctor dashboard: ' + err.message });
  }
});

// GET /api/doctor/search-patients?q=... - Search by Patient ID or Name
router.get('/search-patients', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const searchTerm = `%${q.trim()}%`;
    const doctorId = req.doctor.id;

    // Search patient by patient_id or full_name
    const matchedPatients = db.prepare(`
      SELECT 
        p.id,
        p.patient_id,
        p.blood_group,
        p.dob,
        p.gender,
        u.full_name,
        u.avatar_url
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.patient_id LIKE ? OR u.full_name LIKE ?
      LIMIT 10
    `).all(searchTerm, searchTerm);

    // For each patient, check if this doctor currently has valid consent
    const results = matchedPatients.map(patient => {
      // Check active consent
      const activeConsent = db.prepare(`
        SELECT * FROM consent_permissions
        WHERE patient_id = ? 
          AND doctor_id = ? 
          AND is_revoked = 0 
          AND (expires_at > datetime('now') OR expires_at IS NULL)
        ORDER BY granted_at DESC
        LIMIT 1
      `).get(patient.id, doctorId);

      // Check pending request
      const pendingRequest = db.prepare(`
        SELECT * FROM access_requests
        WHERE patient_id = ? AND doctor_id = ? AND status = 'pending'
        ORDER BY requested_at DESC
        LIMIT 1
      `).get(patient.id, doctorId);

      // Check total records for this patient across all hospitals
      const recordSummary = db.prepare(`
        SELECT 
          COUNT(DISTINCT mr.hospital_id) as connected_hospitals_count,
          COUNT(mr.id) as total_records_count
        FROM medical_records mr
        WHERE mr.patient_id = ?
      `).get(patient.id);

      return {
        ...patient,
        hasConsent: !!activeConsent,
        consent: activeConsent || null,
        pendingRequest: pendingRequest || null,
        connectedHospitalsCount: recordSummary?.connected_hospitals_count || 0,
        totalRecordsCount: recordSummary?.total_records_count || 0
      };
    });

    logAuditEvent({
      userId: req.user.id,
      action: 'SEARCH_PATIENT',
      resourceType: 'Patient',
      hospitalId: req.doctor.hospital_id,
      details: `Doctor ${req.user.full_name} searched for patients with query "${q}". ${results.length} matches found.`,
      status: 'SUCCESS'
    });

    res.json({ patients: results });
  } catch (err) {
    console.error('Patient search error:', err);
    res.status(500).json({ error: 'Patient search failed: ' + err.message });
  }
});

// POST /api/doctor/request-access - Doctor requests patient consent
router.post('/request-access', (req, res) => {
  try {
    const { patientId, purpose, durationDays = 7 } = req.body;
    const doctorId = req.doctor.id;
    const hospitalId = req.doctor.hospital_id;

    if (!patientId || !purpose) {
      return res.status(400).json({ error: 'Patient ID and clinical purpose are required.' });
    }

    const patient = db.prepare('SELECT p.*, u.full_name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ? OR UPPER(p.patient_id) = ?').get(patientId, (patientId || '').toUpperCase());
    if (!patient) {
      return res.status(404).json({ error: 'Patient record not found.' });
    }

    // Check if an identical request is already pending
    const existing = db.prepare(`
      SELECT id FROM access_requests 
      WHERE patient_id = ? AND doctor_id = ? AND status = 'pending'
    `).get(patient.id, doctorId);

    if (existing) {
      return res.status(400).json({ error: 'An access request for this patient is already pending authorization.' });
    }

    const requestId = 'req-' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO access_requests (id, patient_id, doctor_id, hospital_id, purpose, requested_duration_days, status, requested_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).run(requestId, patient.id, doctorId, hospitalId, purpose, durationDays);

    logAuditEvent({
      userId: req.user.id,
      action: 'REQUEST_ACCESS',
      resourceType: 'AccessRequest',
      resourceId: requestId,
      patientId: patient.id,
      hospitalId: hospitalId,
      details: `Dr. ${req.user.full_name} (${req.doctor.hospital_name}) submitted an access request for patient ${patient.full_name} (${patient.patient_id}). Purpose: ${purpose}`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: `Access request submitted successfully to ${patient.full_name}. The patient must approve the request before medical records can be viewed.`,
      requestId
    });
  } catch (err) {
    console.error('Request access error:', err);
    res.status(500).json({ error: 'Failed to submit access request: ' + err.message });
  }
});

// POST /api/doctor/emergency-access - Emergency Break-Glass Override (Section 12)
router.post('/emergency-access', (req, res) => {
  try {
    const { patientId, justification } = req.body;
    const doctorId = req.doctor.id;
    const hospitalId = req.doctor.hospital_id;

    if (!patientId || !justification || justification.trim().length < 15) {
      return res.status(400).json({
        error: 'Mandatory clinical justification of at least 15 characters is required for emergency break-glass access.'
      });
    }

    const patient = db.prepare('SELECT p.*, u.full_name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const consentId = 'cst-emg-' + uuidv4().substring(0, 8);
    // Emergency consent lasts 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO consent_permissions (id, patient_id, doctor_id, hospital_id, access_level, granted_at, expires_at, is_revoked, is_emergency, emergency_justification)
      VALUES (?, ?, ?, ?, 'emergency_break_glass', datetime('now'), ?, 0, 1, ?)
    `).run(consentId, patientId, doctorId, hospitalId, expiresAt, justification);

    logAuditEvent({
      userId: req.user.id,
      action: 'EMERGENCY_OVERRIDE',
      resourceType: 'Consent',
      resourceId: consentId,
      patientId: patientId,
      hospitalId: hospitalId,
      details: `EMERGENCY BREAK-GLASS OVERRIDE EXECUTED by Dr. ${req.user.full_name} (${req.doctor.hospital_name}) for patient ${patient.full_name}. Justification: "${justification}". High-priority compliance audit flagged.`,
      status: 'WARNING'
    });

    res.json({
      message: 'Emergency Break-Glass access activated for 24 hours. This incident has been logged with clinical compliance audit oversight.',
      consentId,
      expiresAt
    });
  } catch (err) {
    console.error('Emergency access error:', err);
    res.status(500).json({ error: 'Failed to execute emergency override: ' + err.message });
  }
});

// GET /api/doctor/patient-records/:patientId - View patient's complete cross-hospital record
// STRICTLY PROTECTED BY verifyPatientConsent!
router.get('/patient-records/:patientId', verifyPatientConsent, (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Fetch patient profile
    const patient = db.prepare(`
      SELECT 
        p.*,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Fetch medical records across ALL hospitals!
    const records = db.prepare(`
      SELECT 
        mr.*,
        h.name as hospital_name,
        h.code as hospital_code,
        h.city as hospital_city,
        h.logo_url as hospital_logo,
        u.full_name as doctor_name,
        d.specialization as doctor_specialization
      FROM medical_records mr
      JOIN hospitals h ON mr.hospital_id = h.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.encounter_date DESC
    `).all(patientId);

    const recordsWithDetails = records.map(record => {
      const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE medical_record_id = ?').all(record.id);
      const labReports = db.prepare('SELECT * FROM lab_reports WHERE medical_record_id = ?').all(record.id);
      const diagnoses = db.prepare('SELECT * FROM diagnoses WHERE medical_record_id = ?').all(record.id);

      return {
        ...record,
        vitals: record.vitals_json ? JSON.parse(record.vitals_json) : null,
        prescriptions,
        labReports: labReports.map(l => ({
          ...l,
          results: l.results_json ? JSON.parse(l.results_json) : null
        })),
        diagnoses
      };
    });

    // Fetch all allergies
    const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC').all(patientId);

    // Fetch all current prescriptions across hospitals
    const prescriptions = db.prepare(`
      SELECT 
        p.*,
        h.name as hospital_name,
        h.code as hospital_code,
        u.full_name as doctor_name
      FROM prescriptions p
      JOIN hospitals h ON p.hospital_id = h.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.issued_at DESC
    `).all(patientId);

    // Fetch all lab reports across hospitals
    const labReports = db.prepare(`
      SELECT 
        lr.*,
        h.name as hospital_name,
        h.code as hospital_code
      FROM lab_reports lr
      JOIN hospitals h ON lr.hospital_id = h.id
      WHERE lr.patient_id = ?
      ORDER BY lr.test_date DESC
    `).all(patientId);

    // Distinct hospitals connected
    const hospitalsConnected = db.prepare(`
      SELECT DISTINCT h.id, h.name, h.code, h.city
      FROM medical_records mr
      JOIN hospitals h ON mr.hospital_id = h.id
      WHERE mr.patient_id = ?
    `).all(patientId);

    // Log authorized access event in audit log
    logAuditEvent({
      userId: req.user.id,
      action: 'VIEW_RECORD',
      resourceType: 'MedicalRecord',
      patientId: patientId,
      hospitalId: req.doctor.hospital_id,
      details: `Dr. ${req.user.full_name} (${req.doctor.hospital_name}) accessed unified medical history for ${patient.full_name} (${patient.patient_id}) across ${hospitalsConnected.length} hospitals.`,
      status: 'SUCCESS'
    });

    res.json({
      patient,
      consent: req.consent,
      hospitalsConnected,
      records: recordsWithDetails,
      allergies,
      prescriptions,
      labReports: labReports.map(l => ({
        ...l,
        results: l.results_json ? JSON.parse(l.results_json) : null
      }))
    });
  } catch (err) {
    console.error('Error fetching patient records:', err);
    res.status(500).json({ error: 'Failed to retrieve patient medical records: ' + err.message });
  }
});

// POST /api/doctor/add-record - Authorized doctor adds a new clinical consultation
router.post('/add-record', verifyPatientConsent, (req, res) => {
  try {
    const {
      patientId,
      encounter_date,
      record_type = 'Outpatient Consultation',
      title,
      chief_complaint,
      vitals, // { bloodPressure, heartRate, temp, spO2, weight }
      diagnosis,
      icd10_code,
      treatment,
      clinical_notes,
      prescriptions = [], // [{ medication_name, dosage, frequency, duration, instructions }]
      labReports = [] // [{ test_name, category, test_date, results, findings_summary, status }]
    } = req.body;

    if (!title || !diagnosis || !treatment) {
      return res.status(400).json({ error: 'Title, diagnosis, and treatment plan are required.' });
    }

    const doctorId = req.doctor.id;
    const hospitalId = req.doctor.hospital_id;
    const recordId = 'rec-' + uuidv4().substring(0, 8);

    const executeAdd = db.transaction(() => {
      // 1. Insert medical record
      db.prepare(`
        INSERT INTO medical_records (
          id, patient_id, doctor_id, hospital_id, record_type,
          encounter_date, title, chief_complaint, vitals_json,
          diagnosis, icd10_code, treatment, clinical_notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalized')
      `).run(
        recordId,
        patientId,
        doctorId,
        hospitalId,
        record_type,
        encounter_date || new Date().toISOString().split('T')[0],
        title,
        chief_complaint || '',
        vitals ? JSON.stringify(vitals) : null,
        diagnosis,
        icd10_code || 'Z00.00',
        treatment,
        clinical_notes || ''
      );

      // 2. Insert diagnosis entry
      const diagId = 'diag-' + uuidv4().substring(0, 8);
      db.prepare(`
        INSERT INTO diagnoses (id, medical_record_id, patient_id, condition_name, icd10_code, severity, diagnosed_date, status)
        VALUES (?, ?, ?, ?, ?, 'Moderate', ?, 'Active')
      `).run(diagId, recordId, patientId, diagnosis, icd10_code || 'Z00.00', encounter_date || new Date().toISOString().split('T')[0]);

      // 3. Insert prescriptions if provided
      for (const rx of prescriptions) {
        if (rx.medication_name && rx.dosage) {
          const rxId = 'rx-' + uuidv4().substring(0, 8);
          db.prepare(`
            INSERT INTO prescriptions (
              id, medical_record_id, patient_id, doctor_id, hospital_id,
              medication_name, dosage, frequency, duration, instructions, status, issued_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
          `).run(
            rxId,
            recordId,
            patientId,
            doctorId,
            hospitalId,
            rx.medication_name,
            rx.dosage,
            rx.frequency || 'Once daily',
            rx.duration || '14 days',
            rx.instructions || '',
            encounter_date || new Date().toISOString().split('T')[0]
          );

          // Also add to patient's active medications table
          db.prepare(`
            INSERT INTO medications (id, patient_id, name, dosage, frequency, start_date, prescribing_hospital, is_current)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
          `).run(
            'med-' + uuidv4().substring(0, 8),
            patientId,
            rx.medication_name,
            rx.dosage,
            rx.frequency || 'Once daily',
            encounter_date || new Date().toISOString().split('T')[0],
            req.doctor.hospital_name
          );
        }
      }

      // 4. Insert lab reports if attached
      for (const lab of labReports) {
        if (lab.test_name) {
          const labId = 'lab-' + uuidv4().substring(0, 8);
          db.prepare(`
            INSERT INTO lab_reports (
              id, medical_record_id, patient_id, hospital_id, doctor_id,
              test_name, category, test_date, results_json, findings_summary, file_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            labId,
            recordId,
            patientId,
            hospitalId,
            doctorId,
            lab.test_name,
            lab.category || 'Diagnostic Review',
            lab.test_date || encounter_date || new Date().toISOString().split('T')[0],
            lab.results ? JSON.stringify(lab.results) : null,
            lab.findings_summary || '',
            lab.file_url || null,
            lab.status || 'Normal'
          );
        }
      }
    });

    executeAdd();

    // Fetch patient for audit
    const patient = db.prepare('SELECT p.*, u.full_name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(patientId);

    logAuditEvent({
      userId: req.user.id,
      action: 'ADD_RECORD',
      resourceType: 'MedicalRecord',
      resourceId: recordId,
      patientId: patientId,
      hospitalId: hospitalId,
      details: `Dr. ${req.user.full_name} (${req.doctor.hospital_name}) added consultation "${title}" for patient ${patient?.full_name}. Diagnosis: ${diagnosis}`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: 'Medical record and prescriptions successfully added to unified patient history.',
      recordId
    });
  } catch (err) {
    console.error('Add record error:', err);
    res.status(500).json({ error: 'Failed to save medical record: ' + err.message });
  }
});

// POST /api/doctor/upload-document - Upload lab or prescription document
router.post('/upload-document', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Document uploaded successfully',
      fileName: req.file.originalname,
      fileUrl,
      sizeBytes: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// GET /api/doctor/access-history - Doctor's own access audit logs
router.get('/access-history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT 
        al.*,
        p.patient_id as patient_code,
        u.full_name as patient_name,
        h.name as hospital_name
      FROM audit_logs al
      LEFT JOIN patients p ON al.patient_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN hospitals h ON al.hospital_id = h.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all(req.user.id);

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve access history: ' + err.message });
  }
});

module.exports = router;
