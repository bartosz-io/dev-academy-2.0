# TST-001 Code Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the first production-ready Testing Pill about the limits of code coverage, preserving two original graphics from the historical email.

**Architecture:** The repository remains the canonical plain-text-first source. Two clean images are extracted from the historical PDF into the `TST-001` asset directory, and one validated Markdown record references them with explicit Kit upload markers. Kit body content is not changed.

**Tech Stack:** Markdown, Poppler `pdfimages`, Node.js Knowledge Pills validator

## Global Constraints

- The body is authored as plain-text-first Markdown, not HTML.
- Preserve the line-coverage visualization and body-temperature illustration from `coverage.pdf`.
- Do not name or depend on a specific test framework.
- Keep the AI-assisted-development reference secondary to the evergreen testing lesson.
- Do not create or update Kit email body content through MCP.
- Use `status: ready` and an 18-month review interval.

---

### Task 1: Preserve the historical graphics

**Files:**
- Create: `content/pills/assets/TST-001/code-coverage-lines.jpg`
- Create: `content/pills/assets/TST-001/body-temperature.jpg`
- Source: `/Users/bartosz/Projects/dev-academy docs/testing pills/coverage.pdf`

**Interfaces:**
- Consumes: Embedded images 2 and 3 from `coverage.pdf`.
- Produces: Two stable repository assets referenced by the canonical Pill.

- [ ] **Step 1: Extract the embedded images to a temporary directory**

Run:

```bash
mkdir -p /private/tmp/tst-001-images
/Users/bartosz/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdfimages -all "/Users/bartosz/Projects/dev-academy docs/testing pills/coverage.pdf" /private/tmp/tst-001-images/coverage
```

Expected: `/private/tmp/tst-001-images/coverage-002.jpg` is 890x374 and `coverage-003.jpg` is 485x324.

- [ ] **Step 2: Copy only the two editorial images into the canonical asset directory**

Run:

```bash
mkdir -p content/pills/assets/TST-001
cp /private/tmp/tst-001-images/coverage-002.jpg content/pills/assets/TST-001/code-coverage-lines.jpg
cp /private/tmp/tst-001-images/coverage-003.jpg content/pills/assets/TST-001/body-temperature.jpg
```

- [ ] **Step 3: Verify both files and inspect them visually**

Run:

```bash
file content/pills/assets/TST-001/code-coverage-lines.jpg content/pills/assets/TST-001/body-temperature.jpg
```

Expected: JPEG images with dimensions 890x374 and 485x324. Visual inspection must show the annotated line-coverage screenshot and the thermometer illustration without Gmail chrome.

### Task 2: Create the canonical Testing Pill

**Files:**
- Create: `content/pills/testing/TST-001-code-coverage.md`
- Test: `scripts/pills/check.js`
- Test: `tests/verify-pill-structure.js`
- Test: `tests/verify-pill-validator.js`
- Test: `tests/verify-pills-cli.js`

**Interfaces:**
- Consumes: The two assets created in Task 1 and the accepted TST-001 design.
- Produces: A `ready` Testing Pill at testing sequence position 1.

- [ ] **Step 1: Create the canonical Markdown record**

Create `content/pills/testing/TST-001-code-coverage.md` with this exact content:

````markdown
---
id: TST-001
track: testing
status: ready
sequence_position: 1
subject: "Can high code coverage hide useless tests?"
preview_text: "Your first Testing Pill: coverage tells you what ran—not whether your tests protect the behavior."
created: 2026-08-05
last_verified: 2026-08-05
review_after: 2028-02-05
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
  - https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage
---

## Email body

Hi developer,

Here is your first Testing Pill. 💊

Imagine an agent generates this test for you:

```js
test('calculates the total', () => {
  calculateTotal(100, true);
  calculateTotal(100, false);
});
```

It executes both paths through `calculateTotal`.

But what does it actually verify?

Nothing.

There is no assertion. The function could return the wrong price and this test would not notice. Yet the relevant lines and branches may still appear as covered.

**[IMAGE PLACEHOLDER — upload `assets/TST-001/code-coverage-lines.jpg` here]**

This is the important distinction:

**Code coverage tells you what ran. It does not tell you whether the tests protected the behavior.**

Think about body temperature.

A reading of 38.5°C warns you that something may be wrong. But a normal reading does not prove that you are completely healthy.

**[IMAGE PLACEHOLDER — upload `assets/TST-001/body-temperature.jpg` here]**

Coverage works in a similar way. Low coverage can reveal important gaps. High coverage is still only one indicator—it is not a complete diagnosis of your test suite.

This matters even more when AI generates tests quickly. An agent can produce many tests and improve the number on your dashboard. You still need to review what those tests can actually detect.

**Your check for today**

Choose one test in your project and answer this question:

**What specific bug would make this test fail?**

If you cannot name one, the test may be executing code without protecting useful behavior.

That’s all for today. One misleading metric, one mental model, one practical check. 💊

See you next Friday,  
Bartosz  
Dev Academy
````

- [ ] **Step 2: Run the production validator**

Run:

```bash
npm run pills:check
```

Expected: `2 Knowledge Pills passed validation.`

- [ ] **Step 3: Run the editorial infrastructure tests**

Run:

```bash
npm run test:pills
```

Expected: structure, validator, and CLI checks all pass.

- [ ] **Step 4: Verify scope and repository state**

Run:

```bash
git diff --check
git status --short
```

Expected: only the TST-001 Markdown, two TST-001 assets, and this plan are part of this implementation; unrelated existing work remains untouched.

- [ ] **Step 5: Commit only TST-001 production files**

```bash
git add content/pills/testing/TST-001-code-coverage.md content/pills/assets/TST-001/code-coverage-lines.jpg content/pills/assets/TST-001/body-temperature.jpg
git commit --only content/pills/testing/TST-001-code-coverage.md content/pills/assets/TST-001/code-coverage-lines.jpg content/pills/assets/TST-001/body-temperature.jpg -m "content: add first Testing Pill"
```
