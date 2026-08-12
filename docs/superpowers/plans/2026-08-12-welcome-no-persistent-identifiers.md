# Welcome Without Persistent Browser Identifiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/welcome` the same no-consent, memory-only PostHog and server-only Meta boundary as the homepage while renaming that mode to `no-persistent-browser-identifiers`.

**Architecture:** Resolve one page-level tracking mode in the shared layout. The homepage defaults to `no-persistent-browser-identifiers`; `/welcome` opts in through frontmatter; every other page defaults to `consent-managed`. The shared runtime consumes the renamed mode without changing its established behavior.

**Tech Stack:** Hexo frontmatter, EJS, browser JavaScript, Node.js acceptance scripts.

## Global Constraints

- The exact mode name is `no-persistent-browser-identifiers`.
- PostHog still collects browser events but always uses `persistence: 'memory'` in this mode.
- PostHog identity must not persist in cookies or localStorage.
- Meta browser Pixel must not load or execute in this mode.
- The `_fbc` cookie must not be read or written in this mode.
- Transient in-memory `fbc` derivation and explicit Meta CAPI events remain supported.
- Public consent mutations and cross-tab consent synchronization cannot enable persistence in this mode.
- `/welcome` must not emit a new Meta event.
- Kit redirect, double-opt-in instructions, confirmation state, Starter Kit flow, welcome copy, and welcome layout must not change.
- Other pages remain `consent-managed` unless they explicitly opt in.
- Do not modify dependencies, lockfiles, `main.js`, or form code.

---

### Task 1: Rename the mode and opt `/welcome` into it

**Files:**
- Modify: `source/welcome/index.html`
- Modify: `themes/my-theme/layout/layout.ejs`
- Modify: `themes/my-theme/source/js/privacy/consent-runtime.js`
- Modify: `tests/verify-privacy-runtime.js`
- Modify: `tests/verify-privacy-output.js`
- Modify: `tests/verify-homepage.js`

**Interfaces:**
- Consumes: optional Hexo page frontmatter `trackingMode` and the existing `window.DEV_ACADEMY_PRIVACY_CONFIG.trackingMode` string.
- Produces: resolved mode `no-persistent-browser-identifiers | consent-managed`; unchanged `window.DevAcademyPrivacy` API.

- [ ] **Step 1: Rename the mode in runtime tests before production code**

Replace all three `trackingMode: 'memory-only-server-capi'` fixtures in `tests/verify-privacy-runtime.js` with:

```js
trackingMode: 'no-persistent-browser-identifiers'
```

Rename the affected test descriptions from homepage/server-only wording to mode behavior:

```js
test('keeps non-persistent tracking in memory and sends one server Lead without browser identifiers', function() {
test('ignores external consent synchronization without persistent browser identifiers', function() {
test('ignores public consent mutations without persistent browser identifiers', function() {
```

- [ ] **Step 2: Add generated-output expectations for homepage, welcome, and articles**

In `tests/verify-privacy-output.js`, change the shared-consent check so only `articles` requires controls and both `homepage` and `welcome` require none:

```js
[articles].forEach(function(html) {
  assert(html.includes('Memory-only analytics and masked session replay are always active'));
  assert.strictEqual(count(html, 'id="consent-banner"'), 1);
  assert.strictEqual(count(html, 'id="privacy-dialog"'), 1);
  assert.strictEqual(count(html, 'id="persistent-analytics-consent"'), 1);
  assert.strictEqual(count(html, 'id="marketing-consent"'), 1);
  assert(html.includes('data-accept-all'));
  assert(html.includes('data-reject-all'));
  assert(html.includes('data-save-privacy-settings'));
  assert(html.includes('data-open-privacy-settings'));
});
[homepage, welcome].forEach(function(html) {
  assert(!html.includes('id="consent-banner"'));
  assert(!html.includes('id="privacy-dialog"'));
  assert(!html.includes('data-open-privacy-settings'));
});
```

Remove the obsolete `privacy-settings-compact` expectation for welcome.

In the serialized-config check, parse homepage, welcome, and articles independently and assert:

