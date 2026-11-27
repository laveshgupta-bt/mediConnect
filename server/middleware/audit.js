const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

function logAuditEvent({
  userId = null,
  action,
  resourceType,
  resourceId = null,
  patientId = null,
  hospitalId = null,
  ipAddress = '127.0.0.1',
  details = '',
  status = 'SUCCESS'
}) {
  try {
    const id = 'aud-' + uuidv4().substring(0, 8);
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, patient_id, hospital_id, ip_address, details, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, action, resourceType, resourceId, patientId, hospitalId, ipAddress, details, status);
    return id;
  } catch (err) {
    console.error('Audit log failure:', err.message);
    return null;
  }
}

module.exports = { logAuditEvent };
