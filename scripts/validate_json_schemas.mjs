#!/usr/bin/env node
/**
 * Validate that every JSON Schema under schemas/ is a well-formed JSON Schema
 * 2020-12 document and that all $ref references resolve.
 *
 * Uses Ajv 2020 (draft 2020-12). Exits non-zero on any failure.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const schemasDir = path.join(repoRoot, 'schemas');

const files = (await glob('**/*.schema.json', { cwd: schemasDir })).sort();
if (files.length === 0) {
  console.error('No schema files found under schemas/.');
  process.exit(1);
}

// Load every schema first so cross-file $ref by $id resolves.
const ajv = new Ajv2020({ allErrors: true, strict: false, validateSchema: true });
addFormats.default ? addFormats.default(ajv) : addFormats(ajv);

const loaded = [];
let hadError = false;

for (const rel of files) {
  const abs = path.join(schemasDir, rel);
  try {
    const schema = JSON.parse(readFileSync(abs, 'utf8'));
    ajv.addSchema(schema, schema.$id ?? rel);
    loaded.push({ rel, schema });
  } catch (err) {
    console.error(`✗ ${rel}: could not parse — ${err.message}`);
    hadError = true;
  }
}

// Compile each schema to force $ref resolution.
for (const { rel, schema } of loaded) {
  try {
    ajv.compile(schema);
    console.log(`✓ ${rel}`);
  } catch (err) {
    console.error(`✗ ${rel}: ${err.message}`);
    hadError = true;
  }
}

console.log(`\n${loaded.length} schema(s) checked.`);
process.exit(hadError ? 1 : 0);
