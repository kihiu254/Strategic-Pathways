const fs = require('fs');
const path = 'src/sections/ProfilePage.tsx';
let c = fs.readFileSync(path, 'utf8');

// Replace catch blocks safely
c = c.replace(/catch\s*\(\s*err\s*:\s*any\s*\)\s*\{/g, 'catch (error) {\n      const err = error as Error;');
c = c.replace(/catch\s*\(\s*error\s*:\s*any\s*\)\s*\{/g, 'catch (error) {\n      const err = error as Error;');

// In ProfilePage.tsx err.message is used or error.message is used.
// If error is used, we re-alias error inside: catch (e) { const error = e as Error; ...
c = c.replace(/catch \(error\) \{\n      const err = error as Error;/g, 'catch (e) {\n      const error = e as Error;\n      const err = e as Error;');

// Replace arrays
c = c.replace(/const \[documents, setDocuments\] = useState<any\[\]>\(\[\]\);/g, 'const [documents, setDocuments] = useState<{name: string, url: string, metadata?: {size: number}, created_at: string}[]>([]);');
c = c.replace(/const \[userProjects, setUserProjects\] = useState<any\[\]>\(\[\]\);/g, 'const [userProjects, setUserProjects] = useState<{id: string, project_title: string, organization?: string, project_description?: string, is_current: boolean, created_at: string, tags?: string[]}[]>([]);');
c = c.replace(/const \[activities, setActivities\] = useState<any\[\]>\(\[/g, 'const [activities, setActivities] = useState<{action: string, target: string, time: string}[]>([');
c = c.replace(/let parsedDocs: any\[\] = \[\];/g, 'let parsedDocs: {name: string, url?: string, metadata?: {size: number}, created_at: string}[] = [];');

// Any other inline usages (like opp: any)
c = c.replace(/\(opp: any\)/g, '(opp: { id: string | number; title: string; org: string; tags: string[] })');
c = c.replace(/\(tag: any\)/g, '(tag: string)');

fs.writeFileSync(path, c);
console.log('Fixed any in ProfilePage.tsx');
