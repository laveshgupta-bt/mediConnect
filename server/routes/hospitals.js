const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { logAuditEvent } = require('../middleware/audit');

const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect-super-secure-production-secret-key-2026';

// Optional auth helper: allows logged-in admin/user or falls back to demo admin
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = { id: 'usr-admin-01', full_name: 'Facility Administrator' };
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = { id: 'usr-admin-01', full_name: 'Facility Administrator' };
    else req.user = user;
    next();
  });
}

// GET /api/hospitals - Public list of connected hospitals & private clinics
router.get('/', (req, res) => {
  try {
    const hospitals = db.prepare(`
      SELECT 
        h.*,
        COALESCE(h.facility_type, 'hospital') as facility_type,
        (SELECT COUNT(*) FROM hospital_doctors WHERE hospital_id = h.id) as doctor_count,
        (SELECT COUNT(*) FROM medical_records WHERE hospital_id = h.id) as total_records_count
      FROM hospitals h
      ORDER BY h.name ASC
    `).all();

    const formatted = hospitals.map(h => ({
      ...h,
      departments: h.departments_json ? JSON.parse(h.departments_json) : []
    }));

    res.json({ hospitals: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve hospitals: ' + err.message });
  }
});

// GET /api/hospitals/:id - Specific facility details, doctors, activity
router.get('/:id', (req, res) => {
  try {
    const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ? OR code = ?').get(req.params.id, req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Healthcare facility not found.' });
    }

    const doctors = db.prepare(`
      SELECT 
        d.*,
        u.full_name,
        u.email,
        u.avatar_url,
        hd.department as current_department,
        hd.status as staff_status
      FROM hospital_doctors hd
      JOIN doctors d ON hd.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE hd.hospital_id = ?
      ORDER BY d.created_at DESC
    `).all(hospital.id);

    const recentRecords = db.prepare(`
      SELECT 
        mr.*, 
        p.patient_id as patient_code,
        u.full_name as patient_name,
        doc_u.full_name as doctor_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users doc_u ON d.user_id = doc_u.id
      WHERE mr.hospital_id = ?
      ORDER BY mr.encounter_date DESC
      LIMIT 10
    `).all(hospital.id);

    const stats = {
      totalDoctors: doctors.length,
      totalRecordsUploaded: db.prepare('SELECT COUNT(*) as count FROM medical_records WHERE hospital_id = ?').get(hospital.id).count,
      bedCapacity: hospital.bed_capacity || 0,
      facilityType: hospital.facility_type || 'hospital'
    };

    res.json({
      hospital: {
        ...hospital,
        facility_type: hospital.facility_type || 'hospital',
        departments: hospital.departments_json ? JSON.parse(hospital.departments_json) : []
      },
      doctors,
      recentRecords,
      stats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hospital details: ' + err.message });
  }
});

// POST /api/hospitals/register - Register a new hospital or private clinic
router.post('/register', optionalAuth, async (req, res) => {
  try {
    const {
      name,
      code,
      facility_type = 'hospital', // 'hospital', 'private_clinic', 'diagnostic_center'
      address,
      city,
      state,
      phone,
      email,
      license_no,
      bed_capacity,
      departments,
      leadDoctor // Optional doctor created alongside the facility
    } = req.body;

    if (!name || !code || !address || !license_no) {
      return res.status(400).json({ error: 'Facility name, code, address, and license number are required.' });
    }

    const existing = db.prepare('SELECT id FROM hospitals WHERE code = ?').get(code);
    if (existing) {
      return res.status(400).json({ error: 'A facility with this registration code already exists.' });
    }

    const prefix = facility_type === 'private_clinic' ? 'cln-' : 'hosp-';
    const id = prefix + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const defaultDepartments = facility_type === 'private_clinic'
      ? ['General Consultation', 'Specialist OPD', 'Preventive Care']
      : ['General Medicine', 'Emergency Care', 'Outpatient Care'];

    const logo = facility_type === 'private_clinic'
      ? 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80';

    const defaultCapacity = facility_type === 'private_clinic' ? (bed_capacity || 0) : (bed_capacity || 250);

    db.prepare(`
      INSERT INTO hospitals (id, code, name, facility_type, address, city, state, phone, email, license_no, logo_url, bed_capacity, departments_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code.toUpperCase(),
      name,
      facility_type,
      address,
      city || 'Metro Area',
      state || 'State',
      phone || '+91 22 0000 0000',
      email || null,
      license_no,
      logo,
      defaultCapacity,
      departments ? JSON.stringify(departments) : JSON.stringify(defaultDepartments)
    );

    let createdDoctorInfo = null;

    // If leadDoctor is supplied, automatically affiliate doctor with this facility
    if (leadDoctor && leadDoctor.full_name && leadDoctor.license_number) {
      try {
        const docUserId = 'usr-' + uuidv4().substring(0, 8);
        const docId = 'doc-' + uuidv4().substring(0, 8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(leadDoctor.password || 'Doctor@123', salt);

        const cleanEmail = leadDoctor.email || `dr.${leadDoctor.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${code.toLowerCase()}.org`;

        // Create user
        db.prepare(`
          INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url)
          VALUES (?, ?, ?, 'doctor', ?, ?, ?)
        `).run(
          docUserId,
          cleanEmail,
          passwordHash,
          leadDoctor.full_name,
          leadDoctor.phone || '+91 98000 00000',
          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
        );

        // Create doctor
        let uniqueDoctorCode = 'DOC-' + leadDoctor.license_number.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
        if (db.prepare('SELECT id FROM doctors WHERE doctor_id = ?').get(uniqueDoctorCode)) {
          uniqueDoctorCode = 'DOC-' + Math.floor(1000 + Math.random() * 9000);
        }
        db.prepare(`
          INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, qualification, hospital_id, department, experience_years, bio)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          docId,
          docUserId,
          uniqueDoctorCode,
          leadDoctor.specialization || (facility_type === 'private_clinic' ? 'Consulting Physician' : 'General Medicine'),
          leadDoctor.license_number,
          leadDoctor.qualification || 'MBBS, MD',
          id,
          leadDoctor.department || 'Outpatient Care',
          leadDoctor.experience_years || 8,
          `Affiliated physician at ${name}`
        );

        // Insert junction
        db.prepare(`
          INSERT INTO hospital_doctors (id, hospital_id, doctor_id, department, status)
          VALUES (?, ?, ?, ?, 'active')
        `).run('hd-' + uuidv4().substring(0, 8), id, docId, leadDoctor.department || 'Outpatient Care');

        createdDoctorInfo = {
          id: docId,
          full_name: leadDoctor.full_name,
          license_number: leadDoctor.license_number,
          email: cleanEmail
        };
      } catch (docErr) {
        console.warn('Warning: Failed to create lead doctor for facility:', docErr.message);
      }
    }

    logAuditEvent({
      userId: req.user.id,
      action: 'REGISTER_HOSPITAL',
      resourceType: 'Hospital',
      resourceId: id,
      hospitalId: id,
      details: `New ${facility_type} registered: ${name} (${code})`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: `${facility_type === 'private_clinic' ? 'Private Clinic' : 'Hospital facility'} registered successfully onto MediConnect Network!`,
      hospitalId: id,
      doctor: createdDoctorInfo
    });
  } catch (err) {
    console.error('Facility register error:', err);
    res.status(500).json({ error: 'Failed to register facility: ' + err.message });
  }
});

