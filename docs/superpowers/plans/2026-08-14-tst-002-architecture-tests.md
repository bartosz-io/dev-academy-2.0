# TST-002 Architecture Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the second production-ready Testing Pill showing how executable architecture rules protect dependency boundaries that functional tests were not designed to enforce.

**Architecture:** The repository remains the canonical plain-text-first source. Two diagrams recovered from Bartosz's historical email illustrate the intended layered dependency direction and the cumulative big-ball-of-mud failure mode. The email uses one minimal TypeScript import and one tool-independent rule so its lesson does not depend on a library API; Kit body content remains a manual delivery copy.

**Tech Stack:** Markdown, TypeScript example code, Node.js Knowledge Pills validator, Poppler PDF rendering, Pillow image cropping

## Global Constraints

- The body is authored as plain-text-first Markdown, not HTML.
- Use `status: ready`, testing sequence position `2`, and an 18-month review interval ending `2028-02-14`.
- Teach the architecture-testing concept without using TSArch or another library API in the body.
- Do not prescribe controllers, services, or repositories as the universally correct architecture.
- Keep AI secondary: a person or an agent can break the same boundary.
- Do not claim that ordinary unit tests can never catch architecture violations; say that a boundary needs an explicit test or static rule to be enforced automatically.
- Include exactly two image placeholders with the accepted TST-002 asset filenames.
- Do not create or update Kit email body content through MCP.
- Obtain Bartosz's explicit approval of the complete email copy before creating the canonical production record.

---

### Task 1: Recover the two historical architecture diagrams

**Files:**
- Source: `/Users/bartosz/Projects/dev-academy docs/testing pills/arch test.pdf`
- Create: `content/pills/assets/TST-002/clean-layered-architecture.png`
- Create: `content/pills/assets/TST-002/big-ball-of-mud.png`
- Temporary: `tmp/pdfs/TST-002/page-1.png`
- Temporary: `tmp/pdfs/TST-002/page-2.png`

**Interfaces:**
- Consumes: The clean layered diagram on PDF page 1 and the big-ball-of-mud diagram on PDF page 2.
- Produces: Two legible PNG files referenced verbatim by the TST-002 email placeholders.

- [ ] **Step 1: Verify that the asset-existence check starts red**

Run:

```bash
node -e "const fs=require('fs');for(const p of ['content/pills/assets/TST-002/clean-layered-architecture.png','content/pills/assets/TST-002/big-ball-of-mud.png']){if(!fs.existsSync(p))throw new Error('missing '+p)}"
```

Expected: FAIL with `missing content/pills/assets/TST-002/clean-layered-architecture.png`.

- [ ] **Step 2: Render the two relevant PDF pages at high resolution**

Run:

```bash
mkdir -p tmp/pdfs/TST-002 content/pills/assets/TST-002
/Users/bartosz/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm -f 1 -l 2 -png -r 260 '/Users/bartosz/Projects/dev-academy docs/testing pills/arch test.pdf' tmp/pdfs/TST-002/page
```

Expected: `tmp/pdfs/TST-002/page-1.png` and `tmp/pdfs/TST-002/page-2.png` exist. Each rendered page is approximately 2148 by 3040 pixels.

- [ ] **Step 3: Crop the original diagrams without recreating or restyling them**

Run this resolution-independent Pillow crop using the bundled Python runtime:

```bash
/Users/bartosz/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c "from pathlib import Path;from PIL import Image;root=Path('tmp/pdfs/TST-002');out=Path('content/pills/assets/TST-002');jobs=[('page-1.png','clean-layered-architecture.png',(0.14,0.60,0.90,0.94)),('page-2.png','big-ball-of-mud.png',(0.14,0.12,0.90,0.44))];[(lambda im,name,box: im.crop(tuple(round(v*s) for v,s in zip(box,(im.width,im.height,im.width,im.height)))).save(out/name,optimize=True))(Image.open(root/src).convert('RGB'),name,box) for src,name,box in jobs]"
```

Expected:

- `clean-layered-architecture.png` contains the complete Controllers, Services, and Repositories diagram including its labels, without surrounding Gmail chrome or footer URL;
- `big-ball-of-mud.png` contains the complete network of colored modules and dotted red dependencies, without the prose above or below it.

- [ ] **Step 4: Inspect both assets visually**

Open both files with the local image viewer and inspect them at original detail:

```text
content/pills/assets/TST-002/clean-layered-architecture.png
content/pills/assets/TST-002/big-ball-of-mud.png
```

Expected: no clipped boxes, arrows, or labels; no email addresses, Gmail controls, unsubscribe text, or footer URLs; both images remain sharp at normal email width.

If a crop clips content or includes surrounding email text, adjust only the corresponding fractional crop tuple in Step 3, regenerate that image, and repeat this visual inspection.

