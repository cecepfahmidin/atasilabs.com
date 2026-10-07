import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const utilsPath = path.resolve(ROOT_DIR, 'node_modules', 'whatsapp-web.js', 'src', 'util', 'Injected', 'Utils.js');

if (!fs.existsSync(utilsPath)) {
  console.log('[patch-wwebjs] whatsapp-web.js not found, skipping patch.');
  process.exit(0);
}

let code = fs.readFileSync(utilsPath, 'utf8');

let modified = false;

// Fix 1: delete mediaOptions.id and mediaOptions.__x_id in processMediaData / options.media
if (!code.includes('delete mediaOptions.id;') && code.includes('delete options.sendMediaAsSticker;')) {
  code = code.replace(
    /delete options\.sendMediaAsSticker;(\s*})/g,
    'delete options.sendMediaAsSticker;\n            if (mediaOptions) {\n                delete mediaOptions.id;\n                delete mediaOptions.__x_id;\n            }$1'
  );
  modified = true;
}

// Fix 2: re-assert message.id = newMsgKey and delete message.__x_id after spreading options
if (!code.includes('delete message.__x_id;') && code.includes('...extraOptions,\n        };')) {
  code = code.replace(
    /(\.\.\.extraOptions,\s*\};\s*)(if \(botOptions\))/g,
    '$1\n        message.id = newMsgKey;\n        delete message.__x_id;\n        message.from = from;\n        message.to = chat.id;\n        if (content) message.body = content;\n\n        $2'
  );
  modified = true;
}

// Fix 3: delete mediaData.id and mediaData.__x_id before return mediaData in processMediaData
if (!code.includes('delete mediaData.id;') && code.includes('return mediaData;\n    };')) {
  code = code.replace(
    /(\s*)return mediaData;\s*\};/g,
    '$1delete mediaData.id;\n$1delete mediaData.__x_id;\n\n$1return mediaData;\n    };'
  );
  modified = true;
}

if (modified) {
  fs.writeFileSync(utilsPath, code, 'utf8');
  console.log('[patch-wwebjs] Successfully applied media memoize id patch to whatsapp-web.js!');
} else {
  console.log('[patch-wwebjs] whatsapp-web.js is already patched.');
}
