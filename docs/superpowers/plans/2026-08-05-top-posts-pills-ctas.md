# Contextual Knowledge Pills CTAs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one contextual Knowledge Pills CTA around 25–35% reading progress in each of the five most-viewed blog posts and remove their obsolete sales CTAs.

**Architecture:** Each selected Markdown post owns its contextual copy and uses shared semantic HTML classes. One SCSS component supplies a restrained card presentation, while a rendered-output test enforces CTA count, destination, tracking, and removal of obsolete promotion.

**Tech Stack:** Hexo 5, Markdown with inline HTML, EJS theme styles, SCSS, Node.js `assert`

## Global Constraints

- New CTA links must use `href="/"` with no fragment and no query parameters.
- Every selected post must contain exactly one CTA with `data-ph="article-pills-cta__link"`.
- CTA copy must connect directly to the surrounding article topic.
- Preserve editorial links to relevant technical articles.
- Remove legacy popup front matter, `review_screen` promotions, Web Security Academy sales prose, discount copy, and inactive promotional metadata from only the five selected posts.
- Do not modify `.playwright-cli/`.

---

### Task 1: Define the rendered-output contract

**Files:**
- Create: `tests/verify-top-post-pills-ctas.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: generated HTML under `public/<slug>/index.html`, the five Markdown sources, and the shared CTA SCSS source
- Produces: a `test:homepage` regression gate for all five contextual CTAs

- [ ] **Step 1: Create the failing acceptance test**

Create `tests/verify-top-post-pills-ctas.js` with this structure:

```js
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const posts = [
  ['angular-architecture-best-practices', 'angular-architecture-best-practices.md'],
  ['vue-design-patterns', 'vue-design-patterns.md'],
  ['angular-session-storage', 'angular-session-storage.md'],
  ['angular-cors', 'angular-cors.md'],
  ['angular-authentication-with-openid-connect', 'angular-authentication-with-openid-connect.md']
];

