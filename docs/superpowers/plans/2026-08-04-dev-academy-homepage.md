# Dev Academy Newsletter Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the root article index with a newsletter-first Dev Academy homepage, move the article listing to `/articles/`, and preserve every existing article permalink.

**Architecture:** Keep the existing Hexo 5 site and introduce a dedicated `homepage` layout composed from small EJS partials and a single homepage data file. Reconfigure `hexo-generator-index` to emit the existing article list at `/articles/`. Reuse the current Kit form endpoint for three email-only forms, expose stable topic and placement attributes for the later analytics integration, and verify the generated static HTML with a dependency-free Node acceptance script.

**Tech Stack:** Hexo 5.4, EJS, SCSS, vanilla JavaScript, Kit/ConvertKit embedded form endpoint, Node.js 14 acceptance checks.

## Global Constraints

- Work in `/Users/bartosz/Projects/dev-academy` using Node `14.20.1` from `.nvmrc`.
- Preserve all existing post permalinks (`/:title/`). Only the article index moves.
- Keep the homepage English-only and personal-led: `Dev Academy by Bartosz Pietrucha`.
- Use exactly `For JavaScript & TypeScript developers`; never reintroduce `working`.
- Use `900+ course enrollments`, never `900+ developers` or `900+ students`.
- Do not show Starter Kit pricing, a cohort duration, a curriculum promise, or a course catalog on `/`.
- Every homepage form asks only for email and submits to the existing Kit form `1921330` (`e4bf864ac2`). Double opt-in and enrollment in both evergreen sequences must be configured and verified in Kit separately; static markup cannot guarantee either behavior.
- Do not invent a Testing Pill or testimonial. Implementation of those content blocks is gated on source material supplied by Bartosz or already present in the repository. Historical testimonials must name their original program context.
- Keep existing article styles intact. `source/about.html` depends on the legacy `pages/_homepage.scss`, so add a separate newsletter-homepage stylesheet instead of replacing it.
- Do not add event-schema-v2 JavaScript in this plan. Add privacy-safe `data-newsletter-topic` and `data-newsletter-placement` hooks for the separate analytics implementation.
- No placeholders, lorem ipsum, fake logos, fake social proof, or TODO comments may ship.

---

## Required content input

Before Task 5 begins, Bartosz supplies one real Testing Pill in a copyable format, including its subject/title, problem example, solution example, and any code snippet used in the original email. The Security preview uses the existing `target="_blank"` / `rel="noopener"` Pill supplied in the project materials. Before Task 6 begins, inspect the tracked `review_1.png`–`review_3.png` assets, select 2–3 legible reviews, and verify that they came from Web Security Academy or Fullstack Testing Academy. If their program context cannot be proven, Bartosz supplies replacement testimonials; Task 6 does not ship with unverified proof.

## Task 1: Restore the reproducible baseline and add the acceptance harness

**Files:**
- Modify: `package.json`
- Create: `scripts/verify-homepage.js`

- [ ] **Step 1: Restore locked dependencies and record the baseline**

Run:

```bash
source /Users/bartosz/.nvm/nvm.sh
nvm use 14.20.1
npm ci
npm run build:hexo
```

Expected: dependencies install from `package-lock.json` and the current site builds successfully. If the baseline fails after `npm ci`, stop and diagnose it before changing homepage code.

- [ ] **Step 2: Add a deliberately failing generated-site acceptance check**

Create `scripts/verify-homepage.js` with built-in `fs`, `path`, and `assert`. Provide helpers:

```js
function readPublic(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', 'public', relativePath), 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}
```

The initial assertions must require:

```js
const homepage = readPublic('index.html');
const articles = readPublic('articles/index.html');

assert(homepage.includes('Build web applications you can trust.'));
assert(homepage.includes('Security Tuesday'));
assert(homepage.includes('Testing Friday'));
assert(homepage.includes('under five minutes'));
assert.strictEqual(count(homepage, 'name="email_address"'), 3);
assert.strictEqual(count(homepage, 'name="fields[first_name]"'), 0);
assert.strictEqual(count(homepage, 'https://app.convertkit.com/forms/1921330/subscriptions'), 3);
assert(homepage.includes('data-newsletter-placement="homepage_hero"'));
assert(homepage.includes('data-newsletter-placement="homepage_after_examples"'));
assert(homepage.includes('data-newsletter-placement="homepage_final"'));
assert(!homepage.includes('€19'));
assert(!homepage.includes('€37'));
assert(articles.includes('posts-wrapper'));
readPublic('preventing-xss-in-angular/index.html');
```

