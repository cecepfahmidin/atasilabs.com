// app.js - Entry point for cPanel Node.js (Phusion Passenger)
import('./server/whatsapp-service.mjs').catch((err) => {
  console.error('[Startup Error] Gagal memuat whatsapp-service.mjs:', err);
});
