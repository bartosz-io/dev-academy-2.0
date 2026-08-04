'use strict';

const fs = require('fs');
const path = require('path');
const frontMatter = require('hexo-front-matter');

const STATUSES = new Set(['idea', 'draft', 'ready', 'added-to-kit', 'retired']);
const PRODUCTION_STATUSES = new Set(['ready', 'added-to-kit']);
const MAX_WORDS = 900;

function valueAsDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value == null ? '' : String(value);
}

function countWords(body) {
  const words = String(body || '').trim().match(/\S+/g);
  return words ? words.length : 0;
}

function parsePill(source, filePath) {
  const parsed = frontMatter.parse(source);
  const body = String(parsed._content || '').trim();
  delete parsed._content;
  return { filePath: filePath, metadata: parsed, body: body };
}

function addRequired(errors, metadata, field) {
  if (metadata[field] == null || String(metadata[field]).trim() === '') {
    errors.push(field + ' is required');
  }
}

function validatePill(record, now) {
  const errors = [];
  const metadata = record.metadata;
  const production = PRODUCTION_STATUSES.has(metadata.status);

  ['id', 'track', 'status', 'created', 'last_verified', 'review_after'].forEach(function (field) {
    addRequired(errors, metadata, field);
  });

  if (!['security', 'testing'].includes(metadata.track)) {
    errors.push('track must be security or testing');
  }
  if (!STATUSES.has(metadata.status)) {
    errors.push('status is invalid');
  }
  if (metadata.track === 'security' && !/^SEC-\d{3}$/.test(metadata.id || '')) {
    errors.push('security IDs must match SEC-NNN');
  }
  if (metadata.track === 'testing' && !/^TST-\d{3}$/.test(metadata.id || '')) {
    errors.push('testing IDs must match TST-NNN');
  }

  if (production) {
    ['subject', 'preview_text', 'sequence_position'].forEach(function (field) {
      addRequired(errors, metadata, field);
    });
    if (!Number.isInteger(Number(metadata.sequence_position)) || Number(metadata.sequence_position) < 1) {
      errors.push('sequence_position must be a positive integer');
    }
    if (!Array.isArray(metadata.sources) || metadata.sources.length === 0) {
      errors.push('at least one source is required');
    }
    if (!record.body) errors.push('email body is required');
    if (countWords(record.body) > MAX_WORDS) errors.push('email body exceeds 900 words');

    const reviewAfter = valueAsDate(metadata.review_after);
    const today = now.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(reviewAfter) && reviewAfter < today) {
      errors.push('review is overdue');
    }
  }

  if (metadata.status === 'added-to-kit') {
    addRequired(errors, metadata, 'kit_sequence_id');
    addRequired(errors, metadata, 'kit_email_id');
  }

  return errors.map(function (error) {
    return record.filePath + ': ' + error;
  });
}

function validateCollection(records, now) {
  const errors = [];
  const ids = new Map();
  const positions = new Map();

  records.forEach(function (record) {
    errors.push.apply(errors, validatePill(record, now));
    const metadata = record.metadata;

    if (ids.has(metadata.id)) errors.push(record.filePath + ': duplicate id ' + metadata.id);
    else ids.set(metadata.id, record.filePath);

    if (PRODUCTION_STATUSES.has(metadata.status) && metadata.sequence_position) {
      const key = metadata.track + ':' + metadata.sequence_position;
      if (positions.has(key)) {
        errors.push(
          record.filePath + ': duplicate ' + metadata.track +
          ' sequence position ' + metadata.sequence_position
        );
      } else positions.set(key, record.filePath);
    }
  });

  records.forEach(function (record) {
    const related = record.metadata.related_pill;
    if (related && !ids.has(related)) {
      errors.push(record.filePath + ': related Pill ' + related + ' does not exist');
    }
  });

  return errors.sort();
}

function loadPills(rootDir) {
  return ['security', 'testing'].flatMap(function (track) {
    const directory = path.join(rootDir, track);
    return fs.readdirSync(directory)
      .filter(function (name) { return name.endsWith('.md'); })
      .sort()
      .map(function (name) {
        const filePath = path.join(directory, name);
        return parsePill(fs.readFileSync(filePath, 'utf8'), filePath);
      });
  });
}

module.exports = {
  MAX_WORDS,
  countWords,
  loadPills,
  parsePill,
  validateCollection,
  validatePill
};
