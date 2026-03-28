import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const includeRoots = ['src', 'api'];
const includeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

const sinkPatterns = [
  { label: 'toast.error', regex: /toast\.error\(([\s\S]{0,300}?)\)/g },
  { label: 'setLoadError', regex: /setLoadError\(([\s\S]{0,300}?)\)/g },
  { label: 'api error response', regex: /\.json\(\s*\{\s*error:\s*([\s\S]{0,300}?)\}\s*\)/g },
];

const riskySources = [
  /\.message\b/,
  /\bresult\.error\b/,
  /\bpayload\.error\b/,
  /\berr\.message\b/,
  /\berrorData\.message\b/,
];

const bannedTerms = [
  /supabase/i,
  /resend/i,
  /firebase/i,
  /imagekit/i,
  /paystack/i,
  /service role/i,
  /api key/i,
  /private key/i,
  /authorization/i,
  /token/i,
  /session token/i,
  /database/i,
  /schema/i,
  /table/i,
  /policy/i,
  /\brls\b/i,
  /configured/i,
  /cron_secret/i,
  /internal server error/i,
  /method not allowed/i,
];

const allowPatterns = [
  /getSafeErrorMessage\(/,
  /t\(/,
  /validationError/,
  /notice/,
  /copy\.loadError/,
  /message\b/,
];

const violations = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!includeExtensions.has(path.extname(entry.name))) continue;
    scanFile(fullPath);
  }
};

const getLineNumber = (content, index) => content.slice(0, index).split('\n').length;

const addViolation = (filePath, index, reason, snippet) => {
  violations.push({
    filePath: path.relative(rootDir, filePath),
    line: getLineNumber(fs.readFileSync(filePath, 'utf8'), index),
    reason,
    snippet: snippet.replace(/\s+/g, ' ').trim().slice(0, 180),
  });
};

const scanExpression = (filePath, content, matchIndex, sinkLabel, expression) => {
  const normalized = expression.replace(/\s+/g, ' ').trim();

  if (allowPatterns.some((pattern) => pattern.test(normalized))) {
    return;
  }

  if (riskySources.some((pattern) => pattern.test(normalized))) {
    addViolation(filePath, matchIndex, `${sinkLabel} uses raw runtime error data`, normalized);
    return;
  }

  const quotedLiteralMatch = normalized.match(/^['"`]([\s\S]*)['"`]$/);
  if (!quotedLiteralMatch) return;

  const literal = quotedLiteralMatch[1];
  const hasTemplateInterpolation = normalized.startsWith('`') && /\$\{/.test(normalized);
  if (hasTemplateInterpolation) {
    addViolation(filePath, matchIndex, `${sinkLabel} uses an interpolated template literal`, normalized);
    return;
  }

  const bannedTerm = bannedTerms.find((pattern) => pattern.test(literal));
  if (bannedTerm) {
    addViolation(filePath, matchIndex, `${sinkLabel} contains technical wording`, literal);
  }
};

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');

  for (const sink of sinkPatterns) {
    sink.regex.lastIndex = 0;
    let match;
    while ((match = sink.regex.exec(content)) !== null) {
      scanExpression(filePath, content, match.index, sink.label, match[1]);
    }
  }
};

for (const relativeRoot of includeRoots) {
  const fullRoot = path.join(rootDir, relativeRoot);
  if (fs.existsSync(fullRoot)) {
    walk(fullRoot);
  }
}

if (violations.length > 0) {
  console.error('Unsafe user-facing messaging detected:\n');
  for (const violation of violations) {
    console.error(`- ${violation.filePath}:${violation.line} ${violation.reason}`);
    console.error(`  ${violation.snippet}`);
  }
  process.exit(1);
}

console.log('Safe messaging check passed.');
