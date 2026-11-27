const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Ensure DB is initialized
require('./db/database');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const hospitalRoutes = require('./routes/hospitals');
const fhirRoutes = require('./routes/fhir');
const auditRoutes = require('./routes/audit');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server and network origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded medical documents and public assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// QR Code Scanned View (Displays the Work in Progress image when scanned)
app.get(['/qr-view', '/verify/:id', '/verify'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediConnect — ID Verification Status</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #061321;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #0A1A2F;
      border: 2px solid #16A6A1;
      border-radius: 28px;
      padding: 28px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .badge {
      display: inline-block;
      background: rgba(22, 166, 161, 0.2);
      color: #38D9D3;
      border: 1px solid rgba(56, 217, 211, 0.4);
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
    }
    .img-box {
      background: #fff;
      border-radius: 20px;
      padding: 16px;
      margin: 16px 0 20px 0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    img {
      max-width: 100%;
      height: auto;
      max-height: 380px;
      display: block;
      margin: 0 auto;
      border-radius: 12px;
    }
    h2 {
      margin: 0 0 6px 0;
      font-size: 20px;
      font-weight: 800;
      color: #F7FAFC;
    }
    p {
      margin: 0;
      font-size: 13px;
      color: #829AB1;
      line-height: 1.5;
    }
    .footer-note {
      font-size: 11px;
      color: #16A6A1;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">MediConnect Security Grid</div>
    <h2>Patient / Student ID Verification</h2>
    <p>This verification module is currently under active development.</p>
    <div class="img-box">
      <img src="/work-in-progress.png" alt="Work in Progress" />
    </div>
    <div class="footer-note">MediConnect Unified Health Platform</div>
  </div>
</body>
</html>`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MediConnect Healthcare Interoperability Network',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MediConnect Health API Server running on port ${PORT}`);
  console.log(` Base API: http://localhost:${PORT}/api`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = app;