Also assert exactly one canonical URL for `/` and one for `/articles/`. Print one short success line only after every assertion passes.

- [ ] **Step 3: Expose the test command**

Add to `package.json`:

```json
"test:homepage": "npm run build:hexo && node scripts/verify-homepage.js"
```

- [ ] **Step 4: Run the test and confirm the intended failure**

Run: `npm run test:homepage`

Expected: FAIL because `/articles/index.html` and the new homepage do not exist yet. A syntax error in the verification script is not an acceptable failure.

- [ ] **Step 5: Commit the red test**

```bash
git add package.json scripts/verify-homepage.js
git commit -m "test: define newsletter homepage acceptance"
```

## Task 2: Split the homepage from the article index

**Files:**
- Modify: `_config.yml`
- Create: `source/index.md`
- Create: `themes/my-theme/layout/homepage.ejs`
- Modify: `themes/my-theme/layout/layout.ejs`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Strengthen the routing assertions**

Require `public/index.html` to contain `class="newsletter-homepage"`, require `public/articles/index.html` to contain the existing `posts-wrapper`, and require both `public/preventing-xss-in-angular/index.html` and another known post permalink from `source/_posts/` to exist.

- [ ] **Step 2: Move only the generated index**

Change:

```yaml
index_generator:
  path: articles
```

Do not change `permalink: /:title/` or the post source paths.

- [ ] **Step 3: Add the root page**

Create `source/index.md`:

```yaml
---
layout: homepage
title: Build web applications you can trust | Dev Academy
description: Practical Security Tuesday and Testing Friday Knowledge Pills for JavaScript and TypeScript developers.
---
```

Create `themes/my-theme/layout/homepage.ejs` with the semantic page root:

```ejs
<article class="newsletter-homepage">
  <%- partial('partial/homepage/hero') %>
</article>
```

- [ ] **Step 4: Give the page an isolated body hook**

In `layout.ejs`, append `newsletter-homepage-page` when `page.layout === 'homepage'`. Keep the global header and footer, but do not render the legacy modal `partial/ck-form` on the homepage. Continue rendering it on existing pages until article conversion is handled by its own plan.

- [ ] **Step 5: Build and verify routing**

Run: `npm run test:homepage`

Expected: routing and permalink assertions pass; content assertions still fail because the homepage sections are incomplete.

- [ ] **Step 6: Commit**

```bash
git add _config.yml source/index.md themes/my-theme/layout/homepage.ejs themes/my-theme/layout/layout.ejs scripts/verify-homepage.js
git commit -m "feat: separate homepage from article index"
```

## Task 3: Implement the approved global navigation and footer

**Files:**
- Modify: `themes/my-theme/layout/partial/header.ejs`
- Modify: `themes/my-theme/layout/partial/footer.ejs`
- Modify: `themes/my-theme/source/css/layout/_header.scss`
- Modify: `themes/my-theme/source/css/layout/_footer.scss`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Add navigation acceptance checks**

Assert the generated homepage contains links to `/articles/`, `/podcast/`, `/web-security/`, and `/about/`, plus a `Get the free Pills` anchor targeting the hero form. Assert that the homepage header does not contain `securitystarterkit.net`, `Courses`, or `Contributors`.

- [ ] **Step 2: Replace the header information architecture**

Keep the Dev Academy logo and existing accessible mobile-menu button. Replace the menu contents with:

```text
Articles | Podcast | Web Security | About | Get the free Pills
```

Use internal paths with trailing slashes and make the CTA link to `#get-free-pills`. Remove the retired Starter Kit domain and the course submenu. Preserve keyboard-operable mobile navigation behavior from `main.js`.

