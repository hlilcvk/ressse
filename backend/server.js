const express = require('express');
const cors = require('cors');
const { masterPool } = require('./db');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const appointmentRoutes = require('./routes/appointments');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Randevu Yönetim API' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Randevu Yönetim Sistemi API                 ║');
  console.log(`║   Port: ${PORT}                                    ║`);
  console.log(`║   Environment: ${process.env.NODE_ENV || 'development'}              ║`);
  console.log('║   Hazır ve çalışıyor! 🚀                      ║');
  console.log('╚═══════════════════════════════════════════════╝');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  masterPool.end();
  process.exit(0);
});
