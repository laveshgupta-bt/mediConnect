import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, Clock, Building2, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatientAppointments()
      .then(res => setAppointments(res.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Appointments</h2>
          <p className="text-xs text-navy-500">Upcoming hospital consultations and cross-facility visits.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-navy-400 text-sm">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-navy-100 text-navy-400">
          No appointments scheduled.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex flex-col items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-navy-900">{apt.reason}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-xs text-navy-600 mt-1 flex items-center space-x-2">
                    <span>{apt.hospital_name} ({apt.department})</span>
                    <span>•</span>
                    <span>Physician: Dr. {apt.doctor_name}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-navy-900">{apt.appointment_date}</div>
                <div className="text-xs text-navy-400 font-mono">{apt.appointment_time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
