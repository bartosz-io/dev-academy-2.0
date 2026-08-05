'use strict';

const fs = require('fs');
const path = require('path');
const frontMatter = require('hexo-front-matter');

const STATUSES = new Set(['idea', 'draft', 'ready', 'added-to-kit', 'retired']);
const PRODUCTION_STATUSES = new Set(['ready', 'added-to-kit']);
const DATE_FIELDS = ['created', 'last_verified', 'review_after'];
const MAX_WORDS = 900;

function valueAsDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }
  return value == null ? '' : String(value);
}

function rawFrontMatterValue(source, field) {
  const data = frontMatter.split(source).data;
  if (!data) return undefined;

  const prefix = field + ':';
  const line = data.split(/\r?\n/).find(function (candidate) {
    return candidate.startsWith(prefix);
  });
  if (!line) return undefined;

  const value = line.slice(prefix.length).trim();
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeDate(value) {
  const date = valueAsDate(value);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return null;
  }
  return date;
}

function countWords(body) {
  const words = String(body || '').trim().match(/\S+/g);
  return words ? words.length : 0;
}

function parsePill(source, filePath) {
  const parsed = frontMatter.parse(source);
  const body = String(parsed._content || '').trim();
  delete parsed._content;
  DATE_FIELDS.forEach(function (field) {
    const rawValue = rawFrontMatterValue(source, field);
    if (rawValue !== undefined) parsed[field] = rawValue;
  });
  return { filePath: filePath, metadata: parsed, body: body };
}

function addRequired(errors, metadata, field) {
  if (metadata[field] == null || String(metadata[field]).trim() === '') {
    errors.push(field + ' is required');
  }
}

function normalizeSequencePosition(value) {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function validatePillWithPosition(record, now, sequencePosition) {
  const errors = [];
  const metadata = record.metadata;
  const production = PRODUCTION_STATUSES.has(metadata.status);
  const normalizedDates = {};

  ['id', 'track', 'status', 'created', 'last_verified', 'review_after'].forEach(function (field) {
    addRequired(errors, metadata, field);
  });
  DATE_FIELDS.forEach(function (field) {
    normalizedDates[field] = normalizeDate(metadata[field]);
    if (
      metadata[field] != null &&
      String(metadata[field]).trim() !== '' &&
      normalizedDates[field] == null
    ) {
      errors.push(field + ' must be a valid ISO date (YYYY-MM-DD)');
    }
  });

  if (!['security', 'testing'].includes(metadata.track)) {
    errors.push('track must be security or testing');
  }
  if (
    ['security', 'testing'].includes(metadata.track) &&
    path.basename(path.dirname(record.filePath)) !== metadata.track
  ) {
    errors.push('file must be in the ' + metadata.track + ' track directory');
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
  if (
    typeof metadata.id === 'string' &&
    (
      !path.basename(record.filePath).startsWith(metadata.id + '-') ||
      path.basename(record.filePath) === metadata.id + '-.md' ||
      !path.basename(record.filePath).endsWith('.md')
    )
  ) {
    errors.push('filename must start with ' + metadata.id + '- and include a topic slug');
  }

  if (production) {
    ['subject', 'preview_text', 'sequence_position'].forEach(function (field) {
      addRequired(errors, metadata, field);
    });
    if (sequencePosition == null) {
      errors.push('sequence_position must be a positive integer');
    }
    const sources = metadata.sources;
    if (
      Array.isArray(sources) &&
      sources.some(function (source) {
        return typeof source !== 'string' || source.trim() === '';
      })
    ) {
      errors.push('sources must contain only nonblank strings');
    }
    if (
      !Array.isArray(sources) ||
      !sources.some(function (source) {
        return typeof source === 'string' && source.trim() !== '';
      })
    ) {
      errors.push('at least one source is required');
    }
    if (!record.body) errors.push('email body is required');
    if (countWords(record.body) > MAX_WORDS) errors.push('email body exceeds 900 words');

    const reviewAfter = normalizedDates.review_after;
    const today = now.toISOString().slice(0, 10);
    if (reviewAfter != null && reviewAfter < today) {
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

function validatePill(record, now) {
  return validatePillWithPosition(
    record,
    now,
    normalizeSequencePosition(record.metadata.sequence_position)
  );
}

function validateCollection(records, now) {
  const errors = [];
  const ids = new Map();
  const positions = new Map();

  records.forEach(function (record) {
    const metadata = record.metadata;
    const sequencePosition = normalizeSequencePosition(metadata.sequence_position);
    errors.push.apply(errors, validatePillWithPosition(record, now, sequencePosition));

    if (ids.has(metadata.id)) errors.push(record.filePath + ': duplicate id ' + metadata.id);
    else ids.set(metadata.id, record.filePath);

    if (PRODUCTION_STATUSES.has(metadata.status) && sequencePosition != null) {
      const key = metadata.track + ':' + sequencePosition;
      if (positions.has(key)) {
        errors.push(
          record.filePath + ': duplicate ' + metadata.track +
          ' sequence position ' + sequencePosition
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
