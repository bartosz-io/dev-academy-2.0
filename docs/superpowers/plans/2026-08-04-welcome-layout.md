# Headerless `/welcome` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render `/welcome` without the global site header or footer while preserving its confirmation content and leaving every other route unchanged.

**Architecture:** Reuse the theme's existing `landing` rendering path by selecting it in the `/welcome` page front matter. Add generated-HTML acceptance assertions so the route-specific layout contract is protected during the normal Hexo build test.

**Tech Stack:** Hexo 5, EJS layouts, Node.js `assert`, npm scripts

## Global Constraints

- The change applies only to `/welcome`.
- Keep the current confirmation content, metadata and styling unchanged.
- Do not change `/welcome/security` or any other route.
- Do not add a new layout or a route-specific condition to the global layout.

---

### Task 1: Render `/welcome` without global chrome

**Files:**
- Modify: `tests/verify-homepage.js:175-179`
- Modify: `source/welcome/index.html:1-5`

**Interfaces:**
- Consumes: Hexo's existing `layout: landing` front-matter convention and the generated `public/welcome/index.html` fixture loaded as `welcome`.
- Produces: Generated `/welcome` HTML containing `.welcome-confirmation` but no `<header class="header">` or `<footer class="footer">`.

- [ ] **Step 1: Write the failing generated-HTML assertions**

Append the two negative assertions to the existing `/welcome` checks in `tests/verify-homepage.js`:

```js
assert(welcome.includes('class="welcome-confirmation"'));
assert(welcome.includes('Check your inbox'));
assert(welcome.includes('Open the email'));
assert(welcome.includes('Confirm your subscription'));
assert(welcome.includes('You are not subscribed yet'));
assert(!welcome.includes('<header class="header">'));
assert(!welcome.includes('<footer class="footer">'));
```

- [ ] **Step 2: Run the acceptance test and confirm the new contract fails**

Run:

```bash
npm run test:homepage
```

Expected: FAIL at the first new negative assertion because the generated `/welcome` page currently contains `<header class="header">`.

- [ ] **Step 3: Select the existing headerless layout**

Add `layout: landing` to the front matter in `source/welcome/index.html` without changing any other field or page content:

```yaml
---
layout: landing
thankYouPage: true
sitemap: false
title: Confirm your email | Dev Academy
---
```

- [ ] **Step 4: Run the acceptance test and confirm the route contract passes**

Run:

```bash
npm run test:homepage
```

Expected: PASS with `Newsletter homepage acceptance checks passed.` The generated `/welcome` page retains its confirmation assertions and satisfies both header/footer absence assertions.

- [ ] **Step 5: Review the focused diff**

Run:

```bash
git diff --check
git diff -- tests/verify-homepage.js source/welcome/index.html
```

Expected: no whitespace errors; the diff contains only the two negative assertions and the single `layout: landing` front-matter line.

- [ ] **Step 6: Commit the implementation**

```bash
git add tests/verify-homepage.js source/welcome/index.html
git commit -m "fix: remove site chrome from welcome page"
```
