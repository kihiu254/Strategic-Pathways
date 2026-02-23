import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'src/sections/ConceptNotePage.tsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backgrounds
  content = content.replace(/bg-\[var\(--bg-alt\)\]/g, 'bg-[var(--bg-primary)]');
  content = content.replace(/bg-white/g, 'bg-[var(--bg-card)]/5');
  
  // Text inverse -> Primary
  content = content.replace(/text-\[var\(--text-inverse\)\]/g, 'text-[var(--text-primary)]');
  content = content.replace(/border-\[var\(--text-inverse\)\]/g, 'border-[var(--text-primary)]');
  
  // Specific tweaks
  content = content.replace(/text-\[var\(--text-primary\)\]\/70/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-\[var\(--text-primary\)\]\/80/g, 'text-[var(--text-secondary)]');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('ConceptNotePage colors normalized for dark mode default.');
} else {
  console.log('File not found');
}
