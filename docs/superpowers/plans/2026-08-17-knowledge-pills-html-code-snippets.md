# Knowledge Pills HTML Code Snippets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish syntax-highlighted HTML as the canonical format for standalone Knowledge Pill code snippets and migrate both standalone snippets in `SEC-003`.

**Architecture:** Preserve plain-text-first email bodies while treating code blocks as self-contained HTML islands with inline styles and accessible labels. Store the rule in the canonical Pills README, update SEC-003 and its existing documentation, and verify the markup through a red-green acceptance command.

**Tech Stack:** Markdown, email-safe HTML, inline CSS, Node.js Knowledge Pills validator

## Global Constraints

- Standalone code snippets use `<div role="region">`, a content-specific `aria-label`, and one `<pre><code>` pair.
- Snippet presentation uses inline styles only; no external CSS, scripts, or event-handler attributes.
- The shared visual baseline and token palette match the approved `TST-002` snippets.
- Characters that can be parsed as markup are encoded as HTML entities inside `<code>`.
- Short inline technical references remain Markdown code spans.
- SEC-003 retains its wording, metadata, `draft` status, sources, and sequence position.
- Kit content, publication state, backlog ordering, images, and other Pills remain unchanged.

---

### Task 1: Record the canonical code-snippet process

**Files:**
- Modify: `content/pills/README.md`

**Interfaces:**
- Consumes: the approved HTML code-snippet design and the existing `TST-002` pattern.
- Produces: the process rule applied to future standalone code snippets.

- [x] **Step 1: Verify the process rule starts red**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('content/pills/README.md','utf8');if(!s.includes('## Code snippet rule'))throw new Error('canonical HTML code snippet rule missing');"
```

Expected: FAIL with `canonical HTML code snippet rule missing`.

- [x] **Step 2: Update the Monday handoff and Kit rule**

Replace Monday handoff steps 3 and 7 with:

```markdown
3. Draft subject, preview text, and one standalone email in plain-text-first style. Render every standalone code snippet with the syntax-highlighted HTML pattern defined below.
7. Bartosz manually pastes the approved copy into Kit and uploads the images.
```

Replace the current `## Kit content rule` section with:

```markdown
## Kit content rule

The repository copy is written and reviewed as plain-text-first content with lightweight Markdown. Standalone code snippets are intentional, self-contained HTML islands authored in the canonical file before review. Codex does not convert the complete body to HTML or write the body to Kit through MCP. Bartosz performs the final paste, image upload, and visual review in Kit. Kit's remaining internal HTML representation is a delivery detail and is never the canonical source.

## Code snippet rule

Every standalone code snippet must:

- use an outer `<div role="region" aria-label="…">` with a concise, content-specific label;
- use one `<pre><code>` pair inside that region;
- use inline styles only, with no external stylesheet, `<script>`, or event-handler attribute;
- use `margin: 24px 0`, `padding: 20px 22px`, `background: #f6f8fa`, `border: 1px solid #d0d7de`, and `border-radius: 10px` on the outer region;
- use `color: #24292f`, `font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`, `font-size: 15px`, `line-height: 1.65`, `white-space: pre-wrap`, and `overflow-wrap: anywhere` on `<pre>`;
- encode characters such as `<`, `>`, and quotes when they could be parsed as markup;
- use the established palette when applicable: `#0000cc` for keywords, `#0a7a28` for strings, `#8250df` for declarations, `#cf222e` for insecure or warning values, and `#57606a` for comments or punctuation;
- remain understandable without color; color supplements the text and accessible label.

Short technical references inside prose remain Markdown code spans. Do not wrap inline references in the standalone HTML structure.
```

- [x] **Step 3: Verify the process rule is green**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('content/pills/README.md','utf8');for(const x of ['## Code snippet rule','<div role=\"region\" aria-label=\"…\">','<pre><code>','inline styles only','Short technical references inside prose remain Markdown code spans'])if(!s.includes(x))throw new Error('missing '+x);console.log('Knowledge Pills HTML code snippet process check passed.');"
```

Expected: `Knowledge Pills HTML code snippet process check passed.`

---

### Task 2: Migrate SEC-003 and align its documentation

**Files:**
- Modify: `content/pills/security/SEC-003-jwt-hmac-key-strength.md`
- Modify: `docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md`
- Modify: `docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md`

**Interfaces:**
- Consumes: the process rule produced by Task 1.
- Produces: two syntax-highlighted, email-ready SEC-003 code regions and documentation that describes the actual artifact.

