#!/usr/bin/env node

/**
 * Bundle the TIER-Graph OpenAPI specification into a single file.
 *
 * The specification is authored as a multi-file OpenAPI 3.1.0 document that uses
 * external `$ref`s (into ./paths and ../schemas) for organization. Some tools (e.g. the
 * online Swagger Editor) cannot resolve external file references. This script produces a
 * single, self-contained `openapi-bundled.yaml` by delegating to swagger-cli, which
 * correctly preserves internal component references instead of inlining them repeatedly.
 *
 * Usage:   node bundle-spec.js        (equivalent to `npm run bundle`)
 * Output:  openapi-bundled.yaml       (generated artifact — gitignored)
 */

const { spawnSync } = require('child_process');
const path = require('path');

const input = path.join(__dirname, 'openapi.yaml');
const output = path.join(__dirname, 'openapi-bundled.yaml');

// swagger-cli is provided by @apidevtools/swagger-cli (devDependency).
const bin = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'swagger-cli.cmd' : 'swagger-cli'
);

const result = spawnSync(
  bin,
  ['bundle', input, '--outfile', output, '--type', 'yaml'],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

if (result.status !== 0) {
  console.error('Bundling failed. Run `npm install` in the openapi/ directory first.');
  process.exit(result.status ?? 1);
}
