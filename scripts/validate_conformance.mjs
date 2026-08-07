#!/usr/bin/env node
/**
 * Validate the normative conformance definitions:
 *   1. conformance/case-definition.schema.json and conformance/manifest.schema.json are
 *      well-formed JSON Schema 2020-12 documents and their $refs resolve;
 *   2. conformance/manifest.yaml validates against manifest.schema.json;
 *   3. each case's `definition` file (cases/T0N.md) exists;
 *   4. the repository contains NO executable conformance payloads
 *      (input.json / profile-fixture.json / request.json / expected.json).
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const confDir = path.join(repoRoot, 'conformance');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats.default ? addFormats.default(ajv) : addFormats(ajv);

let hadError = false;

// 1. Load & compile the conformance schemas.
const schemaFiles = ['case-definition.schema.json', 'manifest.schema.json'];
for (const rel of schemaFiles) {
  const abs = path.join(confDir, rel);
  const schema = JSON.parse(readFileSync(abs, 'utf8'));
  ajv.addSchema(schema, schema.$id ?? rel);
}
let manifestValidate;
try {
  const manifestSchema = JSON.parse(readFileSync(path.join(confDir, 'manifest.schema.json'), 'utf8'));
  manifestValidate = ajv.getSchema(manifestSchema.$id) ?? ajv.compile(manifestSchema);
  console.log('✓ conformance schemas compiled');
} catch (err) {
  console.error(`✗ conformance schema error — ${err.message}`);
  process.exit(1);
}

// 2. Validate manifest.yaml.
const manifest = yaml.load(readFileSync(path.join(confDir, 'manifest.yaml'), 'utf8'));
if (manifestValidate(manifest)) {
  console.log(`✓ manifest.yaml valid (${manifest.cases.length} cases)`);
} else {
  console.error('✗ manifest.yaml invalid:');
  for (const e of manifestValidate.errors ?? []) console.error(`    ${e.instancePath || '/'} ${e.message}`);
  hadError = true;
}

// 3. Each case's definition file exists.
for (const c of manifest.cases ?? []) {
  if (c.definition) {
    const defAbs = path.join(confDir, c.definition);
    if (!existsSync(defAbs)) {
      console.error(`✗ ${c.id}: definition file missing: ${c.definition}`);
      hadError = true;
    }
  }
}
if (!hadError) console.log('✓ all case definition files present');

// 4. No executable payloads in this repository.
const forbidden = await glob(
  ['conformance/**/{input,profile-fixture,request,expected}.json'],
  { cwd: repoRoot }
);
if (forbidden.length > 0) {
  console.error('✗ executable conformance payloads found (these belong in tier-graph-reference):');
  for (const f of forbidden) console.error(`    ${f}`);
  hadError = true;
} else {
  console.log('✓ no executable conformance payloads present');
}

process.exit(hadError ? 1 : 0);