posts.forEach(function(entry) {
  const route = entry[0];
  const sourceName = entry[1];
  const html = fs.readFileSync(path.join(ROOT, 'public', route, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(ROOT, 'source', '_posts', sourceName), 'utf8');
  const ctas = html.match(/<aside class="article-pills-cta"[\s\S]*?<\/aside>/g) || [];

  assert.strictEqual(ctas.length, 1, route + ' must render exactly one Pills CTA');
  assert(ctas[0].includes('href="/"'));
  assert(!ctas[0].includes('#get-free-pills'));
  assert(ctas[0].includes('data-ph="article-pills-cta__link"'));
  assert(ctas[0].includes('Get the free Knowledge Pills'));
  assert(!html.includes('id="popup"'));
  assert(!html.includes('class="review-screen"'));
  assert(!html.includes('websecurity-academy.com'));
  assert(!source.includes('\npopup:'));
  assert(!source.includes('{% review_screen'));
  assert(!source.includes('Join with 40% OFF'));
  assert(!source.includes('bannerHeader:'));
});

const stylesEntry = fs.readFileSync(path.join(ROOT, 'themes', 'my-theme', 'source', 'css', 'styles.scss'), 'utf8');
const componentPath = path.join(ROOT, 'themes', 'my-theme', 'source', 'css', 'components', '_article-pills-cta.scss');
assert(stylesEntry.includes("@import 'components/article-pills-cta';"));
assert(fs.existsSync(componentPath), 'shared Pills CTA stylesheet must exist');
const component = fs.readFileSync(componentPath, 'utf8');
assert(component.includes('.article-pills-cta'));
assert(component.includes('@media (max-width: 575px)'));

console.log('Top post Pills CTA checks passed.');
```

- [ ] **Step 2: Add the test to the homepage suite**

Append `&& node tests/verify-top-post-pills-ctas.js` to `test:homepage` in `package.json`.

- [ ] **Step 3: Run the new test and verify RED**

Run: `node tests/verify-top-post-pills-ctas.js`

Expected: FAIL because the five rendered articles do not yet contain `.article-pills-cta`.

---

### Task 2: Add the shared inline CTA component

**Files:**
- Create: `themes/my-theme/source/css/components/_article-pills-cta.scss`
- Modify: `themes/my-theme/source/css/styles.scss`

**Interfaces:**
- Consumes: `.article-pills-cta`, `.article-pills-cta-eyebrow`, and `.article-pills-cta-link` classes from post HTML
- Produces: a compact, responsive article callout card with no fixed positioning

- [ ] **Step 1: Create the component stylesheet**

Create the component with this implementation:

```scss
.article-pills-cta {
  margin: 3rem 0;
  padding: 2.4rem;
  border-left: .5rem solid $purple-100;
  border-radius: 1.2rem;
  background: $light-125;
  color: $navy-400;

  h3 {
    margin: 0 0 1rem;
  }

  p {
    margin: 0 0 1.6rem;
  }

  .article-pills-cta-eyebrow {
    color: $purple-100;
    font-size: $font-size-13;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .article-pills-cta-link {
    margin-top: .4rem;
  }
}

@media (max-width: 575px) {
  .article-pills-cta {
    padding: 2rem;

    .article-pills-cta-link {
      display: block;
      width: 100%;
      text-align: center;
    }
  }
}
```

- [ ] **Step 2: Import the component**

Add this import beside the other article components in `styles.scss`:

```scss
@import 'components/article-pills-cta';
```

---

### Task 3: Add contextual copy to the five selected posts

**Files:**
- Modify: `source/_posts/angular-architecture-best-practices.md`
- Modify: `source/_posts/vue-design-patterns.md`
- Modify: `source/_posts/angular-session-storage.md`
- Modify: `source/_posts/angular-cors.md`
- Modify: `source/_posts/angular-authentication-with-openid-connect.md`

**Interfaces:**
- Consumes: the shared article CTA classes from Task 2
- Produces: exactly one contextual CTA per selected article

- [ ] **Step 1: Angular architecture**

Remove the `popup` front matter and both `review_screen` shortcodes. Replace the first review-screen position, between the State and Synchronization Strategy discussion, with:

```html
<aside class="article-pills-cta" aria-label="Free Dev Academy Knowledge Pills">
  <p class="article-pills-cta-eyebrow">Security Tuesday + Testing Friday</p>
  <h3>Architecture needs feedback loops.</h3>
  <p>Clean boundaries are valuable only when your team can verify they still hold. Get two practical Knowledge Pills each week to help you review, secure, and test code written by you, your team, or AI.</p>
  <a class="button button-primary article-pills-cta-link" href="/" data-ph="article-pills-cta__link">Get the free Knowledge Pills →</a>
</aside>
```

- [ ] **Step 2: Vue design patterns**

Remove `bannerHeader`. Replace the old Web Security Academy sentence in the Adapter Pattern paragraph with: `For a deeper review of framework-specific risks, see our [Vue Security Best Practices](/vue-security-best-practices/) guide.` Insert immediately after that paragraph:

```html
<aside class="article-pills-cta" aria-label="Free Dev Academy Knowledge Pills">
  <p class="article-pills-cta-eyebrow">Security Tuesday + Testing Friday</p>
  <h3>A good adapter contains change. Judgment contains risk.</h3>
  <p>Dependencies change, vulnerabilities appear, and generated code crosses boundaries quickly. Get two practical Knowledge Pills each week to sharpen the security and testing decisions behind your design patterns.</p>
  <a class="button button-primary article-pills-cta-link" href="/" data-ph="article-pills-cta__link">Get the free Knowledge Pills →</a>
</aside>
```

- [ ] **Step 3: Angular session storage**

Remove the `popup` front matter. Insert immediately after the first `save-data.jpg` example:

```html
<aside class="article-pills-cta" aria-label="Free Dev Academy Knowledge Pills">
  <p class="article-pills-cta-eyebrow">Security Tuesday + Testing Friday</p>
  <h3>Before you store it, ask how it could leak.</h3>
  <p><code>sessionStorage</code> is convenient, but JavaScript—and therefore an XSS payload—can read it. Get two practical Knowledge Pills each week to make security and testing checks part of everyday development.</p>
  <a class="button button-primary article-pills-cta-link" href="/" data-ph="article-pills-cta__link">Get the free Knowledge Pills →</a>
</aside>
```

- [ ] **Step 4: Angular CORS**

Remove the `popup` front matter, replace the `review_screen` after the NinWiki introduction with the CTA below, and replace the closing Web Security Academy sales paragraph with: `For a broader set of practical safeguards, see our [secure coding training](/secure-coding-training) guide.`

```html
<aside class="article-pills-cta" aria-label="Free Dev Academy Knowledge Pills">
  <p class="article-pills-cta-eyebrow">Security Tuesday + Testing Friday</p>
  <h3>Fix the CORS error without creating a security hole.</h3>
  <p>Allowing every origin may silence the browser today and widen your attack surface tomorrow. Get two practical Knowledge Pills each week to understand the trade-offs behind fixes like this.</p>
  <a class="button button-primary article-pills-cta-link" href="/" data-ph="article-pills-cta__link">Get the free Knowledge Pills →</a>
</aside>
```

- [ ] **Step 5: Angular OIDC**

Remove the `review_screen` before the GCP setup section. Insert immediately before `### OIDC ID token`:

```html
<aside class="article-pills-cta" aria-label="Free Dev Academy Knowledge Pills">
  <p class="article-pills-cta-eyebrow">Security Tuesday + Testing Friday</p>
  <h3>Authentication is not a copy-paste feature.</h3>
  <p>A working OIDC configuration can still encode the wrong flow or unsafe token handling. Get two practical Knowledge Pills each week to understand the security and testing decisions behind the code.</p>
  <a class="button button-primary article-pills-cta-link" href="/" data-ph="article-pills-cta__link">Get the free Knowledge Pills →</a>
</aside>
```

---

### Task 4: Verify, commit, deploy, and check production

**Files:**
- Test: all files modified in Tasks 1–3

**Interfaces:**
- Consumes: the completed article sources, styles, build scripts, and Netlify auto-deploy
- Produces: production articles with one contextual `/` CTA and no obsolete sales CTA

- [ ] **Step 1: Run the focused acceptance test**

Run: `npm run build:hexo && node tests/verify-top-post-pills-ctas.js`

Expected: all five article contracts pass.

- [ ] **Step 2: Run the complete homepage and privacy suites**

Run: `npm run test:homepage && npm run test:privacy`

Expected: all acceptance scripts pass. Existing local `sharp` and `node-sass` architecture warnings may be reported by the legacy Hexo setup, but the commands must exit with code `0`.

- [ ] **Step 3: Commit and push only scoped files**

```bash
git add package.json tests/verify-top-post-pills-ctas.js themes/my-theme/source/css/styles.scss themes/my-theme/source/css/components/_article-pills-cta.scss source/_posts/angular-architecture-best-practices.md source/_posts/vue-design-patterns.md source/_posts/angular-session-storage.md source/_posts/angular-cors.md source/_posts/angular-authentication-with-openid-connect.md docs/superpowers/plans/2026-08-05-top-posts-pills-ctas.md
git commit -m "add contextual Pills CTAs to top posts"
git push
```

- [ ] **Step 4: Verify production HTML after Netlify deploy**

Fetch each of the five production routes. Verify exactly one `article-pills-cta`, `href="/"`, no `#get-free-pills`, and no `websecurity-academy.com`, `review-screen`, or legacy popup markup.
