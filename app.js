// app.js - Entry point for cPanel Node.js (Phusion Passenger)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 2. Start the WhatsApp Gateway service
import('./server/whatsapp-service.mjs').catch((err) => {
  console.error('[Startup Error] Gagal memuat whatsapp-service.mjs:', err);
});
