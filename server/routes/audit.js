const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/audit-logs - View system audit logs
router.get('/', authenticateToken, (req, res) => {
  try {
    const { action, status, limit = 50 } = req.query;

    let query = `
      SELECT 
        al.*,
        u.full_name as user_name,
        u.role as user_role,
        h.name as hospital_name,
        p.patient_id as patient_code,
        pat_u.full_name as patient_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN hospitals h ON al.hospital_id = h.id
      LEFT JOIN patients p ON al.patient_id = p.id
      LEFT JOIN users pat_u ON p.user_id = pat_u.id
      WHERE 1=1
    `;

    const params = [];

    // Role restrictions: patients only see their own logs
    if (req.user.role === 'patient') {
      query += ` AND al.patient_id = ?`;
      params.push(req.patient.id);
    } else if (req.user.role === 'doctor') {
      // Doctors see logs involving their user_id or where they were treating
      query += ` AND (al.user_id = ? OR al.hospital_id = ?)`;
      params.push(req.user.id, req.doctor.hospital_id);
    }

    if (action) {
      query += ` AND al.action = ?`;
      params.push(action);
    }

    if (status) {
      query += ` AND al.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY al.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const logs = db.prepare(query).all(...params);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs: ' + err.message });
  }
});

module.exports = router;
