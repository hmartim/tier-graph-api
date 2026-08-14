#!/usr/bin/env node
/**
 * Validate profile documents under profiles/ and enforce the constraints JSON Schema
 * cannot express.
 *
 * Two document kinds are recognized by filename:
 *
 *   *vocabulary*.yaml -> schemas/vocabulary/profile-vocabulary.schema.json
 *   *profile*.yaml    -> schemas/grounding/temporal-grounding-profile.schema.json
 *
 * Beyond schema validity, this checks:
 *   1. token uniqueness within each vocabulary list (the vocabulary is the sole authority
 *      on meaning, so one token MUST NOT carry two declarations);
 *   2. that every `predicates[].family` is declared in `predicateFamilies`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats.default ? addFormats.default(ajv) : addFormats(ajv);

for (const rel of await glob('schemas/**/*.schema.json', { cwd: repoRoot })) {
  const schema = JSON.parse(readFileSync(path.join(repoRoot, rel), 'utf8'));
  ajv.addSchema(schema, schema.$id ?? rel);
}

const VOCABULARY_SCHEMA = 'https://spec.tier-graph.org/schemas/vocabulary/profile-vocabulary.schema.json';
const PROFILE_SCHEMA = 'https://spec.tier-graph.org/schemas/grounding/temporal-grounding-profile.schema.json';

const TOKEN_KEYS = {
  entityTypes: 'entityType',
  predicates: 'predicate',
  predicateFamilies: 'family',
  qualifierDimensions: 'dimension',
};

let checked = 0;
let hadError = false;

const fail = (rel, message) => {
  console.error(`✗ ${rel}: ${message}`);
  hadError = true;
};

for (const rel of (await glob('profiles/**/*.yaml', { cwd: repoRoot })).sort()) {
  const base = path.basename(rel).toLowerCase();
  const schemaId = base.includes('vocabulary')
    ? VOCABULARY_SCHEMA
    : base.includes('profile')
      ? PROFILE_SCHEMA
      : null;

  if (!schemaId) {
    console.log(`- ${rel} (no recognized document kind; skipped)`);
    continue;
  }

  let doc;
  try {
    doc = yaml.load(readFileSync(path.join(repoRoot, rel), 'utf8'));
  } catch (err) {
    fail(rel, `invalid YAML — ${err.message}`);
    continue;
  }

  const validate = ajv.getSchema(schemaId);
  if (!validate(doc)) {
    console.error(`✗ ${rel}`);
    for (const e of validate.errors ?? []) console.error(`    ${e.instancePath || '/'} ${e.message}`);
    hadError = true;
    continue;
  }

  if (schemaId === VOCABULARY_SCHEMA) {
    for (const [list, key] of Object.entries(TOKEN_KEYS)) {
      const seen = new Set();
      for (const entry of doc[list] ?? []) {
        if (seen.has(entry[key])) fail(rel, `duplicate ${list} token "${entry[key]}"`);
        seen.add(entry[key]);
      }
    }
    const families = new Set((doc.predicateFamilies ?? []).map((f) => f.family));
    for (const p of doc.predicates ?? []) {
      if (p.family && !families.has(p.family)) {
        fail(rel, `predicate "${p.predicate}" declares undeclared family "${p.family}"`);
      }
    }
  }

  if (!hadError) console.log(`✓ ${rel}`);
  checked++;
}

console.log(`\n${checked} profile document(s) checked.`);
process.exit(hadError ? 1 : 0);
