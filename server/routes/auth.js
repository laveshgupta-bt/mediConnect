const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { logAuditEvent } = require('../middleware/audit');

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password, role, medical_id } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email / ID and password are required.' });
    }

    // Support lookup by Email, Patient ID (MC-PAT-...), or Doctor ID (MC-DOC-...)
    let user = null;

    if (loginId.toUpperCase().startsWith('MC-PAT-')) {
      const patientRecord = db.prepare('SELECT user_id FROM patients WHERE UPPER(patient_id) = ?').get(loginId.toUpperCase());
      if (patientRecord) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(patientRecord.user_id);
      }
    } else {
      const docRecord = db.prepare('SELECT user_id FROM doctors WHERE UPPER(doctor_id) = ? OR UPPER(license_number) = ?').get(loginId.toUpperCase(), loginId.toUpperCase());
      if (docRecord) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(docRecord.user_id);
      }
    }

    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(loginId);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials. User account not found.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Account role mismatch. This account is registered as a ${user.role}, not ${role}.`
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      logAuditEvent({
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user.id,
        details: `Failed login attempt for user ${loginId}`,
        status: 'DENIED'
      });
      return res.status(401).json({ error: 'Invalid credentials or password.' });
    }

    let extraData = {};
    if (user.role === 'patient') {
      const patient = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
      extraData = { patient };
    } else if (user.role === 'doctor') {
      const doctor = db.prepare(`
        SELECT d.*, h.name as hospital_name, h.code as hospital_code 
        FROM doctors d 
        JOIN hospitals h ON d.hospital_id = h.id 
        WHERE d.user_id = ?
      `).get(user.id);

      // Verify Doctor's Medical ID on EVERY sign-in as required
      if (!medical_id || medical_id.trim().length === 0) {
        return res.status(400).json({
          error: 'Medical ID / License Number is required for doctor authentication on every sign-in.'
        });
      }

      const inputMedId = medical_id.trim().toUpperCase();
      const registeredLicense = (doctor.license_number || '').toUpperCase();
      const registeredDocId = (doctor.doctor_id || '').toUpperCase();

      if (inputMedId !== registeredLicense && inputMedId !== registeredDocId) {
        logAuditEvent({
          userId: user.id,
          action: 'LOGIN',
          resourceType: 'Doctor',
          resourceId: doctor.id,
          details: `Doctor ${user.full_name} entered invalid Medical ID "${medical_id}". Access DENIED.`,
          status: 'DENIED'
        });
        return res.status(401).json({
          error: `Invalid Medical ID. Please enter your verified Medical License Number (${doctor.license_number}) or Doctor ID (${doctor.doctor_id}).`
        });
      }

      extraData = { doctor };
    }

    const token = generateToken(user);

    logAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      details: `Successful login as ${user.role} (${user.full_name})`,
      status: 'SUCCESS'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url
      },
      ...extraData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// POST /api/auth/register-patient
router.post('/register-patient', async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      blood_group,
      dob,
      gender,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation
    } = req.body;

    if (!full_name || !email || !password || !blood_group || !dob || !gender) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = 'usr-pat-' + uuidv4().substring(0, 8);
    const patientDbId = 'pat-' + uuidv4().substring(0, 8);
    const patientCode = 'MC-PAT-' + Math.floor(1000 + Math.random() * 9000);

    const qrData = JSON.stringify({
      platform: 'MediConnect',
      patientId: patientCode,
      name: full_name,
      bloodGroup: blood_group,
      emergencyContact: emergency_contact_phone || 'N/A',
      verificationUrl: `https://mediconnect.health/verify/${patientCode}`
    });

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url)
      VALUES (?, ?, ?, 'patient', ?, ?, ?)
    `);

    const insertPatient = db.prepare(`
      INSERT INTO patients (id, user_id, patient_id, blood_group, dob, gender, address, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, qr_code_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute in transaction
    const executeRegistration = db.transaction(() => {
      insertUser.run(
        userId,
        email.trim().toLowerCase(),
        password_hash,
        full_name.trim(),
        phone || null,
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`
      );

      insertPatient.run(
        patientDbId,
        userId,
        patientCode,
        blood_group,
        dob,
        gender,
        address || '',
        emergency_contact_name || '',
        emergency_contact_phone || '',
        emergency_contact_relation || '',
        qrData
      );
    });

    executeRegistration();

    const newUser = db.prepare('SELECT id, email, role, full_name, phone, avatar_url FROM users WHERE id = ?').get(userId);
    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientDbId);
    const token = generateToken(newUser);

    logAuditEvent({
      userId: newUser.id,
      action: 'REGISTER_PATIENT',
      resourceType: 'Patient',
      resourceId: patientDbId,
      patientId: patientDbId,
      details: `New patient registered: ${full_name} (${patientCode})`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      user: newUser,
      patient: newPatient,
      isNewRegistration: true,
      assignedPatientId: patientCode
    });
  } catch (err) {
    console.error('Patient registration error:', err);
    res.status(500).json({ error: 'Failed to complete patient registration: ' + err.message });
  }
});

// POST /api/auth/register-doctor
router.post('/register-doctor', async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      specialization,
      license_number,
      qualification,
      hospital_id,
      department,
      experience_years,
      bio
    } = req.body;

    if (!full_name || !email || !password || !specialization || !license_number || !hospital_id) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = 'usr-doc-' + uuidv4().substring(0, 8);
    const doctorDbId = 'doc-' + uuidv4().substring(0, 8);
    const doctorCode = 'MC-DOC-' + Math.floor(500 + Math.random() * 4500);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url)
      VALUES (?, ?, ?, 'doctor', ?, ?, ?)
    `);

    const insertDoctor = db.prepare(`
      INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, qualification, hospital_id, department, experience_years, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertHospDoc = db.prepare(`
      INSERT INTO hospital_doctors (id, hospital_id, doctor_id, department, status, joined_date)
      VALUES (?, ?, ?, ?, 'active', date('now'))
    `);

    const executeDocReg = db.transaction(() => {
      insertUser.run(
        userId,
        email.trim().toLowerCase(),
        password_hash,
        full_name.trim(),
        phone || null,
        `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80`
      );

      insertDoctor.run(
        doctorDbId,
        userId,
        doctorCode,
        specialization,
        license_number,
        qualification || 'MBBS, MD',
        hospital_id,
        department || specialization,
        experience_years || 5,
        bio || 'Consultant Physician committed to interoperable patient care.'
      );

      insertHospDoc.run(
        'hd-' + uuidv4().substring(0, 8),
        hospital_id,
        doctorDbId,
        department || specialization
      );
    });

    executeDocReg();

    const newUser = db.prepare('SELECT id, email, role, full_name, phone, avatar_url FROM users WHERE id = ?').get(userId);
    const newDoctor = db.prepare(`
      SELECT d.*, h.name as hospital_name 
      FROM doctors d 
      JOIN hospitals h ON d.hospital_id = h.id 
      WHERE d.id = ?
    `).get(doctorDbId);

    const token = generateToken(newUser);

    logAuditEvent({
      userId: newUser.id,
      action: 'REGISTER_DOCTOR',
      resourceType: 'Doctor',
      resourceId: doctorDbId,
      hospitalId: hospital_id,
      details: `New doctor registered: ${full_name} (${doctorCode}, ${specialization})`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: 'Doctor registered successfully',
      token,
      user: newUser,
      doctor: newDoctor,
      isNewRegistration: true,
      assignedDoctorId: doctorCode,
      registeredLicenseNumber: license_number
    });
  } catch (err) {
    console.error('Doctor registration error:', err);
    res.status(500).json({ error: 'Failed to complete doctor registration: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    patient: req.patient || null,
    doctor: req.doctor || null
  });
});

// GET /api/auth/demo-accounts (Returns clearly documented credentials for immediate testing)
router.get('/demo-accounts', (req, res) => {
  res.json({
    patient: {
      role: 'patient',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password: 'Patient@123',
      patientId: 'MC-PAT-7701',
      description: 'Patient with active medical histories across 3 hospitals (City Care, Sunrise Medical, Global Health).'
    },
    visitingDoctor: {
      role: 'doctor',
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh@metropolitan.org',
      password: 'Doctor@123',
      doctorId: 'MC-DOC-404',
      hospital: 'Metropolitan Medical Institute',
      specialization: 'Internal & Emergency Medicine',
      description: 'Visiting doctor in the demonstration scenario who needs to search Rahul, request consent, and add a consultation.'
    },
    treatingDoctors: [
      {
        name: 'Dr. Priya Patel',
        email: 'dr.priya@citycare.org',
        password: 'Doctor@123',
        hospital: 'City Care Hospital',
        specialization: 'Cardiology'
      },
      {
        name: 'Dr. Amit Verma',
        email: 'dr.amit@sunrisemed.org',
        password: 'Doctor@123',
        hospital: 'Sunrise Medical Centre',
        specialization: 'Orthopedics'
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'dr.sarah@globalhealth.org',
        password: 'Doctor@123',
        hospital: 'Global Health Hospital',
        specialization: 'Pulmonology'
      }
    ],
    admin: {
      role: 'hospital_admin',
      name: 'Vikramaditya Rao',
      email: 'admin@citycare.org',
      password: 'Admin@123',
      hospital: 'City Care Hospital'
    }
  });
});

// POST /api/auth/quick-demo-login (1-click login for seamless evaluation!)
router.post('/quick-demo-login', async (req, res) => {
  try {
    const { accountType } = req.body;
    let targetEmail = '';

    if (accountType === 'patient') {
      targetEmail = 'rahul.sharma@example.com';
    } else if (accountType === 'doctor_visiting') {
      targetEmail = 'dr.rajesh@metropolitan.org';
    } else if (accountType === 'doctor_cardio') {
      targetEmail = 'dr.priya@citycare.org';
    } else if (accountType === 'doctor_ortho') {
      targetEmail = 'dr.amit@sunrisemed.org';
    } else if (accountType === 'doctor_pulmo') {
      targetEmail = 'dr.sarah@globalhealth.org';
    } else if (accountType === 'admin') {
      targetEmail = 'admin@citycare.org';
    } else {
      return res.status(400).json({ error: 'Invalid demo account type specified.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo account not found in database.' });
    }

    let extraData = {};
    if (user.role === 'patient') {
      const patient = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
      extraData = { patient };
    } else if (user.role === 'doctor') {
      const doctor = db.prepare(`
        SELECT d.*, h.name as hospital_name, h.code as hospital_code 
        FROM doctors d 
        JOIN hospitals h ON d.hospital_id = h.id 
        WHERE d.user_id = ?
      `).get(user.id);
      extraData = { doctor };
    }

    const token = generateToken(user);

    logAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      details: `Demo quick login initiated as ${user.role} (${user.full_name})`,
      status: 'SUCCESS'
    });

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url
      },
      ...extraData
    });
  } catch (err) {
    console.error('Quick demo login error:', err);
    res.status(500).json({ error: 'Internal server error during demo login.' });
  }
});

module.exports = router;
