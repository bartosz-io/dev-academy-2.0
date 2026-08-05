# Newsletter Anchor Offset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the `Get the free Pills` CTA anchored to the hero form while positioning that form below the fixed header after fragment navigation.

**Architecture:** Use native fragment navigation and smooth scrolling. Add a target-specific responsive `scroll-margin-top` to `#get-free-pills`; no JavaScript or global anchor offset is introduced.

**Tech Stack:** Hexo 5, EJS, SCSS, Node.js static verification with `assert`.

## Global Constraints

- Preserve the existing `href="#get-free-pills"` and `id="get-free-pills"` contract.
- Use `9rem` on mobile: the `7rem` fixed header plus `2rem` spacing.
- Use `10rem` from the existing desktop-header breakpoint at `992px`: the `8rem` fixed header plus `2rem` spacing.
- Do not change global anchor behavior, form placement, submission behavior, focus behavior, or CTA copy.
- Do not add JavaScript scrolling.

## File Structure

- Modify `themes/my-theme/source/css/pages/_newsletter-homepage.scss` to own the homepage-form anchor offset alongside the existing newsletter form styles.
- Modify `tests/verify-homepage.js` to statically protect both responsive offsets from regression.

---

### Task 1: Keep the hero signup form below the fixed header

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`

**Interfaces:**
- Consumes: the existing `#get-free-pills` form ID, `$header-height-mobile`, `$header-height-desktop`, and the desktop-header breakpoint at `992px`.
- Produces: native fragment navigation whose target has `scroll-margin-top: 9rem` on mobile and `scroll-margin-top: 10rem` at widths of `992px` and above.

- [ ] **Step 1: Add the focused failing assertions**

In `tests/verify-homepage.js`, immediately after the existing assertion for `href="#get-free-pills"`, add:

```js
assert(
  /#get-free-pills\s*\{[\s\S]*?scroll-margin-top:\s*calc\(#\{\$header-height-mobile\}\s*\+\s*2rem\);/.test(
    newsletterStyles
  ),
  'Pills form anchor must clear the fixed mobile header'
);
assert(
  /@media\s*\(min-width:\s*992px\)[\s\S]*?#get-free-pills\s*\{[\s\S]*?scroll-margin-top:\s*calc\(#\{\$header-height-desktop\}\s*\+\s*2rem\);/.test(
    newsletterStyles
  ),
  'Pills form anchor must clear the fixed desktop header'
);
```

- [ ] **Step 2: Run the focused verifier and confirm the expected failure**

Run:

```bash
node tests/verify-homepage.js
```

Expected: FAIL with `Pills form anchor must clear the fixed mobile header`. If `public/index.html` is absent, first run the existing `npm run build:hexo`; if the legacy native dependency toolchain prevents regeneration, use the already generated homepage only when it represents the current templates and record that constraint in the verification handoff.

- [ ] **Step 3: Add the mobile target offset**

In `themes/my-theme/source/css/pages/_newsletter-homepage.scss`, directly before the existing `.newsletter-form` block, add:

```scss
#get-free-pills {
  scroll-margin-top: calc(#{$header-height-mobile} + 2rem);
}
```

- [ ] **Step 4: Add the desktop target offset**

Add a breakpoint matching the fixed header's desktop transition:

```scss
@media (min-width: 992px) {
  #get-free-pills {
    scroll-margin-top: calc(#{$header-height-desktop} + 2rem);
  }
}
```

Place it near the existing responsive newsletter rules. Do not reuse the newsletter layout's `960px` breakpoint because the fixed header remains at its mobile height until `992px`.

- [ ] **Step 5: Run the static verifier and confirm it passes**

Run:

```bash
node tests/verify-homepage.js
```

Expected: the process exits with code `0` and prints no assertion error.

- [ ] **Step 6: Run proportional regression checks**

Run:

```bash
git diff --check
npm run test:pills
```

Expected: `git diff --check` exits with code `0`; all three Knowledge Pills checks pass.

- [ ] **Step 7: Verify the real interaction at both responsive sizes**

Serve the current homepage with the project's existing development command. At one viewport below `992px` and one viewport at or above `992px`, scroll below the hero, click `Get the free Pills`, and confirm:

- the URL fragment becomes `#get-free-pills`;
- the email label and input remain visible below the fixed header;
- approximately `2rem` of space separates the fixed header from the form;
- no JavaScript error appears and the form remains usable.

- [ ] **Step 8: Commit the focused change**

```bash
git add tests/verify-homepage.js themes/my-theme/source/css/pages/_newsletter-homepage.scss
git commit -m "fix: keep Pills form below fixed header"
```
