# Homepage Highlight Marker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the oversized full-height `secure` and `tested` hero highlights with thin marker bands that do not enlarge either word.

**Architecture:** Keep the existing semantic spans and color mapping. Change only their SCSS decoration from solid backgrounds, padding, radius, and inset shadows to exact linear gradients occupying 62–90% of the inline line box; update the existing source-level homepage acceptance test first, then verify the compiled result at mobile and desktop sizes.

**Tech Stack:** Hexo, EJS, SCSS, Node.js acceptance scripts, Dart Sass for temporary visual-QA CSS, Playwright CLI.

## Global Constraints

- The marker is transparent from 0–62%, colored from 62–90%, and transparent from 90–100% of the line box.
- `secure` remains purple using `#ded3ff`; `tested` remains green using `#cff3e5`.
- The highlight has no horizontal padding, border radius, or inset shadow.
- Headline copy, HTML, accessibility, font size, line height, wrapping rules, layout, analytics, forms, and downstream content must not change.
- Mobile and desktop use the same relative marker depth.
- No dependency or lockfile changes are allowed.

---

### Task 1: Replace full boxes with thin marker gradients

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`

**Interfaces:**
- Consumes: existing `.newsletter-highlight`, `.newsletter-highlight-security`, and `.newsletter-highlight-testing` spans from the homepage hero.
- Produces: exact purple and green marker-gradient declarations with unchanged semantic markup.

- [ ] **Step 1: Strengthen the CSS acceptance checks before changing production styles**

Replace the two generic highlight-background assertions in `tests/verify-homepage.js` with exact marker assertions and checks that the old full-box properties are absent:

```js
var highlightBaseStyles = newsletterStyles.match(/\.newsletter-highlight\s*\{([^}]*)\}/);
var securityHighlightStyles = newsletterStyles.match(/\.newsletter-highlight-security\s*\{([^}]*)\}/);
var testingHighlightStyles = newsletterStyles.match(/\.newsletter-highlight-testing\s*\{([^}]*)\}/);

assert(highlightBaseStyles, 'base highlight styles must exist');
assert(securityHighlightStyles, 'security highlight styles must exist');
assert(testingHighlightStyles, 'testing highlight styles must exist');
assert(!/padding:|border-radius:/.test(highlightBaseStyles[1]));
assert(!/box-shadow:/.test(securityHighlightStyles[1]));
assert(!/box-shadow:/.test(testingHighlightStyles[1]));
assert(
  /background:\s*linear-gradient\(to bottom, transparent 0 62%, #ded3ff 62% 90%, transparent 90% 100%\);/
    .test(securityHighlightStyles[1])
);
assert(
  /background:\s*linear-gradient\(to bottom, transparent 0 62%, #cff3e5 62% 90%, transparent 90% 100%\);/
    .test(testingHighlightStyles[1])
);
```

- [ ] **Step 2: Run the focused acceptance script and verify RED**

Run:

```bash
node tests/verify-homepage.js
```

Expected: FAIL at `assert(!/padding:|border-radius:/.test(highlightBaseStyles[1]))` because the existing highlight still has full-box padding and radius. This focused script reads the existing generated homepage plus source SCSS and does not need a new Hexo build for the RED state.

- [ ] **Step 3: Implement the minimal SCSS change**

Replace the three highlight blocks in `_newsletter-homepage.scss` with:

```scss
.newsletter-highlight {
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.newsletter-highlight-security {
  background: linear-gradient(to bottom, transparent 0 62%, #ded3ff 62% 90%, transparent 90% 100%);
}

.newsletter-highlight-testing {
  background: linear-gradient(to bottom, transparent 0 62%, #cff3e5 62% 90%, transparent 90% 100%);
}
```

Do not change any breakpoint-specific headline styles.

- [ ] **Step 4: Run the homepage suite and verify GREEN**

Run:

```bash
npm run test:homepage
git diff --check
```

Expected: all homepage acceptance checks pass and `git diff --check` exits 0. The repository's known non-fatal Sharp/node-sass plugin-load warnings on Node 24 are allowed; assertion failures are not.

- [ ] **Step 5: Compile temporary CSS for trustworthy visual QA**

Because the repository's legacy node-sass binary does not render SCSS on the current Node 24 ARM environment, compile the current SCSS without changing dependencies:

```bash
npx --yes sass@1.77.8 --style=compressed themes/my-theme/source/css/styles.scss public/css/styles.css
npx --yes sass@1.77.8 --style=compressed themes/my-theme/source/css/desktop.scss public/css/desktop.css
python3 -m http.server 4173 --directory public
```

Do not stage or commit anything under `public/`.

- [ ] **Step 6: Verify mobile and desktop rendering with Playwright CLI**

Using `/Users/bartosz/.codex/skills/playwright/scripts/playwright_cli.sh`, open `http://127.0.0.1:4173/`, then verify at 382 × 800 and 1440 × 1000:

- both highlights compute to `background-image: linear-gradient(...)`;
- both highlighted spans have zero left/right padding;
- the colored band occupies only the lower portion of each word;
- headline wrapping and line-height remain unchanged;
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`;
- the form and CTA remain visible in the 382 × 800 initial viewport.

Save refreshed screenshots to `/private/tmp/dev-academy-marker-mobile.png` and `/private/tmp/dev-academy-marker-desktop.png`. Do not commit screenshots or Playwright artifacts.

- [ ] **Step 7: Commit the marker treatment**

```bash
git add tests/verify-homepage.js themes/my-theme/source/css/pages/_newsletter-homepage.scss
git commit -m "style: reduce homepage hero highlights"
```

