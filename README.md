# MediConnect — One Patient. One Medical History. Multiple Hospitals.

> **Demonstration Prototype Notice:** MediConnect is a technology demonstration prototype designed to showcase healthcare interoperability, role-based access control (RBAC), and patient consent governance using synthetic fictional healthcare data. It is not clinically certified for live medical diagnostics or treatment.

---

## 1. Project Overview

**Problem Statement:**
Why can't doctors access patient medical histories across hospitals? Currently, healthcare systems operate in isolated data silos. When patients visit different clinics or emergency centers, past diagnoses, drug allergies, and treatments are invisible, causing dangerous medical blind spots and repeated expensive testing.

**Our Solution:**
MediConnect is a centralized, secure, interoperable healthcare platform that unifies patient medical histories across connected hospitals. Access is strictly controlled through patient-authorized consent and protected by server-side verification and immutable audit logging.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Framer Motion, Canvas Confetti, QRCode.react.
- **Backend:** Node.js, Express.js REST API.
- **Database:** SQLite (using `better-sqlite3` with WAL mode and foreign key constraints).
- **Security & Auth:** JWT session tokens, bcrypt password hashing, server-side consent authorization middleware, immutable audit logging.
- **Healthcare Interoperability:** HL7 FHIR R4-inspired REST bundle structures (`Patient`, `Encounter`, `Condition`, `MedicationRequest`, `Observation`).

---

## 3. Project Folder Structure

```
hospital/
├── package.json                   # Root package script runner (concurrently)
├── README.md                      # Comprehensive platform documentation
├── test-scenario.js               # Automated end-to-end verification script
│
├── server/                        # Express API Backend & Database
│   ├── index.js                   # Express server entry point (Port 5000)
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Environment configuration
│   ├── db/
│   │   ├── database.js            # SQLite initialization & schema definitions
│   │   ├── seed.js                # Database seeder (hospitals, doctors, Rahul Sharma)
│   │   └── mediconnect.db         # Relational database file
│   ├── middleware/
│   │   ├── auth.js                # JWT auth, RBAC, & verifyPatientConsent middleware
│   │   └── audit.js               # Audit log helper
│   ├── routes/
│   │   ├── auth.js                # Login, registration, 1-click demo login
│   │   ├── patients.js            # Patient dashboard, medical timeline, consent mgmt
│   │   ├── doctors.js             # Patient search, request access, emergency override, EHR
│   │   ├── hospitals.js           # Connected facility management & registration
│   │   ├── fhir.js                # HL7 FHIR R4 endpoints (/api/fhir/Bundle/:id)
│   │   └── audit.js               # Security audit trail queries
│   └── uploads/                   # Secure storage for uploaded medical documents
│
└── client/                        # React + Vite + Three.js Frontend (Port 3000)
    ├── package.json               # Frontend dependencies
    ├── vite.config.js             # Vite configuration with API proxy
    ├── tailwind.config.js         # Custom Deep Navy & Medical Teal color system
    ├── postcss.config.js
    ├── index.html                 # HTML entry point with Plus Jakarta Sans typography
    └── src/
        ├── main.jsx               # Application entry with AuthProvider
        ├── App.jsx                # Main application orchestrator & routing
        ├── index.css              # Custom styling, glassmorphism, animations
        ├── context/
        │   └── AuthContext.jsx    # Session state & quick demo account switches
        ├── services/
        │   └── api.js             # Centralized API fetch wrapper
        └── components/
            ├── Navbar.jsx         # Glassmorphic header with Demo Account Switcher
            ├── Footer.jsx         # Prototype disclaimer, FHIR info & site links
            ├── AuthModal.jsx      # Role-based login and registration modal
            ├── three/
            │   ├── HeroHospitalCanvas.jsx       # 3D Hospital reception environment
            │   └── HospitalWalkthroughScene.jsx # 3D Walking patient corridor experience
            ├── landing/
            │   ├── HeroSection.jsx              # Section 1: Hero with 3D environment
            │   ├── WalkthroughSection.jsx       # Section 2: Cinematic scrolling experience
            │   ├── ProblemSection.jsx           # Section 3: Healthcare fragmentation crisis
            │   ├── SolutionDiagram.jsx          # Section 4: One Connected Healthcare Ecosystem
            │   ├── HowItWorksSection.jsx        # Section 5: 4-step workflow
            │   ├── FeaturesSection.jsx          # Section 6: Key enterprise features
            │   └── LoginSelectionSection.jsx    # Section 7: Patient & Doctor login cards
            ├── patient/
            │   ├── PatientDashboardLayout.jsx   # Sidebar & dashboard container
            │   ├── PatientOverview.jsx          # Vitals, metrics, allergies, recent labs
            │   ├── PatientMedicalTimeline.jsx   # Chronological cross-hospital timeline
            │   ├── PatientManageAccess.jsx      # Approve/reject requests & revoke access
            │   ├── PatientPrescriptions.jsx     # Active and past medications
            │   ├── PatientLabReports.jsx        # Diagnostic reports & abnormal flags
            │   ├── PatientAppointments.jsx      # Scheduled visits
            │   ├── PatientAccessHistory.jsx     # Security audit trail
            │   ├── PatientProfile.jsx           # Demographics & summary export
            │   └── QRCodeModal.jsx              # Emergency Patient QR ID
            ├── doctor/
            │   ├── DoctorDashboardLayout.jsx    # Clinician console container
            │   ├── DoctorOverview.jsx           # Doctor metrics & active consents
            │   ├── DoctorSearchPatients.jsx     # Patient search & request access
            │   ├── DoctorPatientRecordView.jsx  # Deep clinical view (consent-enforced)
            │   ├── DoctorAddRecordModal.jsx     # Consultation & digital prescription form
            │   ├── DoctorAccessHistory.jsx      # Doctor's access audit logs
            │   └── EmergencyAccessModal.jsx     # Break-glass emergency override
            ├── hospital/
            │   └── HospitalManagementView.jsx   # Facility profiles, doctors & records
            └── common/
                ├── DemoBanner.jsx               # Floating walkthrough helper
                └── SummaryExportModal.jsx       # Printable PDF health passport preview
```

