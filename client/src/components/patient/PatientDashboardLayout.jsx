import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Clock,
  Pill,
  FileText,
  Calendar,
  ShieldCheck,
  History,
  User,
  LogOut,
  Menu,
  X,
  QrCode,
  Shield
} from 'lucide-react';

import PatientOverview from './PatientOverview';
import PatientMedicalTimeline from './PatientMedicalTimeline';
import PatientPrescriptions from './PatientPrescriptions';
import PatientLabReports from './PatientLabReports';
import PatientAppointments from './PatientAppointments';
import PatientManageAccess from './PatientManageAccess';
import PatientAccessHistory from './PatientAccessHistory';
import PatientProfile from './PatientProfile';
import QRCodeModal from './QRCodeModal';

export default function PatientDashboardLayout() {
  const { user, patient, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await api.getPatientDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'My Medical History', icon: Clock },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'labs', label: 'Lab Reports', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'access', label: 'Manage Doctor Access', icon: ShieldCheck, badge: dashboardData?.stats?.pendingRequests },
    { id: 'audit', label: 'Access History', icon: History },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-navy-100 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg teal-gradient-bg flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-navy-900 text-sm">MediConnect</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-navy-700 hover:bg-navy-50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 text-white p-6 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* Logo & Platform Tag */}
          <div className="flex items-center space-x-3 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">
                Medi<span className="text-teal-400">Connect</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-300">
                Patient Portal
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
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
                      : 'text-navy-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-navy-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold uppercase">
              {user?.full_name ? user.full_name[0] : 'P'}
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.full_name}</div>
              <div className="text-[11px] font-mono text-teal-400 truncate">{patient?.patient_id}</div>
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
            Loading your verified medical records...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <PatientOverview
                data={dashboardData}
                onNavigate={setActiveTab}
                onOpenQr={() => setQrModalOpen(true)}
              />
            )}
            {activeTab === 'history' && <PatientMedicalTimeline />}
            {activeTab === 'prescriptions' && <PatientPrescriptions />}
            {activeTab === 'labs' && <PatientLabReports />}
            {activeTab === 'appointments' && <PatientAppointments />}
            {activeTab === 'access' && <PatientManageAccess />}
            {activeTab === 'audit' && <PatientAccessHistory />}
            {activeTab === 'profile' && (
              <PatientProfile
                user={user}
                patient={patient}
                onOpenQr={() => setQrModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Emergency QR ID Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        patient={patient}
        user={user}
      />
    </div>
  );
}
