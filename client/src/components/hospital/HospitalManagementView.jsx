import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Building2,
  Users,
  FileText,
  Activity,
  PlusCircle,
  X,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Sparkles,
  Filter,
  Award,
  BedDouble,
  Search
} from 'lucide-react';

const COMMON_SPECIALIZATIONS = [
  'General Physician',
  'Consulting Physician',
  'Cardiologist',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Dermatologist',
  'Neurologist',
  'Gynecologist'
];

export default function HospitalManagementView({ isOpen, onClose }) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('hosp-cch-100');
  const [hospitalDetail, setHospitalDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Facility filtering & search
  const [facilityFilter, setFacilityFilter] = useState('all'); // 'all' | 'hospital' | 'private_clinic' | 'diagnostic_center'
  const [searchQuery, setSearchQuery] = useState('');

  // New hospital modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [facilityType, setFacilityType] = useState('hospital'); // 'hospital' | 'private_clinic' | 'diagnostic_center'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Rajasthan');
  const [licenseNo, setLicenseNo] = useState('');
  const [bedCapacity, setBedCapacity] = useState('250');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Lead doctor toggle in facility registration
  const [addLeadDoctorNow, setAddLeadDoctorNow] = useState(false);
  const [leadDoctor, setLeadDoctor] = useState({
    fullName: '',
    licenseNumber: '',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    department: 'General Consultation',
    email: '',
    phone: '+91 98000 00000'
  });

  // Add Doctor to existing facility modal state
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [addDoctorLoading, setAddDoctorLoading] = useState(false);
  const [docForm, setDocForm] = useState({
    fullName: '',
    licenseNumber: '',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    department: 'Outpatient Care',
    experienceYears: 8,
    email: '',
    phone: '+91 98000 00000',
    password: 'Doctor@123'
  });

  const loadHospitals = async () => {
    try {
      const res = await api.getHospitals();
      const list = res.hospitals || [];
      setHospitals(list);
      if (list.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.getHospitalDetails(id);
      setHospitalDetail(res);
      // Pre-set default department in add doctor form based on facility
      if (res.hospital?.departments && res.hospital.departments.length > 0) {
        setDocForm(prev => ({
          ...prev,
          department: res.hospital.departments[0]
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHospitals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedHospitalId) {
      loadDetail(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  // Handle facility registration
  const handleRegisterHospital = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const payload = {
        name,
        code: code.trim().toUpperCase(),
        facility_type: facilityType,
        address,
        city,
        state: state || 'State',
        license_no: licenseNo.trim(),
        bed_capacity: facilityType === 'private_clinic' 
          ? (parseInt(bedCapacity, 10) || 3) 
          : (parseInt(bedCapacity, 10) || 250)
      };

      if (addLeadDoctorNow && leadDoctor.fullName && leadDoctor.licenseNumber) {
        payload.leadDoctor = {
          full_name: leadDoctor.fullName.trim(),
          license_number: leadDoctor.licenseNumber.trim().toUpperCase(),
          specialization: leadDoctor.specialization,
          qualification: leadDoctor.qualification,
          department: leadDoctor.department || (facilityType === 'private_clinic' ? 'Consultation' : 'General Medicine'),
          email: leadDoctor.email ? leadDoctor.email.trim() : undefined,
          phone: leadDoctor.phone
        };
      }

      const res = await api.registerHospital(payload);
      alert(res.message);

      setRegisterModalOpen(false);
      setName('');
      setCode('');
      setAddress('');
      setCity('');
      setLicenseNo('');
      setAddLeadDoctorNow(false);
      setLeadDoctor({
        fullName: '',
        licenseNumber: '',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        department: 'General Consultation',
        email: '',
        phone: '+91 98000 00000'
      });

      await loadHospitals();
      if (res.hospitalId) {
        setSelectedHospitalId(res.hospitalId);
      }
    } catch (err) {
      alert('Error registering facility: ' + err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  // Handle adding doctor to selected facility
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!docForm.fullName || !docForm.licenseNumber || !docForm.specialization) {
      alert('Please fill Doctor Name, Medical License Number, and Specialization.');
      return;
    }

    setAddDoctorLoading(true);
    try {
      const res = await api.addDoctorToHospital(selectedHospitalId, {
        full_name: docForm.fullName.trim(),
        license_number: docForm.licenseNumber.trim().toUpperCase(),
        specialization: docForm.specialization,
        qualification: docForm.qualification || 'MBBS, MD',
        department: docForm.department || 'Outpatient Care',
        experience_years: parseInt(docForm.experienceYears, 10) || 5,
        email: docForm.email ? docForm.email.trim() : undefined,
        phone: docForm.phone,
        password: docForm.password || 'Doctor@123'
      });

      alert(res.message);
      setAddDoctorModalOpen(false);
      setDocForm({
        fullName: '',
        licenseNumber: '',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        department: 'Outpatient Care',
        experienceYears: 8,
        email: '',
        phone: '+91 98000 00000',
        password: 'Doctor@123'
      });

      await loadDetail(selectedHospitalId);
      await loadHospitals();
    } catch (err) {
      alert('Failed to add doctor: ' + err.message);
    } finally {
      setAddDoctorLoading(false);
    }
  };

  // Switch facility type in modal with smart defaults
  const handleFacilityTypeChange = (type) => {
    setFacilityType(type);
    if (type === 'private_clinic') {
      if (!code.startsWith('CLN-')) setCode('CLN-' + (code.replace(/^HOSP-|^LAB-|^CLN-/, '') || ''));
      setBedCapacity('3'); // 3 consultation rooms
      setAddLeadDoctorNow(true); // Default true for clinics
      setLeadDoctor(prev => ({
        ...prev,
        department: 'Consultation & OPD',
        specialization: 'Consulting Physician'
      }));
    } else if (type === 'diagnostic_center') {
      if (!code.startsWith('LAB-')) setCode('LAB-' + (code.replace(/^HOSP-|^LAB-|^CLN-/, '') || ''));
      setBedCapacity('4'); // 4 diagnostic suites
      setLeadDoctor(prev => ({
        ...prev,
        department: 'Pathology & Imaging',
        specialization: 'Radiologist / Pathologist'
      }));
    } else {
      if (!code.startsWith('HOSP-')) setCode('HOSP-' + (code.replace(/^HOSP-|^LAB-|^CLN-/, '') || ''));
      setBedCapacity('250');
      setLeadDoctor(prev => ({
        ...prev,
        department: 'General Medicine',
        specialization: 'General Physician'
      }));
    }
  };

  if (!isOpen) return null;

  // Filter facilities
  const filteredHospitals = hospitals.filter(h => {
    const matchesType = facilityFilter === 'all' || (h.facility_type || 'hospital') === facilityFilter;
    const matchesSearch = !searchQuery || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city && h.city.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const clinicCount = hospitals.filter(h => h.facility_type === 'private_clinic').length;
  const hospitalCount = hospitals.filter(h => !h.facility_type || h.facility_type === 'hospital').length;
  const diagnosticCount = hospitals.filter(h => h.facility_type === 'diagnostic_center').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-navy-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 md:p-6 border-b border-navy-100 flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-navy-900 tracking-tight">
                  Healthcare Network Management
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Interoperable
                </span>
              </div>
              <p className="text-xs text-navy-500">
                Connected Multi-Specialty Hospitals, Private Practice Clinics & Diagnostic Centers.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                handleFacilityTypeChange('hospital');
                setRegisterModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Facility</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-navy-200 text-navy-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Facility Selector List */}
          <div className="w-full md:w-84 border-r border-navy-100 p-4 space-y-3 overflow-y-auto bg-surface/50 shrink-0">
            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-navy-100/60 rounded-xl text-[11px] font-bold text-navy-600">
              <button
                onClick={() => setFacilityFilter('all')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  facilityFilter === 'all' ? 'bg-white text-navy-950 shadow-xs' : 'hover:text-navy-900'
                }`}
              >
                All ({hospitals.length})
              </button>
              <button
                onClick={() => setFacilityFilter('hospital')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  facilityFilter === 'hospital' ? 'bg-white text-navy-950 shadow-xs' : 'hover:text-navy-900'
                }`}
              >
                Hospitals ({hospitalCount})
              </button>
              <button
                onClick={() => setFacilityFilter('private_clinic')}
                className={`py-1.5 rounded-lg text-center transition-all ${
                  facilityFilter === 'private_clinic' ? 'bg-white text-navy-950 shadow-xs' : 'hover:text-navy-900'
                }`}
              >
                Clinics ({clinicCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-navy-400" />
              <input
                type="text"
                placeholder="Search facility name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-navy-200 bg-white text-xs outline-none focus:border-teal-500"
              />
            </div>

            <div className="text-[11px] font-bold text-navy-400 uppercase tracking-wider px-1">
              Network Facilities ({filteredHospitals.length})
            </div>

            <div className="space-y-2">
              {filteredHospitals.map((h) => {
                const isSelected = h.id === selectedHospitalId;
                const isClinic = h.facility_type === 'private_clinic';
                const isDiagnostic = h.facility_type === 'diagnostic_center';

                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                        : 'bg-white/70 border-navy-100 hover:bg-white hover:border-navy-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        {isClinic ? (
                          <span className="p-1 rounded-md bg-teal-50 text-teal-700">
                            <Stethoscope className="w-3.5 h-3.5" />
                          </span>
                        ) : isDiagnostic ? (
                          <span className="p-1 rounded-md bg-purple-50 text-purple-700">
                            <Activity className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-blue-50 text-blue-700">
                            <Building2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="font-bold text-sm text-navy-900 truncate max-w-[150px]">{h.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-50 text-navy-700 font-bold border border-navy-200">
                        {h.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-navy-500">
                      <span>{h.city || 'Metro'}, {h.state || 'India'}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isClinic 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : isDiagnostic 
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isClinic ? 'Private Clinic' : isDiagnostic ? 'Diagnostic' : 'Hospital'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-navy-400 mt-2 pt-2 border-t border-navy-50">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-teal-600" />
                        <span className="font-bold text-navy-700">{h.doctor_count ?? 0}</span>
                        <span>Doctors</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-teal-600" />
                        <span className="font-bold text-navy-700">{h.total_records_count ?? 0}</span>
                        <span>Records</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredHospitals.length === 0 && (
                <div className="p-6 text-center text-xs text-navy-400 rounded-2xl bg-white border border-dashed border-navy-200">
                  No facilities found matching your criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Facility Detail View */}
          <div className="flex-1 p-5 md:p-7 overflow-y-auto space-y-6">
            {detailLoading || !hospitalDetail ? (
              <div className="p-16 text-center text-navy-400 text-xs flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                Loading facility profile & accredited medical staff...
              </div>
            ) : (
              <>
                {/* Hospital Header Banner */}
                <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-teal-950 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-teal-500/20">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        hospitalDetail.hospital.logo_url || 
                        (hospitalDetail.hospital.facility_type === 'private_clinic'
                          ? 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&auto=format&fit=crop&q=80')
                      }
                      alt={hospitalDetail.hospital.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/50 shadow-md"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {hospitalDetail.hospital.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-teal-400 text-navy-950">
                          {hospitalDetail.hospital.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-900/60 text-teal-300 border border-teal-400/30">
                          {hospitalDetail.hospital.facility_type === 'private_clinic' 
                            ? '🩺 Private Practice Clinic' 
                            : hospitalDetail.hospital.facility_type === 'diagnostic_center'
                              ? '🔬 Diagnostic Center'
                              : '🏥 Multi-Specialty Hospital'}
                        </span>
                      </div>
                      <div className="text-xs text-navy-200 mt-1 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>{hospitalDetail.hospital.address}, {hospitalDetail.hospital.city}</span>
                      </div>
                      <div className="text-[11px] text-teal-300 font-mono mt-0.5 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                        <span>Facility License: {hospitalDetail.hospital.license_no}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 shrink-0">
                    <div className="font-black text-white text-lg">
                      {hospitalDetail.hospital.facility_type === 'private_clinic' ? (
                        `${hospitalDetail.stats.bedCapacity || 3} Consultation Chambers`
                      ) : (
                        `${hospitalDetail.stats.bedCapacity || 250} Inpatient Beds`
                      )}
                    </div>
                    <div className="text-xs text-teal-300 font-medium">
                      {hospitalDetail.hospital.facility_type === 'private_clinic' 
                        ? 'Independent Practice OPD' 
                        : 'Interoperable EHR Node Tier 1'}
                    </div>
                  </div>
                </div>

                {/* Facility Authorized Departments */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-navy-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Authorized Specialty Departments</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hospitalDetail.hospital.departments?.map((dept, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-surface border border-navy-100 text-xs font-semibold text-navy-800">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Affiliated Licensed Practitioners Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-teal-600" />
                        <span>Affiliated Licensed Practitioners ({hospitalDetail.doctors?.length || 0})</span>
                      </h4>
                      <p className="text-[11px] text-navy-400">
                        Doctors authorized to review records & record clinical encounters at this facility.
                      </p>
                    </div>

                    <button
                      onClick={() => setAddDoctorModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Doctor to this Facility</span>
                    </button>
                  </div>

                  {hospitalDetail.doctors && hospitalDetail.doctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {hospitalDetail.doctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl bg-white border border-navy-100 hover:border-teal-300 shadow-xs hover:shadow-md transition-all flex items-start space-x-3.5 group"
                        >
                          <img
                            src={doc.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'}
                            alt={doc.full_name}
                            className="w-12 h-12 rounded-xl object-cover border border-navy-200 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-navy-900 truncate">
                                {doc.full_name}
                              </div>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-100">
                                {doc.doctor_id}
                              </span>
                            </div>

                            <div className="text-xs text-teal-700 font-semibold mt-0.5">
                              {doc.specialization}
                            </div>

                            <div className="text-[11px] text-navy-500 mt-1 flex items-center space-x-2">
                              <span>{doc.current_department || doc.department || 'Outpatient Care'}</span>
                              <span>•</span>
                              <span>{doc.experience_years || 5} yrs exp</span>
                            </div>

                            <div className="mt-2 pt-2 border-t border-navy-50 flex items-center justify-between text-[10px] text-navy-400">
                              <span className="font-mono bg-navy-50 px-1.5 py-0.5 rounded text-navy-600">
                                Lic: {doc.license_number}
                              </span>
                              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-surface border border-dashed border-navy-200 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900">No Doctors Affiliated Yet</p>
                        <p className="text-xs text-navy-500 max-w-md mx-auto mt-1">
                          This facility does not have any licensed physicians assigned. Add doctors now to enable consent requests, prescription generation, and clinical diagnoses under {hospitalDetail.hospital.name}.
                        </p>
                      </div>
                      <button
                        onClick={() => setAddDoctorModalOpen(true)}
                        className="px-4 py-2 rounded-xl teal-gradient-bg text-white font-bold text-xs shadow-glow-teal hover:opacity-95 inline-flex items-center space-x-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add First Doctor / Practitioner</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Uploaded Encounters from this Facility */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-navy-600 uppercase tracking-wider">
                    Recent Records Uploaded from this Facility ({hospitalDetail.recentRecords?.length || 0})
                  </h4>

                  {hospitalDetail.recentRecords && hospitalDetail.recentRecords.length > 0 ? (
                    <div className="space-y-2">
                      {hospitalDetail.recentRecords.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3.5 rounded-2xl bg-surface border border-navy-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-navy-900">{rec.title}</div>
                            <div className="text-navy-500 mt-0.5">
                              Patient: <strong className="text-navy-800">{rec.patient_name}</strong> ({rec.patient_code}) • {rec.encounter_date}
                            </div>
                            <div className="text-teal-700 mt-0.5 font-medium">Diagnosis: {rec.diagnosis}</div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-navy-700 border border-navy-200">
                              {rec.record_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface border border-navy-100 text-xs text-navy-400 text-center">
                      No clinical records uploaded from this facility yet.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD DOCTOR DIRECTLY TO CURRENT SELECTED FACILITY
         ======================================================== */}
      {addDoctorModalOpen && hospitalDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-navy-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Add Doctor to {hospitalDetail.hospital.name}
                  </h3>
                  <p className="text-[11px] text-navy-500">
                    Affiliate a certified medical practitioner to this facility.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddDoctorModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-navy-100 text-navy-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.fullName}
                  onChange={(e) => setDocForm({ ...docForm, fullName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Medical License No. / Reg ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.licenseNumber}
                    onChange={(e) => setDocForm({ ...docForm, licenseNumber: e.target.value })}
                    placeholder="MCI-2026-8812"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none font-mono"
                  />
                  <span className="text-[10px] text-navy-400">Used for official verification at login</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.specialization}
                    onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                    placeholder="e.g. Cardiologist"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Specialization Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-navy-400 uppercase">Quick Select Specialization:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SPECIALIZATIONS.map((spec) => (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => setDocForm({ ...docForm, specialization: spec })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        docForm.specialization === spec
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold'
                          : 'bg-white border-navy-200 text-navy-600 hover:border-teal-300'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={docForm.qualification}
                    onChange={(e) => setDocForm({ ...docForm, qualification: e.target.value })}
                    placeholder="MBBS, MD"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={docForm.department}
                    onChange={(e) => setDocForm({ ...docForm, department: e.target.value })}
                    placeholder="e.g. Cardiology OPD"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={docForm.experienceYears}
                    onChange={(e) => setDocForm({ ...docForm, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={docForm.phone}
                    onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  Doctor Login Email (Optional)
                </label>
                <input
                  type="email"
                  value={docForm.email}
                  onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                  placeholder={`dr.${docForm.fullName ? docForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'name'}@${hospitalDetail.hospital.code.toLowerCase()}.org`}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                />
                <span className="text-[10px] text-navy-400">
                  Leave blank to auto-generate based on facility domain. Initial password is <code className="font-mono font-bold text-teal-800">Doctor@123</code>.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setAddDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-navy-100 text-xs font-bold text-navy-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDoctorLoading}
                  className="px-5 py-2 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{addDoctorLoading ? 'Affiliating Doctor...' : 'Affiliate Doctor Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REGISTER NEW FACILITY (HOSPITAL / PRIVATE CLINIC)
         ======================================================== */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-navy-100">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Register New Healthcare Facility</h3>
                <p className="text-xs text-navy-500">Connect a hospital, private clinic, or diagnostic center to MediConnect.</p>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-navy-100 text-navy-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Facility Type Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-navy-700">Facility Classification *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFacilityTypeChange('hospital')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    facilityType === 'hospital'
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-navy-200 bg-white hover:border-navy-300'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-1 ${facilityType === 'hospital' ? 'text-teal-700' : 'text-navy-500'}`} />
                  <div className="font-bold text-xs text-navy-900">Hospital</div>
                  <div className="text-[10px] text-navy-400">Multi-specialty, Inpatient</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFacilityTypeChange('private_clinic')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    facilityType === 'private_clinic'
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-navy-200 bg-white hover:border-navy-300'
                  }`}
                >
                  <Stethoscope className={`w-5 h-5 mb-1 ${facilityType === 'private_clinic' ? 'text-teal-700' : 'text-navy-500'}`} />
                  <div className="font-bold text-xs text-navy-900">Private Clinic</div>
                  <div className="text-[10px] text-navy-400">Consultant OPD, Practice</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFacilityTypeChange('diagnostic_center')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    facilityType === 'diagnostic_center'
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-navy-200 bg-white hover:border-navy-300'
                  }`}
                >
                  <Activity className={`w-5 h-5 mb-1 ${facilityType === 'diagnostic_center' ? 'text-teal-700' : 'text-navy-500'}`} />
                  <div className="font-bold text-xs text-navy-900">Diagnostic Lab</div>
                  <div className="text-[10px] text-navy-400">Pathology & Imaging</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleRegisterHospital} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  {facilityType === 'private_clinic' ? 'Clinic / Practice Name *' : 'Facility Legal Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    facilityType === 'private_clinic'
                      ? 'e.g. Dr. Verma Family Health Clinic'
                      : facilityType === 'diagnostic_center'
                        ? 'e.g. Apex Diagnostics & Imaging Center'
                        : 'e.g. Apollo Multi-Specialty Hospital'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Facility Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={facilityType === 'private_clinic' ? 'CLN-VERMA' : 'HOSP-XYZ'}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">Government License No *</label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="RJ-MED-2026"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14, Central Market, Malviya Nagar"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-700 mb-1">
                  {facilityType === 'private_clinic' 
                    ? 'Consultation Chambers / Examination Rooms' 
                    : 'Inpatient Bed Capacity'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={bedCapacity}
                  onChange={(e) => setBedCapacity(e.target.value)}
                  placeholder={facilityType === 'private_clinic' ? '3' : '250'}
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              {/* Lead Doctor / Practice Owner Collapsible Option */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addLeadDoctorNow}
                    onChange={(e) => setAddLeadDoctorNow(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">
                      {facilityType === 'private_clinic' 
                        ? 'Add Lead Doctor / Clinic Owner Now' 
                        : 'Add First Affiliated Doctor Now'}
                    </span>
                    <span className="text-[10px] text-navy-500 block">
                      Instantly registers an accredited physician and connects them to this facility.
                    </span>
                  </div>
                </label>

                {addLeadDoctorNow && (
                  <div className="pt-2 border-t border-teal-200/60 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-navy-700 mb-0.5">Doctor Full Name *</label>
                        <input
                          type="text"
                          required={addLeadDoctorNow}
                          value={leadDoctor.fullName}
                          onChange={(e) => setLeadDoctor({ ...leadDoctor, fullName: e.target.value })}
                          placeholder="e.g. Dr. Rajesh Kumar"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white text-xs outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-navy-700 mb-0.5">Doctor Medical License No *</label>
                        <input
                          type="text"
                          required={addLeadDoctorNow}
                          value={leadDoctor.licenseNumber}
                          onChange={(e) => setLeadDoctor({ ...leadDoctor, licenseNumber: e.target.value })}
                          placeholder="e.g. MCI-2026-9041"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white text-xs font-mono outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-navy-700 mb-0.5">Specialization</label>
                        <input
                          type="text"
                          value={leadDoctor.specialization}
                          onChange={(e) => setLeadDoctor({ ...leadDoctor, specialization: e.target.value })}
                          placeholder="e.g. Consulting Physician"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white text-xs outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-navy-700 mb-0.5">Doctor Email (Optional)</label>
                        <input
                          type="email"
                          value={leadDoctor.email}
                          onChange={(e) => setLeadDoctor({ ...leadDoctor, email: e.target.value })}
                          placeholder="dr.name@clinic.org"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-navy-200 bg-white text-xs outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-navy-100 text-xs font-bold text-navy-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="px-5 py-2 rounded-xl teal-gradient-bg text-white text-xs font-bold shadow-glow-teal hover:opacity-95 disabled:opacity-50"
                >
                  {registerLoading ? 'Registering Facility...' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
