# SEC-003 JWT HMAC Key Strength Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete draft of the third Security Pill showing why a predictable HS256 shared key makes otherwise valid JWTs forgeable.

**Architecture:** Add one canonical plain-text-first Markdown record under the Security track. The draft uses a configuration-review story, a standards-backed explanation, and a one-time Node.js provisioning example without changing Kit or the production backlog.

**Tech Stack:** Markdown, Node.js `node:crypto`, RFC 7518, RFC 8725, Node.js Knowledge Pills validator

## Global Constraints

- Use ID `SEC-003`, security sequence position `3`, and `status: draft`.
- Use created and last-verified date `2026-08-17` and review date `2027-08-17`.
- Keep Kit identifiers and `related_pill` blank.
- Teach only weak HS256 shared-key strength and offline key guessing.
- State that RFC 7518 requires at least 256 bits, or 32 bytes, for HS256.
- State that a human-memorable password must not be used directly as an HS256 key.
- Frame `randomBytes(32)` as one-time provisioning, never application startup behavior.
- Render the two standalone code snippets as self-contained, syntax-highlighted HTML; keep short inline technical references in Markdown code spans.
- Do not include JWT-versus-cookie comparisons, other JWT attacks, AI framing, images, or a promotional CTA.
- Leave `content/pills/backlog.md` and Kit unchanged while the Pill is a draft.

---

### Task 1: Create the canonical SEC-003 draft

**Files:**
- Create: `content/pills/security/SEC-003-jwt-hmac-key-strength.md`
- Reference: `docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md`
- Test: `scripts/pills/check.js`
- Test: `tests/verify-pill-structure.js`
- Test: `tests/verify-pill-validator.js`
- Test: `tests/verify-pills-cli.js`

**Interfaces:**
- Consumes: the approved SEC-003 design and existing Knowledge Pills schema.
- Produces: a complete editorial `draft` at security sequence position `3` for Bartosz's copy review.

- [x] **Step 1: Verify the canonical record is absent**

Run:

```bash
node -e "const fs=require('fs');const p='content/pills/security/SEC-003-jwt-hmac-key-strength.md';if(!fs.existsSync(p))throw new Error('SEC-003 draft missing');"
```

Expected: FAIL with `SEC-003 draft missing`. This is the red acceptance check.

- [x] **Step 2: Create the exact draft**

Create `content/pills/security/SEC-003-jwt-hmac-key-strength.md` with:

````markdown
---
id: SEC-003
track: security
status: draft
sequence_position: 3
subject: "Could someone guess your JWT signing key?"
preview_text: "HS256 can be correctly implemented and still rely on a weak shared secret."
created: 2026-08-17
last_verified: 2026-08-17
review_after: 2027-08-17
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://www.rfc-editor.org/rfc/rfc7518.html#section-3.2
  - https://www.rfc-editor.org/rfc/rfc8725.html#section-2.2
  - https://www.rfc-editor.org/rfc/rfc8725.html#section-3.5
  - https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
---

## Email body

Hi developer,

It’s time for another Security Pill. 💊

Imagine you find this value in an application’s deployment configuration:

<div
  role="region"
  aria-label="Weak JWT HMAC key configuration"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code>JWT_HMAC_KEY<span style="color:#57606a;">=</span><strong style="color:#cf222e;">secret123</strong></code></pre>
</div>

The application uses HS256. It creates tokens, verifies their signatures, and appears to work correctly.

**Is this signing setup secure?**

No.

HS256 uses HMAC with SHA-256 and a shared secret. SHA-256 may be strong, but it cannot make a predictable secret strong.

Once someone obtains one valid token, they have both the signed data and its authentication code. They can test candidate keys on their own machine until one produces the same result.

That work happens offline. It does not require repeated login attempts, so your application’s rate limiter does not slow it down.

If the shared key is recovered, the attacker can change claims, calculate a new authentication code, and create tokens that services trusting that key may accept.

They did not break SHA-256. They guessed the key.

For HS256, RFC 7518 requires a key of at least 256 bits—that is, 32 bytes. JWT best-current-practice guidance also says that a human-memorable password must not be used directly as an HS256 key.

In Node.js, you can generate 32 cryptographically strong random bytes like this:

<div
  role="region"
  aria-label="Generating a random HS256 key in Node.js"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code><span style="color:#0000cc;">import</span> { <strong>randomBytes</strong> } <span style="color:#0000cc;">from</span> <span style="color:#0a7a28;">&#39;node:crypto&#39;</span>;

<span style="color:#8250df;">const</span> encodedKey = <strong>randomBytes</strong>(32).<strong>toString</strong>(<span style="color:#0a7a28;">&#39;base64url&#39;</span>);
<strong>console</strong>.<strong>log</strong>(encodedKey);</code></pre>
</div>

Run this once during secret provisioning, then store the result in your deployment’s secret-management system.

Do not generate a new key every time the application starts. Different instances—and tokens created before a restart—must still use an intentionally managed key set.

If the current key is weak, plan its rotation. Existing tokens signed with the old key need an explicit transition or expiry strategy.

**Your check for today**

Without printing or exposing the current key, find out how it was created.

- Was it typed by a person or generated by a cryptographically secure random generator?
- For HS256, was it generated from at least 32 random bytes?
- Is it stored outside the source code and deployed as a managed secret?

A library can verify every signature correctly and still be protecting it with the wrong key.

That’s all for today. One strong algorithm, one weak assumption, one practical check. 💊

See you next Tuesday,

Bartosz

Dev Academy
````

- [x] **Step 3: Verify the draft acceptance contract**

Run:

```bash
node -e 'const fs=require("fs");const {parsePill,countWords}=require("./scripts/pills/validator");const p="content/pills/security/SEC-003-jwt-hmac-key-strength.md";const s=fs.readFileSync(p,"utf8");const r=parsePill(s,p);const count=x=>(s.match(new RegExp(x,"g"))||[]).length;const required=["aria-label=\"Weak JWT HMAC key configuration\"","aria-label=\"Generating a random HS256 key in Node.js\"","aria-label=\"How an attacker guesses a weak JWT signing key offline\"","role=\"presentation\"","background: #f6f8fa","border: 1px solid #d0d7de","font-family: SFMono-Regular","white-space: pre-wrap","overflow-wrap: anywhere","color:#0000cc","color:#0a7a28","color:#8250df","color:#cf222e","color:#57606a","&#39;node:crypto&#39;","&#39;base64url&#39;"];const failed=required.filter(x=>!s.includes(x));if(count("role=\"region\"")!==3)failed.push("three regions");if(count("role=\"presentation\"")!==2)failed.push("two presentation tables");if(count("<pre")!==2)failed.push("two pre elements");if(count("<code>")!==2)failed.push("two code elements");if(/```/.test(r.body))failed.push("fenced code");if(/<link\b|<script\b|<svg\b|<img\b|<canvas\b|<form\b|\son[a-z]+\s*=/i.test(r.body))failed.push("unsafe or external markup");if(s.includes("IMAGE PLACEHOLDER"))failed.push("image placeholder");if(r.metadata.status!=="ready"||r.metadata.sequence_position!==3)failed.push("metadata");if(countWords(r.body)>900)failed.push("word count");if(failed.length)throw new Error("failed: "+failed.join(", "));const visible=r.body.replace(/<[^>]+>/g," ").replace(/&#39;/g,"\u0027");console.log("SEC-003 HTML checks passed; visible count: "+countWords(visible)+" words; validator count: "+countWords(r.body)+" words.");'
```

Expected: the command exits `0`, reports both counts, and keeps the validator count below 900 words.

- [x] **Step 4: Run the editorial infrastructure tests**

Run:

```bash
npm run test:pills
```

Expected: structure, validator, and CLI checks all pass.

- [x] **Step 5: Run collection validation**

Run:

```bash
npm run pills:check
```

Expected: `5 Knowledge Pills passed validation.`

- [x] **Step 6: Verify scope and diff quality**

Run:

```bash
git diff --check
git status --short
git diff -- content/pills/security/SEC-003-jwt-hmac-key-strength.md
```

Expected: the only production-content change is the new SEC-003 Markdown file; the implementation plan is the only supporting document.

- [x] **Step 7: Commit the draft and plan**

```bash
git add content/pills/security/SEC-003-jwt-hmac-key-strength.md docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md
git commit -m "content: draft third Security Pill"
```
