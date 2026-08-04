'use strict';

const assert = require('assert');
const {
  countWords,
  parsePill,
  validateCollection,
  validatePill
} = require('../scripts/pills/validator');

const NOW = new Date('2026-08-04T00:00:00Z');

function source(overrides, body) {
  const values = Object.assign({
    id: 'SEC-001',
    track: 'security',
    status: 'ready',
    sequence_position: '1',
    subject: 'Can another website click your buttons?',
    preview_text: 'Authentication does not prove user intent.',
    created: '2026-08-04',
    last_verified: '2026-08-04',
    review_after: '2027-08-04',
    kit_sequence_id: '',
    kit_email_id: '',
    related_pill: '',
    sources: '  - https://developer.mozilla.org/'
  }, overrides || {});

  return [
    '---',
    'id: ' + values.id,
    'track: ' + values.track,
    'status: ' + values.status,
    'sequence_position: ' + values.sequence_position,
    'subject: "' + values.subject + '"',
    'preview_text: "' + values.preview_text + '"',
    'created: ' + values.created,
    'last_verified: ' + values.last_verified,
    'review_after: ' + values.review_after,
    'kit_sequence_id: ' + values.kit_sequence_id,
    'kit_email_id: ' + values.kit_email_id,
    'related_pill: ' + values.related_pill,
    'sources:',
    values.sources,
    '---',
    '',
    body || 'A focused, approved email body.'
  ].join('\n');
}

const valid = parsePill(source(), '/tmp/security/SEC-001-clickjacking.md');
assert.deepStrictEqual(validatePill(valid, NOW), []);
assert.strictEqual(countWords('one two\nthree'), 3);

const wrongPrefix = parsePill(
  source({ id: 'TST-001' }),
  '/tmp/security/TST-001-clickjacking.md'
);
assert(validatePill(wrongPrefix, NOW).some(function (error) {
  return error.includes('security IDs must match SEC-NNN');
}));

const missingSubject = parsePill(
  source({ subject: '' }),
  '/tmp/security/SEC-001-clickjacking.md'
);
assert(validatePill(missingSubject, NOW).some(function (error) {
  return error.includes('subject is required');
}));

const overdue = parsePill(
  source({ review_after: '2026-08-03' }),
  '/tmp/security/SEC-001-clickjacking.md'
);
assert(validatePill(overdue, NOW).some(function (error) {
  return error.includes('review is overdue');
}));

const tooLong = parsePill(
  source({}, new Array(902).join('word ')),
  '/tmp/security/SEC-001-clickjacking.md'
);
assert(validatePill(tooLong, NOW).some(function (error) {
  return error.includes('exceeds 900 words');
}));

const kitCopy = parsePill(
  source({ status: 'added-to-kit' }),
  '/tmp/security/SEC-001-clickjacking.md'
);
assert(validatePill(kitCopy, NOW).some(function (error) {
  return error.includes('kit_sequence_id is required');
}));
assert(validatePill(kitCopy, NOW).some(function (error) {
  return error.includes('kit_email_id is required');
}));

const duplicate = parsePill(source(), '/tmp/security/SEC-001-second.md');
const collectionErrors = validateCollection([valid, duplicate], NOW);
assert(collectionErrors.some(function (error) {
  return error.includes('duplicate id SEC-001');
}));
assert(collectionErrors.some(function (error) {
  return error.includes('duplicate security sequence position 1');
}));

const relation = parsePill(
  source({ id: 'SEC-002', sequence_position: '2', related_pill: 'TST-999' }),
  '/tmp/security/SEC-002-related.md'
);
assert(validateCollection([valid, relation], NOW).some(function (error) {
  return error.includes('related Pill TST-999 does not exist');
}));

console.log('Knowledge Pills validator checks passed.');
