import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, Download, Copy, Check, ExternalLink, Image as ImageIcon, QrCode } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, patient, user }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'photo'

  if (!isOpen || !patient) return null;

  // Use Wi-Fi LAN IP (192.168.1.38) when scanning from a physical phone, or fallback to current origin
  const scanHost = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? '192.168.1.38'
    : (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

  const qrScanUrl = `http://${scanHost}:5000/qr-view`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.patient_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden text-center p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-navy-800">
          Student / Patient ID QR Code
        </h3>
        <p className="text-xs text-navy-500 mb-4">
          Scan this QR code with any phone or scanner to view the verification status.
        </p>

        {/* View Toggle Tabs */}
        <div className="flex rounded-xl bg-navy-50 p-1 mb-4 text-xs font-bold border border-navy-100">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'qr' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'photo' ? 'bg-white text-teal-700 shadow-sm' : 'text-navy-500 hover:text-navy-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Target Photo</span>
          </button>
        </div>

        {activeTab === 'qr' ? (
          <div>
            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-teal-300 inline-block shadow-inner mb-3">
              <QRCodeSVG
                value={qrScanUrl}
                size={180}
                level="H"
                fgColor="#102A43"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="mb-4">
              <a
                href="/qr-view"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center space-x-1 hover:underline"
              >
                <span>↗ Open photo directly in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* Scanned Photo Preview */
          <div className="mb-4 p-3 bg-navy-950 rounded-2xl border-2 border-amber-300 shadow-inner">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2">
              ● Scanned Result Preview
            </div>
            <div className="bg-white p-2 rounded-xl">
              <img
                src="/work-in-progress.png"
                alt="Work in Progress"
                className="w-full max-h-48 object-contain rounded-lg mx-auto"
              />
            </div>
          </div>
        )}

        {/* Patient Details Pill */}
        <div className="p-3 rounded-xl bg-surface border border-navy-100 text-left mb-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-800">
            <span>{user?.full_name}</span>
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">{patient.blood_group}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-navy-500 font-mono">
            <span>ID: {patient.patient_id}</span>
            <button
              onClick={handleCopyId}
              className="text-teal-600 hover:underline flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl teal-gradient-bg text-white font-bold text-xs shadow-glow-teal hover:opacity-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
