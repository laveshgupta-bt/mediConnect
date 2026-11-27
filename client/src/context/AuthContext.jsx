import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing session on boot or initialize requested role from URL query param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedRole = urlParams.get('role');

    if (requestedRole === 'doctor' || requestedRole === 'patient') {
      const demoKey = requestedRole === 'doctor' ? 'doctor_visiting' : 'patient';
      api.quickDemoLogin(demoKey)
        .then(res => {
          sessionStorage.setItem('mediconnect_token', res.token);
          setUser(res.user);
          setPatient(res.patient || null);
          setDoctor(res.doctor || null);
        })
        .catch(err => {
          console.warn('Auto-role boot error:', err.message);
        })
        .finally(() => setLoading(false));
      return;
    }

    const token = sessionStorage.getItem('mediconnect_token') || localStorage.getItem('mediconnect_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then(res => {
        setUser(res.user);
        setPatient(res.patient);
        setDoctor(res.doctor);
      })
      .catch(err => {
        console.warn('Session expired or invalid:', err.message);
        sessionStorage.removeItem('mediconnect_token');
        localStorage.removeItem('mediconnect_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password, role, medicalId) => {
    const res = await api.login(identifier, password, role, medicalId);
    sessionStorage.setItem('mediconnect_token', res.token);
    localStorage.setItem('mediconnect_token', res.token);
    setUser(res.user);
    setPatient(res.patient || null);
    setDoctor(res.doctor || null);
    return res;
  };

  const registerPatient = async (formData) => {
    const res = await api.registerPatient(formData);
    sessionStorage.setItem('mediconnect_token', res.token);
    localStorage.setItem('mediconnect_token', res.token);
    setUser(res.user);
    setPatient(res.patient);
    return res;
  };

  const registerDoctor = async (formData) => {
    const res = await api.registerDoctor(formData);
    sessionStorage.setItem('mediconnect_token', res.token);
    localStorage.setItem('mediconnect_token', res.token);
    setUser(res.user);
    setDoctor(res.doctor);
    return res;
  };

  const quickDemoLogin = async (accountType) => {
    const res = await api.quickDemoLogin(accountType);
    sessionStorage.setItem('mediconnect_token', res.token);
    localStorage.setItem('mediconnect_token', res.token);
    setUser(res.user);
    setPatient(res.patient || null);
    setDoctor(res.doctor || null);
    return res;
  };

  const logout = () => {
    sessionStorage.removeItem('mediconnect_token');
    localStorage.removeItem('mediconnect_token');
    setUser(null);
    setPatient(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      patient,
      doctor,
      loading,
      login,
      registerPatient,
      registerDoctor,
      quickDemoLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
