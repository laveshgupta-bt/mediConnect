import React, { useState } from 'react';
import {
  X,
  User,
  Stethoscope,
  Lock,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Heart,
  Sparkles,
  Building2,
  Copy,
  Check,
  IdCard,
  QrCode,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialRole = 'patient' }) {
  const { login, registerPatient, registerDoctor } = useAuth();
  const [role, setRole] = useState(initialRole); // 'patient' | 'doctor'
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor Medical ID (Mandatory for doctor login on EVERY sign-in)
  const [medicalId, setMedicalId] = useState('');

  // Patient specific
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState('Male');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Doctor specific registration
  const [specialization, setSpecialization] = useState('Cardiology');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalId, setHospitalId] = useState('hosp-cch-100');

  // Welcome modal for newly issued ID
  const [welcomeInfo, setWelcomeInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (role === 'doctor' && (!medicalId || medicalId.trim().length === 0)) {
          setError('Medical ID / License Number is mandatory for doctor sign-in.');
          setLoading(false);
          return;
        }

        await login(emailOrId, password, role, medicalId);
        onClose();
      } else {
        // Registration
        if (role === 'patient') {
          const res = await registerPatient({
            full_name: fullName,
            email: emailOrId,
            password,
            phone,
            blood_group: bloodGroup,
            dob,
            gender,
            emergency_contact_phone: emergencyPhone
          });

          // Show congratulatory Unique Patient ID confirmation
          setWelcomeInfo({
            role: 'patient',
            name: fullName,
            patientId: res.assignedPatientId || res.patient?.patient_id || 'MC-PAT-GENERATED',
            bloodGroup
          });

          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          const res = await registerDoctor({
            full_name: fullName,
            email: emailOrId,
            password,
            phone,
            specialization,
            license_number: licenseNumber,
            hospital_id: hospitalId
          });

          setWelcomeInfo({
            role: 'doctor',
            name: fullName,
            doctorId: res.assignedDoctorId || res.doctor?.doctor_id || 'MC-DOC-GENERATED',
            licenseNumber: licenseNumber,
            specialization
          });

          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDemoFill = (type) => {
    if (type === 'patient') {
      setRole('patient');
      setMode('login');
      setEmailOrId('MC-PAT-7701'); // Unique Patient ID
      setPassword('Patient@123');
      setMedicalId('');
    } else if (type === 'doctor_visiting') {
      setRole('doctor');
      setMode('login');
      setEmailOrId('dr.rajesh@metropolitan.org');
      setPassword('Doctor@123');
      setMedicalId('MCI-INTM-2017-9102'); // Doctor's Medical License ID
    } else if (type === 'doctor_cardio') {
      setRole('doctor');
      setMode('login');
      setEmailOrId('dr.priya@citycare.org');
      setPassword('Doctor@123');
      setMedicalId('MCI-CARD-2012-8819');
    }
  };

  // ==========================================
  // WELCOME / FIRST-TIME ID ISSUANCE CONFIRMATION VIEW
  // ==========================================
  if (welcomeInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-teal-300 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl teal-gradient-bg text-white flex items-center justify-center mx-auto shadow-glow-teal">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              Registration Successful
            </span>
            <h3 className="text-2xl font-black text-navy-900 mt-2">
              Welcome, {welcomeInfo.name}!
            </h3>
            <p className="text-xs text-navy-500 mt-1">
              {welcomeInfo.role === 'patient'
                ? 'Your permanent Unique Patient ID has been cryptographically generated across all connected hospitals.'
                : 'Your Physician Credentials and Doctor ID have been verified on the network.'}
            </p>
          </div>

          {/* Large Highlighted ID Badge */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-navy-50 border-2 border-teal-300 shadow-inner space-y-3">
            <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider block">
              {welcomeInfo.role === 'patient' ? 'Your Unique Patient ID' : 'Your Verified Doctor ID'}
            </span>
            <div className="text-3xl font-black font-mono tracking-tight text-teal-700">
              {welcomeInfo.role === 'patient' ? welcomeInfo.patientId : welcomeInfo.doctorId}
            </div>
            {welcomeInfo.role === 'doctor' && (
              <div className="text-xs text-navy-600 font-mono">
                Medical License ID: <strong>{welcomeInfo.licenseNumber}</strong>
              </div>
            )}
            <button
              onClick={() => handleCopyId(welcomeInfo.role === 'patient' ? welcomeInfo.patientId : welcomeInfo.doctorId)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Unique ID'}</span>
            </button>
          </div>

          <p className="text-xs text-navy-500 leading-relaxed">
            {welcomeInfo.role === 'patient'
              ? 'Save this ID. When visiting any hospital or clinic, doctors will use this ID to request authorization to view your unified medical history.'
              : 'You will need to enter your registered Medical ID on every sign-in to authenticate as a licensed clinician.'}
          </p>

          <button
            onClick={() => {
              setWelcomeInfo(null);
              onClose();
            }}
            className="w-full py-3.5 rounded-xl teal-gradient-bg text-white font-bold text-sm shadow-glow-teal hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN LOGIN / REGISTER MODAL VIEW
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden">
        {/* Top Header Banner */}
        <div className="teal-gradient-bg p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            <span>MediConnect Secure Portal</span>
          </div>
          <h3 className="text-2xl font-bold">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create New Healthcare Profile'}
          </h3>
          <p className="text-xs text-teal-100 mt-1">
            {role === 'patient'
              ? 'Patients can log in using Email or their Unique Patient ID (MC-PAT-XXXX).'
              : 'Doctors must provide their Medical ID on every sign-in.'}
          </p>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-navy-950/30 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setRole('patient'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                role === 'patient'
                  ? 'bg-white text-navy-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('doctor'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                role === 'doctor'
                  ? 'bg-white text-navy-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* Demo Account Quick-Fill Bar */}
        <div className="bg-teal-50 px-6 py-2.5 border-b border-teal-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-teal-800 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Quick Demo Credentials:</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleDemoFill('patient')}
              className="px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 hover:bg-teal-100 font-medium"
            >
              Rahul (MC-PAT-7701)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('doctor_visiting')}
              className="px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 hover:bg-teal-100 font-medium"
            >
              Dr. Rajesh (With Med ID)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Full Name for Registration */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-navy-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'patient' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Rajesh Kumar'}
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
              />
            </div>
          )}

          {/* Email or Patient/Doctor ID */}
          <div>
            <label className="block text-xs font-bold text-navy-700 mb-1">
              {mode === 'login'
                ? role === 'patient'
                  ? 'Email or Unique Patient ID (MC-PAT-XXXX) *'
                  : 'Email or Doctor ID (MC-DOC-XXXX) *'
                : 'Email Address *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder={
                  mode === 'login'
                    ? role === 'patient'
                      ? 'e.g. MC-PAT-7701 or rahul.sharma@example.com'
                      : 'e.g. dr.rajesh@metropolitan.org'
                    : 'your.email@example.com'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
              />
              <Mail className="w-4 h-4 text-navy-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-navy-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
              />
              <Lock className="w-4 h-4 text-navy-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* MANDATORY DOCTOR MEDICAL ID ON EVERY SIGN-IN */}
          {role === 'doctor' && mode === 'login' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
              <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center space-x-1.5">
                <IdCard className="w-4 h-4 text-blue-600" />
                <span>Doctor Medical ID / License No. * (Required Every Sign-In)</span>
              </label>
              <input
                type="text"
                required
                value={medicalId}
                onChange={(e) => setMedicalId(e.target.value)}
                placeholder="e.g. MCI-INTM-2017-9102 or MC-DOC-404"
                className="w-full px-4 py-2.5 rounded-xl border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-mono uppercase font-bold bg-white"
              />
              <span className="text-[11px] text-blue-700 block">
                Verification required: Enter your Medical Council Registration or Doctor ID.
              </span>
            </div>
          )}

          {/* Patient Registration Fields */}
          {mode === 'register' && role === 'patient' && (
            <div className="space-y-4 pt-2 border-t border-navy-100">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
                <span>A permanent Unique Patient ID (MC-PAT-XXXX) will be automatically generated upon registration.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Doctor Registration Fields */}
          {mode === 'register' && role === 'doctor' && (
            <div className="space-y-4 pt-2 border-t border-navy-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Medical License / ID *</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MCI-12345"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">Affiliated Hospital *</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm focus:border-teal-500 outline-none"
                >
                  <option value="hosp-cch-100">City Care Hospital (Metro City)</option>
                  <option value="hosp-smc-200">Sunrise Medical Centre (Pune)</option>
                  <option value="hosp-ghh-300">Global Health Hospital (Mumbai)</option>
                  <option value="hosp-mmi-400">Metropolitan Medical Institute (Navi Mumbai)</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl teal-gradient-bg text-white font-bold text-sm shadow-glow-teal hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? `Sign In as ${role === 'patient' ? 'Patient' : 'Doctor'}`
                : `Complete Registration & Generate ID`}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2 text-xs text-navy-500">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="font-bold text-teal-600 hover:underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-bold text-teal-600 hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
