# Homepage Hero Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Dev Academy homepage hero with the approved conversion-focused design and make the homepage use memory-only PostHog plus server-only Meta CAPI without a consent banner or persistent browser tracking.

**Architecture:** Keep the existing Hexo data/template/style separation: copy lives in `source/_data/homepage.yml`, semantic markup lives in homepage EJS partials, and responsive presentation lives in `_newsletter-homepage.scss`. Add a homepage-only `memory-only-server-capi` mode to the shared privacy runtime; all other pages retain the existing consent-managed PostHog and browser Pixel behavior. The homepage sends only a server-side Meta `Lead` on valid form submission, deriving `fbc` from the current page's `fbclid` in memory and never creating `_fbc`.

**Tech Stack:** Hexo 5, EJS, YAML, SCSS, browser JavaScript, PostHog JS, Netlify Edge Functions, Meta Conversions API, Node assertion tests, Playwright CLI for visual verification.

## Global Constraints

- The exact headline is `Your code works. Do you know if it’s secure and well tested?`.
- `secure` uses a restrained purple highlight; `tested` uses a restrained green highlight.
- The exact supporting copy is `Spot security risks and testing gaps — even in AI-generated code. Two practical lessons a week, under 5 minutes each.`
- The hero CTA is `Get the free lessons →`; the homepage header CTA is `Free lessons`.
- The exact reassurance is `Free. First Security lesson after confirmation. Unsubscribe anytime.`
- The hero has no audience/cadence eyebrow and no Tuesday/Friday cadence chips.
- Both miniature labels are exact: `Security Tuesday · 3-min email` and `Testing Friday · 4-min email`.
- Both detailed email examples below the hero remain unchanged.
- The proof is secondary and qualified as `900+ course enrollments` / `Previous Web Security & Full-stack Testing programs`.
- The homepage renders no cookie banner, consent dialog, or privacy-settings control.
- Homepage PostHog persistence is always `memory`; the homepage creates no `_fbc`, `_fbp`, PostHog cookie, localStorage identity, or stored consent decision.
- Homepage Meta measurement is server-only CAPI; it does not load or call the browser Pixel.
- Form submission remains email-only and Kit double opt-in remains unchanged.
- PostHog receives no email address, `fbclid`, raw query parameter, or form PII.
- Analytics or CAPI failure must never block Kit submission.
- Do not add dependencies or a new design framework.

## File Structure

- Modify `source/_data/homepage.yml`: approved hero copy, split highlighted headline tokens, miniature labels/content, and qualified proof.
- Modify `themes/my-theme/layout/partial/homepage/hero.ejs`: semantic hero order, highlighted tokens, miniature envelope icons, proof placement.
- Create `themes/my-theme/layout/partial/homepage/email-icon.ejs`: one reusable accessible decorative envelope SVG.
- Modify `themes/my-theme/layout/partial/homepage/newsletter-form.ejs`: optional reassurance text while preserving the default used by non-hero forms.
- Modify `themes/my-theme/layout/partial/header.ejs`: homepage-only `Free lessons` CTA label.
- Modify `themes/my-theme/layout/partial/footer.ejs`: omit the nonfunctional homepage privacy-settings button.
- Modify `themes/my-theme/layout/layout.ejs`: serialize homepage tracking mode and omit privacy controls on the homepage.
- Modify `themes/my-theme/source/css/pages/_newsletter-homepage.scss`: approved responsive hierarchy, highlights, form layout, email-like miniatures, and proof placement.
- Modify `themes/my-theme/source/js/privacy/consent-runtime.js`: homepage memory-only/server-CAPI mode, in-memory `fbc`, no browser Pixel, and one PostHog capture per event.
- Modify `themes/my-theme/source/js/main.js`: keep one safe newsletter event object and one server Meta Lead call for each valid submission.
- Modify `tests/verify-homepage.js`: exact content, structure, and CSS acceptance checks.
- Modify `tests/verify-privacy-runtime.js`: server-only mode, no persistence/Pixel, transient `fbc`, and single-capture regression checks.
- Modify `tests/verify-privacy-output.js`: homepage-only privacy output and unchanged consent behavior elsewhere.

---

### Task 1: Homepage-only memory analytics and server Meta conversion

**Files:**
- Modify: `tests/verify-privacy-runtime.js`
- Modify: `tests/verify-privacy-output.js`
- Modify: `themes/my-theme/layout/layout.ejs`
- Modify: `themes/my-theme/layout/partial/footer.ejs`
- Modify: `themes/my-theme/source/js/privacy/consent-runtime.js`
- Modify: `themes/my-theme/source/js/main.js`

