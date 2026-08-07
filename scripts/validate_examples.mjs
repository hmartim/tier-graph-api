#!/usr/bin/env node
/**
 * Validate example instances against their declared JSON Schema.
 *
 * An example opts into validation by including a `$schema` property whose value
 * is a repo-relative path to a schema file, e.g.
 *
 *   { "$schema": "../../schemas/core/derived-relation.schema.json", ... }
 *
 * Examples under examples/ and conformance/ are checked. Files without a
 * repo-relative `$schema` are skipped with a note.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats.default ? addFormats.default(ajv) : addFormats(ajv);

// Preload all schemas so $id-based and file $refs resolve.
const schemaFiles = await glob('schemas/**/*.schema.json', { cwd: repoRoot });
for (const rel of schemaFiles) {
  const schema = JSON.parse(readFileSync(path.join(repoRoot, rel), 'utf8'));
  ajv.addSchema(schema, schema.$id ?? rel);
}

const exampleFiles = (
  await glob(['examples/**/*.json', 'conformance/**/*.json'], { cwd: repoRoot })
).sort();

let checked = 0;
let skipped = 0;
let hadError = false;

for (const rel of exampleFiles) {
  const abs = path.join(repoRoot, rel);
  let instance;
  try {
    instance = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (err) {
    console.error(`✗ ${rel}: invalid JSON — ${err.message}`);
    hadError = true;
    continue;
  }

  const ref = instance.$schema;
  if (typeof ref !== 'string' || (!ref.startsWith('.') && !ref.startsWith('schemas/'))) {
    skipped++;
    continue;
  }

  const schemaAbs = path.resolve(path.dirname(abs), ref);
  let schema;
  try {
    schema = JSON.parse(readFileSync(schemaAbs, 'utf8'));
  } catch (err) {
    console.error(`✗ ${rel}: cannot load $schema ${ref} — ${err.message}`);
    hadError = true;
    continue;
  }

  // Reuse the preloaded validator by $id when available (schemas were added above);
  // fall back to compiling only if this schema was not preloaded.
  const validate = (schema.$id && ajv.getSchema(schema.$id)) || ajv.compile(schema);
  // The $schema pointer is a convenience for this tool, not part of the instance.
  const { $schema, ...data } = instance;
  if (validate(data)) {
    console.log(`✓ ${rel}`);
    checked++;
  } else {
    console.error(`✗ ${rel}`);
    for (const e of validate.errors ?? []) {
      console.error(`    ${e.instancePath || '/'} ${e.message}`);
    }
    hadError = true;
  }
}

console.log(`\n${checked} example(s) validated, ${skipped} skipped (no repo-relative $schema).`);
process.exit(hadError ? 1 : 0);