---

## 4. Instructions to Install and Run the Project

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Step 1: Install Dependencies
Dependencies for root, server, and client can be installed via:
```powershell
# From the project root:
npm install

# Install server dependencies:
cd server
npm install
cd ..

# Install client dependencies:
cd client
npm install
cd ..
```

### Step 2: Seed the Database
Populate the database with realistic fictional hospitals, doctors, and patient Rahul Sharma's medical records across 3 hospitals:
```powershell
npm run seed
```

### Step 3: Run the Complete Application
Run both backend and frontend concurrently with one command:
```powershell
npm run dev
```
- **Backend API:** `http://localhost:5000/api`
- **Frontend Web App:** `http://localhost:3000`

---

## 5. Environment Variables Setup

Create a `.env` file inside `server/` (a default `.env` is already configured):

```env
PORT=5000
JWT_SECRET=mediconnect-super-secure-production-secret-key-2026
NODE_ENV=development
```

---

## 6. Demo Login Credentials

The database comes pre-seeded with accounts ready for immediate evaluation:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Patient** | Rahul Sharma | `rahul.sharma@example.com` | `Patient@123` | Patient ID: `MC-PAT-7701`<br/>Has records from City Care, Sunrise, & Global Health. |
| **Visiting Doctor** | Dr. Rajesh Kumar | `dr.rajesh@metropolitan.org` | `Doctor@123` | Emergency & Internal Medicine, Metropolitan Medical Institute.<br/>*Configured initially without consent to test the live sharing flow.* |
| **Cardiologist** | Dr. Priya Patel | `dr.priya@citycare.org` | `Doctor@123` | Senior Cardiologist, City Care Hospital (`HOSP-CCH`). |
| **Orthopedic Surgeon**| Dr. Amit Verma | `dr.amit@sunrisemed.org` | `Doctor@123` | Orthopedics & Sports Medicine, Sunrise Medical (`HOSP-SMC`). |
| **Pulmonologist** | Dr. Sarah Jenkins | `dr.sarah@globalhealth.org` | `Doctor@123` | Senior Pulmonologist, Global Health Hospital (`HOSP-GHH`). |
| **Hospital Admin** | Vikramaditya Rao | `admin@citycare.org` | `Admin@123` | Chief Registrar, City Care Hospital. |

> **Pro-Tip:** You can also use the **Demo Switcher** in the top navigation bar or the **Live Evaluation Guide** at the bottom of the screen to switch between accounts with a single click.

---

## 7. Step-by-Step Demonstration Walkthrough

Follow this scenario to test the complete cross-hospital record sharing workflow:

1. **Patient Pre-existing Records:**
   - Log in as **Rahul Sharma** (`rahul.sharma@example.com` / `Patient@123`).
   - Go to **My Medical History**. Notice records originating from 3 different hospitals:
     - *City Care Hospital:* Cardiology evaluation & Essential Hypertension.
     - *Sunrise Medical Centre:* Digital X-ray & Right Ankle Ligament Sprain.
     - *Global Health Hospital:* Spirometry test & Bronchial Asthma.
   - Go to **Manage Doctor Access**. Notice active consents exist for Dr. Priya, Dr. Amit, and Dr. Sarah, but **no consent exists for Dr. Rajesh Kumar**.

2. **Doctor Searches for Patient:**
   - Log out and log in as **Dr. Rajesh Kumar** (`dr.rajesh@metropolitan.org` / `Doctor@123`).
   - Go to **Search Patients**. Search for Rahul using Patient ID `MC-PAT-7701`.
   - The system displays Rahul's profile with badge: **Access Restricted: Consent Required**.
   - Notice that if Dr. Rajesh attempts to open Rahul's clinical records directly, the server strictly blocks access with HTTP 403 Forbidden.

