import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const stageDir = path.resolve(ROOT, 'dist-wa-zip');
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// Copy root files
fs.copyFileSync(path.resolve(ROOT, '.htaccess'), path.resolve(stageDir, '.htaccess'));
fs.copyFileSync(path.resolve(ROOT, 'app.cjs'), path.resolve(stageDir, 'app.cjs'));
fs.copyFileSync(path.resolve(ROOT, 'app.js'), path.resolve(stageDir, 'app.js'));
fs.copyFileSync(path.resolve(ROOT, 'wa-package.json'), path.resolve(stageDir, 'package.json'));

// Subdirectories
fs.mkdirSync(path.resolve(stageDir, 'server'), { recursive: true });
fs.copyFileSync(path.resolve(ROOT, 'server', 'whatsapp-service.mjs'), path.resolve(stageDir, 'server', 'whatsapp-service.mjs'));

fs.mkdirSync(path.resolve(stageDir, 'prisma'), { recursive: true });
fs.copyFileSync(path.resolve(ROOT, 'prisma', 'schema.prisma'), path.resolve(stageDir, 'prisma', 'schema.prisma'));

const zipPath = path.resolve(ROOT, 'wa-service.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const files = fs.readdirSync(stageDir);
execSync(`tar -acf "${zipPath}" ${files.map((f) => `"${f}"`).join(' ')}`, { cwd: stageDir, stdio: 'inherit' });
fs.rmSync(stageDir, { recursive: true, force: true });

console.log('Successfully built wa-service.zip!');
