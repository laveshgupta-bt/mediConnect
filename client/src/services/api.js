const API_BASE = '/api';

function getAuthHeader() {
  const token = (typeof window !== 'undefined' && (sessionStorage.getItem('mediconnect_token') || localStorage.getItem('mediconnect_token'))) || null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function parseJsonSafely(res, defaultError = 'Request failed') {
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      if (text.includes('FUNCTION_INVOCATION_FAILED')) {
        throw new Error('Backend is initializing or undergoing cold start. Please retry in a moment.');
      }
      throw new Error(`Server error (${res.status}): ${text.substring(0, 100) || res.statusText}`);
    }
    throw new Error('Invalid JSON response received from server.');
  }

  if (!res.ok) {
    throw new Error(data?.error || defaultError);
  }
  return data;
}

export const api = {
  // Authentication
  async login(identifier, password, role, medicalId) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, identifier, password, role, medical_id: medicalId })
    });
    return parseJsonSafely(res, 'Login failed');
  },

  async registerPatient(formData) {
    const res = await fetch(`${API_BASE}/auth/register-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return parseJsonSafely(res, 'Registration failed');
  },

  async registerDoctor(formData) {
    const res = await fetch(`${API_BASE}/auth/register-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return parseJsonSafely(res, 'Registration failed');
  },

  async quickDemoLogin(accountType) {
    const res = await fetch(`${API_BASE}/auth/quick-demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountType })
    });
    return parseJsonSafely(res, 'Demo login failed');
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return parseJsonSafely(res, 'Session expired');
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return parseJsonSafely(res, 'Failed to fetch demo accounts');
  },

  // Patient API
  async getPatientDashboard() {
    const res = await fetch(`${API_BASE}/patient/dashboard`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch dashboard');
  },

  async getPatientMedicalHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/patient/medical-history?${query}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch medical history');
  },

  async getPatientPrescriptions() {
    const res = await fetch(`${API_BASE}/patient/prescriptions`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch prescriptions');
  },

  async getPatientLabReports() {
    const res = await fetch(`${API_BASE}/patient/lab-reports`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch lab reports');
  },

  async getPatientAppointments() {
    const res = await fetch(`${API_BASE}/patient/appointments`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch appointments');
  },

  async getPatientAccessRequests() {
    const res = await fetch(`${API_BASE}/patient/access-requests`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch access requests');
  },

  async approveAccessRequest(requestId, durationDays = 7) {
    const res = await fetch(`${API_BASE}/patient/access-requests/${requestId}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationDays })
    });
    return parseJsonSafely(res, 'Failed to approve access request');
  },

  async rejectAccessRequest(requestId, reason) {
    const res = await fetch(`${API_BASE}/patient/access-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return parseJsonSafely(res, 'Failed to reject access request');
  },

  async getPatientConsents() {
    const res = await fetch(`${API_BASE}/patient/consents`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch consents');
  },

  async revokeConsent(consentId, reason) {
    const res = await fetch(`${API_BASE}/patient/consents/${consentId}/revoke`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return parseJsonSafely(res, 'Failed to revoke consent');
  },

  async getPatientAccessHistory() {
    const res = await fetch(`${API_BASE}/patient/access-history`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch access history');
  },

  async getPatientQrCode() {
    const res = await fetch(`${API_BASE}/patient/qr-code`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch QR code');
  },

  async getPatientExportSummary() {
    const res = await fetch(`${API_BASE}/patient/export-summary`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to export summary');
  },

  // Doctor API
  async getDoctorDashboard() {
    const res = await fetch(`${API_BASE}/doctor/dashboard`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch doctor dashboard');
  },

  async searchPatients(q) {
    const res = await fetch(`${API_BASE}/doctor/search-patients?q=${encodeURIComponent(q)}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Search failed');
  },

  async requestDoctorAccess(patientId, purpose, durationDays = 7) {
    const res = await fetch(`${API_BASE}/doctor/request-access`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, purpose, durationDays })
    });
    return parseJsonSafely(res, 'Access request failed');
  },

  async emergencyAccess(patientId, justification) {
    const res = await fetch(`${API_BASE}/doctor/emergency-access`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, justification })
    });
    return parseJsonSafely(res, 'Emergency override failed');
  },

  async getPatientRecordsForDoctor(patientId) {
    const res = await fetch(`${API_BASE}/doctor/patient-records/${patientId}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to load patient records');
  },

  async addMedicalRecord(recordData) {
    const res = await fetch(`${API_BASE}/doctor/add-record`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    return parseJsonSafely(res, 'Failed to save record');
  },

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('document', file);
    const token = (typeof window !== 'undefined' && (sessionStorage.getItem('mediconnect_token') || localStorage.getItem('mediconnect_token'))) || null;
    const res = await fetch(`${API_BASE}/doctor/upload-document`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    return parseJsonSafely(res, 'Failed to upload document');
  },

  async getDoctorAccessHistory() {
    const res = await fetch(`${API_BASE}/doctor/access-history`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch access history');
  },

  // Hospital API
  async getHospitals() {
    const res = await fetch(`${API_BASE}/hospitals`);
    return parseJsonSafely(res, 'Failed to fetch hospitals');
  },

  async getHospitalDetails(id) {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    return parseJsonSafely(res, 'Failed to fetch hospital details');
  },

  async registerHospital(formData) {
    const res = await fetch(`${API_BASE}/hospitals/register`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return parseJsonSafely(res, 'Hospital registration failed');
  },

  async addDoctorToHospital(hospitalId, doctorData) {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/add-doctor`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
    return parseJsonSafely(res, 'Failed to affiliate doctor');
  },

  // Audit logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch audit logs');
  },

  // FHIR
  async getFhirPatient(patientId) {
    const res = await fetch(`${API_BASE}/fhir/Patient/${patientId}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch FHIR patient');
  },

  async getFhirBundle(patientId) {
    const res = await fetch(`${API_BASE}/fhir/Bundle/${patientId}`, { headers: getAuthHeader() });
    return parseJsonSafely(res, 'Failed to fetch FHIR bundle');
  },

  // Gemini AI Assistant Chat
  async sendAIChat(messages, userRole = 'patient') {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userRole })
    });
    return parseJsonSafely(res, 'AI Assistant is temporarily busy');
  }
};
