'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'content', 'pills');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

[
  'README.md',
  'backlog.md',
  'template.md',
  'security/.gitkeep',
  'testing/.gitkeep',
  'assets/README.md'
].forEach(function (relativePath) {
  assert(fs.existsSync(path.join(ROOT, relativePath)), 'missing ' + relativePath);
});

const template = read('template.md');
[
  'id:',
  'track:',
  'status:',
  'sequence_position:',
  'subject:',
  'preview_text:',
  'created:',
  'last_verified:',
  'review_after:',
  'kit_sequence_id:',
  'kit_email_id:',
  'related_pill:',
  'sources:'
].forEach(function (field) {
  assert(template.includes(field), 'template missing ' + field);
});

assert(template.includes('## Email body'));
assert(read('README.md').includes('idea -> draft -> ready -> added-to-kit -> retired'));
assert(read('backlog.md').includes('## Security'));
assert(read('backlog.md').includes('## Testing'));
assert(read('backlog.md').includes('## Review due'));

console.log('Knowledge Pills structure checks passed.');