**Interfaces:**
- Consumes: `window.DEV_ACADEMY_PRIVACY_CONFIG` and the existing `window.DevAcademyPrivacy.capture(event, properties)` / `trackMeta(event, properties)` API.
- Produces: serialized `trackingMode: 'memory-only-server-capi' | 'consent-managed'`; homepage `trackMeta('Lead', properties)` returns one event ID and sends one `/api/meta/events` request without calling `fbq`; other pages keep the existing consent API.

- [ ] **Step 1: Add failing runtime tests for single captures and homepage server-only mode**

Extend `VALID_CONFIG` in `tests/verify-privacy-runtime.js` with the default mode:

```js
trackingMode: 'consent-managed'
```

In the existing `loads PostHog asynchronously...` test, require one queued event and one pageview:

```js
assert.strictEqual(captures(harness, 'runtime_test').length, 1);
assert.strictEqual(captures(harness, '$pageview').length, 1);
```

Add this test after the memory-load test:

```js
test('keeps homepage tracking memory-only and sends one server Lead without browser identifiers', function() {
  var harness = createHarness({
    config: Object.assign({}, VALID_CONFIG, {
      trackingMode: 'memory-only-server-capi'
    }),
    pathname: '/',
    search: '?fbclid=test-click-123&utm_source=meta',
    eventIds: ['lead-event-id'],
    now: 1700000000000,
    rawConsent: JSON.stringify({
      schemaVersion: 1,
      persistentAnalytics: true,
      marketing: true
    })
  });

  assert.deepStrictEqual(plain(harness.api.getState()), {
    decided: true,
    persistentAnalytics: false,
    marketing: false
  });
  assert.strictEqual(harness.storageWrites.length, 0);
  harness.attachPostHog();
  var init = harness.calls.filter(function(call) { return call[0] === 'posthog:init'; })[0][2];
  assert.strictEqual(init.persistence, 'memory');

  assert.strictEqual(harness.api.trackMeta('Lead', {
    content_name: 'pills_eu_launch',
    content_category: 'newsletter'
  }), 'lead-event-id');

  var requests = harness.calls.filter(function(call) {
    return call[0] === 'fetch' && call[1] === '/api/meta/events';
  });
  assert.strictEqual(requests.length, 1);
  assert.deepStrictEqual(JSON.parse(requests[0][2].body), {
    event_name: 'Lead',
    event_id: 'lead-event-id',
    event_source_url: 'https://dev-academy.com/',
    fbc: 'fb.1.1700000000000.test-click-123',
    custom_data: {
      content_name: 'pills_eu_launch',
      content_category: 'newsletter'
    }
  });
  assert.strictEqual(harness.cookieWrites.length, 0);
  assert.strictEqual(harness.window.fbq, undefined);
});
```

- [ ] **Step 2: Add failing generated-output tests for the homepage privacy boundary**

Change the shared-control test in `tests/verify-privacy-output.js` so `articles` and `welcome` still require controls while `homepage` requires none:

```js
[articles, welcome].forEach(function(html) {
  assert.strictEqual(count(html, 'id="consent-banner"'), 1);
  assert.strictEqual(count(html, 'id="privacy-dialog"'), 1);
  assert(html.includes('data-open-privacy-settings'));
});
assert(!homepage.includes('id="consent-banner"'));
assert(!homepage.includes('id="privacy-dialog"'));
assert(!homepage.includes('data-open-privacy-settings'));
```

Update the serialized-config expectation:

```js
assert.deepStrictEqual(
  Object.keys(config).sort(),
  ['metaPixelId', 'posthogAssetHost', 'posthogHost', 'posthogKey', 'trackingMode']
);
assert.strictEqual(config.trackingMode, 'memory-only-server-capi');
```

Also parse the config from `articles/index.html` and require `trackingMode === 'consent-managed'`.

- [ ] **Step 3: Run the privacy tests and verify the red state**

Run:

```bash
npm run build:hexo
node tests/verify-privacy-runtime.js
node tests/verify-privacy-output.js
```

Expected: failures showing duplicate PostHog capture counts, missing `trackingMode`, homepage consent controls still present, and server-only `trackMeta` returning `null`.

- [ ] **Step 4: Serialize page-specific tracking mode and omit homepage controls**

In `themes/my-theme/layout/layout.ejs`, derive the mode once:

