const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const bundledDbPath = path.join(__dirname, 'mediconnect.db');

let dbPath = bundledDbPath;

if (isServerless) {
  // In Vercel serverless functions, the deployment directory is strictly read-only.
  // /tmp is the only writable directory.
  const tmpDbPath = path.join('/tmp', 'mediconnect.db');
  try {
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    }
    dbPath = tmpDbPath;
  } catch (err) {
    console.warn('[Database] Failed to copy database to /tmp:', err.message);
  }
}

let db;
try {
  db = new Database(dbPath);
  if (!isServerless) {
    db.pragma('journal_mode = WAL');
  } else {
    // In serverless /tmp, use MEMORY journal mode to avoid file locking conflicts
    db.pragma('journal_mode = MEMORY');
  }
  db.pragma('foreign_keys = ON');
} catch (err) {
  console.error('[Database] Failed to open SQLite database at', dbPath, err);
  db = new Database(':memory:');
}

function initializeDatabase() {
  const schema = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'hospital_admin')),
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Hospitals Table
    CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      facility_type TEXT DEFAULT 'hospital', -- 'hospital', 'private_clinic', 'diagnostic_center'
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      license_no TEXT NOT NULL,
      logo_url TEXT,
      bed_capacity INTEGER DEFAULT 350,
      departments_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Patients Table
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      patient_id TEXT UNIQUE NOT NULL,
      blood_group TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      emergency_contact_relation TEXT,
      qr_code_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Doctors Table
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doctor_id TEXT UNIQUE NOT NULL,
      specialization TEXT NOT NULL,
      license_number TEXT NOT NULL,
      qualification TEXT NOT NULL,
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      department TEXT NOT NULL,
      experience_years INTEGER DEFAULT 10,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Hospital Doctors Junction Table
    CREATE TABLE IF NOT EXISTS hospital_doctors (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      department TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      joined_date TEXT,
      UNIQUE(hospital_id, doctor_id)
    );

    -- Medical Records Table (Clinical Encounters)
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      record_type TEXT NOT NULL, -- 'Outpatient Consultation', 'Inpatient Admission', 'Emergency Care', 'Diagnostic Review', 'Surgery'
      encounter_date TEXT NOT NULL,
      title TEXT NOT NULL,
      chief_complaint TEXT,
      vitals_json TEXT, -- JSON: { bp, heartRate, temp, spO2, weight }
      diagnosis TEXT NOT NULL,
      icd10_code TEXT,
      treatment TEXT NOT NULL,
      clinical_notes TEXT,
      status TEXT DEFAULT 'finalized',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Diagnoses Table
    CREATE TABLE IF NOT EXISTS diagnoses (
      id TEXT PRIMARY KEY,
      medical_record_id TEXT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      condition_name TEXT NOT NULL,
      icd10_code TEXT,
      severity TEXT DEFAULT 'Moderate',
      diagnosed_date TEXT NOT NULL,
      status TEXT DEFAULT 'Active' -- 'Active', 'Resolved', 'Chronic'
    );

    -- Prescriptions Table
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      instructions TEXT,
      status TEXT DEFAULT 'active', -- 'active', 'completed', 'discontinued'
      issued_at TEXT NOT NULL
    );

    -- Medications Table (Summary list for quick lookup)
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      prescribing_hospital TEXT,
      is_current INTEGER DEFAULT 1
    );

    -- Allergies Table
    CREATE TABLE IF NOT EXISTS allergies (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      allergen TEXT NOT NULL,
      severity TEXT NOT NULL, -- 'Mild', 'Moderate', 'Severe / Life-threatening'
      reaction TEXT NOT NULL,
      diagnosed_date TEXT
    );

    -- Lab Reports Table
    CREATE TABLE IF NOT EXISTS lab_reports (
      id TEXT PRIMARY KEY,
      medical_record_id TEXT REFERENCES medical_records(id) ON DELETE SET NULL,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      doctor_id TEXT REFERENCES doctors(id),
      test_name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Blood Work', 'Radiology / Imaging', 'Cardiology', 'Pulmonology', 'Pathology'
      test_date TEXT NOT NULL,
      results_json TEXT,
      findings_summary TEXT,
      file_url TEXT,
      status TEXT DEFAULT 'Normal', -- 'Normal', 'Abnormal', 'Pending Review'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments Table
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      department TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Access Requests Table
    CREATE TABLE IF NOT EXISTS access_requests (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      purpose TEXT NOT NULL,
      requested_duration_days INTEGER DEFAULT 7,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME,
      rejection_reason TEXT
    );

    -- Consent Permissions Table
    CREATE TABLE IF NOT EXISTS consent_permissions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES doctors(id),
      hospital_id TEXT NOT NULL REFERENCES hospitals(id),
      access_level TEXT DEFAULT 'full_history', -- 'full_history', 'prescriptions_only', 'emergency_break_glass'
      granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      is_revoked INTEGER DEFAULT 0,
      revoked_at DATETIME,
      revoked_reason TEXT,
      is_emergency INTEGER DEFAULT 0,
      emergency_justification TEXT
    );

    -- Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL, -- 'LOGIN', 'SEARCH_PATIENT', 'REQUEST_ACCESS', 'APPROVE_CONSENT', 'REJECT_CONSENT', 'REVOKE_CONSENT', 'VIEW_RECORD', 'ADD_RECORD', 'EMERGENCY_OVERRIDE', 'EXPORT_HISTORY'
      resource_type TEXT NOT NULL, -- 'Patient', 'MedicalRecord', 'Consent', 'Prescription', 'LabReport'
      resource_id TEXT,
      patient_id TEXT,
      hospital_id TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      details TEXT,
      status TEXT DEFAULT 'SUCCESS', -- 'SUCCESS', 'DENIED', 'WARNING'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Indexes for fast querying
    CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
    CREATE INDEX IF NOT EXISTS idx_records_patient ON medical_records(patient_id);
    CREATE INDEX IF NOT EXISTS idx_records_hospital ON medical_records(hospital_id);
    CREATE INDEX IF NOT EXISTS idx_consent_patient_doctor ON consent_permissions(patient_id, doctor_id, is_revoked);
    CREATE INDEX IF NOT EXISTS idx_access_requests_patient ON access_requests(patient_id, status);
    CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_logs(patient_id);
  `;

  db.exec(schema);

  // Gracefully ensure facility_type column exists on hospitals table
  try {
    const cols = db.prepare('PRAGMA table_info(hospitals)').all();
    if (!cols.some(c => c.name === 'facility_type')) {
      db.prepare("ALTER TABLE hospitals ADD COLUMN facility_type TEXT DEFAULT 'hospital'").run();
    }
  } catch (err) {
    // Migration fallback
  }

  console.log('Database tables verified and initialized successfully.');

  // If database is empty (e.g. freshly initialized in /tmp on Vercel), auto-seed essential demo data
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    if (userCount === 0) {
      console.log('[Database] Database has 0 users. Triggering initial demo data seed...');
      const seed = require('./seed');
      seed().catch(err => console.warn('[Database] Auto-seed background error:', err.message));
    }
  } catch (err) {
    console.warn('[Database] Could not verify user count:', err.message);
  }
}

initializeDatabase();

module.exports = db;