- [x] **Step 1: Verify the SEC-003 HTML acceptance check starts red**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('content/pills/security/SEC-003-jwt-hmac-key-strength.md','utf8');const regions=(s.match(/role=\"region\"/g)||[]).length;if(regions!==2)throw new Error('expected 2 HTML code regions, found '+regions);"
```

Expected: FAIL with `expected 2 HTML code regions, found 0`.

- [x] **Step 2: Replace the weak-key configuration snippet**

Replace the standalone Markdown code span with:

```html
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
```

- [x] **Step 3: Replace the Node.js provisioning snippet**

Replace the fenced JavaScript block with:

```html
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
```

- [x] **Step 4: Align the existing SEC-003 design**

In `docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md`:

- after the environment-value example, state that the canonical email renders it as the labelled syntax-highlighted HTML region defined by the Knowledge Pills code-snippet rule;
- after the Node.js example, state that the canonical email renders it as the second labelled HTML region;
- replace the acceptance requirement for `absence of HTML` with `exactly two labelled, syntax-highlighted HTML code regions and no fenced code blocks`.

- [x] **Step 5: Align the existing SEC-003 implementation plan**

In `docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md`:

- add a global constraint requiring self-contained HTML for the two standalone snippets while keeping inline code in Markdown;
- replace the two old snippet fragments in the exact draft with the HTML from Steps 2 and 3;
- replace the acceptance checks `no HTML` and `no image placeholder` with assertions for two regions, both labels, two `<pre>` and `<code>` elements, all five palette colors, escaped quotes, no fenced code, no external CSS, no script, no event handlers, and no image placeholder;
- report both visible prose word count and validator raw word count without hard-coding a stale value.

- [x] **Step 6: Verify the SEC-003 HTML acceptance contract**

Run:

```bash
node -e 'const fs=require("fs");const {parsePill,countWords}=require("./scripts/pills/validator");const p="content/pills/security/SEC-003-jwt-hmac-key-strength.md";const s=fs.readFileSync(p,"utf8");const r=parsePill(s,p);const count=x=>(s.match(new RegExp(x,"g"))||[]).length;const required=["aria-label=\"Weak JWT HMAC key configuration\"","aria-label=\"Generating a random HS256 key in Node.js\"","background: #f6f8fa","border: 1px solid #d0d7de","font-family: SFMono-Regular","white-space: pre-wrap","overflow-wrap: anywhere","color:#0000cc","color:#0a7a28","color:#8250df","color:#cf222e","color:#57606a","&#39;node:crypto&#39;","&#39;base64url&#39;"];const failed=required.filter(x=>!s.includes(x));if(count("role=\"region\"")!==2)failed.push("two regions");if(count("<pre")!==2)failed.push("two pre elements");if(count("<code>")!==2)failed.push("two code elements");if(/```/.test(r.body))failed.push("fenced code");if(/<link\b|<script\b|\son[a-z]+\s*=/i.test(r.body))failed.push("unsafe or external markup");if(s.includes("IMAGE PLACEHOLDER"))failed.push("image placeholder");if(r.metadata.status!=="draft"||r.metadata.sequence_position!==3)failed.push("metadata");if(countWords(r.body)>900)failed.push("word count");if(failed.length)throw new Error("failed: "+failed.join(", "));const visible=r.body.replace(/<[^>]+>/g," ").replace(/&#39;/g,"\u0027");console.log("SEC-003 HTML code checks passed; visible count: "+countWords(visible)+" words; validator count: "+countWords(r.body)+" words.");'
```

Expected: the command exits `0` and reports a validator count below 900 words.

- [x] **Step 7: Run repository verification**

Run:

```bash
npm run test:pills
npm run pills:check
git diff --check
git status --short
```

Expected: all Pills tests pass, collection validation reports `5 Knowledge Pills passed validation.`, and only the approved process, SEC-003, consistency documentation, and this implementation plan are changed.

- [x] **Step 8: Commit the migration**

```bash
git add content/pills/README.md content/pills/security/SEC-003-jwt-hmac-key-strength.md docs/superpowers/specs/2026-08-17-sec-003-jwt-hmac-key-strength-design.md docs/superpowers/plans/2026-08-17-sec-003-jwt-hmac-key-strength.md docs/superpowers/plans/2026-08-17-knowledge-pills-html-code-snippets.md
git commit -m "content: standardize HTML code snippets in Pills"
```
