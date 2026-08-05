'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

const CHECK = path.join(__dirname, '..', 'scripts', 'pills', 'check.js');

assert.doesNotThrow(function () {
  const source = fs.readFileSync(CHECK, 'utf8');
  vm.runInThisContext(
    '(function(exports, require, module, __filename, __dirname, hexo){' + source + '\n});',
    { filename: CHECK }
  );
}, 'the CLI must compile when Hexo wraps files beneath scripts/');

function run(rootDir) {
  return spawnSync(process.execPath, [CHECK, rootDir, '2026-08-04'], {
    encoding: 'utf8'
  });
}

const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pills-valid-'));
fs.mkdirSync(path.join(emptyRoot, 'security'));
fs.mkdirSync(path.join(emptyRoot, 'testing'));

const success = run(emptyRoot);
assert.strictEqual(success.status, 0);
assert(success.stdout.includes('0 Knowledge Pills passed validation.'));

const invalidRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pills-invalid-'));
fs.mkdirSync(path.join(invalidRoot, 'security'));
fs.mkdirSync(path.join(invalidRoot, 'testing'));
fs.writeFileSync(
  path.join(invalidRoot, 'security', 'SEC-001-invalid.md'),
  '---\nid: SEC-001\ntrack: security\nstatus: ready\n---\nBody',
  'utf8'
);

const failure = run(invalidRoot);
assert.strictEqual(failure.status, 1);
assert(failure.stderr.includes('subject is required'));
assert(failure.stderr.includes('preview_text is required'));

console.log('Knowledge Pills CLI checks passed.');
