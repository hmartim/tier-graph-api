#!/usr/bin/env node
/**
 * Validate the ontology layer by parsing every Turtle file (syntax check).
 *
 * This checks that ontology/tier-graph.ttl and ontology/tier-graph.shacl.ttl are
 * syntactically valid Turtle and reports triple counts. Full SHACL *execution* against
 * instance data belongs to the conformance tooling, where there are concrete instances to
 * validate; here we only ensure the vocabulary and shapes parse.
 *
 * n3 is optional at authoring time; if it is not installed the script reports that and
 * exits 0 so a bare checkout does not fail. CI installs it and enforces the parse check.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const ontologyDir = path.join(repoRoot, 'ontology');

let N3;
try {
  N3 = (await import('n3')).default ?? (await import('n3'));
} catch {
  console.log('ℹ n3 not installed — skipping Turtle parse check. Run `npm install` in scripts/.');
  process.exit(0);
}

const { Parser } = N3;

const ttlFiles = (await glob('*.ttl', { cwd: ontologyDir })).sort();
if (ttlFiles.length === 0) {
  console.log('No Turtle files in ontology/.');
  process.exit(0);
}

let hadError = false;
for (const rel of ttlFiles) {
  const abs = path.join(ontologyDir, rel);
  try {
    const quads = new Parser().parse(readFileSync(abs, 'utf8'));
    console.log(`✓ parsed ${rel} (${quads.length} triples)`);
  } catch (err) {
    console.error(`✗ ${rel}: Turtle parse error — ${err.message}`);
    hadError = true;
  }
}

process.exit(hadError ? 1 : 0);
