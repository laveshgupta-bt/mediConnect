const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('./database');

async function seed() {
  console.log('Seeding MediConnect database with realistic fictional healthcare data...');

  // Clear existing data in correct FK order
  const tables = [
    'audit_logs',
    'consent_permissions',
    'access_requests',
    'appointments',
    'lab_reports',
    'allergies',
    'medications',
    'prescriptions',
    'diagnoses',
    'medical_records',
    'hospital_doctors',
    'doctors',
    'patients',
    'hospitals',
    'users'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // Pre-generate password hashes
  const patientHash = await bcrypt.hash('Patient@123', 10);
  const doctorHash = await bcrypt.hash('Doctor@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // 1. HOSPITALS
  const hospitals = [
    {
      id: 'hosp-cch-100',
      code: 'HOSP-CCH',
      name: 'City Care Hospital',
      address: '742 Healthcare Boulevard, Metro City',
      city: 'Metro City',
      state: 'Maharashtra',
      phone: '+91 22 2456 7890',
      email: 'records@citycare.org',
      license_no: 'MH-MED-2018-9941',
      logo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&auto=format&fit=crop&q=80',
      bed_capacity: 480,
      departments_json: JSON.stringify(['Cardiology', 'Neurology', 'Internal Medicine', 'Emergency Care', 'Pathology'])
    },
    {
      id: 'hosp-smc-200',
      code: 'HOSP-SMC',
      name: 'Sunrise Medical Centre',
      address: '108 Valley View Road, Tech District',
      city: 'Pune',
      state: 'Maharashtra',
      phone: '+91 20 2899 1122',
      email: 'info@sunrisemed.org',
      license_no: 'MH-MED-2020-4412',
      logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
      bed_capacity: 320,
      departments_json: JSON.stringify(['Orthopedics', 'Sports Medicine', 'Physiotherapy', 'Radiology', 'Rehabilitation'])
    },
    {
      id: 'hosp-ghh-300',
      code: 'HOSP-GHH',
      name: 'Global Health Hospital',
      address: '500 Marine Heights Avenue, Bayview',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '+91 22 6123 4500',
      email: 'interop@globalhealth.org',
      license_no: 'MH-MED-2016-1189',
      logo_url: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=150&auto=format&fit=crop&q=80',
      bed_capacity: 650,
      departments_json: JSON.stringify(['Pulmonology', 'Oncology', 'Allergy & Immunology', 'Critical Care', 'Endocrinology'])
    },
    {
      id: 'hosp-mmi-400',
      code: 'HOSP-MMI',
      name: 'Metropolitan Medical Institute',
      address: '15 Apex Corporate Road, Central District',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      phone: '+91 22 4780 3300',
      email: 'admissions@metropolitan.org',
      license_no: 'MH-MED-2022-7801',
      logo_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=150&auto=format&fit=crop&q=80',
      bed_capacity: 400,
      departments_json: JSON.stringify(['Emergency Medicine', 'General Surgery', 'Preventive Health', 'Gastroenterology'])
    }
  ];

  const insertHosp = db.prepare(`
    INSERT INTO hospitals (id, code, name, address, city, state, phone, email, license_no, logo_url, bed_capacity, departments_json)
    VALUES (@id, @code, @name, @address, @city, @state, @phone, @email, @license_no, @logo_url, @bed_capacity, @departments_json)
  `);
  hospitals.forEach(h => insertHosp.run(h));

  // 2. USERS
  const users = [
    // Patient: Rahul Sharma
    {
      id: 'usr-pat-rahul-7701',
      email: 'rahul.sharma@example.com',
      password_hash: patientHash,
      role: 'patient',
      full_name: 'Rahul Sharma',
      phone: '+91 98201 12345',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    // Doctor 1: Dr. Priya Patel (City Care)
    {
      id: 'usr-doc-priya-101',
      email: 'dr.priya@citycare.org',
      password_hash: doctorHash,
      role: 'doctor',
      full_name: 'Dr. Priya Patel',
      phone: '+91 98202 55678',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
    },
    // Doctor 2: Dr. Amit Verma (Sunrise Medical)
    {
      id: 'usr-doc-amit-202',
      email: 'dr.amit@sunrisemed.org',
      password_hash: doctorHash,
      role: 'doctor',
      full_name: 'Dr. Amit Verma',
      phone: '+91 98203 77890',
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
    },
    // Doctor 3: Dr. Sarah Jenkins (Global Health)
    {
      id: 'usr-doc-sarah-303',
      email: 'dr.sarah@globalhealth.org',
      password_hash: doctorHash,
      role: 'doctor',
      full_name: 'Dr. Sarah Jenkins',
      phone: '+91 98204 99012',
      avatar_url: 'https://images.unsplash.com/photo-1594824813589-a29633390c56?w=200&auto=format&fit=crop&q=80'
    },
    // Doctor 4: Dr. Rajesh Kumar (Metropolitan Medical - Visiting Doctor for Demo Scenario)
    {
      id: 'usr-doc-rajesh-404',
      email: 'dr.rajesh@metropolitan.org',
      password_hash: doctorHash,
      role: 'doctor',
      full_name: 'Dr. Rajesh Kumar',
      phone: '+91 98205 33456',
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80'
    },
    // Hospital Admin: City Care Admin
    {
      id: 'usr-adm-citycare-001',
      email: 'admin@citycare.org',
      password_hash: adminHash,
      role: 'hospital_admin',
      full_name: 'Vikramaditya Rao (Chief Registrar)',
      phone: '+91 22 2456 7800',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url)
    VALUES (@id, @email, @password_hash, @role, @full_name, @phone, @avatar_url)
  `);
  users.forEach(u => insertUser.run(u));

  // 3. PATIENTS
  const patient = {
    id: 'pat-rahul-01',
    user_id: 'usr-pat-rahul-7701',
    patient_id: 'MC-PAT-7701',
    blood_group: 'O+',
    dob: '1988-06-15',
    gender: 'Male',
    address: 'Flat 402, Sea Breeze Apartments, Bandra West, Mumbai',
    emergency_contact_name: 'Ananya Sharma',
    emergency_contact_phone: '+91 98765 43210',
    emergency_contact_relation: 'Spouse',
    qr_code_data: JSON.stringify({
      platform: 'MediConnect',
      patientId: 'MC-PAT-7701',
      name: 'Rahul Sharma',
      bloodGroup: 'O+',
      emergencyContact: '+91 98765 43210',
      verificationUrl: 'https://mediconnect.health/verify/MC-PAT-7701'
    })
  };

  db.prepare(`
    INSERT INTO patients (id, user_id, patient_id, blood_group, dob, gender, address, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, qr_code_data)
    VALUES (@id, @user_id, @patient_id, @blood_group, @dob, @gender, @address, @emergency_contact_name, @emergency_contact_phone, @emergency_contact_relation, @qr_code_data)
  `).run(patient);

  // 4. DOCTORS
  const doctors = [
    {
      id: 'doc-priya-101',
      user_id: 'usr-doc-priya-101',
      doctor_id: 'MC-DOC-101',
      specialization: 'Cardiology',
      license_number: 'MCI-CARD-2012-8819',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
      hospital_id: 'hosp-cch-100',
      department: 'Cardiology',
      experience_years: 14,
      bio: 'Consultant Interventional Cardiologist specializing in preventive cardiovascular disease, hypertension, and ischemic heart disorders.'
    },
    {
      id: 'doc-amit-202',
      user_id: 'usr-doc-amit-202',
      doctor_id: 'MC-DOC-202',
      specialization: 'Orthopedics & Sports Medicine',
      license_number: 'MCI-ORTH-2015-4421',
      qualification: 'MBBS, MS (Orthopedics), Fellowship in Arthroscopy & Sports Surgery',
      hospital_id: 'hosp-smc-200',
      department: 'Orthopedics',
      experience_years: 11,
      bio: 'Leading sports medicine and arthroscopic surgeon focused on acute joint trauma, ligamentous reconstruction, and functional rehabilitation.'
    },
    {
      id: 'doc-sarah-303',
      user_id: 'usr-doc-sarah-303',
      doctor_id: 'MC-DOC-303',
      specialization: 'Pulmonology & Critical Care',
      license_number: 'MCI-PULM-2011-3376',
      qualification: 'MBBS, MD (Pulmonary Medicine), European Diploma in Adult Respiratory Medicine (EDARM)',
      hospital_id: 'hosp-ghh-300',
      department: 'Pulmonology',
      experience_years: 15,
      bio: 'Senior Pulmonologist and Critical Care Specialist leading research in persistent adult asthma, chronic obstructive airways, and environmental lung disease.'
    },
    {
      id: 'doc-rajesh-404',
      user_id: 'usr-doc-rajesh-404',
      doctor_id: 'MC-DOC-404',
      specialization: 'Internal & Emergency Medicine',
      license_number: 'MCI-INTM-2017-9102',
      qualification: 'MBBS, MD (General Medicine), MRCEM (UK)',
      hospital_id: 'hosp-mmi-400',
      department: 'Emergency Medicine',
      experience_years: 9,
      bio: 'Consultant Physician and Acute Care Lead at Metropolitan Medical Institute, handling complex poly-morbid patient admissions and cross-specialty triage.'
    }
  ];

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, user_id, doctor_id, specialization, license_number, qualification, hospital_id, department, experience_years, bio)
    VALUES (@id, @user_id, @doctor_id, @specialization, @license_number, @qualification, @hospital_id, @department, @experience_years, @bio)
  `);
  doctors.forEach(d => insertDoctor.run(d));

  // Hospital-Doctor relationships
  const insertHospDoc = db.prepare(`
    INSERT INTO hospital_doctors (id, hospital_id, doctor_id, department, status, joined_date)
    VALUES (?, ?, ?, ?, 'active', ?)
  `);
  insertHospDoc.run('hd-1', 'hosp-cch-100', 'doc-priya-101', 'Cardiology', '2019-01-15');
  insertHospDoc.run('hd-2', 'hosp-smc-200', 'doc-amit-202', 'Orthopedics', '2020-07-01');
  insertHospDoc.run('hd-3', 'hosp-ghh-300', 'doc-sarah-303', 'Pulmonology', '2018-04-10');
  insertHospDoc.run('hd-4', 'hosp-mmi-400', 'doc-rajesh-404', 'Emergency Medicine', '2022-03-20');

  // 5. ALLERGIES (Important for cross-hospital safety!)
  const insertAllergy = db.prepare(`
    INSERT INTO allergies (id, patient_id, allergen, severity, reaction, diagnosed_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAllergy.run('alg-1', 'pat-rahul-01', 'Penicillin & Beta-lactams', 'Severe / Life-threatening', 'Anaphylactic bronchospasm, urticaria and facial angioedema', '2019-03-12');
  insertAllergy.run('alg-2', 'pat-rahul-01', 'Aspirin / NSAIDs (High Dose)', 'Moderate', 'Erythematous maculopapular rash and gastric distress', '2021-11-05');

  // 6. MEDICAL RECORDS ACROSS 3 HOSPITALS (Demonstrating Unified Medical History!)

  // RECORD 1: City Care Hospital (Cardiology)
  const rec1Id = 'rec-cch-cardio-001';
  db.prepare(`
    INSERT INTO medical_records (id, patient_id, doctor_id, hospital_id, record_type, encounter_date, title, chief_complaint, vitals_json, diagnosis, icd10_code, treatment, clinical_notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rec1Id,
    'pat-rahul-01',
    'doc-priya-101',
    'hosp-cch-100',
    'Outpatient Consultation',
    '2026-05-12',
    'Cardiovascular Evaluation & Essential Hypertension',
    'Episodic morning occipital headaches and mild exertional fatigue for 3 weeks',
    JSON.stringify({ bloodPressure: '142/92 mmHg', heartRate: '78 bpm', temp: '98.4 °F', spO2: '98%', weight: '78.0 kg', bmi: '25.5' }),
    'Essential Primary Hypertension with Mild Hyperlipidemia',
    'I10 / E78.5',
    'DASH diet adoption (sodium < 2g/day), aerobic exercise 45 min/day, Lisinopril 10mg daily and Atorvastatin 20mg at bedtime.',
    'Cardiovascular examination revealed normal S1/S2 with no audible murmurs or carotid bruits. 12-lead ECG confirmed sinus rhythm with early non-specific ST-T wave changes. Patient advised against NSAID usage which can exacerbate blood pressure.',
    'finalized'
  );

  db.prepare(`
    INSERT INTO diagnoses (id, medical_record_id, patient_id, condition_name, icd10_code, severity, diagnosed_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('diag-1', rec1Id, 'pat-rahul-01', 'Essential Primary Hypertension', 'I10', 'Moderate', '2026-05-12', 'Active');

  db.prepare(`
    INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, hospital_id, medication_name, dosage, frequency, duration, instructions, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rx-1', rec1Id, 'pat-rahul-01', 'doc-priya-101', 'hosp-cch-100', 'Lisinopril Tablets USP', '10 mg', 'Once daily in morning', '90 days', 'Take with a glass of water after breakfast. Monitor BP twice weekly.', 'active', '2026-05-12');

  db.prepare(`
    INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, hospital_id, medication_name, dosage, frequency, duration, instructions, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rx-2', rec1Id, 'pat-rahul-01', 'doc-priya-101', 'hosp-cch-100', 'Atorvastatin Calcium Tablets', '20 mg', 'Once daily at bedtime', '90 days', 'Avoid grapefruit juice during therapy.', 'active', '2026-05-12');

  db.prepare(`
    INSERT INTO lab_reports (id, medical_record_id, patient_id, hospital_id, doctor_id, test_name, category, test_date, results_json, findings_summary, file_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'lab-1',
    rec1Id,
    'pat-rahul-01',
    'hosp-cch-100',
    'doc-priya-101',
    'Comprehensive Lipid Panel & Renal Function',
    'Blood Work',
    '2026-05-12',
    JSON.stringify({
      'Total Cholesterol': '218 mg/dL (Borderline High)',
      'HDL Cholesterol': '44 mg/dL (Normal)',
      'LDL Cholesterol': '139 mg/dL (Elevated)',
      'Serum Triglycerides': '175 mg/dL (Elevated)',
      'Serum Creatinine': '0.9 mg/dL (Normal)',
      'eGFR': '> 90 mL/min/1.73m²'
    }),
    'Elevated atherogenic lipid profile. Renal function markers within normal limits. Repeat lipid testing scheduled in 3 months.',
    '/uploads/sample_lipid_panel.pdf',
    'Abnormal'
  );

  // RECORD 2: Sunrise Medical Centre (Orthopedics)
  const rec2Id = 'rec-smc-ortho-002';
  db.prepare(`
    INSERT INTO medical_records (id, patient_id, doctor_id, hospital_id, record_type, encounter_date, title, chief_complaint, vitals_json, diagnosis, icd10_code, treatment, clinical_notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rec2Id,
    'pat-rahul-01',
    'doc-amit-202',
    'hosp-smc-200',
    'Outpatient Consultation',
    '2026-08-20',
    'Right Ankle Inversion Injury & Ligamentous Sprain',
    'Twisted right ankle during recreational football match; acute pain, swelling, and antalgic gait',
    JSON.stringify({ bloodPressure: '126/80 mmHg', heartRate: '74 bpm', temp: '98.6 °F', spO2: '99%', weight: '77.5 kg', bmi: '25.3' }),
    'Grade II Anterior Talofibular Ligament Sprain (Right Ankle)',
    'S93.401A',
    'Modified RICE protocol, pneumatic stirrup ankle brace for 14 days, non-weight bearing crutches for 72 hours followed by progressive weight-bearing physiotherapy.',
    'Point tenderness over anterior talofibular ligament. Anterior drawer test positive with soft endpoint. Squeeze test and Maisonneuve palpation negative. Noted patient allergy to Aspirin: avoid all non-selective NSAIDs; selective COX-2 inhibitor prescribed with gastroprotection.',
    'finalized'
  );

  db.prepare(`
    INSERT INTO diagnoses (id, medical_record_id, patient_id, condition_name, icd10_code, severity, diagnosed_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('diag-2', rec2Id, 'pat-rahul-01', 'Anterior Talofibular Ligament Sprain (Right)', 'S93.401A', 'Moderate', '2026-08-20', 'Resolved');

  db.prepare(`
    INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, hospital_id, medication_name, dosage, frequency, duration, instructions, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rx-3', rec2Id, 'pat-rahul-01', 'doc-amit-202', 'hosp-smc-200', 'Etoricoxib Tablets', '90 mg', 'Once daily after meals', '7 days', 'Short course for acute ligament inflammation. Note: Aspirin alternative.', 'completed', '2026-08-20');

  db.prepare(`
    INSERT INTO lab_reports (id, medical_record_id, patient_id, hospital_id, doctor_id, test_name, category, test_date, results_json, findings_summary, file_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'lab-2',
    rec2Id,
    'pat-rahul-01',
    'hosp-smc-200',
    'doc-amit-202',
    'Right Ankle Digital Radiography (AP, Lateral & Mortise Views)',
    'Radiology / Imaging',
    '2026-08-20',
    JSON.stringify({
      'Bony Architecture': 'Intact cortical margins, no fracture or osteochondral defect',
      'Mortise Joint Space': 'Uniform, no widening of syndesmosis',
      'Soft Tissues': 'Significant lateral peri-malleolar soft tissue swelling'
    }),
    'No radiographic evidence of acute bony fracture or avulsion. Findings consistent with acute soft-tissue lateral ligament sprain.',
    '/uploads/sample_ankle_xray.pdf',
    'Normal'
  );

  // RECORD 3: Global Health Hospital (Pulmonology)
  const rec3Id = 'rec-ghh-pulmo-003';
  db.prepare(`
    INSERT INTO medical_records (id, patient_id, doctor_id, hospital_id, record_type, encounter_date, title, chief_complaint, vitals_json, diagnosis, icd10_code, treatment, clinical_notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rec3Id,
    'pat-rahul-01',
    'doc-sarah-303',
    'hosp-ghh-300',
    'Outpatient Consultation',
    '2026-10-15',
    'Acute Exacerbation of Allergic Bronchial Asthma',
    'Dry nocturnal cough, expiratory wheezing, and chest tightness triggered by seasonal dust and smoke',
    JSON.stringify({ bloodPressure: '128/84 mmHg', heartRate: '86 bpm', temp: '98.8 °F', spO2: '96%', respiratoryRate: '20 bpm', weight: '77.0 kg' }),
    'Moderate Persistent Bronchial Asthma with Allergic Phenotype',
    'J45.41',
    'Maintenance inhaled corticosteroid / long-acting beta2-agonist (Budesonide/Formoterol 200/6) 2 puffs twice daily; rescue Levosalbutamol inhaler PRN; HEPA air filter in bedroom.',
    'Bilateral expiratory rhonchi audible on mid-lower lung zones. Peak expiratory flow rate 340 L/min (baseline predicted 510 L/min). Spirometry confirmed reversible airflow obstruction. Emphasized strictly avoiding beta-blocker medications for hypertension as they can trigger bronchospasms.',
    'finalized'
  );

  db.prepare(`
    INSERT INTO diagnoses (id, medical_record_id, patient_id, condition_name, icd10_code, severity, diagnosed_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('diag-3', rec3Id, 'pat-rahul-01', 'Moderate Persistent Bronchial Asthma', 'J45.41', 'Moderate', '2026-10-15', 'Active');

  db.prepare(`
    INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, hospital_id, medication_name, dosage, frequency, duration, instructions, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rx-4', rec3Id, 'pat-rahul-01', 'doc-sarah-303', 'hosp-ghh-300', 'Budesonide + Formoterol Dry Powder Inhaler', '200 mcg / 6 mcg', '2 inhalations twice daily', '60 days', 'Rinse mouth thoroughly with water after inhalation. Do not stop without consultation.', 'active', '2026-10-15');

  db.prepare(`
    INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, hospital_id, medication_name, dosage, frequency, duration, instructions, status, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rx-5', rec3Id, 'pat-rahul-01', 'doc-sarah-303', 'hosp-ghh-300', 'Levosalbutamol Inhaler (Rescue)', '50 mcg', '1-2 puffs as needed for sudden wheezing', '90 days', 'Carry at all times for acute bronchospasm relief.', 'active', '2026-10-15');

  db.prepare(`
    INSERT INTO lab_reports (id, medical_record_id, patient_id, hospital_id, doctor_id, test_name, category, test_date, results_json, findings_summary, file_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'lab-3',
    rec3Id,
    'pat-rahul-01',
    'hosp-ghh-300',
    'doc-sarah-303',
    'Comprehensive Spirometry & Reversibility Assessment',
    'Pulmonology',
    '2026-10-15',
    JSON.stringify({
      'Pre-Bronchodilator FEV1': '2.45 L (68% predicted)',
      'Pre-Bronchodilator FVC': '3.60 L (85% predicted)',
      'Pre FEV1/FVC Ratio': '68%',
      'Post-Bronchodilator FEV1': '2.95 L (82% predicted, +20.4% improvement)',
      'Post FEV1/FVC Ratio': '78%'
    }),
    'Significant positive bronchodilator reversibility (> 12% and > 200 mL improvement in FEV1), establishing diagnosis of bronchial asthma.',
    '/uploads/sample_pulmonary_spirometry.pdf',
    'Abnormal'
  );

  // 7. CURRENT MEDICATIONS SUMMARY (Aggregated across hospitals)
  const insertMed = db.prepare(`
    INSERT INTO medications (id, patient_id, name, dosage, frequency, start_date, end_date, prescribing_hospital, is_current)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMed.run('med-1', 'pat-rahul-01', 'Lisinopril', '10 mg', 'Once daily (morning)', '2026-05-12', '2026-11-12', 'City Care Hospital', 1);
  insertMed.run('med-2', 'pat-rahul-01', 'Atorvastatin', '20 mg', 'Once daily (bedtime)', '2026-05-12', '2026-11-12', 'City Care Hospital', 1);
  insertMed.run('med-3', 'pat-rahul-01', 'Budesonide/Formoterol Inhaler', '200/6 mcg', '2 puffs twice daily', '2026-10-15', '2026-12-15', 'Global Health Hospital', 1);
  insertMed.run('med-4', 'pat-rahul-01', 'Levosalbutamol Inhaler', '50 mcg', 'PRN for acute dyspnea', '2026-10-15', '2027-01-15', 'Global Health Hospital', 1);

  // 8. APPOINTMENTS
  const insertAppt = db.prepare(`
    INSERT INTO appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, department, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAppt.run('apt-1', 'pat-rahul-01', 'doc-priya-101', 'hosp-cch-100', '2026-12-05', '10:30 AM', 'Cardiology', '6-Month Cardiovascular Follow-up & BP Evaluation', 'Scheduled');
  insertAppt.run('apt-2', 'pat-rahul-01', 'doc-sarah-303', 'hosp-ghh-300', '2026-12-20', '02:00 PM', 'Pulmonology', 'Winter Asthma Assessment & Spirometry Check', 'Scheduled');

  // 9. CONSENT PERMISSIONS FOR THE 3 PREVIOUS DOCTORS (Active)
  const insertConsent = db.prepare(`
    INSERT INTO consent_permissions (id, patient_id, doctor_id, hospital_id, access_level, granted_at, expires_at, is_revoked, revoked_at, revoked_reason, is_emergency, emergency_justification)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, 0, NULL)
  `);
  // Valid until next year
  const nextYear = '2027-11-19 18:00:00';
  insertConsent.run('cst-1', 'pat-rahul-01', 'doc-priya-101', 'hosp-cch-100', 'full_history', '2026-05-12 10:00:00', nextYear);
  insertConsent.run('cst-2', 'pat-rahul-01', 'doc-amit-202', 'hosp-smc-200', 'full_history', '2026-08-20 11:30:00', nextYear);
  insertConsent.run('cst-3', 'pat-rahul-01', 'doc-sarah-303', 'hosp-ghh-300', 'full_history', '2026-10-15 14:15:00', nextYear);

  // 10. DR. RAJESH KUMAR (Metropolitan Medical) HAS NO CONSENT YET!
  // This allows testing the exact live demonstration flow.
  // We can add one historical access request or leave it empty so the doctor clicks "Request Access" live.
  console.log('Seeded active consent for 3 prior doctors. Dr. Rajesh Kumar is configured without consent for live demonstration.');

  // 11. AUDIT LOGS (Historical records demonstrating compliance tracking)
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, patient_id, hospital_id, ip_address, details, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run(
    'aud-1',
    'usr-pat-rahul-7701',
    'LOGIN',
    'Patient',
    'pat-rahul-01',
    'pat-rahul-01',
    'hosp-cch-100',
    '192.168.1.45',
    'Patient Rahul Sharma logged into MediConnect patient portal',
    'SUCCESS',
    '2026-05-12 09:30:00'
  );

  insertAudit.run(
    'aud-2',
    'usr-doc-priya-101',
    'APPROVE_CONSENT',
    'Consent',
    'cst-1',
    'pat-rahul-01',
    'hosp-cch-100',
    '10.20.4.11',
    'Full health records access consent granted to Dr. Priya Patel (City Care Hospital)',
    'SUCCESS',
    '2026-05-12 10:00:00'
  );

  insertAudit.run(
    'aud-3',
    'usr-doc-priya-101',
    'ADD_RECORD',
    'MedicalRecord',
    rec1Id,
    'pat-rahul-01',
    'hosp-cch-100',
    '10.20.4.11',
    'Created consultation record for Hypertension at City Care Hospital',
    'SUCCESS',
    '2026-05-12 10:45:00'
  );

  insertAudit.run(
    'aud-4',
    'usr-doc-amit-202',
    'APPROVE_CONSENT',
    'Consent',
    'cst-2',
    'pat-rahul-01',
    'hosp-smc-200',
    '10.30.2.8',
    'Full records access granted to Dr. Amit Verma (Sunrise Medical Centre)',
    'SUCCESS',
    '2026-08-20 11:30:00'
  );

  insertAudit.run(
    'aud-5',
    'usr-doc-amit-202',
    'VIEW_RECORD',
    'MedicalRecord',
    rec1Id,
    'pat-rahul-01',
    'hosp-smc-200',
    '10.30.2.8',
    'Dr. Amit Verma accessed cross-hospital record from City Care Hospital to check medication contraindications',
    'SUCCESS',
    '2026-08-20 11:35:00'
  );

  insertAudit.run(
    'aud-6',
    'usr-doc-sarah-303',
    'APPROVE_CONSENT',
    'Consent',
    'cst-3',
    'pat-rahul-01',
    'hosp-ghh-300',
    '10.40.1.92',
    'Consent granted to Dr. Sarah Jenkins (Global Health Hospital)',
    'SUCCESS',
    '2026-10-15 14:15:00'
  );

  insertAudit.run(
    'aud-7',
    'usr-doc-sarah-303',
    'VIEW_RECORD',
    'MedicalRecord',
    rec1Id,
    'pat-rahul-01',
    'hosp-ghh-300',
    '10.40.1.92',
    'Dr. Sarah Jenkins reviewed cardiology notes from City Care Hospital to verify beta-blocker contraindications',
    'SUCCESS',
    '2026-10-15 14:20:00'
  );

  console.log('Seeding complete! Database successfully populated with 4 hospitals, doctors, patient Rahul Sharma, records, labs, prescriptions, and audit logs.');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