- [ ] **Step 5: Verify both production assets**

Run:

```bash
node -e "const fs=require('fs');const {execFileSync}=require('child_process');for(const p of ['content/pills/assets/TST-002/clean-layered-architecture.png','content/pills/assets/TST-002/big-ball-of-mud.png']){if(!fs.existsSync(p))throw new Error('missing '+p);if(fs.statSync(p).size<10000)throw new Error('asset unexpectedly small: '+p);execFileSync('sips',['-g','pixelWidth','-g','pixelHeight',p],{stdio:'inherit'})}console.log('TST-002 assets exist and are nontrivial.');"
```

Expected: dimensions are printed for both images, followed by `TST-002 assets exist and are nontrivial.`

- [ ] **Step 6: Remove only the rendered temporary pages**

Run:

```bash
rm tmp/pdfs/TST-002/page-1.png tmp/pdfs/TST-002/page-2.png
rmdir tmp/pdfs/TST-002 tmp/pdfs tmp
```

Expected: the production assets remain under `content/pills/assets/TST-002/`, and `git status --short` does not show `tmp/`.

- [ ] **Step 7: Commit only the recovered diagrams**

```bash
git add content/pills/assets/TST-002/clean-layered-architecture.png content/pills/assets/TST-002/big-ball-of-mud.png
git commit -m "content: add TST-002 architecture diagrams"
```

---

### Task 2: Create the canonical TST-002 email

**Files:**
- Create: `content/pills/testing/TST-002-architecture-tests.md`
- Modify: `content/pills/backlog.md`
- Test: `scripts/pills/check.js`
- Test: `tests/verify-pill-structure.js`
- Test: `tests/verify-pill-validator.js`
- Test: `tests/verify-pills-cli.js`

**Interfaces:**
- Consumes: The accepted TST-002 design and the two asset filenames produced by Task 1.
- Produces: A `ready` Testing Pill at sequence position 2 and a backlog containing only unrealized Testing topics.

- [ ] **Step 1: Present the complete proposed copy to Bartosz**

Use the exact Markdown record from Step 4 as the review draft. Do not create the production file yet. Wait for explicit approval or incorporate requested copy changes before proceeding.

Expected: Bartosz explicitly accepts the complete subject, preview text, email body, practical check, and both image placements.

- [ ] **Step 2: Verify that the production acceptance check starts red**

Run:

```bash
node -e "const fs=require('fs');const p='content/pills/testing/TST-002-architecture-tests.md';if(!fs.existsSync(p))throw new Error('TST-002 production record missing');"
```

Expected: FAIL with `TST-002 production record missing`.

- [ ] **Step 3: Verify the relevant technical claims against authoritative sources**

Review:

```text
https://www.archunit.org/motivation
https://www.archunit.org/userguide/html/000_Index.html
https://ts-arch.github.io/ts-arch/index.html
```

Confirm only these claims:

- architecture-testing tools can inspect dependencies and enforce layered rules;
- such a rule can run as an automated test;
- behavior-focused tests do not enforce a dependency boundary unless that boundary is checked explicitly.

Do not add library names to the body merely because they were used for fact-checking.

- [ ] **Step 4: Create the approved canonical Markdown record**

Create `content/pills/testing/TST-002-architecture-tests.md` with this content, incorporating only copy edits explicitly approved in Step 1:

````markdown
---
id: TST-002
track: testing
status: ready
sequence_position: 2
subject: "The feature works. But did it break your architecture?"
preview_text: "A passing test suite cannot detect a boundary it was never asked to protect."
created: 2026-08-14
last_verified: 2026-08-14
review_after: 2028-02-14
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://www.archunit.org/motivation
  - https://www.archunit.org/userguide/html/000_Index.html
  - https://ts-arch.github.io/ts-arch/index.html
---

## Email body

Hi developer,

It’s time for another Testing Pill. 💊

Imagine an agent opens a pull request with a working feature.

The code compiles.

The unit tests pass.

The application behaves correctly.

But the controller now imports the repository directly, bypassing the service layer:

```ts
// checkout.controller.ts
import { paymentsRepository } from './payments.repository';
```

Is the pull request safe to merge?

Functionally? Maybe.

Architecturally? No.

In this application, the intended dependency direction is:

```text
Controller → Service → Repository
```

**[IMAGE PLACEHOLDER — upload `assets/TST-002/clean-layered-architecture.png` here]**

The new import creates a shortcut:

```text
Controller ─────────→ Repository
```

The behavior-focused tests may still pass because they verify what the feature does. They do not enforce the direction of dependencies unless we explicitly ask them to.

An agent can complete a local task while missing an unwritten system-wide constraint. A developer can make the same mistake.

If an architectural boundary matters, turn it into an executable rule:

