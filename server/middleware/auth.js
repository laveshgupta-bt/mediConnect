const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { logAuditEvent } = require('./audit');

const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect-super-secure-production-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication session' });
    }

    // Fetch live user data
    const user = db.prepare('SELECT id, email, role, full_name, phone, avatar_url FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    req.user = user;

    // Attach role-specific metadata
    if (user.role === 'patient') {
      const patient = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
      req.patient = patient;
    } else if (user.role === 'doctor') {
      const doctor = db.prepare(`
        SELECT d.*, h.name as hospital_name, h.code as hospital_code 
        FROM doctors d 
        JOIN hospitals h ON d.hospital_id = h.id 
        WHERE d.user_id = ?
      `).get(user.id);
      req.doctor = doctor;
    }

    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized access: Requires one of the following roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
}

// Strictly verify that the requesting doctor has active patient consent
function verifyPatientConsent(req, res, next) {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Only licensed doctors can access patient clinical records.' });
  }

  const rawPatientId = req.params.patientId || req.body.patientId || req.query.patientId;
  if (!rawPatientId) {
    return res.status(400).json({ error: 'Target Patient ID is required.' });
  }

  const patientRecord = db.prepare('SELECT id FROM patients WHERE id = ? OR UPPER(patient_id) = ?').get(rawPatientId, rawPatientId.toUpperCase());
  const patientId = patientRecord ? patientRecord.id : rawPatientId;

  const doctorId = req.doctor.id;

  // Query active consent permission
  const activeConsent = db.prepare(`
    SELECT * FROM consent_permissions
    WHERE patient_id = ? 
      AND doctor_id = ? 
      AND is_revoked = 0 
      AND (expires_at > datetime('now') OR expires_at IS NULL)
    ORDER BY granted_at DESC
    LIMIT 1
  `).get(patientId, doctorId);

  if (!activeConsent) {
    // Log unauthorized access attempt in audit log
    logAuditEvent({
      userId: req.user.id,
      action: 'VIEW_RECORD',
      resourceType: 'MedicalRecord',
      resourceId: null,
      patientId: patientId,
      hospitalId: req.doctor.hospital_id,
      ipAddress: req.ip || '127.0.0.1',
      details: `Doctor ${req.user.full_name} (${req.doctor.specialization}) attempted to access patient records without valid patient consent. Access DENIED.`,
      status: 'DENIED'
    });

    return res.status(403).json({
      error: 'Access Restricted: You do not have active patient authorization to view this medical history.',
      consentRequired: true,
      patientId
    });
  }

  req.consent = activeConsent;
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole,
  verifyPatientConsent
};