- [ ] **Step 3: Simplify the footer**

The footer must contain:

- `Dev Academy by Bartosz Pietrucha`;
- Articles, Podcast, Web Security, and About links;
- the existing verified LinkedIn profile link;
- terms and privacy links;
- no link to `securitystarterkit.net` or `websecurity-academy.com`.

Only include Instagram if a verified profile URL already exists in project data or Bartosz supplies it; never guess the handle.

- [ ] **Step 4: Adjust header/footer styles without regressing article pages**

Use the existing layout classes and responsive breakpoints. Keep minimum 44px interactive targets, visible focus styles, and the current fixed-header offset.

- [ ] **Step 5: Run the generated-site test**

Run: `npm run test:homepage`

Expected: routing and navigation assertions pass; remaining content assertions may still fail.

- [ ] **Step 6: Commit**

```bash
git add themes/my-theme/layout/partial/header.ejs themes/my-theme/layout/partial/footer.ejs themes/my-theme/source/css/layout/_header.scss themes/my-theme/source/css/layout/_footer.scss scripts/verify-homepage.js
git commit -m "feat: align global navigation with newsletter funnel"
```

## Task 4: Build the shared email-only Kit form and three placements

**Files:**
- Modify: `_config.yml`
- Create: `themes/my-theme/layout/partial/homepage/newsletter-form.ejs`
- Modify: `themes/my-theme/layout/homepage.ejs`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Add exact form-contract assertions**

For each placement (`homepage_hero`, `homepage_after_examples`, `homepage_final`) assert exactly one form with:

```html
method="post"
action="https://app.convertkit.com/forms/1921330/subscriptions"
data-sv-form="1921330"
data-uid="e4bf864ac2"
data-newsletter-topic="both"
```

Require one `email_address` input, no name input, a visible label or `aria-label`, and check-inbox copy. Assert there are exactly three forms total.

- [ ] **Step 2: Centralize Kit configuration**

Add a `newsletter` block to `_config.yml` containing the action URL, form ID, UID, and privacy URL. The partial must read this configuration instead of duplicating IDs.

- [ ] **Step 3: Create a parameterized form partial**

The partial interface is:

```ejs
partial('partial/homepage/newsletter-form', {
  placement: 'homepage_hero',
  formId: 'get-free-pills',
  buttonLabel: 'Get the free Pills'
})
```

Render an email-only form with an explicit label, submit button, double-opt-in reassurance, and `data-newsletter-topic="both"`. Keep Kit's required `data-*` attributes and a post-submit check-your-inbox state. Do not put email values into analytics attributes or URLs.

- [ ] **Step 4: Render the three forms**

Call the shared partial in the hero, immediately after the authentic email examples, and in the final CTA. Only the hero form receives `id="get-free-pills"`; all field IDs and label `for` values must remain unique.

- [ ] **Step 5: Run the acceptance test**

Run: `npm run test:homepage`

Expected: all form-count, field, endpoint, placement, and privacy assertions pass.

- [ ] **Step 6: Commit**

```bash
git add _config.yml themes/my-theme/layout/partial/homepage/newsletter-form.ejs themes/my-theme/layout/homepage.ejs scripts/verify-homepage.js
git commit -m "feat: add email-only newsletter forms"
```

## Task 5: Implement the hero and authentic Pill previews