```text
Files matching: *.controller.ts
must not depend directly on:
*.repository.ts
```

Run this rule in your CI/CD pipeline. The moment a controller imports a repository directly, the architecture test fails—even if the feature works and every unit test is green.

One shortcut will not destroy an application. But repeated shortcuts slowly replace the intended architecture with a web of accidental dependencies.

**[IMAGE PLACEHOLDER — upload `assets/TST-002/big-ball-of-mud.png` here]**

The important point is not that every project must use controllers, services, and repositories.

The point is this:

**Choose the boundaries that matter in your application—and enforce them automatically.**

**Your check for today**

Choose one architectural boundary in your application.

Can your CI detect when someone—or an agent—breaks it?

If the rule exists only in documentation or someone’s head, it is not being enforced automatically.

That’s all for today. One hidden shortcut, one executable boundary, one practical check. 💊

See you next Friday,

Bartosz

Dev Academy
````

- [ ] **Step 5: Remove completed Testing topics from the backlog**

In `content/pills/backlog.md`, change the Testing section from:

```markdown
## Testing

- Architecture tests as executable boundaries
- Why high coverage does not prove useful behavior
- Unit-test assertions as behavioral evidence
- Network interception and contract drift
```

to:

```markdown
## Testing

- Unit-test assertions as behavioral evidence
- Network interception and contract drift
```

- [ ] **Step 6: Verify the exact metadata, body constraints, and image placeholders**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('content/pills/testing/TST-002-architecture-tests.md','utf8');const required=['id: TST-002','track: testing','status: ready','sequence_position: 2','review_after: 2028-02-14','assets/TST-002/clean-layered-architecture.png','assets/TST-002/big-ball-of-mud.png','Run this rule in your CI/CD pipeline.','Choose the boundaries that matter in your application—and enforce them automatically.'];for(const x of required){if(!s.includes(x))throw new Error('missing '+x)}const placeholders=(s.match(/IMAGE PLACEHOLDER/g)||[]).length;if(placeholders!==2)throw new Error('expected exactly 2 image placeholders, found '+placeholders);if(/tsarch|archunit/i.test(s.split('## Email body')[1]))throw new Error('library name leaked into email body');if(/<\/?[a-z][^>]*>/i.test(s))throw new Error('HTML found');console.log('TST-002 content checks passed.');"
```

Expected: `TST-002 content checks passed.`

- [ ] **Step 7: Run the production validator**

Run:

```bash
npm run pills:check
```

Expected: `4 Knowledge Pills passed validation.`

- [ ] **Step 8: Run the editorial infrastructure tests**

Run:

```bash
npm run test:pills
```

Expected: structure, validator, and CLI checks all pass.

- [ ] **Step 9: Verify scope and repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: only `content/pills/testing/TST-002-architecture-tests.md` and `content/pills/backlog.md` are uncommitted; the TST-002 diagram commit from Task 1 is already present; unrelated existing work remains untouched.

- [ ] **Step 10: Commit the approved canonical email and backlog update**

```bash
git add content/pills/testing/TST-002-architecture-tests.md content/pills/backlog.md
git commit -m "content: add second Testing Pill"
```

---

### Task 3: Final production verification and handoff

**Files:**
- Verify: `content/pills/testing/TST-002-architecture-tests.md`
- Verify: `content/pills/assets/TST-002/clean-layered-architecture.png`
- Verify: `content/pills/assets/TST-002/big-ball-of-mud.png`
- Verify: `content/pills/backlog.md`

**Interfaces:**
- Consumes: The committed TST-002 assets and canonical email.
- Produces: A verified manual handoff package for Bartosz to paste into Kit.

- [ ] **Step 1: Run all Knowledge Pills checks from a clean production state**

Run:

```bash
npm run pills:check
npm run test:pills
git diff --check
```

Expected:

```text
4 Knowledge Pills passed validation.
Knowledge Pills structure checks passed.
Knowledge Pills validator checks passed.
Knowledge Pills CLI checks passed.
```

`git diff --check` exits with code `0`.

- [ ] **Step 2: Confirm the final commit boundaries and working tree**

Run:

```bash
git log -2 --stat --oneline
git status --short
```

Expected: one commit contains only the two TST-002 diagrams; one commit contains only the canonical TST-002 Markdown and backlog cleanup; the working tree is clean apart from any unrelated pre-existing user changes.

- [ ] **Step 3: Hand off the manual Kit delivery package**

Report:

- the exact canonical email path;
- the exact two asset paths;
- the accepted subject and preview text;
- that Bartosz must paste the body and upload both diagrams manually;
- that no Kit body was created, overwritten, or published;
- that the email remains `ready` until Kit identifiers are confirmed.

Do not push unless Bartosz explicitly requests it.
