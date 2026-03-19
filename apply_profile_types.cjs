const fs = require('fs');
const path = 'src/sections/ProfilePage.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/education:\s*any\[\];/g, 'education: {degree: string, school: string, year: string}[];');
c = c.replace(/experience:\s*any\[\];/g, 'experience: {role: string, company: string, period: string}[];');
c = c.replace(/const activities:\s*any\[\]\s*=\s*\[\];/g, 'const activities: {action: string, target: string, time: string}[] = [];');
c = c.replace(/as\s*any/g, 'as Record<string, unknown>');
c = c.replace(/:\s*any\b/g, ': unknown'); // any final dangling typed parameters

fs.writeFileSync(path, c);
console.log('Fixed remaining any in ProfilePage.tsx');