```ejs
<%
var homepageServerOnly = page.layout === 'homepage';
%>
```

Render privacy controls only when `homepageServerOnly` is false:

```ejs
<% if (!homepageServerOnly) { %>
    <%- partial('partial/privacy-controls', {footerless: page.layout === 'landing'}) %>
<% } %>
```

Add the mode to `privacyConfigJson`:

```js
trackingMode: homepageServerOnly ? 'memory-only-server-capi' : 'consent-managed'
```

In `themes/my-theme/layout/partial/footer.ejs`, wrap only the privacy-settings list item:

```ejs
<% if (page.layout !== 'homepage') { %>
  <li><button class="privacy-settings-footer" type="button" data-open-privacy-settings>Privacy settings</button></li>
<% } %>
```

Remove `{caches: true}` from the footer partial call in `layout.ejs` so the page-specific branch cannot leak between generated pages.

- [ ] **Step 5: Implement `memory-only-server-capi` in the shared runtime**

Near the runtime config declaration, add:

```js
var serverOnlyMode = config.trackingMode === 'memory-only-server-capi';
var state = serverOnlyMode ? {
  decided: true,
  persistentAnalytics: false,
  marketing: false
} : readState();
```

Update `currentFbc()` so server-only mode derives an in-memory value and never reads or writes a cookie:

```js
function currentFbc() {
  var existing;
  var created;
  if (serverOnlyMode) {
    return landingFbclid ?
      'fb.1.' + landingFbclidCapturedAt + '.' + landingFbclid : null;
  }
  if (!state.marketing) return null;
  existing = readCookie('_fbc');
  if (validFbc(existing)) return existing;
  if (!landingFbclid) return null;
  created = 'fb.1.' + landingFbclidCapturedAt + '.' + landingFbclid;
  try {
    document.cookie = '_fbc=' + created + '; Path=/; Max-Age=7776000; SameSite=Lax; Secure';
  } catch (error) {}
  return created;
}
```

Split the `sendMetaEvent()` precondition and browser call:

```js
if (config.enabled === false || typeof window.fetch !== 'function' ||
    allowedEvents.indexOf(eventName) === -1) {
  return null;
}
if (!serverOnlyMode && (!state.marketing || !isMetaConfigured() || !window.fbq)) {
  return null;
}
```

Keep the same CAPI payload and fetch. Guard only the browser Pixel call:

```js
if (!serverOnlyMode) {
  window.fbq('track', eventName, safeProperties, { eventID: eventId });
}
```

Do not call `loadMetaPixel()` in server-only mode:

```js
if (!serverOnlyMode && state.marketing) loadMetaPixel();
```

Force PostHog init to memory in server-only mode:

```js
persistence: serverOnlyMode ? 'memory' :
  (effectivePersistentAnalytics ? 'localStorage+cookie' : 'memory')
```

Remove the duplicated `posthogClient.capture(event, safeProperties);` line from `capture()` so each logical event is emitted once.

- [ ] **Step 6: Remove the duplicated newsletter property and preserve one Lead call**

In `themes/my-theme/source/js/main.js`, keep exactly one property:

```js
source_page: window.location.pathname
```

Do not add `fbclid` to PostHog properties or form inputs. Keep the existing single call:

```js
window.DevAcademyPrivacy.trackMeta('Lead', {
  content_name: 'pills_eu_launch',
  content_category: 'newsletter'
});
```

- [ ] **Step 7: Run the privacy tests and verify green**

Run:

```bash
npm run test:privacy
```

Expected: all privacy runtime, generated-output, and Meta Edge Function checks pass; the existing Node Sass deprecation warning is allowed.

- [ ] **Step 8: Commit the tracking boundary**

```bash
git add themes/my-theme/layout/layout.ejs \
  themes/my-theme/layout/partial/footer.ejs \
  themes/my-theme/source/js/privacy/consent-runtime.js \
  themes/my-theme/source/js/main.js \
  tests/verify-privacy-runtime.js \
  tests/verify-privacy-output.js
git commit -m "feat: make homepage analytics memory only"
```

---

### Task 2: Approved hero content and semantic markup

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `source/_data/homepage.yml`
- Modify: `themes/my-theme/layout/partial/homepage/hero.ejs`
- Create: `themes/my-theme/layout/partial/homepage/email-icon.ejs`
- Modify: `themes/my-theme/layout/partial/homepage/newsletter-form.ejs`
- Modify: `themes/my-theme/layout/partial/header.ejs`

