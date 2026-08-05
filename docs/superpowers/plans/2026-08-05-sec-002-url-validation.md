# SEC-002 URL Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the second production-ready Security Pill showing why string-prefix checks do not enforce an exact URL-origin allow-list.

**Architecture:** The repository remains the canonical plain-text-first source. One validated Markdown record presents a vulnerable validator, preserves a 12-line interactive pause, reveals the suffix-domain bypass, and replaces string matching with exact `URL.origin` comparison. Kit body content is not changed.

**Tech Stack:** Markdown, JavaScript `URL` API, Node.js Knowledge Pills validator

## Global Constraints

- The body is authored as plain-text-first Markdown, not HTML.
- Use exactly 12 separate lines containing one period between the prompt and reveal.
- Implement an exact HTTPS-origin rule, not a general subdomain rule.
- Keep the AI-assisted-development reference secondary and tool-independent.
- Do not create or update Kit email body content through MCP.
- Use `status: ready` and a 12-month review interval.
- Do not add an image or image placeholder.

---

### Task 1: Create the canonical Security Pill

**Files:**
- Create: `content/pills/security/SEC-002-url-allow-list.md`
- Test: `scripts/pills/check.js`
- Test: `tests/verify-pill-structure.js`
- Test: `tests/verify-pill-validator.js`
- Test: `tests/verify-pills-cli.js`

**Interfaces:**
- Consumes: The accepted SEC-002 design and the existing Knowledge Pills schema.
- Produces: A `ready` Security Pill at security sequence position 2.

- [ ] **Step 1: Create the canonical Markdown record**

Create `content/pills/security/SEC-002-url-allow-list.md` with this exact content:

````markdown
---
id: SEC-002
track: security
status: ready
sequence_position: 2
subject: "Would this malicious URL pass your allow-list?"
preview_text: "This three-line validator looks reasonable. Would you approve it?"
created: 2026-08-05
last_verified: 2026-08-05
review_after: 2027-08-05
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://url.spec.whatwg.org/
  - https://developer.mozilla.org/en-US/docs/Web/API/URL/origin
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
---

## Email body

Hi developer,

It’s time for another Security Pill. 💊

Imagine an agent opens a pull request containing this URL allow-list:

```js
function isTrustedUrl(value) {
  return value.startsWith('https://safe-app.com');
}
```

The intention is simple: accept URLs from `https://safe-app.com` and reject everything else.

The question is:

**Is this validation secure?**

Think for a while before you continue. 🙂
.
.
.
.
.
.
.
.
.
.
.
.
Ready?

Imagine an attacker controls `evil.com` and creates this subdomain:

`https://safe-app.com.evil.com`

Will it pass our check?

**Yes.** The entire string starts with `https://safe-app.com`.

But the browser does not treat that text as the trusted domain. The hostname is `safe-app.com.evil.com`, which belongs under `evil.com`.

The problem is that `startsWith()` understands strings—not URL structure or hostname boundaries.

Parse the URL first and compare the exact property your application trusts:

```js
const TRUSTED_ORIGIN = 'https://safe-app.com';

function isTrustedUrl(value) {
  try {
    return new URL(value).origin === TRUSTED_ORIGIN;
  } catch {
    return false;
  }
}
```

For HTTP and HTTPS URLs, `origin` represents the scheme, hostname, and port. This check therefore rejects a different scheme, hostname, non-default port, or malformed URL.

This example intentionally allows one exact origin. If your product must trust multiple origins or selected subdomains, define that allow-list explicitly—do not loosen the check back into string matching.

AI can generate a validator that looks perfectly reasonable. Your review still has to verify whether the code enforces the real security boundary.

**Your check for today**

Search your project for `startsWith`, `includes`, or `endsWith` near URLs, redirects, origins, callbacks, or webhook destinations.

For every match, ask:

**Are we comparing a string, or the exact URL property we actually trust?**

That’s all for today. One deceptive string, one parser, one practical check. 💊

See you next Tuesday,  
Bartosz  
Dev Academy
````

- [ ] **Step 2: Verify the pause and forbidden delivery patterns**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('content/pills/security/SEC-002-url-allow-list.md','utf8');const block=s.match(/Think for a while before you continue\. 🙂\n((?:\.\n)+)Ready\?/);if(!block)throw new Error('pause block missing');const dots=block[1].trim().split('\\n');if(dots.length!==12||dots.some(x=>x!=='.'))throw new Error('expected exactly 12 period lines');if(/<\/?[a-z][^>]*>/i.test(s))throw new Error('HTML found');console.log('SEC-002 plain-text and pause checks passed.');"
```

Expected: `SEC-002 plain-text and pause checks passed.`

- [ ] **Step 3: Run the production validator**

Run:

```bash
npm run pills:check
```

Expected: `3 Knowledge Pills passed validation.`

- [ ] **Step 4: Run the editorial infrastructure tests**

Run:

```bash
npm run test:pills
```

Expected: structure, validator, and CLI checks all pass.

- [ ] **Step 5: Verify scope and repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: only the SEC-002 Markdown is a new production file; unrelated existing work remains untouched.

- [ ] **Step 6: Commit only SEC-002 production content**

```bash
git add content/pills/security/SEC-002-url-allow-list.md
git commit --only content/pills/security/SEC-002-url-allow-list.md -m "content: add second Security Pill"
```