3. **Doctor Requests Access:**
   - Click **Request Patient Consent**.
   - Enter purpose: *"Routine acute care consultation & medication review"* and select duration (e.g. 7 days).
   - Click **Send Access Request**. Status updates to *"Awaiting Patient Approval"*.

4. **Patient Approves Access:**
   - Switch back to **Rahul Sharma** (Patient).
   - Navigate to **Manage Doctor Access**. Under **Pending Access Requests**, Dr. Rajesh's request from Metropolitan Medical Institute is waiting.
   - Click **Approve Access** (confetti animation triggers). Access is now granted for 7 days.

5. **Doctor Views Unified History & Adds Consultation:**
   - Switch back to **Dr. Rajesh Kumar** (Doctor).
   - Search `MC-PAT-7701` again (or click from your Overview). Status now reads: **Access Authorized**.
   - Click **View Medical History**.
   - Dr. Rajesh now sees Rahul's complete unified history across all 3 previous hospitals, including vital trends, medication lists, and critical drug allergy warnings (Penicillin & Aspirin).
   - Click **Add Clinical Encounter & Rx**. Enter:
     - Title: *"Routine General Wellness & Cardio-Respiratory Follow-up"*
     - Diagnosis: *"Controlled Hypertension & Exercise-Induced Bronchospasm"*
     - Treatment: *"Continue Lisinopril 10mg daily and maintenance inhaler."*
     - Prescribe medication: *"Montelukast 10mg, Once daily at bedtime, 30 days."*
   - Click **Save Consultation Record**.

6. **Patient Sees Updated Record & Audit Logs:**
   - Switch back to **Rahul Sharma**.
   - Open **My Medical History**: The new consultation authored by Dr. Rajesh at Metropolitan Medical Institute appears at the top of the timeline!
   - Open **Access History**: The full audit trail shows:
     - Initial unauthorized attempt (Denied).
     - Access request submitted.
     - Patient approval.
     - Doctor viewing records across 3 hospitals.
     - Doctor adding the new clinical encounter.

7. **Break-Glass Emergency Simulation (Optional):**
   - A doctor can also click **Emergency Override** in Search Patients, provide a mandatory justification (min 15 chars), which unlocks 24-hr access and immediately flags a high-priority compliance warning in the audit log.

---

## 8. Healthcare Interoperability & Security Features

- **Server-Side Enforcement:** Medical records are never sent to unauthorized clients. The backend middleware `verifyPatientConsent` enforces active consent permissions directly on the database query layer.
- **HL7 FHIR R4 JSON Bundle:** Interoperability endpoint `/api/fhir/Bundle/:patientId` generates an official FHIR bundle grouping `Patient`, `Encounter`, `Condition`, `MedicationRequest`, and `Observation` resources.
- **Access Revocation:** Patients can instantly revoke any doctor's access with one click from their dashboard.
- **QR-Based Patient ID:** Patients have a digital emergency QR code that contains cryptographic verification references without exposing raw medical records.
- **Downloadable Health Summary:** Patients can export a verified, printable clinical summary (Health Passport) with one click.
- **3D Hospital Corridor Journey:** Built with Three.js and React Three Fiber, featuring smooth scroll-linked walking animations, departmental wings, and a graceful 2D/3D toggle for performance.

---

## 9. Feature Completeness Status

All 15 master prompt sections and extra requirements have been fully implemented and verified:
- [x] Cinematic 3D landing page with 3D hospital environment (Section 3).
- [x] Scroll-based 3D walking character corridor experience (Section 3).
- [x] Problem statement, visual solution diagram, how it works, feature cards (Sections 3, 4, 5, 6).
- [x] Dual Patient / Doctor login selection cards (Section 7).
- [x] Full authentication with password hashing, roles, & protected routes (Section 4).
- [x] Patient Dashboard: Overview, Timeline, Prescriptions, Labs, Appointments, Access Management, Access History, Profile (Section 5).
- [x] Doctor Dashboard: Search Patients, Consent Verification, Unified Medical Records, Add Clinical Consultation & Prescriptions (Section 6).
- [x] Hospital Management: Multi-hospital profiles, doctor affiliation, facility records (Section 7).
- [x] Relational database with 15 tables, foreign keys, & seed data (Section 8).
- [x] HL7 FHIR-inspired interoperability endpoints (Section 9).
- [x] Security, RBAC, and comprehensive audit logs (Section 10).
- [x] Extra Features: Emergency Break-Glass override, QR-based Patient ID, Download Medical History PDF preview, Timeline filters (Section 12).
- [x] Complete demonstration scenario verified end-to-end (Section 13).

---

## 10. Verification Script

To re-run the end-to-end scenario verification suite at any time:
```powershell
npm test
```
This runs `test-scenario.js`, which programmatically tests all 14 steps of the demonstration flow.