**Files:**
- Create: `source/_data/homepage.yml`
- Create: `themes/my-theme/layout/partial/homepage/hero.ejs`
- Create: `themes/my-theme/layout/partial/homepage/email-preview.ejs`
- Create: `themes/my-theme/layout/partial/homepage/email-examples.ejs`
- Modify: `themes/my-theme/layout/homepage.ejs`
- Create: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`
- Modify: `themes/my-theme/source/css/styles.scss`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Confirm the content gate is satisfied**

Verify that Bartosz has provided the real Testing Pill described under “Required content input.” If not, pause this task without inserting synthetic copy.

- [ ] **Step 2: Add content and authenticity assertions**

Require the generated homepage to contain:

- `For JavaScript & TypeScript developers`;
- `Build web applications you can trust.`;
- `Security Tuesday` and `Testing Friday` above the fold;
- `under five minutes`;
- `900+ course enrollments across Web Security & Full-stack Testing`;
- the verified problem and solution snippets from both supplied Pills;
- no occurrence of `working JavaScript`, `900+ developers`, `900+ students`, `12-week`, `5-week`, `€19`, or `€37`.

- [ ] **Step 3: Store approved copy and real examples as data**

Create `source/_data/homepage.yml` with `hero`, `security_pill`, `testing_pill`, `proof`, and `author` keys. Code snippets must be plain data and escaped by EJS on output. Do not store raw executable HTML from emails.

- [ ] **Step 4: Build the split hero**

The left column contains audience, promise, two-email mechanism, under-five-minute commitment, hero form, double-opt-in/free/unsubscribe reassurance, and enrollment proof. The right column contains overlapping compact previews of both real emails, with Security and Testing visually distinguishable but equally weighted.

- [ ] **Step 5: Build the full authentic email examples**

Create a reusable `email-preview.ejs` partial that renders sender context, Pill label, problem, code sample, explanation, and solution. Use email/inbox visual language rather than generic course cards. Render one Security and one Testing example before the second form.

- [ ] **Step 6: Add isolated responsive styles**

Import `pages/newsletter-homepage` after the legacy homepage stylesheet. Scope every rule beneath `.newsletter-homepage-page` or `.newsletter-homepage`. Use a light editorial surface, technical code treatments, readable line lengths, and a single-column mobile layout. Do not modify or remove `pages/_homepage.scss`.

- [ ] **Step 7: Run the acceptance test**

Run: `npm run test:homepage`

Expected: hero, examples, forms, routing, and forbidden-copy checks pass.

- [ ] **Step 8: Commit**

```bash
git add source/_data/homepage.yml themes/my-theme/layout/partial/homepage themes/my-theme/layout/homepage.ejs themes/my-theme/source/css/pages/_newsletter-homepage.scss themes/my-theme/source/css/styles.scss scripts/verify-homepage.js
git commit -m "feat: present authentic Security and Testing Pills"
```

## Task 6: Add AI-era relevance, proof, author story, and final CTA

**Files:**
- Modify: `source/_data/homepage.yml`
- Create: `themes/my-theme/layout/partial/homepage/ai-judgment.ejs`
- Create: `themes/my-theme/layout/partial/homepage/proof.ejs`
- Create: `themes/my-theme/layout/partial/homepage/about-bartosz.ejs`
- Create: `themes/my-theme/layout/partial/homepage/final-cta.ejs`
- Modify: `themes/my-theme/layout/homepage.ejs`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Add assertions for the approved narrative**

Require:

```text
Code gets produced faster. Judgment doesn't.
Building production software since 2013. Teaching developers since 2017.
Dev Academy by Bartosz Pietrucha
```

If testimonials are included, assert their source-program labels are visible. Assert that company logos are introduced as companies where participating developers work, not as Dev Academy clients.

- [ ] **Step 2: Add the AI-era section**

Explain briefly that frameworks, packages, and coding agents can generate working-looking code, while developers still own verification and engineering judgment. Keep AI subordinate to the durable security-and-testing promise.

- [ ] **Step 3: Add defensible proof**

Use `900+ course enrollments` and the existing `logos-desktop.png` / `logos-mobile.png` only with explicit participant-company context. Use 2–3 legible reviews from the tracked `review_1.png`–`review_3.png` assets after confirming their original program, or use exact replacement copy supplied by Bartosz. Render `From a previous Web Security Academy program` or `From a previous Fullstack Testing Academy program` beside every review.

- [ ] **Step 4: Add Bartosz's author section**

Use an existing Bartosz portrait asset, the fixed 2013/2017 credibility line, and concise first-person copy connecting production work with the practical Pill format.

- [ ] **Step 5: Add the final CTA**

Restate the transformation and two-email weekly mechanism, then render the shared form with `homepage_final`. Do not introduce a paid product.

- [ ] **Step 6: Run the acceptance test**

Run: `npm run test:homepage`

Expected: all content and proof-rule assertions pass.

- [ ] **Step 7: Commit**

```bash
git add source/_data/homepage.yml themes/my-theme/layout/partial/homepage themes/my-theme/layout/homepage.ejs themes/my-theme/source/css/pages/_newsletter-homepage.scss scripts/verify-homepage.js
git commit -m "feat: complete newsletter homepage narrative"
```

## Task 7: Verify SEO, accessibility, responsiveness, and external Kit behavior

**Files:**
- Modify if needed: `themes/my-theme/layout/partial/head/meta.ejs`
- Modify if needed: `themes/my-theme/layout/partial/head/og.ejs`
- Modify if needed: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`
- Modify if needed: `themes/my-theme/layout/partial/homepage/*.ejs`
- Test: `scripts/verify-homepage.js`

