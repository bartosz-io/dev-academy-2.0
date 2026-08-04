# Knowledge Pills Editorial Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repository-native source of truth, template, and automated validation for Dev Academy Security Tuesday and Testing Friday Pills.

**Architecture:** Store unpublished canonical emails as Markdown outside Hexo's `source/` tree. Parse frontmatter through an explicit `hexo-front-matter` development dependency, validate individual records and cross-record invariants in a focused CommonJS module, and expose the checks through a small CLI and npm scripts.

**Tech Stack:** Node.js, CommonJS, `hexo-front-matter` 2.x, Node `assert`, npm scripts, Git.

## Global Constraints

- The canonical content root is `content/pills/`; Kit remains the delivery system.
- Security and Testing are separate evergreen tracks with IDs `SEC-NNN` and `TST-NNN`.
- Canonical Pill files must not live under Hexo's published `source/` tree.
- One Markdown file represents one email; its body is the exact approved email copy.
- Allowed statuses are `idea`, `draft`, `ready`, `added-to-kit`, and `retired`.
- Production statuses are `ready` and `added-to-kit`.
- A production Pill must contain no more than 900 body words, matching the under-five-minute promise.
- `added-to-kit` requires both `kit_sequence_id` and `kit_email_id`.
- No implementation step creates, edits, or publishes a Kit sequence email.
- No historical PDF becomes production content without fact-checking and Bartosz's approval.
- Existing user changes outside the files named in a task must remain untouched.

---

## File Map

### Editorial content

- `content/pills/README.md` - operating contract, naming rules, status lifecycle, and Monday handoff checklist.
- `content/pills/backlog.md` - lightweight queues for Security, Testing, and review-due ideas.
- `content/pills/template.md` - copyable canonical Markdown/frontmatter template.
- `content/pills/security/.gitkeep` - keeps the initially empty Security directory in Git.
- `content/pills/testing/.gitkeep` - keeps the initially empty Testing directory in Git.
- `content/pills/assets/README.md` - asset naming and ownership rules.

### Validation

- `scripts/pills/validator.js` - parsing, per-Pill validation, collection validation, and filesystem loading.
- `scripts/pills/check.js` - CLI adapter for the production `content/pills/` tree.
- `tests/verify-pill-structure.js` - repository-structure contract.
- `tests/verify-pill-validator.js` - validator behavior and edge cases.
- `tests/verify-pills-cli.js` - CLI success/failure behavior.
- `package.json` - explicit parser dependency and npm entry points.
- `package-lock.json` - reproducible dependency resolution.

---

### Task 1: Establish the editorial repository contract

**Files:**
- Create: `tests/verify-pill-structure.js`
- Create: `content/pills/README.md`
- Create: `content/pills/backlog.md`
- Create: `content/pills/template.md`
- Create: `content/pills/security/.gitkeep`
- Create: `content/pills/testing/.gitkeep`
- Create: `content/pills/assets/README.md`

**Interfaces:**
- Consumes: the approved editorial-system specification.
- Produces: a stable directory and template contract consumed by the validator and every Monday editorial session.

- [ ] **Step 1: Write the failing structure test**

Create `tests/verify-pill-structure.js`:

```js
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
```

- [ ] **Step 2: Run the structure test and verify failure**

Run:

```bash
node tests/verify-pill-structure.js
```

Expected: FAIL with `ENOENT` because `content/pills/` does not exist.

- [ ] **Step 3: Create the editorial files**

Create `content/pills/template.md` with this exact schema:

```markdown
---
id: SEC-001
track: security
status: draft
sequence_position:
subject: ""
preview_text: ""
created: 2026-08-04
last_verified: 2026-08-04
review_after: 2027-08-04
kit_sequence_id:
kit_email_id:
related_pill:
sources: []
---

## Email body

Write the exact approved email copy here.
```

Create `content/pills/backlog.md`:

```markdown
# Knowledge Pills backlog

## Security

- Clickjacking and `frame-ancestors`
- URL allow-list validation
- JWT signing-key strength
- XSS escape hatches in modern frameworks

## Testing

- Architecture tests as executable boundaries
- Why high coverage does not prove useful behavior
- Unit-test assertions as behavioral evidence
- Network interception and contract drift

## Review due

Move active Pills here when `review_after` is approaching or has passed.
```

Create `content/pills/README.md` with these sections and rules:

```markdown
# Knowledge Pills

This directory is the canonical source for Dev Academy Security Tuesday and Testing Friday emails. Kit contains delivery copies, not the source of truth.

## Tracks and filenames

- Security: `security/SEC-NNN-topic-slug.md`
- Testing: `testing/TST-NNN-topic-slug.md`
- Assets: `assets/SEC-NNN/` or `assets/TST-NNN/`

Internal IDs and sequence positions are not required in public subject lines.

## Lifecycle

`idea -> draft -> ready -> added-to-kit -> retired`

Only `ready` and `added-to-kit` are production statuses. `added-to-kit` means a Kit draft or live email exists and therefore requires `kit_sequence_id` and `kit_email_id`.

## Monday handoff

1. Select one independent topic per track.
2. Verify technical claims using authoritative sources.
3. Draft subject, preview text, and one standalone email.
4. Obtain Bartosz's explicit content approval.
5. Save the canonical Markdown and run `npm run pills:check`.
6. Create an unpublished Kit draft through MCP.
7. Save the returned Kit identifiers in frontmatter.
8. Give Bartosz the Kit confirmation URL.
9. Publish only after a separate explicit instruction.

## Evergreen reviews

- Foundations: 18 months.
- Browser, standard, and framework behavior: 12 months.
- Tool- and library-specific guidance: 6 months.

An overdue production Pill must be reviewed, updated, or retired.
```

Create `content/pills/assets/README.md`:

```markdown
# Pill assets

Store original diagrams and screenshots under a directory named after the Pill ID, for example `SEC-001/clickjacking-flow.png`. Kit may host a delivery copy, but the original source asset stays here.
```

Create empty `.gitkeep` files in the two track directories.

- [ ] **Step 4: Run the structure test and verify success**

Run:

```bash
node tests/verify-pill-structure.js
```

Expected: `Knowledge Pills structure checks passed.`

- [ ] **Step 5: Commit the repository contract**

```bash
git add content/pills tests/verify-pill-structure.js
git commit -m "feat: add Knowledge Pills editorial structure"
```

---

### Task 2: Implement Pill parsing and validation

**Files:**
- Create: `tests/verify-pill-validator.js`
- Create: `scripts/pills/validator.js`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Markdown files following `content/pills/template.md`.
- Produces:
  - `parsePill(source: string, filePath: string): PillRecord`
  - `validatePill(record: PillRecord, now: Date): string[]`
  - `validateCollection(records: PillRecord[], now: Date): string[]`
  - `loadPills(rootDir: string): PillRecord[]`
  - `countWords(body: string): number`

- [ ] **Step 1: Add the explicit frontmatter parser dependency**

Run:

```bash
npm install --save-dev hexo-front-matter@2.0.0 --ignore-scripts
```

Expected: `package.json` contains `hexo-front-matter` under `devDependencies`, and `package-lock.json` is updated without running the repository's install lifecycle.

- [ ] **Step 2: Write failing validator tests**

Create `tests/verify-pill-validator.js`:

```js
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
```

- [ ] **Step 3: Run validator tests and verify failure**

Run:

```bash
node tests/verify-pill-validator.js
```

Expected: FAIL with `Cannot find module '../scripts/pills/validator'`.

- [ ] **Step 4: Implement the validator module**

Create `scripts/pills/validator.js` with this interface and behavior:

```js
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
```

- [ ] **Step 5: Run validator tests and verify success**

Run:

```bash
node tests/verify-pill-validator.js
```

Expected: `Knowledge Pills validator checks passed.`

- [ ] **Step 6: Commit the validator**

```bash
git add package.json package-lock.json scripts/pills/validator.js tests/verify-pill-validator.js
git commit -m "feat: validate Knowledge Pill metadata"
```

---

### Task 3: Add the production CLI and npm checks