**Interfaces:**
- Consumes: `homepage.hero` YAML data and the existing newsletter form partial parameters `placement`, `formId`, and `buttonLabel`.
- Produces: `homepage.hero.title.{before,security,middle,testing,after}`, `homepage.hero.summary`, `homepage.hero.proof.{value,context}`, and an optional `reassurance` form-partial parameter with the existing text as its fallback.

- [ ] **Step 1: Replace old hero assertions with exact approved-content assertions**

In `tests/verify-homepage.js`, remove assertions for the old audience/title/cadence and add:

```js
assert(homepage.includes('Your code works. Do you know if it’s'));
assert(homepage.includes('class="newsletter-highlight newsletter-highlight-security">secure</span>'));
assert(homepage.includes('class="newsletter-highlight newsletter-highlight-testing">tested</span>'));
assert(homepage.includes('Spot security risks and testing gaps — even in AI-generated code.'));
assert(homepage.includes('Two practical lessons a week, under 5 minutes each.'));
assert(!homepage.includes('For JavaScript &amp; TypeScript developers'));
assert(!homepage.includes('class="newsletter-cadence"'));
assert(homepage.includes('Get the free lessons →'));
assert(homepage.includes('Free. First Security lesson after confirmation. Unsubscribe anytime.'));
assert(homepage.includes('Security Tuesday · 3-min email'));
assert(homepage.includes('Testing Friday · 4-min email'));
assert.strictEqual(count(homepage, 'class="newsletter-mini-pill-icon"'), 2);
assert(homepage.includes('<strong>900+ course enrollments</strong>'));
assert(homepage.includes('Previous Web Security &amp; Full-stack Testing programs'));
```

Require that proof follows both miniatures by comparing string indexes, and keep the existing assertion that the detailed email partial contains exactly two `.newsletter-email-card` elements.

Add homepage header label checks:

```js
assert.strictEqual(count(homepage, '>Free lessons</a>'), 2);
assert(blogPost.includes('Get the free Pills'));
```

- [ ] **Step 2: Run the homepage test and verify the red state**

Run:

```bash
npm run test:homepage
```

Expected: failure because the generated hero still contains the old title, cadence chips, CTA, labels, and proof position.

- [ ] **Step 3: Restructure hero data around highlighted tokens**

Replace only the `hero` block in `source/_data/homepage.yml` with:

```yaml
hero:
  title:
    before: Your code works. Do you know if it’s
    security: secure
    middle: and well
    testing: tested
    after: "?"
  summary: Spot security risks and testing gaps — even in AI-generated code. Two practical lessons a week, under 5 minutes each.
  proof:
    value: 900+ course enrollments
    context: Previous Web Security & Full-stack Testing programs
  security_card:
    label: Security Tuesday
    time: 3-min email
    title: Can another website click your buttons?
    problem: An invisible iframe can turn a user's click into a real action.
    code: "Content-Security-Policy: frame-ancestors 'none';"
  testing_card:
    label: Testing Friday
    time: 4-min email
    title: Test your architecture before it drifts
    problem: Turn an architectural intention into an executable rule.
    code: controllers should not depend on APIs
```

Do not edit `security_pill`, `testing_pill`, or the detailed email-example data.

- [ ] **Step 4: Create the reusable decorative envelope partial**

Create `themes/my-theme/layout/partial/homepage/email-icon.ejs`:

```ejs
<svg class="newsletter-mini-pill-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/>
    <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 5: Implement the semantic hero order**

In `themes/my-theme/layout/partial/homepage/hero.ejs`:

- remove `.newsletter-eyebrow` and `.newsletter-cadence`;
- render title tokens with literal separating spaces outside the spans;
- pass the approved CTA and reassurance into the form partial;
- add the envelope partial inside both miniature metadata rows;
- combine each label/time as `<label> · <time>`;
- move `.newsletter-proof-line` after `.newsletter-hero-grid`.

The title block is:

```ejs
<h1 id="newsletter-hero-title"><%= homepage.hero.title.before %> <span class="newsletter-highlight newsletter-highlight-security"><%= homepage.hero.title.security %></span> <%= homepage.hero.title.middle %> <span class="newsletter-highlight newsletter-highlight-testing"><%= homepage.hero.title.testing %></span><%= homepage.hero.title.after %></h1>
```

The hero form call is:

```ejs
<%- partial('partial/homepage/newsletter-form', {
    placement: 'homepage_hero',
    formId: 'get-free-pills',
    buttonLabel: 'Get the free lessons →',
    reassurance: 'Free. First Security lesson after confirmation. Unsubscribe anytime.'
}) %>
```

The proof is:

```ejs
<p class="newsletter-proof-line"><strong><%= homepage.hero.proof.value %></strong><span><%= homepage.hero.proof.context %></span></p>
```

- [ ] **Step 6: Support hero-specific reassurance without changing other forms**

At the top of `newsletter-form.ejs`, define:

```ejs
var reassuranceText = typeof reassurance === 'string' ? reassurance : null;
```

Render the approved plain reassurance when supplied; otherwise retain the current generic double-opt-in text and privacy link. This keeps the after-examples and final forms unchanged.

- [ ] **Step 7: Change only homepage header CTA labels**

In `header.ejs`, derive:

```ejs
<% var pillsCtaLabel = page.layout === 'homepage' ? 'Free lessons' : 'Get the free Pills'; %>
```

Use `<%= pillsCtaLabel %>` for both mobile and desktop CTA anchors. Remove `{caches: true}` from the header partial call in `layout.ejs` so the homepage label cannot leak to article output.

- [ ] **Step 8: Build and run homepage checks**

Run:

```bash
npm run test:homepage
```

Expected: content and semantic assertions pass. CSS-specific assertions added in Task 3 may still be absent at this stage.

- [ ] **Step 9: Commit semantic hero content**

```bash
git add source/_data/homepage.yml \
  themes/my-theme/layout/layout.ejs \
  themes/my-theme/layout/partial/header.ejs \
  themes/my-theme/layout/partial/homepage/hero.ejs \
  themes/my-theme/layout/partial/homepage/email-icon.ejs \
  themes/my-theme/layout/partial/homepage/newsletter-form.ejs \
  tests/verify-homepage.js
git commit -m "feat: sharpen homepage hero message"
```

---

### Task 3: Responsive hero presentation and product miniatures

**Files:**
- Modify: `tests/verify-homepage.js`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss`

**Interfaces:**
- Consumes: `.newsletter-highlight-*`, `.newsletter-mini-pill-icon`, `.newsletter-proof-line`, and the semantic markup from Task 2.
- Produces: mobile-first form visibility near 382 × 800, relaxed headline rhythm, two overlapping email-like cards, qualified proof after the cards, and the existing desktop two-column layout.

- [ ] **Step 1: Add failing structural CSS checks**

In `tests/verify-homepage.js`, add regex assertions for:

```js
assert(/\.newsletter-hero-copy\s*\{[\s\S]*?h1\s*\{[\s\S]*?line-height:\s*1\.1;/.test(newsletterStyles));
assert(/\.newsletter-highlight-security\s*\{[\s\S]*?background:/.test(newsletterStyles));
assert(/\.newsletter-highlight-testing\s*\{[\s\S]*?background:/.test(newsletterStyles));
assert(/\.newsletter-mini-pill-icon\s*\{[\s\S]*?width:\s*2rem;/.test(newsletterStyles));
assert(/\.newsletter-proof-line\s*\{[\s\S]*?text-align:\s*center;/.test(newsletterStyles));
```

Also require the old `.newsletter-cadence` style block to be absent.

- [ ] **Step 2: Run the homepage test and verify CSS assertions fail**

Run:

```bash
npm run test:homepage
```

Expected: failure on the new highlight/icon/proof CSS assertions.

- [ ] **Step 3: Implement the mobile-first hero rhythm**

In `_newsletter-homepage.scss`:

- reduce mobile hero vertical padding to approximately `3rem 0 3.6rem`;
- set the mobile heading to `font-size: clamp(3.1rem, 8.5vw, 4.6rem)`, `line-height: 1.1`, `letter-spacing: -.036em`, and remove the old top margin reserved for the eyebrow;
- keep the summary at `1.5–1.55` line height and reduce its bottom spacing;
- keep the form stacked below 700 px and preserve existing focus/loading states;
- reduce the space before the first miniature so its top is visible in the mobile hero flow.

Add highlights:

```scss
.newsletter-highlight {
  border-radius: .5rem;
  box-decoration-break: clone;
  padding: 0 .08em;
  -webkit-box-decoration-break: clone;
}

.newsletter-highlight-security {
  background: #ded3ff;
  box-shadow: inset 0 -.13em 0 #9c7bff;
}

.newsletter-highlight-testing {
  background: #cff3e5;
  box-shadow: inset 0 -.13em 0 #53c49c;
}
```

