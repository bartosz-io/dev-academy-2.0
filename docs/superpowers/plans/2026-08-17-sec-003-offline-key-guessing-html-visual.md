# SEC-003 Offline Key Guessing HTML Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved email-safe 2-by-2 HTML visualization of offline HS256 key guessing to the canonical `SEC-003` Pill.

**Architecture:** Insert one self-contained, accessible HTML region directly into the Markdown email body. Use presentation tables and inline styles for email compatibility, then update historical SEC-003 acceptance documentation so it distinguishes the two code regions from the new third visualization region.

**Tech Stack:** Markdown, email-safe HTML tables, inline CSS, Node.js Knowledge Pills validator

## Global Constraints

- The visual is HTML in the canonical Pill; do not create SVG, PNG, or other asset files.
- Use a 2-by-2 presentation-table layout with the snake flow displayed spatially as `1 → 2` above `4 ← 3`; the conceptual order is steps 1, 2, 3, then 4.
- Use inline styles only; no CSS Grid, linked stylesheet, SVG, image, canvas, script, form, or event-handler attribute.
- Keep every label as real text and use `role="region"`, the approved `aria-label`, and `role="presentation"` on layout tables.
- Preserve the existing two syntax-highlighted code regions without modification.
- Preserve SEC-003 frontmatter, including `status: ready`, sequence position 3, sources, and review dates.
- Do not change Kit, the publication record, backlog ordering, or any other Pill.

---

### Task 1: Add the email-safe visualization to SEC-003

**Files:**
- Modify: `content/pills/security/SEC-003-jwt-hmac-key-strength.md:63-65`

**Interfaces:**
- Consumes: the approved copy and HTML contract from `docs/superpowers/specs/2026-08-17-sec-003-offline-key-guessing-html-visual-design.md`.
- Produces: one HTML region labelled `How an attacker guesses a weak JWT signing key offline` between the offline-attack paragraph and the impact paragraph.

- [x] **Step 1: Run the focused check to verify the visualization starts red**

Run:

```bash
node -e 'const fs=require("fs");const p="content/pills/security/SEC-003-jwt-hmac-key-strength.md";const s=fs.readFileSync(p,"utf8");const label="aria-label=\"How an attacker guesses a weak JWT signing key offline\"";if(!s.includes(label))throw new Error("SEC-003 offline key guessing visual missing");'
```

Expected: FAIL with `SEC-003 offline key guessing visual missing`.

- [x] **Step 2: Insert the approved HTML after the offline-attack paragraph**

Immediately after the paragraph ending `your application’s rate limiter does not slow it down.`, insert:

```html
<div
  role="region"
  aria-label="How an attacker guesses a weak JWT signing key offline"
  style="
    margin: 24px 0;
    padding: 24px 18px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 14px;
    color: #24292f;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div style="font-size:22px;font-weight:700;text-align:center;margin-bottom:6px;">Guessing a weak JWT signing key</div>
  <div style="font-size:14px;text-align:center;color:#57606a;margin-bottom:24px;">One captured token is enough to test candidate keys offline.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;">
    <tr>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#ffffff;border:1px solid #d0d7de;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#57606a;margin-bottom:5px;"><strong>1 · OBTAIN A TOKEN</strong></div>
        <div style="font-size:17px;font-weight:700;">Captured JWT</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">For example, from a request visible in browser DevTools</div>
      </td>
      <td width="8%" align="center" valign="middle" style="width:8%;font-size:26px;font-weight:700;color:#57606a;">→</td>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#fff5f5;border:1px solid #cf222e;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#cf222e;margin-bottom:5px;"><strong>2 · CHOOSE A CANDIDATE KEY</strong></div>
        <div style="font:700 17px Consolas, Menlo, monospace;color:#cf222e;">secret123?</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Try a common password or the next value from a wordlist</div>
      </td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td align="center" style="height:34px;font-size:26px;font-weight:700;color:#57606a;">↓</td>
    </tr>
    <tr>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#ffffff;border:1px solid #d0d7de;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#57606a;margin-bottom:5px;"><strong>4 · COMPARE</strong></div>
        <div style="font-size:17px;font-weight:700;">Signatures match?</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Compare the result with the signature in the captured JWT</div>
      </td>
      <td width="8%" align="center" valign="middle" style="width:8%;font-size:26px;font-weight:700;color:#57606a;">←</td>
      <td width="46%" valign="middle" style="width:46%;padding:18px;background:#faf5ff;border:1px solid #8250df;border-radius:10px;text-align:center;">
        <div style="font-size:12px;color:#8250df;margin-bottom:5px;"><strong>3 · COMPUTE LOCALLY</strong></div>
        <div style="font-size:17px;font-weight:700;color:#8250df;">HMAC-SHA-256</div>
        <div style="font-size:12px;line-height:1.4;color:#57606a;margin-top:6px;">Sign the captured header and payload with the candidate key</div>
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:16px;">
    <tr>
      <td width="50%" style="width:50%;padding:0 5px 0 0;">
        <div style="padding:11px 13px;border-radius:8px;background:#fff1f0;color:#cf222e;font-size:14px;font-weight:700;text-align:center;">NO ↺ try the next candidate key</div>
      </td>
      <td width="50%" style="width:50%;padding:0 0 0 5px;">
        <div style="padding:11px 13px;border-radius:8px;background:#dafbe1;color:#0a7a28;font-size:14px;font-weight:700;text-align:center;">YES → signing key recovered</div>
      </td>
    </tr>
  </table>

  <div style="margin-top:18px;padding-top:16px;border-top:1px solid #d0d7de;text-align:center;font-size:14px;color:#57606a;">No login attempts · No requests to the application · No rate limiting</div>
</div>
```

