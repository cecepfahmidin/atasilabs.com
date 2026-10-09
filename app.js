// app.js - Universal CommonJS Entry Point for Phusion Passenger
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Auto-patch whatsapp-web.js on boot
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

// 2. Load WhatsApp Service ES Module via dynamic import
import('./server/whatsapp-service.mjs').catch((err) => {
  console.error('[Startup Error] Gagal memuat whatsapp-service.mjs:', err);
  const port = process.env.PORT || 5001;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
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
  });
  server.listen(port);
});
