const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

// All endpoints in this router require patient authentication
router.use(authenticateToken);
router.use(requireRole('patient'));

// GET /api/patient/dashboard - Comprehensive overview
router.get('/dashboard', (req, res) => {
  try {
    const patientId = req.patient.id;

    // Total records count
    const totalRecords = db.prepare('SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?').get(patientId).count;

    // Distinct hospitals visited
    const hospitalVisits = db.prepare('SELECT COUNT(DISTINCT hospital_id) as count FROM medical_records WHERE patient_id = ?').get(patientId).count;

    // Active prescriptions
    const activePrescriptions = db.prepare("SELECT COUNT(*) as count FROM prescriptions WHERE patient_id = ? AND status = 'active'").get(patientId).count;

    // Active consents
    const activeConsents = db.prepare(`
      SELECT COUNT(*) as count FROM consent_permissions 
      WHERE patient_id = ? AND is_revoked = 0 AND (expires_at > datetime('now') OR expires_at IS NULL)
    `).get(patientId).count;

    // Pending access requests count & full details
    const pendingRequests = db.prepare("SELECT COUNT(*) as count FROM access_requests WHERE patient_id = ? AND status = 'pending'").get(patientId).count;

    const pendingRequestsList = db.prepare(`
      SELECT 
        ar.*,
        u.full_name as doctor_name,
        d.specialization as doctor_specialization,
        d.license_number as doctor_license,
        d.qualification as doctor_qualification,
        h.name as hospital_name,
        h.code as hospital_code,
        h.city as hospital_city
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN hospitals h ON ar.hospital_id = h.id
      WHERE ar.patient_id = ? AND ar.status = 'pending'
      ORDER BY ar.requested_at DESC
    `).all(patientId);

    // Allergies
    const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ? ORDER BY diagnosed_date DESC').all(patientId);

    // Recent 3 consultations
    const recentRecords = db.prepare(`
      SELECT 
        mr.*, 
        h.name as hospital_name, h.code as hospital_code, h.city as hospital_city,
        u.full_name as doctor_name, d.specialization as doctor_specialization
      FROM medical_records mr
      JOIN hospitals h ON mr.hospital_id = h.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.encounter_date DESC
      LIMIT 3
    `).all(patientId);

    // Recent 3 lab reports
    const recentLabs = db.prepare(`
      SELECT lr.*, h.name as hospital_name, h.code as hospital_code
      FROM lab_reports lr
      JOIN hospitals h ON lr.hospital_id = h.id
      WHERE lr.patient_id = ?
      ORDER BY lr.test_date DESC
      LIMIT 3
    `).all(patientId);

    res.json({
      patient: {
        ...req.patient,
        full_name: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        avatar_url: req.user.avatar_url
      },
      stats: {
        totalRecords,
        hospitalVisits,
        activePrescriptions,
        activeConsents,
        pendingRequests
      },
      allergies,
      recentRecords,
      recentLabs,
      pendingRequestsList: pendingRequestsList || []
    });
  } catch (err) {
    console.error('Patient dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve patient dashboard overview: ' + err.message });
  }
});

