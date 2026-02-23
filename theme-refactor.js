import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Backgrounds
  content = content.replace(/bg-\[\#0B2A3C\]/g, 'bg-[var(--bg-primary)]');
  content = content.replace(/bg-\[\#F3EFE7\]/g, 'bg-[var(--bg-alt)]');
  content = content.replace(/bg-\[\#F6F4EF\]/g, 'bg-[var(--bg-card)]');
  
  // Text
  content = content.replace(/text-\[\#F6F4EF\]/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-\[\#0B2A3C\]/g, 'text-[var(--text-inverse)]');
  content = content.replace(/text-\[\#A9B6C1\]/g, 'text-[var(--text-secondary)]');
  
  // Accents
  content = content.replace(/text-\[\#C89F5E\]/g, 'text-[var(--sp-accent)]');
  content = content.replace(/bg-\[\#C89F5E\]/g, 'bg-[var(--sp-accent)]');

  // Borders
  content = content.replace(/border-\[\#0B2A3C\]/g, 'border-[var(--text-inverse)]');
  content = content.replace(/border-\[\#C89F5E\]/g, 'border-[var(--sp-accent)]');
  content = content.replace(/border-\[\#F6F4EF\]/g, 'border-[var(--text-primary)]');

  fs.writeFileSync(filePath, content, 'utf8');
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
};

walkSync(srcDir);
console.log('Finished refactoring colors to semantic variables.');
