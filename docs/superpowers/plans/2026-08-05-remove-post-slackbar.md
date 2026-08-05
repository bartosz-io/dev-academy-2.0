# Remove Post Slackbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop rendering the yellow fixed promotional slackbar on every blog post.

**Architecture:** Remove the slackbar partial invocation from the shared post branch in `layout.ejs`. Protect the rendered-output contract with an assertion against a generated blog post.

**Tech Stack:** Hexo, EJS, Node.js `assert`

## Global Constraints

- Preserve the header CTA, newsletter forms, in-content CTAs, and privacy controls.
- Leave the unused slackbar partial and stylesheet in the repository.

---

### Task 1: Remove the post slackbar

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `themes/my-theme/layout/layout.ejs`

**Interfaces:**
- Consumes: generated `public/preventing-xss-in-angular/index.html`
- Produces: blog post HTML without an element whose class includes `slack`

- [ ] **Step 1: Write the failing rendered-output assertion**

Add after loading `blogPost`:

```js
assert(!/<div class="slack"(?:\s|>)/.test(blogPost));
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/verify-homepage.js`

Expected: FAIL because the generated post still contains `<div class="slack"`.

- [ ] **Step 3: Remove the slackbar partial invocation**

Delete this block from the non-landing `<main>` element in `themes/my-theme/layout/layout.ejs`:

```ejs
<% if (is_post())  {%>
    <%- partial('partial/slackbar', {}, {caches: true}) %>
<% } %>
```

- [ ] **Step 4: Build and run the homepage suite**

Run: `npm run test:homepage`

Expected: the Hexo command exits successfully and all four acceptance scripts pass.

- [ ] **Step 5: Commit and push**

```bash
git add tests/verify-homepage.js themes/my-theme/layout/layout.ejs docs/superpowers/plans/2026-08-05-remove-post-slackbar.md
git commit -m "remove promotional slackbar from posts"
git push
```
