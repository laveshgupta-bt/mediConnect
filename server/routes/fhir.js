const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// HL7 FHIR-inspired Interoperability Endpoints
// Follows FHIR R4 JSON resource shapes

// GET /api/fhir/Patient/:patientId
router.get('/Patient/:patientId', authenticateToken, (req, res) => {
  try {
    const patientCode = req.params.patientId;
    const patient = db.prepare(`
      SELECT p.*, u.full_name, u.email, u.phone 
      FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.patient_id = ? OR p.id = ?
    `).get(patientCode, patientCode);

    if (!patient) {
      return res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          diagnostics: `Patient resource ${patientCode} not found`
        }]
      });
    }

    const nameParts = patient.full_name.split(' ');
    const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const givenName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];

    const fhirPatient = {
      resourceType: 'Patient',
      id: patient.patient_id,
      meta: {
        versionId: '1',
        lastUpdated: patient.created_at,
        source: 'https://mediconnect.health/fhir'
      },
      identifier: [
        {
          use: 'official',
          system: 'urn:oid:mediconnect:patient-id',
          value: patient.patient_id
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          family: familyName,
          given: [givenName],
          text: patient.full_name
        }
      ],
      telecom: [
        { system: 'phone', value: patient.phone, use: 'mobile' },
        { system: 'email', value: patient.email, use: 'home' }
      ],
      gender: patient.gender.toLowerCase(),
      birthDate: patient.dob,
      address: [
        {
          use: 'home',
          text: patient.address
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-bloodGroup',
          valueString: patient.blood_group
        }
      ]
    };

    res.json(fhirPatient);
  } catch (err) {
    res.status(500).json({ error: 'FHIR transform error: ' + err.message });
  }
});

// GET /api/fhir/Bundle/:patientId - FHIR Bundle of all resources
router.get('/Bundle/:patientId', authenticateToken, (req, res) => {
  try {
    const patientCode = req.params.patientId;
    const patient = db.prepare(`
      SELECT p.*, u.full_name 
      FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.patient_id = ? OR p.id = ?
    `).get(patientCode, patientCode);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const records = db.prepare(`
      SELECT mr.*, h.name as hospital_name, h.code as hospital_code, u.full_name as doctor_name
      FROM medical_records mr
      JOIN hospitals h ON mr.hospital_id = h.id
      JOIN doctors d ON mr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = ?
    `).all(patient.id);

    const conditions = db.prepare('SELECT * FROM diagnoses WHERE patient_id = ?').all(patient.id);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ?').all(patient.id);
    const labReports = db.prepare('SELECT * FROM lab_reports WHERE patient_id = ?').all(patient.id);

    const bundleEntries = [];

    // Encounters
    records.forEach(r => {
      bundleEntries.push({
        fullUrl: `urn:uuid:${r.id}`,
        resource: {
          resourceType: 'Encounter',
          id: r.id,
          status: 'finished',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: r.record_type
          },
          subject: { reference: `Patient/${patient.patient_id}` },
          period: { start: r.encounter_date },
          serviceProvider: { display: r.hospital_name }
        }
      });
    });

    // Conditions
    conditions.forEach(c => {
      bundleEntries.push({
        fullUrl: `urn:uuid:${c.id}`,
        resource: {
          resourceType: 'Condition',
          id: c.id,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: c.status.toLowerCase() }]
          },
          code: {
            coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: c.icd10_code || 'N/A', display: c.condition_name }],
            text: c.condition_name
          },
          subject: { reference: `Patient/${patient.patient_id}` }
        }
      });
    });

    // MedicationRequests
    prescriptions.forEach(p => {
      bundleEntries.push({
        fullUrl: `urn:uuid:${p.id}`,
        resource: {
          resourceType: 'MedicationRequest',
          id: p.id,
          status: p.status,
          intent: 'order',
          medicationCodeableConcept: {
            text: `${p.medication_name} ${p.dosage}`
          },
          subject: { reference: `Patient/${patient.patient_id}` },
          dosageInstruction: [{ text: `${p.dosage}, ${p.frequency} for ${p.duration}. ${p.instructions || ''}` }]
        }
      });
    });

    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: bundleEntries.length,
      entry: bundleEntries
    };

    res.json(fhirBundle);
  } catch (err) {
    res.status(500).json({ error: 'FHIR Bundle generation failed: ' + err.message });
  }
});

module.exports = router;