// POST /api/hospitals/:id/add-doctor - Affiliate / Add a new licensed doctor to this specific facility
router.post('/:id/add-doctor', optionalAuth, async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ? OR code = ?').get(hospitalId, hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Target healthcare facility not found.' });
    }

    const {
      full_name,
      email,
      specialization,
      license_number,
      qualification = 'MBBS, MD',
      department = 'General Consultation',
      experience_years = 8,
      phone = '+91 98000 00000',
      bio,
      password = 'Doctor@123'
    } = req.body;

    if (!full_name || !license_number || !specialization) {
      return res.status(400).json({ error: 'Doctor name, medical license ID, and specialization are required.' });
    }

    // Check if license already exists
    const existingDoc = db.prepare('SELECT id FROM doctors WHERE license_number = ?').get(license_number);
    if (existingDoc) {
      // Check if already in hospital_doctors for this facility
      const alreadyLinked = db.prepare('SELECT id FROM hospital_doctors WHERE hospital_id = ? AND doctor_id = ?').get(hospital.id, existingDoc.id);
      if (alreadyLinked) {
        return res.status(400).json({ error: 'This doctor is already affiliated with this facility.' });
      }

      // Link existing doctor to this hospital
      db.prepare(`
        INSERT INTO hospital_doctors (id, hospital_id, doctor_id, department, status)
        VALUES (?, ?, ?, ?, 'active')
      `).run('hd-' + uuidv4().substring(0, 8), hospital.id, existingDoc.id, department);

      return res.status(200).json({
        message: `Existing practitioner ${full_name} successfully affiliated with ${hospital.name}.`,
        doctorId: existingDoc.id
      });
    }

    // Generate unique email if omitted or taken
    let targetEmail = email ? email.trim().toLowerCase() : `dr.${full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${hospital.code.toLowerCase()}.org`;
    const emailConflict = db.prepare('SELECT id FROM users WHERE email = ?').get(targetEmail);
    if (emailConflict) {
      targetEmail = `dr.${full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(100 + Math.random() * 900)}@${hospital.code.toLowerCase()}.org`;
    }

    const docUserId = 'usr-' + uuidv4().substring(0, 8);
    const docId = 'doc-' + uuidv4().substring(0, 8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Create user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url)
      VALUES (?, ?, ?, 'doctor', ?, ?, ?)
    `).run(
      docUserId,
      targetEmail,
      passwordHash,
      full_name,
      phone,
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
    );

    // 2. Create doctor record
    let uniqueDoctorCode = 'DOC-' + license_number.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    if (db.prepare('SELECT id FROM doctors WHERE doctor_id = ?').get(uniqueDoctorCode)) {
      uniqueDoctorCode = 'DOC-' + Math.floor(1000 + Math.random() * 9000);
    }
    db.prepare(`
      INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, qualification, hospital_id, department, experience_years, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      docUserId,
      uniqueDoctorCode,
      specialization,
      license_number,
      qualification,
      hospital.id,
      department,
      experience_years,
      bio || `Practicing clinician at ${hospital.name}`
    );

    // 3. Link in hospital_doctors junction
    db.prepare(`
      INSERT INTO hospital_doctors (id, hospital_id, doctor_id, department, status)
      VALUES (?, ?, ?, ?, 'active')
    `).run('hd-' + uuidv4().substring(0, 8), hospital.id, docId, department);

    logAuditEvent({
      userId: req.user.id,
      action: 'ADD_RECORD',
      resourceType: 'Doctor',
      resourceId: docId,
      hospitalId: hospital.id,
      details: `New physician ${full_name} (${license_number}) affiliated with ${hospital.name}`,
      status: 'SUCCESS'
    });

    const formattedDocName = full_name.toLowerCase().startsWith('dr.') || full_name.toLowerCase().startsWith('dr ')
      ? full_name
      : `Dr. ${full_name}`;

    res.status(201).json({
      message: `${formattedDocName} successfully added and affiliated with ${hospital.name}!`,
      doctor: {
        id: docId,
        full_name,
        specialization,
        license_number,
        email: targetEmail,
        department,
        hospital_id: hospital.id
      }
    });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ error: 'Failed to add doctor to facility: ' + err.message });
  }
});

module.exports = router;
