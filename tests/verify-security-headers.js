'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const netlifyConfig = fs.readFileSync(path.join(__dirname, '..', 'netlify.toml'), 'utf8');
const cspMatch = netlifyConfig.match(/Content-Security-Policy\s*=\s*"([^"]+)"/);

assert(cspMatch, 'global Content-Security-Policy header must be configured');

const directives = new Map();
cspMatch[1].split(';').forEach(function (entry) {
  const tokens = entry.trim().split(/\s+/).filter(Boolean);
  if (tokens.length > 0) directives.set(tokens[0], tokens.slice(1));
});

[
  'default-src',
  'script-src',
  'style-src',
  'font-src',
  'img-src',
  'connect-src',
  'frame-ancestors',
  'frame-src',
  'form-action',
  'media-src'
].forEach(function (directive) {
  assert(directives.has(directive), 'CSP must preserve ' + directive);
});

function assertSource(directive, source) {
  assert(
    directives.get(directive).includes(source),
    directive + ' must allow ' + source
  );
}

assertSource('script-src', "'self'");
assertSource('script-src', 'https://eu-assets.i.posthog.com');
assertSource('script-src', 'https://connect.facebook.net');
assertSource('connect-src', 'https://p.dev-academy.com');
assertSource('connect-src', 'https://www.facebook.com');
assertSource('img-src', 'https://www.facebook.com');

assert(!directives.get('script-src').includes('*'), 'script-src must not allow every origin');
assert(!directives.get('script-src').includes('data:'), 'script-src must not allow data:');
assert(!directives.get('connect-src').includes('*'), 'connect-src must not allow every origin');
assert(!cspMatch[1].includes("'unsafe-eval'"), 'CSP must not allow unsafe-eval');

console.log('Security header checks passed.');
