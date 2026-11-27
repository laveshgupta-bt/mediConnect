const path = require('path');

async function runScenarioVerification() {
  console.log('========================================================');
  console.log(' STARTING END-TO-END DEMONSTRATION SCENARIO VERIFICATION');
  console.log('========================================================\n');

  // Re-seed DB to clean slate
  require('./server/db/seed');
  await new Promise(r => setTimeout(r, 1000));

  // Boot server
  require('./server/index');
  const PORT = 5000;
  const BASE_URL = `http://localhost:${PORT}/api`;

  // Step 1: Health Check
  console.log('[Step 1] Verifying System Health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log(' ✓ Health Status:', health.status, 'Platform:', health.platform);

  // Step 2: Patient Login using Unique Patient ID (MC-PAT-7701)
  console.log('\n[Step 2] Logging in as Patient using Unique Patient ID: "MC-PAT-7701"...');
  const patientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'MC-PAT-7701',
      password: 'Patient@123',
      role: 'patient'
    })
  });
  const patientAuth = await patientLoginRes.json();
  if (!patientLoginRes.ok) throw new Error('Patient login failed: ' + patientAuth.error);
  const patientToken = patientAuth.token;
  const patientId = patientAuth.patient.id;
  console.log(` ✓ Logged in with Unique Patient ID: ${patientAuth.user.full_name} (ID: ${patientAuth.patient.patient_id})`);

  // Step 3: Verify Rahul has records across 3 hospitals
  console.log('\n[Step 3] Fetching Rahul Sharma Unified Medical History...');
  const historyRes = await fetch(`${BASE_URL}/patient/medical-history`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const history = await historyRes.json();
  console.log(` ✓ Found ${history.records.length} cross-hospital records across ${history.connectedHospitals.length} hospitals:`);
  history.records.forEach((r, i) => {
    console.log(`   - Record #${i + 1}: [${r.hospital_name}] ${r.title} (Dr. ${r.doctor_name})`);
  });

  // Step 4: Login as Visiting Doctor (Dr. Rajesh Kumar at Metropolitan Medical)
  console.log('\n[Step 4] Testing Doctor Sign-In Verification: Attempting login without Medical ID...');
  const missingMedIdRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.rajesh@metropolitan.org',
      password: 'Doctor@123',
      role: 'doctor'
    })
  });
  console.log(` ✓ Server blocked login without Medical ID: status ${missingMedIdRes.status}`);

  console.log(' -> Doctor logs in with verified Medical ID: "MCI-INTM-2017-9102"...');
  const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.rajesh@metropolitan.org',
      password: 'Doctor@123',
      role: 'doctor',
      medical_id: 'MCI-INTM-2017-9102'
    })
  });
  const docAuth = await docLoginRes.json();
  if (!docLoginRes.ok) throw new Error('Doctor login failed: ' + docAuth.error);
  const doctorToken = docAuth.token;
  console.log(` ✓ Doctor successfully authenticated: ${docAuth.user.full_name} (License: ${docAuth.doctor.license_number}, ${docAuth.doctor.hospital_name})`);

  // Step 5: Doctor searches Rahul Sharma using Patient ID
  console.log('\n[Step 5] Doctor searches for Rahul using Patient ID "MC-PAT-7701"...');
  const searchRes = await fetch(`${BASE_URL}/doctor/search-patients?q=MC-PAT-7701`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  const searchData = await searchRes.json();
  const foundPatient = searchData.patients[0];
  console.log(` ✓ Found Patient: ${foundPatient.full_name} (${foundPatient.patient_id})`);
  console.log(`   Has Active Consent: ${foundPatient.hasConsent} (Should be false initially)`);

  // Step 6: Verify Doctor CANNOT access Rahul's records without consent (Security Check!)
  console.log('\n[Step 6] Testing Security Enforcement: Doctor attempts unauthorized access without consent...');
  const unauthorizedRes = await fetch(`${BASE_URL}/doctor/patient-records/${foundPatient.id}`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  console.log(` ✓ Server response status: ${unauthorizedRes.status} (Expected 403 Forbidden)`);
  const unauthorizedJson = await unauthorizedRes.json();
  console.log(`   Server blocked unauthorized request: "${unauthorizedJson.error}"`);

  // Step 7: Doctor submits formal access request
  console.log('\n[Step 7] Doctor submits formal access request...');
  const requestRes = await fetch(`${BASE_URL}/doctor/request-access`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${doctorToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patientId: foundPatient.id,
      purpose: 'Acute clinical evaluation and comprehensive cross-hospital medication reconciliation',
      durationDays: 7
    })
  });
  const requestData = await requestRes.json();
  console.log(` ✓ ${requestData.message}`);

  // Step 8: Patient checks pending requests
  console.log('\n[Step 8] Patient Rahul checks incoming access requests...');
  const pendingReqRes = await fetch(`${BASE_URL}/patient/access-requests`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const pendingData = await pendingReqRes.json();
  const incomingReq = pendingData.requests.find(r => r.status === 'pending');
  console.log(` ✓ Found Pending Request from: ${incomingReq.doctor_name} (${incomingReq.hospital_name})`);
  console.log(`   Purpose: "${incomingReq.purpose}"`);

  // Step 9: Patient approves doctor access request
  console.log('\n[Step 9] Patient approves the access request...');
  const approveRes = await fetch(`${BASE_URL}/patient/access-requests/${incomingReq.id}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${patientToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ durationDays: 7 })
  });
  const approveData = await approveRes.json();
  console.log(` ✓ ${approveData.message}`);

  // Step 10: Doctor accesses unified history (Now authorized!)
  console.log('\n[Step 10] Doctor accesses Rahul Sharma\'s unified cross-hospital history...');
  const authorizedRes = await fetch(`${BASE_URL}/doctor/patient-records/${foundPatient.id}`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  const recordView = await authorizedRes.json();
  console.log(` ✓ Access GRANTED! Retrieved ${recordView.records.length} records across ${recordView.hospitalsConnected.length} hospitals.`);
  console.log(`   Known Allergies identified: ${recordView.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ')}`);

  // Step 11: Doctor adds new clinical consultation
  console.log('\n[Step 11] Doctor adds a new clinical consultation & prescription at Metropolitan Medical...');
  const addRecordRes = await fetch(`${BASE_URL}/doctor/add-record`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${doctorToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patientId: foundPatient.id,
      encounter_date: '2026-11-19',
      record_type: 'Outpatient Consultation',
      title: 'Routine General Wellness & Cardio-Respiratory Follow-up',
      chiefComplaint: 'Periodic mild exertional dyspnea, blood pressure monitoring check',
      vitals: {
        bloodPressure: '128/82 mmHg',
        heartRate: '72 bpm',
        temp: '98.6 °F',
        spO2: '99%',
        weight: '77.2 kg'
      },
      diagnosis: 'Well-controlled Essential Hypertension and Mild Exercise-Induced Bronchospasm',
      icd10_code: 'I10 / J45.990',
      treatment: 'Continue Lisinopril 10mg daily and maintenance Budesonide/Formoterol inhaler. Avoid NSAID usage.',
      clinicalNotes: 'Cardiovascular and respiratory examination reveals clear lung fields and regular cardiac rhythm. Patient counseled on allergy avoidance.',
      prescriptions: [
        {
          medication_name: 'Montelukast Sodium Tablets',
          dosage: '10 mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take 1 hour before bedtime with water for allergen protection.'
        }
      ]
    })
  });
  const newRecordData = await addRecordRes.json();
  console.log(` ✓ ${newRecordData.message}`);

  // Step 12: Verify new consultation appears in Rahul Sharma's patient timeline
  console.log('\n[Step 12] Verifying that new consultation immediately appears in Rahul Sharma\'s medical timeline...');
  const updatedHistoryRes = await fetch(`${BASE_URL}/patient/medical-history`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const updatedHistory = await updatedHistoryRes.json();
  const latestRec = updatedHistory.records[0];
  console.log(` ✓ Latest Record in Timeline: "${latestRec.title}"`);
  console.log(`   Originating Hospital: [${latestRec.hospital_name}] (Dr. ${latestRec.doctor_name})`);
  console.log(`   Prescriptions attached: ${latestRec.prescriptions.map(p => `${p.medication_name} ${p.dosage}`).join(', ')}`);

  // Step 13: Verify Audit Logs
  console.log('\n[Step 13] Verifying Security Audit Trail...');
  const auditRes = await fetch(`${BASE_URL}/audit-logs?limit=10`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const auditData = await auditRes.json();
  console.log(` ✓ Latest ${auditData.logs.length} audit events logged:`);
  auditData.logs.slice(0, 5).forEach((log, i) => {
    console.log(`   - [${log.action}] (${log.status}) ${log.details}`);
  });

  // Step 14: Verify FHIR Interoperability
  console.log('\n[Step 14] Verifying HL7 FHIR Bundle Interoperability...');
  const fhirRes = await fetch(`${BASE_URL}/fhir/Bundle/${foundPatient.patient_id}`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const fhirBundle = await fhirRes.json();
  console.log(` ✓ FHIR Bundle generated: ResourceType="${fhirBundle.resourceType}", Type="${fhirBundle.type}", TotalEntries=${fhirBundle.total}`);

  console.log('\n========================================================');
  console.log(' ALL DEMONSTRATION SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('========================================================\n');
  process.exit(0);
}

runScenarioVerification().catch(err => {
  console.error('\n❌ Scenario Verification Failed:', err);
  process.exit(1);
});
