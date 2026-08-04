# Newsletter Email Grid Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the visible `4rem` gap between the example email cards and the newsletter call-to-action.

**Architecture:** Make each label-and-email wrapper a vertical flex container and let the email card consume the wrapper's remaining height. This preserves equal card heights without letting `height: 100%` overflow the grid row.

**Tech Stack:** Hexo, EJS, SCSS, Node.js acceptance assertions, Playwright CLI.

## Global Constraints

- Keep the existing `.newsletter-examples-form` margin at `4rem auto 0`.
- Apply the fix at desktop and mobile widths.
- Do not change copy, colors, form behavior, card content, or CTA dimensions.
- Do not conceal the overflow with a larger margin or extra grid padding.

---

### Task 1: Correct email-card sizing and verify spacing

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `themes/my-theme/layout/partial/homepage/email-examples.ejs`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`

**Interfaces:**
- Consumes: `.newsletter-email-grid`, `.newsletter-email`, and `.newsletter-examples-form`.
- Produces: `.newsletter-email-card`, a vertical flex wrapper used by both example emails.

- [ ] **Step 1: Write the failing regression assertions**

Read the EJS partial and SCSS source in `tests/verify-homepage.js`, then assert:

```js
assert.strictEqual(count(emailExamplesTemplate, 'class="newsletter-email-card"'), 2);
assert(/\.newsletter-email-card\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/.test(newsletterStyles));
assert(/\.newsletter-email\s*\{[\s\S]*?flex:\s*1;/.test(newsletterStyles));
assert(!/\.newsletter-email\s*\{[\s\S]*?height:\s*100%;/.test(newsletterStyles));
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node tests/verify-homepage.js`

Expected: FAIL because the two wrappers do not yet use `newsletter-email-card`.

- [ ] **Step 3: Implement the minimal layout correction**

Apply `class="newsletter-email-card"` to both direct children of `.newsletter-email-grid`. Add:

```scss
.newsletter-email-card {
  display: flex;
  flex-direction: column;
}
```

Replace `height: 100%` in `.newsletter-email` with:

```scss
flex: 1;
```

- [ ] **Step 4: Run acceptance checks and confirm GREEN**

Run: `npm run test:homepage`

Expected: `Newsletter homepage acceptance checks passed.`

- [ ] **Step 5: Verify visually**

Run the local Hexo server, inspect `/` at `1440x900` and `390x844`, and confirm that the CTA has a visible gap after the email cards with no horizontal overflow.

- [ ] **Step 6: Verify production and commit**

Run:

```bash
npm run build
git diff --check
```

Commit:

```bash
git add tests/verify-homepage.js themes/my-theme/layout/partial/homepage/email-examples.ejs themes/my-theme/source/css/pages/_newsletter-homepage.scss
git commit -m "fix: restore spacing below example emails"
```