// GET /api/patient/medical-history - Full timeline with originating hospital badge & filters
router.get('/medical-history', (req, res) => {
  try {
    const patientId = req.patient.id;
    const { hospitalId, recordType, search } = req.query;

    let query = `
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
    `;

    const params = [patientId];

    if (hospitalId && hospitalId !== 'all') {
      query += ` AND mr.hospital_id = ?`;
      params.push(hospitalId);
    }

    if (recordType && recordType !== 'all') {
      query += ` AND mr.record_type = ?`;
      params.push(recordType);
    }

    if (search) {
      query += ` AND (mr.title LIKE ? OR mr.diagnosis LIKE ? OR mr.treatment LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY mr.encounter_date DESC`;

    const records = db.prepare(query).all(...params);

    // Attach prescriptions and lab reports to each record
    const recordsWithDetails = records.map(record => {
      const recordPrescriptions = db.prepare(`
        SELECT * FROM prescriptions WHERE medical_record_id = ?
      `).all(record.id);

      const recordLabs = db.prepare(`
        SELECT * FROM lab_reports WHERE medical_record_id = ?
      `).all(record.id);

      const recordDiagnoses = db.prepare(`
        SELECT * FROM diagnoses WHERE medical_record_id = ?
      `).all(record.id);

      return {
        ...record,
        vitals: record.vitals_json ? JSON.parse(record.vitals_json) : null,
        prescriptions: recordPrescriptions,
        labReports: recordLabs.map(l => ({
          ...l,
          results: l.results_json ? JSON.parse(l.results_json) : null
        })),
        diagnoses: recordDiagnoses
      };
    });

    // Also get list of connected hospitals for filter dropdown
    const hospitals = db.prepare(`
      SELECT DISTINCT h.id, h.name, h.code 
      FROM medical_records mr 
      JOIN hospitals h ON mr.hospital_id = h.id 
      WHERE mr.patient_id = ?
    `).all(patientId);

    res.json({
      records: recordsWithDetails,
      connectedHospitals: hospitals
    });
  } catch (err) {
    console.error('Medical history retrieval error:', err);
    res.status(500).json({ error: 'Failed to retrieve medical history: ' + err.message });
  }
});

// GET /api/patient/prescriptions
router.get('/prescriptions', (req, res) => {
  try {
    const patientId = req.patient.id;
    const prescriptions = db.prepare(`
      SELECT 
        p.*,
        h.name as hospital_name, h.code as hospital_code,
        u.full_name as doctor_name, d.specialization as doctor_specialization
      FROM prescriptions p
      JOIN hospitals h ON p.hospital_id = h.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.issued_at DESC
    `).all(patientId);

    res.json({ prescriptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prescriptions: ' + err.message });
  }
});

// GET /api/patient/lab-reports
router.get('/lab-reports', (req, res) => {
  try {
    const patientId = req.patient.id;
    const reports = db.prepare(`
      SELECT 
        lr.*,
        h.name as hospital_name, h.code as hospital_code,
        u.full_name as doctor_name
      FROM lab_reports lr
      JOIN hospitals h ON lr.hospital_id = h.id
      LEFT JOIN doctors d ON lr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE lr.patient_id = ?
      ORDER BY lr.test_date DESC
    `).all(patientId);

    const formatted = reports.map(r => ({
      ...r,
      results: r.results_json ? JSON.parse(r.results_json) : null
    }));

    res.json({ labReports: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lab reports: ' + err.message });
  }
});

// GET /api/patient/appointments
router.get('/appointments', (req, res) => {
  try {
    const patientId = req.patient.id;
    const appointments = db.prepare(`
      SELECT 
        a.*,
        h.name as hospital_name, h.code as hospital_code, h.address as hospital_address,
        u.full_name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN hospitals h ON a.hospital_id = h.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `).all(patientId);

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments: ' + err.message });
  }
});

// GET /api/patient/access-requests - View incoming doctor requests
router.get('/access-requests', (req, res) => {
  try {
    const patientId = req.patient.id;
    const requests = db.prepare(`
      SELECT 
        ar.*,
        u.full_name as doctor_name,
        d.specialization as doctor_specialization,
        d.license_number as doctor_license,
        d.qualification as doctor_qualification,
        h.name as hospital_name,
        h.code as hospital_code,
        h.city as hospital_city
      FROM access_requests ar
      JOIN doctors d ON ar.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN hospitals h ON ar.hospital_id = h.id
      WHERE ar.patient_id = ?
      ORDER BY ar.requested_at DESC
    `).all(patientId);

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch access requests: ' + err.message });
  }
});

// POST /api/patient/access-requests/:id/approve - Patient approves doctor request
router.post('/access-requests/:id/approve', (req, res) => {
  try {
    const requestId = req.params.id;
    const patientId = req.patient.id;
    const { durationDays = 7, accessLevel = 'full_history' } = req.body;

    const request = db.prepare(`
      SELECT * FROM access_requests WHERE id = ? AND patient_id = ? AND status = 'pending'
    `).get(requestId, patientId);

    if (!request) {
      return res.status(404).json({ error: 'Pending access request not found or already processed.' });
    }

    const consentId = 'cst-' + uuidv4().substring(0, 8);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (Number(durationDays) || request.requested_duration_days || 7));
    const expiresAtStr = expiresAt.toISOString().replace('T', ' ').substring(0, 19);

    const executeApproval = db.transaction(() => {
      // 1. Update access request
      db.prepare(`
        UPDATE access_requests 
        SET status = 'approved', responded_at = datetime('now')
        WHERE id = ?
      `).run(requestId);

      // 2. Insert consent permission
      db.prepare(`
        INSERT INTO consent_permissions (id, patient_id, doctor_id, hospital_id, access_level, granted_at, expires_at, is_revoked)
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 0)
      `).run(consentId, patientId, request.doctor_id, request.hospital_id, accessLevel, expiresAtStr);
    });

    executeApproval();

    // Doctor info for audit
    const doctor = db.prepare(`
      SELECT u.full_name, h.name as hospital_name 
      FROM doctors d JOIN users u ON d.user_id = u.id JOIN hospitals h ON d.hospital_id = h.id 
      WHERE d.id = ?
    `).get(request.doctor_id);

    logAuditEvent({
      userId: req.user.id,
      action: 'APPROVE_CONSENT',
      resourceType: 'Consent',
      resourceId: consentId,
      patientId: patientId,
      hospitalId: request.hospital_id,
      details: `Patient ${req.user.full_name} APPROVED health records access for ${doctor?.full_name} (${doctor?.hospital_name}) for ${durationDays} days.`,
      status: 'SUCCESS'
    });

    res.json({
      message: `Access successfully granted to ${doctor?.full_name}. Valid until ${expiresAt.toLocaleDateString()}.`,
      consentId,
      expiresAt: expiresAtStr
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ error: 'Failed to approve access request: ' + err.message });
  }
});

// POST /api/patient/access-requests/:id/reject
router.post('/access-requests/:id/reject', (req, res) => {
  try {
    const requestId = req.params.id;
    const patientId = req.patient.id;
    const { reason = 'Access declined by patient' } = req.body;

    const request = db.prepare(`
      SELECT * FROM access_requests WHERE id = ? AND patient_id = ? AND status = 'pending'
    `).get(requestId, patientId);

    if (!request) {
      return res.status(404).json({ error: 'Pending request not found.' });
    }

    db.prepare(`
      UPDATE access_requests 
      SET status = 'rejected', responded_at = datetime('now'), rejection_reason = ?
      WHERE id = ?
    `).run(reason, requestId);

    logAuditEvent({
      userId: req.user.id,
      action: 'REJECT_CONSENT',
      resourceType: 'AccessRequest',
      resourceId: requestId,
      patientId: patientId,
      hospitalId: request.hospital_id,
      details: `Patient ${req.user.full_name} REJECTED access request from doctor. Reason: ${reason}`,
      status: 'SUCCESS'
    });

    res.json({ message: 'Access request successfully rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request: ' + err.message });
  }
});

// GET /api/patient/consents - View all active doctor permissions
router.get('/consents', (req, res) => {
  try {
    const patientId = req.patient.id;
    const consents = db.prepare(`
      SELECT 
        cp.*,
        u.full_name as doctor_name,
        d.specialization as doctor_specialization,
        d.qualification as doctor_qualification,
        h.name as hospital_name,
        h.code as hospital_code,
        CASE 
          WHEN cp.is_revoked = 1 THEN 'Revoked'
          WHEN cp.expires_at < datetime('now') THEN 'Expired'
          ELSE 'Active'
        END as current_status
      FROM consent_permissions cp
      JOIN doctors d ON cp.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN hospitals h ON cp.hospital_id = h.id
      WHERE cp.patient_id = ?
      ORDER BY cp.granted_at DESC
    `).all(patientId);

    res.json({ consents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctor permissions: ' + err.message });
  }
});

// POST /api/patient/consents/:id/revoke - Revoke active doctor access
router.post('/consents/:id/revoke', (req, res) => {
  try {
    const consentId = req.params.id;
    const patientId = req.patient.id;
    const { reason = 'Revoked at patient request' } = req.body;

    const consent = db.prepare(`
      SELECT cp.*, u.full_name as doctor_name, h.name as hospital_name
      FROM consent_permissions cp
      JOIN doctors d ON cp.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN hospitals h ON cp.hospital_id = h.id
      WHERE cp.id = ? AND cp.patient_id = ? AND cp.is_revoked = 0
    `).get(consentId, patientId);

    if (!consent) {
      return res.status(404).json({ error: 'Active consent permission not found or already revoked.' });
    }

    db.prepare(`
      UPDATE consent_permissions
      SET is_revoked = 1, revoked_at = datetime('now'), revoked_reason = ?
      WHERE id = ?
    `).run(reason, consentId);

    logAuditEvent({
      userId: req.user.id,
      action: 'REVOKE_CONSENT',
      resourceType: 'Consent',
      resourceId: consentId,
      patientId: patientId,
      hospitalId: consent.hospital_id,
      details: `Patient ${req.user.full_name} REVOKED medical records access for ${consent.doctor_name} (${consent.hospital_name}). Reason: ${reason}`,
      status: 'WARNING'
    });

    res.json({
      message: `Access authorization for ${consent.doctor_name} has been revoked immediately.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke consent: ' + err.message });
  }
});

// GET /api/patient/access-history - Detailed audit trail for patient
router.get('/access-history', (req, res) => {
  try {
    const patientId = req.patient.id;
    const history = db.prepare(`
      SELECT 
        al.*,
        u.full_name as actor_name,
        u.role as actor_role,
        h.name as hospital_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN hospitals h ON al.hospital_id = h.id
      WHERE al.patient_id = ?
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all(patientId);

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch access history: ' + err.message });
  }
});

// GET /api/patient/qr-code
router.get('/qr-code', (req, res) => {
  try {
    const patient = req.patient;
    const qrPayload = {
      platform: 'MediConnect Health Interoperability Network',
      patientId: patient.patient_id,
      fullName: req.user.full_name,
      bloodGroup: patient.blood_group,
      dob: patient.dob,
      emergencyContact: patient.emergency_contact_phone,
      issuedAt: new Date().toISOString(),
      secureHash: 'SHA256-' + uuidv4().replace(/-/g, '').substring(0, 16)
    };

    res.json({
      qrCodeData: JSON.stringify(qrPayload),
      patientId: patient.patient_id,
      name: req.user.full_name
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR data: ' + err.message });
  }
});

// GET /api/patient/export-summary - Comprehensive summary for download/printing
router.get('/export-summary', (req, res) => {
  try {
    const patientId = req.patient.id;

    const patient = {
      ...req.patient,
      full_name: req.user.full_name,
      email: req.user.email,
      phone: req.user.phone
    };

    const records = db.prepare(`
      SELECT 
        mr.*, 
        h.name as hospital_name, h.code as hospital_code, h.city as hospital_city,
        u.full_name as doctor_name, d.specialization as doctor_specialization
      FROM medical_records mr
      JOIN hospitals h ON mr.hospital_id = h.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.encounter_date DESC
    `).all(patientId);

    const prescriptions = db.prepare(`
      SELECT p.*, h.name as hospital_name, u.full_name as doctor_name
      FROM prescriptions p
      JOIN hospitals h ON p.hospital_id = h.id
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.issued_at DESC
    `).all(patientId);

    const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ?').all(patientId);
    const labReports = db.prepare(`
      SELECT lr.*, h.name as hospital_name 
      FROM lab_reports lr JOIN hospitals h ON lr.hospital_id = h.id 
      WHERE lr.patient_id = ? ORDER BY lr.test_date DESC
    `).all(patientId);

    logAuditEvent({
      userId: req.user.id,
      action: 'EXPORT_HISTORY',
      resourceType: 'Patient',
      resourceId: patientId,
      patientId: patientId,
      details: `Patient ${req.user.full_name} exported unified medical summary PDF`,
      status: 'SUCCESS'
    });

    res.json({
      generatedAt: new Date().toISOString(),
      patient,
      records: records.map(r => ({
        ...r,
        vitals: r.vitals_json ? JSON.parse(r.vitals_json) : null
      })),
      prescriptions,
      allergies,
      labReports: labReports.map(l => ({
        ...l,
        results: l.results_json ? JSON.parse(l.results_json) : null
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export summary: ' + err.message });
  }
});

module.exports = router;
