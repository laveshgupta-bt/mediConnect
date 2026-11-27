const API_BASE = '/api';

function getAuthHeader() {
  const token = (typeof window !== 'undefined' && (sessionStorage.getItem('mediconnect_token') || localStorage.getItem('mediconnect_token'))) || null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  async login(identifier, password, role, medicalId) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, identifier, password, role, medical_id: medicalId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async registerPatient(formData) {
    const res = await fetch(`${API_BASE}/auth/register-patient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async registerDoctor(formData) {
    const res = await fetch(`${API_BASE}/auth/register-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async quickDemoLogin(accountType) {
    const res = await fetch(`${API_BASE}/auth/quick-demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Demo login failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // Patient API
  async getPatientDashboard() {
    const res = await fetch(`${API_BASE}/patient/dashboard`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard');
    return data;
  },

  async getPatientMedicalHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/patient/medical-history?${query}`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch medical history');
    return data;
  },

  async getPatientPrescriptions() {
    const res = await fetch(`${API_BASE}/patient/prescriptions`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPatientLabReports() {
    const res = await fetch(`${API_BASE}/patient/lab-reports`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPatientAppointments() {
    const res = await fetch(`${API_BASE}/patient/appointments`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPatientAccessRequests() {
    const res = await fetch(`${API_BASE}/patient/access-requests`, { headers: getAuthHeader() });
    return res.json();
  },

  async approveAccessRequest(requestId, durationDays = 7) {
    const res = await fetch(`${API_BASE}/patient/access-requests/${requestId}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationDays })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve access request');
    return data;
  },

  async rejectAccessRequest(requestId, reason) {
    const res = await fetch(`${API_BASE}/patient/access-requests/${requestId}/reject`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject access request');
    return data;
  },

  async getPatientConsents() {
    const res = await fetch(`${API_BASE}/patient/consents`, { headers: getAuthHeader() });
    return res.json();
  },

  async revokeConsent(consentId, reason) {
    const res = await fetch(`${API_BASE}/patient/consents/${consentId}/revoke`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke consent');
    return data;
  },

  async getPatientAccessHistory() {
    const res = await fetch(`${API_BASE}/patient/access-history`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPatientQrCode() {
    const res = await fetch(`${API_BASE}/patient/qr-code`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPatientExportSummary() {
    const res = await fetch(`${API_BASE}/patient/export-summary`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to export summary');
    return data;
  },

  // Doctor API
  async getDoctorDashboard() {
    const res = await fetch(`${API_BASE}/doctor/dashboard`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch doctor dashboard');
    return data;
  },

  async searchPatients(q) {
    const res = await fetch(`${API_BASE}/doctor/search-patients?q=${encodeURIComponent(q)}`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Search failed');
    return data;
  },

  async requestDoctorAccess(patientId, purpose, durationDays = 7) {
    const res = await fetch(`${API_BASE}/doctor/request-access`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, purpose, durationDays })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Access request failed');
    return data;
  },

  async emergencyAccess(patientId, justification) {
    const res = await fetch(`${API_BASE}/doctor/emergency-access`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, justification })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Emergency override failed');
    return data;
  },

  async getPatientRecordsForDoctor(patientId) {
    const res = await fetch(`${API_BASE}/doctor/patient-records/${patientId}`, { headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load patient records');
    return data;
  },

  async addMedicalRecord(recordData) {
    const res = await fetch(`${API_BASE}/doctor/add-record`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save record');
    return data;
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data;
  },

  async getDoctorAccessHistory() {
    const res = await fetch(`${API_BASE}/doctor/access-history`, { headers: getAuthHeader() });
    return res.json();
  },

  // Hospital API
  async getHospitals() {
    const res = await fetch(`${API_BASE}/hospitals`);
    return res.json();
  },

  async getHospitalDetails(id) {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    return res.json();
  },

  async registerHospital(formData) {
    const res = await fetch(`${API_BASE}/hospitals/register`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Hospital registration failed');
    return data;
  },

  async addDoctorToHospital(hospitalId, doctorData) {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/add-doctor`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to affiliate doctor');
    return data;
  },

  // Audit logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`, { headers: getAuthHeader() });
    return res.json();
  },

  // FHIR
  async getFhirPatient(patientId) {
    const res = await fetch(`${API_BASE}/fhir/Patient/${patientId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async getFhirBundle(patientId) {
    const res = await fetch(`${API_BASE}/fhir/Bundle/${patientId}`, { headers: getAuthHeader() });
    return res.json();
  },

  // Gemini AI Assistant Chat
  async sendAIChat(messages, userRole = 'patient') {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userRole })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Assistant is temporarily busy');
    return data;
  }
};