- [ ] **Step 1: Complete static SEO assertions**

Assert:

- `/` title and description match `source/index.md`;
- `/` canonical is `https://dev-academy.com/`;
- `/articles/` canonical is `https://dev-academy.com/articles/`;
- sitemap contains `/`, `/articles/`, and the known unchanged post permalink;
- homepage has one `h1` and a logical heading hierarchy;
- meaningful images have alt text and decorative images use empty alt text.

- [ ] **Step 2: Run the complete automated verification**

Run:

```bash
npm run clean
npm run test:homepage
```

Expected: PASS with the verification script's single success line.

- [ ] **Step 3: Start Hexo in a managed background terminal**

Run `npm run dev` in a background terminal session and record the local URL printed by Hexo. Do not detach it with an untracked shell process; keep the session ID so it can be stopped after QA.

- [ ] **Step 4: Perform browser QA at desktop and mobile widths**

Verify `/`, `/articles/`, `/preventing-xss-in-angular/`, `/about/`, and `/podcast/` at 1440px and 390px widths. Check:

- no horizontal scroll;
- both Pill previews are readable;
- all three forms have unique labels/IDs;
- mobile navigation opens, traps no focus, closes, and reaches every approved link;
- keyboard focus is visible;
- reduced-motion preference disables nonessential animation;
- legacy article and About layouts remain usable.

- [ ] **Step 5: Verify the actual Kit form in a safe test submission**

Submit a controlled test email from the homepage, verify the check-your-inbox state, confirm double opt-in, and inspect Kit to confirm the subscriber enters both evergreen sequences. Do not send the address to PostHog or commit it. If the existing form does not enroll both sequences or redirect to the intended confirmation flow, treat that as an external configuration blocker; do not claim homepage acceptance until corrected in Kit.

- [ ] **Step 6: Stop the development server and inspect the diff**

Stop whichever server was started. Run:

```bash
git status --short
git diff --check
git diff --stat
```

Expected: no whitespace errors, no generated `public/` files staged, and no unrelated changes.

- [ ] **Step 7: Commit final refinements**

```bash
git add themes/my-theme/layout/homepage.ejs themes/my-theme/layout/layout.ejs themes/my-theme/layout/partial/header.ejs themes/my-theme/layout/partial/footer.ejs themes/my-theme/layout/partial/homepage themes/my-theme/source/css/pages/_newsletter-homepage.scss themes/my-theme/source/css/styles.scss source/index.md source/_data/homepage.yml _config.yml package.json scripts/verify-homepage.js
git commit -m "fix: polish newsletter homepage experience"
```

## Separate follow-up plans

Do not pull these into the homepage implementation:

1. Kit automation audit: double opt-in, both evergreen sequences, immediate Security Pill #1, next-Friday Testing Pill #1, and confirmation redirects.
2. `/welcome/` and `/welcome/security/` plus the 30-minute EUR 19 offer state.
3. `/security-starter-kit/` canonical sales page and EUR 37 fallback.
4. `/web-security/` closed-cohort lead funnel, checklist delivery, and cohort-interest capture.
5. Analytics schema v2 and confirmed-subscriber attribution without PII.
6. Contextual blog forms, stale modal removal, priority-article refreshes, and retired-domain link migration.
