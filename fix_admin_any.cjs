const fs = require('fs');
const path = 'src/sections/AdminDashboard.tsx';
let c = fs.readFileSync(path, 'utf8');

// Catch blocks
c = c.replace(/catch\s*\(\s*error\s*:\s*any\s*\)\s*\{/g, 'catch (e) {\n      const error = e as Error;');
c = c.replace(/catch\s*\(\s*err\s*:\s*any\s*\)\s*\{/g, 'catch (e) {\n      const err = e as Error;');
c = c.replace(/catch\s*\(\s*e\s*:\s*any\s*\)\s*\{/g, 'catch (error) {\n      const e = error as Error;');

// Arrays and objects
c = c.replace(/useState<any\[\]>/g, 'useState<Record<string, unknown>[]>');
c = c.replace(/useState<any\s*\|\s*null>/g, 'useState<Record<string, unknown> | null>');
c = c.replace(/any\[\]/g, 'Record<string, unknown>[]');
c = c.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');

// Function params
c = c.replace(/\(acc:\s*any,\s*p:\s*any\)/g, '(acc: Record<string, number>, p: Record<string, string>)');
c = c.replace(/\(acc:\s*any,\s*p\)/g, '(acc: Record<string, number>, p: { user_id: string })');
c = c.replace(/\(app:\s*any\)/g, '(app: Record<string, unknown>)');

// Any that's remaining
c = c.replace(/:\s*any\b/g, ': unknown');

fs.writeFileSync(path, c);
console.log('Fixed any in AdminDashboard.tsx');
