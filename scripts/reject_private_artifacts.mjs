#!/usr/bin/env node
/**
 * Fail if any tracked file matches a private-artifact pattern.
 *
 * This is the enforcement arm of the repository's data-separation policy
 * (see SECURITY.md and .gitignore). It inspects git-tracked files only, so a
 * developer's local, gitignored scratch data does not trip it — but nothing
 * private can ever be committed.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

// Filename / extension patterns that must never be committed.
const FORBIDDEN_PATH = [
  /\.db$/i,
  /\.db-journal$/i,
  /\.sqlite$/i,
  /\.sqlite3$/i,
  /\.duckdb$/i,
  /\.parquet$/i,
  /\.mdb$/i,
  /\.accdb$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)secrets\//i,
  /(^|\/)credentials\//i,
  /(^|\/)data\/private\//i,
  /(^|\/)data\/local\//i,
];

// Content patterns that strongly indicate a leaked secret.
const FORBIDDEN_CONTENT = [
  { name: 'AWS access key id', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'private key block', re: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { name: 'generic secret assignment', re: /(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i },
];

// Only scan text-like files for content leaks.
const TEXT_EXT = new Set([
  '.md', '.yaml', '.yml', '.json', '.ttl', '.jsonld', '.txt', '.mjs', '.js', '.cjs', '.py', '.cff', '.toml', '.ini', '.env',
]);

let files;
try {
  files = execSync('git ls-files', { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
} catch {
  console.error('Not a git repository (or git unavailable); skipping tracked-file scan.');
  process.exit(0);
}

const violations = [];

for (const rel of files) {
  for (const re of FORBIDDEN_PATH) {
    if (re.test(rel)) {
      violations.push(`${rel}: matches forbidden path pattern ${re}`);
    }
  }

  const ext = path.extname(rel).toLowerCase();
  if (TEXT_EXT.has(ext)) {
    let content = '';
    try {
      content = readFileSync(path.join(repoRoot, rel), 'utf8');
    } catch {
      continue;
    }
    for (const { name, re } of FORBIDDEN_CONTENT) {
      if (re.test(content)) {
        violations.push(`${rel}: possible ${name}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('✗ Private-artifact guard FAILED:\n');
  for (const v of violations) console.error(`  - ${v}`);
  console.error('\nThis repository must not contain private databases, secrets, or production data.');
  process.exit(1);
}

console.log(`✓ Private-artifact guard passed (${files.length} tracked files scanned).`);
process.exit(0);