Do not modify the paragraphs before or after the insertion.

- [x] **Step 3: Run the focused HTML acceptance check**

Run:

```bash
node -e 'const fs=require("fs");const {parsePill,countWords}=require("./scripts/pills/validator");const p="content/pills/security/SEC-003-jwt-hmac-key-strength.md";const s=fs.readFileSync(p,"utf8");const r=parsePill(s,p);const count=x=>(s.match(new RegExp(x,"g"))||[]).length;const required=["aria-label=\"Weak JWT HMAC key configuration\"","aria-label=\"Generating a random HS256 key in Node.js\"","aria-label=\"How an attacker guesses a weak JWT signing key offline\"","Guessing a weak JWT signing key","One captured token is enough to test candidate keys offline.","1 · OBTAIN A TOKEN","Captured JWT","For example, from a request visible in browser DevTools","2 · CHOOSE A CANDIDATE KEY","secret123?","Try a common password or the next value from a wordlist","3 · COMPUTE LOCALLY","HMAC-SHA-256","Sign the captured header and payload with the candidate key","4 · COMPARE","Signatures match?","Compare the result with the signature in the captured JWT","NO ↺ try the next candidate key","YES → signing key recovered","No login attempts · No requests to the application · No rate limiting","width=\"46%\"","width=\"8%\"","background:#fff5f5","background:#faf5ff","background:#dafbe1"];const failed=required.filter(x=>!s.includes(x));if(count("role=\"region\"")!==3)failed.push("three regions");if(count("role=\"presentation\"")!==2)failed.push("two presentation tables");if(count("<pre")!==2||count("<code>")!==2)failed.push("two unchanged code structures");if(/```/.test(r.body))failed.push("fenced code");if(/<link\b|<script\b|<svg\b|<img\b|<canvas\b|<form\b|\son[a-z]+\s*=/i.test(r.body))failed.push("unsafe or disallowed markup");if(s.includes("IMAGE PLACEHOLDER"))failed.push("image placeholder");if(r.metadata.status!=="ready"||r.metadata.sequence_position!==3)failed.push("metadata");if(!Array.isArray(r.metadata.sources)||r.metadata.sources.length!==4)failed.push("sources");const anchor="That work happens offline. It does not require repeated login attempts, so your application’s rate limiter does not slow it down.";const visual="aria-label=\"How an attacker guesses a weak JWT signing key offline\"";const impact="If the shared key is recovered";if(!(s.indexOf(anchor)<s.indexOf(visual)&&s.indexOf(visual)<s.indexOf(impact)))failed.push("placement");if(countWords(r.body)>900)failed.push("word count");if(failed.length)throw new Error("failed: "+failed.join(", "));console.log("SEC-003 offline key guessing HTML visual checks passed with "+countWords(r.body)+" validator words.");'
```

Expected: exit `0`, three labelled regions, two presentation tables, two unchanged code structures, correct placement, and fewer than 900 validator words.

- [x] **Step 4: Run the Pill test suite**

Run:

```bash
npm run test:pills
npm run pills:check
```

Expected: all structure, validator, and CLI checks pass; collection validation reports `5 Knowledge Pills passed validation.`

- [x] **Step 5: Commit the canonical content change**

```bash
git add content/pills/security/SEC-003-jwt-hmac-key-strength.md
git commit -m "content: visualize offline JWT key guessing"
```

---

### Task 2: Align SEC-003 acceptance documentation

**Files:**
- Modify: `docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md`
- Modify: `docs/superpowers/specs/2026-08-17-knowledge-pills-html-code-snippets-design.md`
- Modify: `docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md`
- Modify: `docs/superpowers/plans/2026-08-17-knowledge-pills-html-code-snippets.md`

**Interfaces:**
- Consumes: the three-region SEC-003 artifact from Task 1.
- Produces: historical acceptance documentation that continues to validate exactly two code regions while allowing the approved third explanatory region.

- [x] **Step 1: Verify the old final acceptance commands still assume two total regions**

Run:

```bash
rg -n 'if\(count\("role=\\"region\\""\)!==2\)' docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md docs/superpowers/plans/2026-08-17-knowledge-pills-html-code-snippets.md
```

Expected: two matches, one in each historical implementation plan.

- [x] **Step 2: Clarify the two design documents**

In `docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md`, replace the acceptance wording that requires exactly two labelled HTML regions with:

```markdown
two labelled syntax-highlighted HTML code regions, one labelled email-safe HTML visualization of offline key guessing, no fenced code blocks, and no image asset
```

In `docs/superpowers/specs/2026-08-17-knowledge-pills-html-code-snippets-design.md`, preserve every requirement for exactly two code containers, but explicitly state:

```markdown
These counts apply to code regions identified by their two approved code labels and `<pre><code>` structures. SEC-003 may contain the separately approved non-code HTML visualization region; acceptance must not infer the number of code snippets from the total `role="region"` count.
```

- [x] **Step 3: Update both historical final acceptance commands**

In the final acceptance command in each historical plan:

- add `aria-label="How an attacker guesses a weak JWT signing key offline"` and `role="presentation"` to the required strings;
- change the total region assertion from two to three;
- retain the exact assertions for two `<pre` and two `<code>` openings;
- change the metadata assertion to `status === "ready"` and sequence position 3;
- retain the unsafe-markup, fenced-code, image-placeholder, palette, escaped-string, and word-count checks.

The resulting assertions must include:

```js
if (count("role=\"region\"") !== 3) failed.push("three regions");
if (count("role=\"presentation\"") !== 2) failed.push("two presentation tables");
if (count("<pre") !== 2) failed.push("two pre elements");
if (count("<code>") !== 2) failed.push("two code elements");
if (r.metadata.status !== "ready" || r.metadata.sequence_position !== 3) failed.push("metadata");
```

Do not rewrite the historical RED steps or exact original draft; only align the commands and prose intended to validate the current artifact.

- [x] **Step 4: Verify documentation consistency**

Run:

```bash
node -e 'const fs=require("fs");const files=["docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md","docs/superpowers/plans/2026-08-17-knowledge-pills-html-code-snippets.md"];const required=["aria-label=\\\"How an attacker guesses a weak JWT signing key offline\\\"","count(\"role=\\\"region\\\"\")!==3","count(\"role=\\\"presentation\\\"\")!==2","r.metadata.status!==\"ready\""];for(const p of files){const s=fs.readFileSync(p,"utf8");for(const x of required)if(!s.includes(x))throw new Error(p+" missing "+x);}console.log("SEC-003 historical acceptance documentation check passed.");'
```

Expected: `SEC-003 historical acceptance documentation check passed.`

- [x] **Step 5: Run final repository verification**

Run:

```bash
npm run test:pills
npm run pills:check
git diff --check
git status --short
```

Expected: all Pill tests pass, five Pills pass collection validation, no whitespace errors exist, and only the approved SEC-003 consistency documentation plus this implementation plan remain uncommitted after Task 1.

- [x] **Step 6: Commit the documentation alignment and plan**

```bash
git add docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md docs/superpowers/specs/2026-08-17-knowledge-pills-html-code-snippets-design.md docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md docs/superpowers/plans/2026-08-17-knowledge-pills-html-code-snippets.md docs/superpowers/plans/2026-08-17-sec-003-offline-key-guessing-html-visual.md
git commit -m "docs: align SEC-003 HTML acceptance checks"
```