```js
assert.strictEqual(config.trackingMode, 'no-persistent-browser-identifiers');

const welcomeMatch = welcome.match(/window\.DEV_ACADEMY_PRIVACY_CONFIG\s*=\s*({[^;]+});/);
assert(welcomeMatch, 'missing serialized privacy config on welcome');
const welcomeConfig = vm.runInNewContext('(' + welcomeMatch[1] + ')');
assert.strictEqual(welcomeConfig.trackingMode, 'no-persistent-browser-identifiers');

assert.strictEqual(articlesConfig.trackingMode, 'consent-managed');
```

In `tests/verify-homepage.js`, replace the current welcome settings assertion:

```js
assert(!welcome.includes('data-open-privacy-settings'));
assert(!welcome.includes('id="consent-banner"'));
assert(!welcome.includes('id="privacy-dialog"'));
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
node tests/verify-privacy-runtime.js
node tests/verify-privacy-output.js
node tests/verify-homepage.js
```

Expected:

- runtime tests fail because the old runtime does not recognize `no-persistent-browser-identifiers`;
- output tests fail because homepage still serializes the old name and welcome still renders consent controls;
- homepage test fails because welcome still exposes privacy settings.

- [ ] **Step 4: Opt `/welcome` into the renamed mode**

Add this frontmatter field to `source/welcome/index.html`:

```yaml
trackingMode: no-persistent-browser-identifiers
```

Do not change the page body or other frontmatter.

- [ ] **Step 5: Resolve tracking mode once in the shared layout**

Replace `homepageServerOnly` in `themes/my-theme/layout/layout.ejs` with:

```ejs
<%
var noPersistentBrowserIdentifiersMode = 'no-persistent-browser-identifiers';
var pageTrackingMode = page.trackingMode ||
    (page.layout === 'homepage' ? noPersistentBrowserIdentifiersMode : 'consent-managed');
var noPersistentBrowserIdentifiers = pageTrackingMode === noPersistentBrowserIdentifiersMode;
var privacy = config.privacy || {};
%>
```

Render privacy controls only outside this mode:

```ejs
<% if (!noPersistentBrowserIdentifiers) { %>
<%- partial('partial/privacy-controls', {footerless: page.layout === 'landing'}) %>
<% } %>
```

Serialize the resolved value directly:

```js
trackingMode: pageTrackingMode
```

- [ ] **Step 6: Rename the runtime predicate without changing behavior**

In `themes/my-theme/source/js/privacy/consent-runtime.js`, replace:

```js
var serverOnlyMode = config.trackingMode === 'memory-only-server-capi';
```

with:

```js
var noPersistentBrowserIdentifiers =
  config.trackingMode === 'no-persistent-browser-identifiers';
```

Replace every use of `serverOnlyMode` with `noPersistentBrowserIdentifiers`. Do not change the guarded branches or CAPI payload behavior.

- [ ] **Step 7: Verify no obsolete mode references remain**

Run:

```bash
rg -n "memory-only-server-capi|serverOnlyMode|homepageServerOnly" themes tests source
```

Expected: no matches.

- [ ] **Step 8: Run complete relevant suites**

Run:

```bash
npm run test:privacy
npm run test:homepage
npm run test:security
git diff --check
```

Expected: all assertions pass and `git diff --check` exits 0. Known non-fatal local Sharp/node-sass plugin warnings are allowed.

- [ ] **Step 9: Verify repository scope and commit**

Run:

```bash
git status --short
git diff -- source/welcome/index.html themes/my-theme/layout/layout.ejs themes/my-theme/source/js/privacy/consent-runtime.js tests/verify-privacy-runtime.js tests/verify-privacy-output.js tests/verify-homepage.js
```

Do not stage the pre-existing untracked `.playwright-cli/` directory.

Commit only the six task files:

```bash
git add source/welcome/index.html \
  themes/my-theme/layout/layout.ejs \
  themes/my-theme/source/js/privacy/consent-runtime.js \
  tests/verify-privacy-runtime.js \
  tests/verify-privacy-output.js \
  tests/verify-homepage.js
git commit -m "feat: remove persistent tracking from welcome"
```

