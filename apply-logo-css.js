import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'src/sections/Onboarding.tsx',
  'src/sections/Navigation.tsx',
  'src/sections/Footer.tsx',
  'src/sections/auth/LoginPage.tsx',
  'src/sections/AdminDashboard.tsx'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace .jpg with .png
    content = content.replace(/\/logo\.jpg/g, '/logo.png');
    // Remove theme-logo class
    content = content.replace(/ theme-logo/g, '');
    content = content.replace(/theme-logo /g, '');
    content = content.replace(/theme-logo/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Remove theme-logo from index.css
const cssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/\/\* Smart Theme Logo Blending[\s\S]*?mix-blend-mode: multiply;\s*\}/, '');
  fs.writeFileSync(cssPath, css, 'utf8');
}

console.log('Logo paths updated to .png and unused theme-logo CSS removed.');
