// app.js - Universal Phusion Passenger Bootstrapper
const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Phusion Passenger manual configuration
if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// 2. Request dispatcher
let activeHandler = null;

const server = http.createServer((req, res) => {
  if (activeHandler) {
    return activeHandler(req, res);
  }

  // Pre-boot handler: Respond 200 OK immediately for health checks!
  const host = req.headers.host || '127.0.0.1';
  const url = new URL(req.url, `http://${host}`);
  if (url.pathname === '/health' || url.pathname === '/' || url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        serviceOnline: true,
        status: 'BOOTING',
        message: 'WhatsApp Gateway service sedang inisialisasi background...',
        timestamp: Date.now(),
      })
    );
    return;
  }

  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      success: false,
      serviceOnline: false,
      status: 'INITIALIZING',
      message: 'Service sedang dimuat, silakan coba beberapa detik lagi.',
    })
  );
});

// 4. Synchronous listen so Passenger reverse-port binding binds immediately
if (typeof PhusionPassenger !== 'undefined') {
  server.listen('passenger');
} else {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] Server listening on port ${PORT}`);
  });
}

// Mark wrapper active so child doesn't double-listen
process.env.PASSENGER_WRAPPER = '1';

// 5. Asynchronously load the WhatsApp service
import('./server/whatsapp-service.mjs')
  .then((mod) => {
    console.log('[BOOT] WhatsApp Service loaded successfully!');
    if (mod.handleRequest) {
      activeHandler = mod.handleRequest;
    }
  })
  .catch((err) => {
    console.error('[Startup Error] Gagal memuat whatsapp-service.mjs:', err);
    activeHandler = (req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          serviceOnline: false,
          status: 'BOOT_ERROR',
          error: 'WhatsApp Service gagal start',
          message: err.message,
          stack: err.stack,
        })
      );
    };
  });

module.exports = server;