- [ ] **Step 4: Make both miniatures read as emails without duplicating full email cards**

Keep the cards compact and overlapping. Update metadata to align the icon and single label:

```scss
.newsletter-mini-pill-meta {
  align-items: center;
  display: flex;
  gap: .8rem;
  justify-content: flex-start;
}

.newsletter-mini-pill-icon {
  flex: 0 0 auto;
  height: 2rem;
  width: 2rem;
}
```

Use the existing light/purple Security and dark/green Testing treatments. Do not add sender, recipient, toolbar, or avatar styles. Set mobile card width around `83–86%`, retain restrained rotation, and keep `@media (prefers-reduced-motion: reduce)` removing transforms.

- [ ] **Step 5: Place and style proof as secondary evidence**

Style `.newsletter-proof-line` as a centered block after the grid:

```scss
.newsletter-proof-line {
  border-top: .1rem solid var(--newsletter-line);
  color: var(--newsletter-muted);
  font-size: 1.15rem;
  line-height: 1.5;
  margin: 2.4rem auto 0;
  max-width: 76rem;
  padding-top: 1.6rem !important;
  text-align: center;

  strong,
  span {
    display: block;
  }

  strong {
    color: var(--newsletter-ink);
  }
}
```

- [ ] **Step 6: Preserve the desktop two-column layout**

At the existing `min-width: 960px` breakpoint:

- use hero padding around `7.2rem 0 7.8rem`;
- keep `grid-template-columns: minmax(0, 1.04fr) minmax(38rem, .96fr)`;
- set the desktop heading to `clamp(5rem, 5vw, 7.2rem)` with the same `1.1` line height;
- keep both miniatures visible with a minimum preview height around `42rem`;
- preserve the existing detailed email grid and all downstream sections.

- [ ] **Step 7: Build and run homepage checks**

Run:

```bash
npm run test:homepage
git diff --check
```

Expected: homepage suite passes and `git diff --check` exits `0`.

- [ ] **Step 8: Run responsive visual verification**

Start the local site:

```bash
npm run dev
```

Using the Playwright CLI wrapper, inspect:

```bash
/Users/bartosz/.codex/skills/playwright/scripts/playwright_cli.sh open "http://localhost:4000/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=testing_b&fbclid=visual-test"
```

Verify at 382 × 800 and 1440 × 1000:

- no consent banner/dialog appears;
- the mobile form field and CTA are visible without scrolling;
- headline lines do not collide and both highlights wrap cleanly;
- both miniature cards are readable and visibly email-like;
- `900+` proof is below the miniature pair;
- the next full email section still contains both detailed examples;
- no horizontal overflow occurs;
- keyboard focus is visible on the email field and CTA.

Save screenshots under `/private/tmp/dev-academy-hero-mobile.png` and `/private/tmp/dev-academy-hero-desktop.png`; do not commit them.

- [ ] **Step 9: Commit responsive hero styling**

```bash
git add themes/my-theme/source/css/pages/_newsletter-homepage.scss tests/verify-homepage.js
git commit -m "style: focus homepage hero conversion flow"
```

---

### Task 4: Full regression and release evidence

**Files:**
- Verify only; no new production file is expected.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a clean, fully tested commit series ready to push.

- [ ] **Step 1: Run every relevant automated suite**

Run:

```bash
npm run test:homepage
npm run test:privacy
npm run test:security
npm run test:pills
```

Expected: all suites pass. Existing Node Sass and Sharp deprecation warnings are allowed; assertion failures are not.

- [ ] **Step 2: Verify the generated homepage tracking boundary**

Run:

```bash
rg -n "consent-banner|privacy-dialog|data-open-privacy-settings|_fbc|fbevents.js" public/index.html
```

Expected: no matches in `public/index.html` for consent controls, `_fbc`, or the browser Pixel script. The shared runtime script itself remains loaded once.

Run:

```bash
rg -n "Your code works|Get the free lessons|3-min email|4-min email|900\+ course enrollments" public/index.html
```

Expected: all approved hero strings appear.

- [ ] **Step 3: Check repository hygiene and commit history**

Run:

```bash
git diff --check
git status --short
git log -4 --oneline
```

Expected: no unstaged production changes, no `.superpowers/brainstorm` files staged, and three focused implementation commits after the design/plan commits.

- [ ] **Step 4: Push only after all verification is green**

```bash
git push
```

Expected: the current `main` branch is pushed successfully to its configured upstream.
