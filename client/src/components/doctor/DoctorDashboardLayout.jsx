import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Search,
  FileText,
  Pill,
  History,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Building2,
  ShieldAlert
} from 'lucide-react';

import DoctorOverview from './DoctorOverview';
import DoctorSearchPatients from './DoctorSearchPatients';
import DoctorPatientRecordView from './DoctorPatientRecordView';
import DoctorAccessHistory from './DoctorAccessHistory';

export default function DoctorDashboardLayout() {
  const { user, doctor, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await api.getDoctorDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('records');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'search', label: 'Search Patients', icon: Search },
    { id: 'records', label: 'Patient Records', icon: FileText, disabled: !selectedPatientId },
    { id: 'audit', label: 'Access History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-navy-100 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg navy-gradient-bg flex items-center justify-center text-white">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-navy-900 text-sm">MediConnect Doctor</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-navy-700 hover:bg-navy-50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Doctor Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 text-white p-6 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* Logo & Doctor Facility */}
          <div className="flex items-center space-x-3 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">
                Medi<span className="text-blue-400">Connect</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300">
                Clinician Portal
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.disabled) return;
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-md'
                      : item.disabled
                      ? 'opacity-40 cursor-not-allowed text-navy-400'
                      : 'text-navy-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'records' && selectedPatientId && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-white/10 text-xs text-navy-300 space-y-1">
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
              Affiliated Facility
            </div>
            <div className="font-bold text-white text-xs">{doctor?.hospital_name || 'Participating Hospital'}</div>
            <div className="text-[10px] text-navy-400 font-mono">Specialty: {doctor?.specialization}</div>
          </div>
        </div>

        {/* Doctor Profile Footer & Sign Out */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold uppercase">
              {user?.full_name ? user.full_name[0] : 'D'}
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.full_name}</div>
              <div className="text-[11px] font-mono text-blue-300 truncate">{doctor?.doctor_id}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-navy-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center text-navy-400 text-sm">
            Loading clinician console...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <DoctorOverview
                data={dashboardData}
                onNavigate={setActiveTab}
                onSelectPatient={handleSelectPatient}
              />
            )}
            {activeTab === 'search' && (
              <DoctorSearchPatients onSelectPatient={handleSelectPatient} />
            )}
            {activeTab === 'records' && selectedPatientId && (
              <DoctorPatientRecordView
                patientId={selectedPatientId}
                onBack={() => setActiveTab('search')}
              />
            )}
            {activeTab === 'audit' && <DoctorAccessHistory />}
          </>
        )}
      </main>
    </div>
  );
}