**Files:**
- Create: `tests/verify-pills-cli.js`
- Create: `scripts/pills/check.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `loadPills(rootDir)` and `validateCollection(records, now)` from Task 2.
- Produces:
  - `npm run pills:check` for production content validation;
  - `npm run test:pills` for all editorial-infrastructure tests.

- [ ] **Step 1: Write the failing CLI test**

Create `tests/verify-pills-cli.js`:

```js
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CHECK = path.join(__dirname, '..', 'scripts', 'pills', 'check.js');

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
```

- [ ] **Step 2: Run the CLI test and verify failure**

Run:

```bash
node tests/verify-pills-cli.js
```

Expected: FAIL because `scripts/pills/check.js` does not exist.

- [ ] **Step 3: Implement the CLI**

Create `scripts/pills/check.js`:

```js
#!/usr/bin/env node
'use strict';

const path = require('path');
const { loadPills, validateCollection } = require('./validator');

const rootDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', '..', 'content', 'pills');
const now = process.argv[3]
  ? new Date(process.argv[3] + 'T00:00:00Z')
  : new Date();

try {
  const records = loadPills(rootDir);
  const errors = validateCollection(records, now);

  if (errors.length) {
    errors.forEach(function (error) { console.error(error); });
    process.exitCode = 1;
  } else {
    console.log(records.length + ' Knowledge Pills passed validation.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
```

- [ ] **Step 4: Add npm scripts**

Add these entries to the existing `scripts` object in `package.json`:

```json
"pills:check": "node scripts/pills/check.js",
"test:pills": "node tests/verify-pill-structure.js && node tests/verify-pill-validator.js && node tests/verify-pills-cli.js"
```

- [ ] **Step 5: Run the CLI tests and production check**

Run:

```bash
npm run test:pills
npm run pills:check
```

Expected:

```text
Knowledge Pills structure checks passed.
Knowledge Pills validator checks passed.
Knowledge Pills CLI checks passed.
0 Knowledge Pills passed validation.
```

- [ ] **Step 6: Run existing homepage regression checks**

Run:

```bash
npm run test:homepage
```

Expected: `Newsletter homepage acceptance checks passed.` The current repository may also print known native-binary warnings from legacy `sharp` and `node-sass`; those warnings are outside this feature unless they prevent the acceptance script from completing.

- [ ] **Step 7: Commit the CLI integration**

```bash
git add package.json scripts/pills/check.js tests/verify-pills-cli.js
git commit -m "feat: add Knowledge Pills validation command"
```

---

### Task 4: Verify the complete editorial infrastructure

**Files:**
- Verify only; no expected source changes.

**Interfaces:**
- Consumes: all outputs from Tasks 1-3.
- Produces: evidence that the repository is ready for the first editorial batch.

- [ ] **Step 1: Run all focused checks from a clean shell**

```bash
npm run test:pills
npm run pills:check
```

Expected: all three test programs pass and the initially empty production collection reports `0 Knowledge Pills passed validation.`

- [ ] **Step 2: Confirm unpublished content is outside Hexo source**

```bash
test ! -e source/pills
test -d content/pills/security
test -d content/pills/testing
```

Expected: exit status 0 for all three commands.

- [ ] **Step 3: Confirm the worktree contains only intentional changes**

```bash
git status --short
git log -4 --oneline
```

Expected: no uncommitted files from this plan; the three feature commits appear above the plan/spec commits.

## Operational follow-up after implementation

The infrastructure plan intentionally stops before external Kit mutations and editorial approval. The first production buffer is built through four Bartosz-reviewed editorial sessions:

1. Clickjacking plus architecture tests.
2. URL allow-list validation plus code-coverage interpretation.
3. JWT signing-key strength plus meaningful unit-test assertions.
4. XSS framework escape hatches plus request interception and contract drift.

For each session, Codex fact-checks both topics, drafts the canonical Markdown, runs `npm run pills:check`, and asks for explicit content approval. Only then may Codex create unpublished drafts in the two Kit sequences and return their `confirm_url` values. Publication remains a separate explicit action.
