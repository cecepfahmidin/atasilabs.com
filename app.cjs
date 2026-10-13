// app.cjs - Universal Phusion Passenger CommonJS Bootstrapper
const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Phusion Passenger manual configuration
if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// 2. Auto-patch whatsapp-web.js on boot
try {
  const possiblePaths = [
    path.resolve(__dirname, 'node_modules', 'whatsapp-web.js', 'src', 'util', 'Injected', 'Utils.js'),
    path.resolve(__dirname, '..', 'node_modules', 'whatsapp-web.js', 'src', 'util', 'Injected', 'Utils.js'),
  ];
  const utilsPath = possiblePaths.find((p) => fs.existsSync(p));
  if (utilsPath) {
    let code = fs.readFileSync(utilsPath, 'utf8');
    let modified = false;

    if (!code.includes('delete mediaOptions.id;') && code.includes('delete options.sendMediaAsSticker;')) {
      code = code.replace(
        /delete options\.sendMediaAsSticker;(\s*})/g,
        'delete options.sendMediaAsSticker;\n            if (mediaOptions) {\n                delete mediaOptions.id;\n                delete mediaOptions.__x_id;\n            }$1'
      );
      modified = true;
    }

    if (!code.includes('delete message.__x_id;') && code.includes('...extraOptions,\n        };')) {
      code = code.replace(
        /(\.\.\.extraOptions,\s*\};\s*)(if \(botOptions\))/g,
        '$1\n        message.id = newMsgKey;\n        delete message.__x_id;\n        message.from = from;\n        message.to = chat.id;\n        if (content) message.body = content;\n\n        $2'
      );
      modified = true;
    }

    if (!code.includes('delete mediaData.id;') && code.includes('return mediaData;\n    };')) {
      code = code.replace(
        /(\s*)return mediaData;\s*\};/g,
        '$1delete mediaData.id;\n$1delete mediaData.__x_id;\n\n$1return mediaData;\n    };'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(utilsPath, code, 'utf8');
      console.log('[Auto-Patch] whatsapp-web.js patched successfully!');
    }
  }
} catch (e) {
  console.warn('[Auto-Patch] Warning applying patch:', e.message);
}

// 3. Request dispatcher
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
