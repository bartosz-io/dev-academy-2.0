# Shared Consent and Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Dev Academy and the reverse-proxied Browser Security Starter Kit independent consent runtimes that share one versioned preference, one PostHog project, persistent identity, masked session replay, and consent-gated Meta Pixel behavior on `dev-academy.com`.

**Architecture:** Implement the same pure consent contract and browser API separately in both repositories. Production same-origin storage under `dev_academy_consent_v1` synchronizes the applications; the Netlify proxy remains a delivery rule and does not inject consent code. Each application owns its UI and styles, while matching contract tests and a final production-origin browser test prevent semantic drift.

**Tech Stack:** Hexo 5/EJS/SCSS/vanilla JavaScript on Node 14.20.1, Astro 6/ES modules on Node 22.12+, Node built-in assertions/tests, PostHog Web SDK, Meta Pixel, Netlify reverse proxy, Cloudflare Pages, Playwright browser verification.

## Global Constraints

- Work in `/Users/bartosz/Projects/browser-security-starter-kit` for Starter Kit tasks and `/Users/bartosz/Projects/dev-academy` for main-site tasks.
- Preserve the untracked `/Users/bartosz/Projects/browser-security-starter-kit/docs/ads-report-1.csv`; never stage or modify it.
- Use the localStorage key `dev_academy_consent_v1` and schema `{ schemaVersion: 1, persistentAnalytics: boolean, marketing: boolean }` exactly.
- Ignore `bssk_consent_preferences`; do not migrate or use it as a fallback.
- PostHog and masked session replay run before a decision with `persistence: 'memory'`.
- `persistentAnalytics` changes only PostHog persistence; `marketing` changes only Meta Pixel loading.
- Use one Dev Academy PostHog key, ingest host, and asset host in both production builds.
- Configure `autocapture: false`, `capture_pageview: false`, `person_profiles: 'identified_only'`, and session replay with all form inputs masked.
- Never send names, email addresses, subscriber IDs, form contents, arbitrary query parameters, or full referrer URLs to analytics.
- New custom events include `event_schema_version: 2` and `page_path`.
- Keep consent copy and semantics identical; keep styling local to each application.
- Do not add a runtime dependency or move consent logic into the reverse proxy.
- Do not deploy until the privacy notice explicitly describes memory-only analytics and replay before a decision and the responsible owner approves the wording.

---

### Task 1: Starter Kit consent contract

**Files:**
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/src/privacy/consent-contract.mjs`
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/tests/consent-contract.test.mjs`
- Modify: `/Users/bartosz/Projects/browser-security-starter-kit/package.json`

**Interfaces:**
- Consumes: raw localStorage string values.
- Produces: `CONSENT_KEY`, `SCHEMA_VERSION`, `DEFAULT_CONSENT`, `parseConsent(raw)`, and `serializeConsent(preferences)`.

- [ ] **Step 1: Write the failing contract test**

Create `tests/consent-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSENT_KEY,
  SCHEMA_VERSION,
  parseConsent,
  serializeConsent,
} from '../src/privacy/consent-contract.mjs';

test('uses the shared v1 contract', () => {
  assert.equal(CONSENT_KEY, 'dev_academy_consent_v1');
  assert.equal(SCHEMA_VERSION, 1);
});

test('treats absent, malformed, and unsupported values as undecided', () => {
  for (const raw of [null, '', '{', '{}', '{"schemaVersion":2,"persistentAnalytics":true,"marketing":true}']) {
    assert.deepEqual(parseConsent(raw), {
      decided: false,
      persistentAnalytics: false,
      marketing: false,
    });
  }
});

test('accepts only a complete v1 decision', () => {
  const raw = '{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}';
  assert.deepEqual(parseConsent(raw), {
    decided: true,
    persistentAnalytics: true,
    marketing: false,
  });
});

test('serializes both booleans and no extra data', () => {
  assert.equal(
    serializeConsent({ persistentAnalytics: false, marketing: true }),
    '{"schemaVersion":1,"persistentAnalytics":false,"marketing":true}'
  );
});
```

Add to `package.json`:

```json
"test:privacy": "node --test tests/consent-contract.test.mjs tests/privacy-runtime.test.mjs tests/verify-privacy-output.mjs"
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `node --test tests/consent-contract.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `consent-contract.mjs`.

- [ ] **Step 3: Implement the pure contract**

Create `src/privacy/consent-contract.mjs`:

```js
export const CONSENT_KEY = 'dev_academy_consent_v1';
export const SCHEMA_VERSION = 1;
export const DEFAULT_CONSENT = Object.freeze({
  decided: false,
  persistentAnalytics: false,
  marketing: false,
});

export function parseConsent(raw) {
  try {
    const value = JSON.parse(raw);
    if (
      value?.schemaVersion === SCHEMA_VERSION &&
      typeof value.persistentAnalytics === 'boolean' &&
      typeof value.marketing === 'boolean'
    ) {
      return {
        decided: true,
        persistentAnalytics: value.persistentAnalytics,
        marketing: value.marketing,
      };
    }
  } catch {}
  return { ...DEFAULT_CONSENT };
}

export function serializeConsent({ persistentAnalytics, marketing }) {
  return JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    persistentAnalytics: persistentAnalytics === true,
    marketing: marketing === true,
  });
}
```

- [ ] **Step 4: Run the contract test**

Run: `node --test tests/consent-contract.test.mjs`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the contract**

```bash
git add package.json src/privacy/consent-contract.mjs tests/consent-contract.test.mjs
git commit -m "Add shared consent contract"
```

---

### Task 2: Starter Kit privacy runtime

**Files:**
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/src/privacy/privacy-runtime.mjs`
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/tests/privacy-runtime.test.mjs`

**Interfaces:**
- Consumes: `createPrivacyRuntime({ storage, posthog, loadMetaPixel, revokeMetaPixel, reload, pagePath })` and the Task 1 contract.
- Produces: `{ getState, setPreferences, acceptAll, rejectAll, subscribe, capture, applyExternalState }`.

- [ ] **Step 1: Write failing transition tests**

Create `tests/privacy-runtime.test.mjs` using fakes instead of a DOM dependency:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrivacyRuntime } from '../src/privacy/privacy-runtime.mjs';

function harness(initial = null) {
  const values = new Map(initial ? [['dev_academy_consent_v1', initial]] : []);
  const calls = [];
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      calls.push(['storage:set', key, value]);
      values.set(key, value);
    },
  };
  const posthog = {
    set_config: (value) => calls.push(['set_config', value]),
    capture: (event, properties) => calls.push(['capture', event, properties]),
    reset: (resetDeviceId) => calls.push(['reset', resetDeviceId]),
    persistence: { clear: () => calls.push(['persistence:clear']) },
  };
  const runtime = createPrivacyRuntime({
    storage,
    posthog,
    loadMetaPixel: () => calls.push(['meta', 'load']),
    revokeMetaPixel: () => calls.push(['meta', 'revoke']),
    reload: () => calls.push(['reload']),
    pagePath: '/security-starter-kit/',
  });
  return { runtime, values, calls };
}

test('starts undecided without vendor persistence', () => {
  const { runtime } = harness();
  assert.deepEqual(runtime.getState(), {
    decided: false,
    persistentAnalytics: false,
    marketing: false,
  });
});

test('accept all persists PostHog and loads Meta', async () => {
  const { runtime, values, calls } = harness();
  await runtime.acceptAll();
  assert.equal(values.get('dev_academy_consent_v1'), '{"schemaVersion":1,"persistentAnalytics":true,"marketing":true}');
  assert(calls.some(([name, value]) => name === 'set_config' && value.persistence === 'localStorage+cookie'));
  assert(calls.some((call) => call.join(':') === 'meta:load'));
});

test('reject all leaves PostHog in memory and never loads Meta', async () => {
  const { runtime, calls } = harness();
  await runtime.rejectAll();
  assert(calls.some(([name, value]) => name === 'set_config' && value.persistence === 'memory'));
  assert(!calls.some((call) => call.join(':') === 'meta:load'));
});

test('revocation resets durable identity and reloads after Meta revoke', async () => {
  const initial = '{"schemaVersion":1,"persistentAnalytics":true,"marketing":true}';
  const { runtime, calls } = harness(initial);
  await runtime.setPreferences({ persistentAnalytics: false, marketing: false }, 'save_preferences');
  assert(calls.some(([name]) => name === 'reset'));
  assert(calls.some((call) => call.join(':') === 'meta:revoke'));
  assert(calls.some((call) => call.join(':') === 'reload'));
});

test('storage synchronization does not write the shared key again', async () => {
  const { runtime, calls } = harness();
  await runtime.applyExternalState(
    '{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}'
  );
  assert(!calls.some(([name]) => name === 'storage:set'));
});
```

- [ ] **Step 2: Run the runtime test and verify it fails**

Run: `node --test tests/privacy-runtime.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `privacy-runtime.mjs`.

- [ ] **Step 3: Implement the state machine**

Create `src/privacy/privacy-runtime.mjs`. Keep vendor loading outside the state machine and inject it through the constructor:

```js
import { CONSENT_KEY, parseConsent, serializeConsent } from './consent-contract.mjs';

export function createPrivacyRuntime(options) {
  const listeners = new Set();
  let state = parseConsent(options.storage?.getItem(CONSENT_KEY) ?? null);

  const notify = () => listeners.forEach((listener) => listener({ ...state }));
  const capture = (event, properties = {}) => options.posthog?.capture(event, {
    event_schema_version: 2,
    page_path: options.pagePath,
    ...properties,
  });

  async function applyState(next, { action, persist }) {
    const previous = state;
    state = {
      decided: true,
      persistentAnalytics: next.persistentAnalytics === true,
      marketing: next.marketing === true,
    };
    if (persist) {
      try {
        options.storage?.setItem(CONSENT_KEY, serializeConsent(state));
      } catch {}
    }

    const revokedPersistence = previous.persistentAnalytics && !state.persistentAnalytics;
    const revokedMarketing = previous.marketing && !state.marketing;
    if (revokedPersistence) {
      options.posthog?.reset?.(true);
      options.posthog?.persistence?.clear?.();
    } else {
      options.posthog?.set_config?.({
        persistence: state.persistentAnalytics ? 'localStorage+cookie' : 'memory',
      });
    }

    if (state.marketing) options.loadMetaPixel?.();
    if (revokedMarketing) options.revokeMetaPixel?.();

    if (persist) {
      capture('consent_preferences_updated', {
        action,
        persistent_analytics: state.persistentAnalytics,
        marketing: state.marketing,
      });
    }
    notify();

    if (revokedPersistence || revokedMarketing) options.reload?.();
    return { ...state };
  }

  const setPreferences = (next, action = 'save_preferences') =>
    applyState(next, { action, persist: true });

  return {
    getState: () => ({ ...state }),
    setPreferences,
    acceptAll: () => setPreferences({ persistentAnalytics: true, marketing: true }, 'accept_all'),
    rejectAll: () => setPreferences({ persistentAnalytics: false, marketing: false }, 'reject_all'),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    capture,
    applyExternalState(raw) {
      const external = parseConsent(raw);
      if (!external.decided) return;
      return applyState(external, { action: 'storage_sync', persist: false });
    },
  };
}
```

The revocation order is deliberate: save the false preference, call
`posthog.reset(true)`, call `posthog.persistence.clear()`, then reload. The next
page load initializes a fresh memory-only ID. Task 7 verifies that the old
durable key/cookie is gone.

- [ ] **Step 4: Run both privacy unit suites**

Run: `node --test tests/consent-contract.test.mjs tests/privacy-runtime.test.mjs`

Expected: all tests PASS.

- [ ] **Step 5: Commit the runtime**

```bash
git add src/privacy/privacy-runtime.mjs tests/privacy-runtime.test.mjs
git commit -m "Add Starter Kit privacy runtime"
```

---

### Task 3: Starter Kit UI and analytics adapter

**Files:**
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/src/components/PrivacyControls.astro`
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/src/privacy/browser-adapter.mjs`
- Create: `/Users/bartosz/Projects/browser-security-starter-kit/tests/verify-privacy-output.mjs`
- Modify: `/Users/bartosz/Projects/browser-security-starter-kit/src/components/LandingPage.astro`
- Modify: `/Users/bartosz/Projects/browser-security-starter-kit/src/config/site.ts`
- Modify: `/Users/bartosz/Projects/browser-security-starter-kit/package.json`
- Modify: `/Users/bartosz/Projects/browser-security-starter-kit/README.md`

**Interfaces:**
- Consumes: `createPrivacyRuntime` from Task 2 and `siteConfig.posthog`/`siteConfig.meta`.
- Produces: `window.DevAcademyPrivacy`, identical consent markup semantics, explicit Starter Kit events, and no inline vendor state machine in `LandingPage.astro`.

- [ ] **Step 1: Add a failing built-output contract test**

Create `tests/verify-privacy-output.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('renders the shared consent semantics', () => {
  assert.match(html, /Help debug this website/);
  assert.match(html, /Memory-only analytics and masked session replay are always active/);
  assert.match(html, /Remember visits/);
  assert.match(html, /Marketing measurement/);
  assert.match(html, /Accept all/);
  assert.match(html, /Reject all/);
  assert.match(html, /Privacy settings/);
});

test('loads the extracted adapter and removes the legacy key', () => {
  assert.match(html, /DevAcademyPrivacy/);
  assert.doesNotMatch(html, /bssk_consent_preferences/);
});
```

- [ ] **Step 2: Run the output test and verify it fails**

Run: `npm run build && node --test tests/verify-privacy-output.mjs`

Expected: FAIL because the current copy and inline legacy key do not match.

- [ ] **Step 3: Extract consent markup and local styles**

Create `PrivacyControls.astro` with the existing banner/dialog structure. Use this exact shared copy in both repositories:

```astro
<section class="consent-banner" id="consent-banner" aria-label="Privacy preferences" hidden>
  <div>
    <h2>Help debug this website</h2>
    <p>Memory-only analytics and masked session replay are always active. You can separately allow us to remember visits and measure marketing performance.</p>
  </div>
  <div class="consent-actions">
    <button type="button" data-open-privacy-settings>Configure</button>
    <button type="button" data-accept-all>Accept all</button>
  </div>
</section>
```

Move the full existing dialog markup and consent-specific CSS from `LandingPage.astro` into the component. Preserve focusable labels, `dialog`, close control, two checkboxes, `Save preferences`, `Reject all`, and `Accept all`. Add `<PrivacyControls />` next to the footer.

- [ ] **Step 4: Implement the browser adapter**

Create `browser-adapter.mjs` with this exported boundary:

```js
export function initializePrivacyControls(config) {
  // Returns the public runtime synchronously, starts vendor loading in the
  // background, drains queued captures after PostHog loads, binds the consent
  // controls, and registers exactly one storage listener.
}
```

The returned runtime must not await a network request. Its `capture()` queues
events until PostHog loads, and discards the queue without affecting the page if
the SDK fails. Initialize PostHog with:

```js
window.posthog.init(config.posthogKey, {
  api_host: config.posthogHost,
  autocapture: false,
  capture_pageview: false,
  person_profiles: 'identified_only',
  persistence: initialState.persistentAnalytics ? 'localStorage+cookie' : 'memory',
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
});
```

Derive `$current_url` from `location.origin + location.pathname`, derive referrer with `new URL(document.referrer).hostname`, and emit one explicit `$pageview`. Load `https://connect.facebook.net/en_US/fbevents.js` only inside the injected `loadMetaPixel` callback.

Bind controls with one selector map so markup and behavior cannot drift:

```js
const controls = {
  banner: document.querySelector('#consent-banner'),
  dialog: document.querySelector('#privacy-dialog'),
  persistentAnalytics: document.querySelector('#persistent-analytics-consent'),
  marketing: document.querySelector('#marketing-consent'),
  acceptAll: document.querySelectorAll('[data-accept-all]'),
  rejectAll: document.querySelector('[data-reject-all]'),
  save: document.querySelector('[data-save-privacy-settings]'),
  open: document.querySelectorAll('[data-open-privacy-settings]'),
};
```

Show the banner and emit `consent_banner_viewed` only for an undecided state.
On `storage`, call `runtime.applyExternalState(event.newValue)` only when
`event.key === 'dev_academy_consent_v1'`.

- [ ] **Step 5: Replace the inline consent/vendor code**

Delete `consentKey`, `readConsent`, `posthogReady`, `applyPosthogPersistence`, `loadMetaPixel`, and `revokeMetaPixel` from `LandingPage.astro`. Replace the current `define:vars` script with an Astro-bundled script that imports `initializePrivacyControls`. Put the public values in escaped `data-*` attributes on `<body>` and read them before initializing the runtime:

```astro
<body
  data-variant={variant}
  data-posthog-key={siteConfig.posthog.key}
  data-posthog-host={siteConfig.posthog.host}
  data-posthog-asset-host={siteConfig.posthog.assetHost}
  data-meta-pixel-id={siteConfig.meta.pixelId}
>
```

```js
import { initializePrivacyControls } from '../privacy/browser-adapter.mjs';

const config = document.body.dataset;
window.DevAcademyPrivacy = initializePrivacyControls({
  posthogKey: config.posthogKey,
  posthogHost: config.posthogHost,
  posthogAssetHost: config.posthogAssetHost,
  metaPixelId: config.metaPixelId,
});
```

Keep the remaining landing behavior in the same bundled script after runtime
initialization. Replace the local `capture()` implementation with:

```js
const capture = (event, properties = {}) =>
  window.DevAcademyPrivacy?.capture(event, { variant, product: productName, ...properties });
```

Rename `checkout_clicked` to `checkout_started`; keep `placement`, actual price, currency, offer state, and coupon state. Do not forward `subscription` or email-like values.

- [ ] **Step 6: Remove unsafe production fallbacks**

Keep `.env.example` placeholders. In `site.ts`, replace the embedded real PostHog fallback with `phc_placeholder`; production must receive `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_POSTHOG_ASSET_HOST`, and `PUBLIC_META_PIXEL_ID` from Cloudflare Pages environment variables.

- [ ] **Step 7: Run all Starter Kit checks**

Run:

```bash
npm run build
node --test tests/consent-contract.test.mjs tests/privacy-runtime.test.mjs tests/verify-privacy-output.mjs
npm run test:offer-bar
```

Expected: all privacy tests PASS, the offer-bar suite remains green, `/` and `/ai/` build, and `rg -n 'bssk_consent_preferences' dist src` returns no matches.

- [ ] **Step 8: Commit the UI and adapter**

```bash
git add package.json README.md src/components/PrivacyControls.astro src/components/LandingPage.astro src/config/site.ts src/privacy/browser-adapter.mjs tests/verify-privacy-output.mjs
git commit -m "Unify Starter Kit consent behavior"
```

---

### Task 4: Dev Academy consent contract and runtime

**Files:**
- Create: `/Users/bartosz/Projects/dev-academy/themes/my-theme/source/js/privacy/consent-runtime.js`
- Create: `/Users/bartosz/Projects/dev-academy/scripts/privacy-config.js`
- Create: `/Users/bartosz/Projects/dev-academy/tests/verify-privacy-runtime.js`
- Modify: `/Users/bartosz/Projects/dev-academy/package.json`
- Modify: `/Users/bartosz/Projects/dev-academy/_prod.yml`
- Modify: `/Users/bartosz/Projects/dev-academy/_dev.yml`

**Interfaces:**
- Consumes: `window.DEV_ACADEMY_PRIVACY_CONFIG` and the same consent schema as Task 1.
- Produces: `window.DevAcademyPrivacy` with the exact API approved in the design.

- [ ] **Step 1: Write a failing VM-based runtime test**

Create `tests/verify-privacy-runtime.js` using Node 14-compatible CommonJS, `assert`, `fs`, and `vm`. Execute `consent-runtime.js` in a fake `window`/`document` context and assert:

```js
assert.strictEqual(context.window.DevAcademyPrivacy.CONSENT_KEY, 'dev_academy_consent_v1');
assert.deepStrictEqual(context.window.DevAcademyPrivacy.getState(), {
  decided: false,
  persistentAnalytics: false,
  marketing: false
});
context.window.DevAcademyPrivacy.acceptAll();
assert.strictEqual(
  storage.dev_academy_consent_v1,
  '{"schemaVersion":1,"persistentAnalytics":true,"marketing":true}'
);
```

Add `node tests/verify-privacy-runtime.js` to a new `test:privacy` script after `npm run build:hexo`.

- [ ] **Step 2: Run the test and verify the runtime is missing**

Run: `node tests/verify-privacy-runtime.js`

Expected: FAIL with `ENOENT` for `consent-runtime.js`.

- [ ] **Step 3: Implement the Node-14-compatible browser runtime**

Create an IIFE in `consent-runtime.js`. Avoid optional chaining and other syntax
unsupported by the repository's Node 14 build path. Use these exact internal
names and public boundary:

```js
(function(window, document) {
  'use strict';

  var CONSENT_KEY = 'dev_academy_consent_v1';
  var SCHEMA_VERSION = 1;
  var listeners = [];
  var captureQueue = [];
  var posthogClient = null;
  var state = readState();

  function parseConsent(raw) {
    try {
      var value = JSON.parse(raw);
      if (value.schemaVersion === 1 &&
          typeof value.persistentAnalytics === 'boolean' &&
          typeof value.marketing === 'boolean') {
        return {
          decided: true,
          persistentAnalytics: value.persistentAnalytics,
          marketing: value.marketing
        };
      }
    } catch (error) {}
    return { decided: false, persistentAnalytics: false, marketing: false };
  }

  function serializeConsent(value) {
    return JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      persistentAnalytics: value.persistentAnalytics === true,
      marketing: value.marketing === true
    });
  }

  function copyState(value) {
    return {
      decided: value.decided,
      persistentAnalytics: value.persistentAnalytics,
      marketing: value.marketing
    };
  }

  function readState() {
    try { return parseConsent(window.localStorage.getItem(CONSENT_KEY)); }
    catch (error) { return parseConsent(null); }
  }

  window.DevAcademyPrivacy = {
    CONSENT_KEY: CONSENT_KEY,
    getState: function() { return copyState(state); },
    setPreferences: function(next) { return applyState(next, 'save_preferences', true); },
    acceptAll: function() { return applyState({ persistentAnalytics: true, marketing: true }, 'accept_all', true); },
    rejectAll: function() { return applyState({ persistentAnalytics: false, marketing: false }, 'reject_all', true); },
    subscribe: function(listener) {
      listeners.push(listener);
      return function() {
        listeners = listeners.filter(function(candidate) { return candidate !== listener; });
      };
    },
    capture: capture,
    applyExternalState: function(raw) {
      var external = parseConsent(raw);
      if (external.decided) applyState(external, 'storage_sync', false);
    }
  };

  loadPostHog();
  if (state.marketing) loadMetaPixel();
}(window, document));
```

Implement `capture`, `applyState`, `loadPostHog`, `loadMetaPixel`, and
`revokeMetaPixel` directly above the public assignment. `capture` creates a new
properties object containing `event_schema_version: 2` and
`page_path: window.location.pathname`; it pushes `[event, properties]` into
`captureQueue` while `posthogClient` is null. `loadPostHog` appends one async
`assetHost + '/static/array.js'` script, initializes the SDK in `onload`, assigns
`posthogClient`, sends an explicit query-free `$pageview`, and drains the queue.
`onerror` empties the queue and does not retry. `loadMetaPixel` returns early for
an empty/disabled ID or an existing `window.fbq`, and otherwise executes the
standard Meta bootstrap once. `revokeMetaPixel` calls
`window.fbq('consent', 'revoke')` only when `window.fbq` exists.

`applyState` uses the approved transition table:

| Transition | Required actions |
| --- | --- |
| false → true persistent analytics | set SDK persistence to `localStorage+cookie` |
| true → false persistent analytics | save consent, `reset(true)`, `persistence.clear()`, reload |
| false → true marketing | load Pixel once, grant consent, emit PageView/ViewContent once |
| true → false marketing | save consent, revoke Pixel consent, reload |
| storage sync | apply vendor transition and notify UI without another storage write or consent event |

Expose `CONSENT_KEY` for contract verification but never expose vendor keys
through event properties.

Initialize PostHog from `window.DEV_ACADEMY_PRIVACY_CONFIG` with the same options as Starter Kit. Load the SDK from `assetHost + '/static/array.js'`. If configuration is absent or placeholder-valued, keep consent controls functional and skip the vendor request.

- [ ] **Step 4: Replace boolean environment flags with explicit public config**

Set development defaults in `_dev.yml`:

```yaml
privacy:
  enabled: true
  posthog_key: phc_placeholder
  posthog_host: https://p.dev-academy.com
  posthog_asset_host: https://eu-assets.i.posthog.com
  meta_pixel_id: '000000000000000'
```

Use the same placeholder defaults in `_prod.yml`. Create the Hexo
`scripts/privacy-config.js` filter to apply Netlify build variables without
writing generated secrets or IDs back to tracked files:

```js
'use strict';

hexo.extend.filter.register('before_generate', function() {
  var privacy = hexo.config.privacy || {};
  privacy.posthog_key = process.env.PUBLIC_POSTHOG_KEY || privacy.posthog_key;
  privacy.posthog_host = process.env.PUBLIC_POSTHOG_HOST || privacy.posthog_host;
  privacy.posthog_asset_host = process.env.PUBLIC_POSTHOG_ASSET_HOST || privacy.posthog_asset_host;
  privacy.meta_pixel_id = process.env.PUBLIC_META_PIXEL_ID || privacy.meta_pixel_id;
  hexo.config.privacy = privacy;
});
```

Do not commit the real Meta Pixel ID. Keep all public vendor identifiers in
deployment configuration and never add them to event properties.

- [ ] **Step 5: Run the runtime test**

Run: `node tests/verify-privacy-runtime.js`

Expected: parser, all four preference combinations, accept/reject, revocation, and malformed-storage assertions PASS.

- [ ] **Step 6: Commit the main-site runtime**

```bash
git add package.json _dev.yml _prod.yml scripts/privacy-config.js themes/my-theme/source/js/privacy/consent-runtime.js tests/verify-privacy-runtime.js
git commit -m "Add Dev Academy consent runtime"
```

---

### Task 5: Dev Academy privacy UI and funnel events

**Files:**
- Create: `/Users/bartosz/Projects/dev-academy/themes/my-theme/layout/partial/privacy-controls.ejs`
- Create: `/Users/bartosz/Projects/dev-academy/themes/my-theme/source/css/components/_privacy-controls.scss`
- Create: `/Users/bartosz/Projects/dev-academy/tests/verify-privacy-output.js`
- Modify: `/Users/bartosz/Projects/dev-academy/themes/my-theme/layout/layout.ejs`
- Modify: `/Users/bartosz/Projects/dev-academy/themes/my-theme/layout/partial/footer.ejs`
- Modify: `/Users/bartosz/Projects/dev-academy/themes/my-theme/source/css/styles.scss`
- Modify: `/Users/bartosz/Projects/dev-academy/themes/my-theme/source/js/main.js`
- Delete: `/Users/bartosz/Projects/dev-academy/themes/my-theme/source/js/posthog/posthog.js`
- Modify: `/Users/bartosz/Projects/dev-academy/tests/verify-homepage.js`

**Interfaces:**
- Consumes: `window.DevAcademyPrivacy` from Task 4 and existing newsletter `data-newsletter-topic`/`data-newsletter-placement` hooks.
- Produces: main-site banner/dialog, privacy-settings footer action, `$pageview`, `newsletter_form_viewed`, `newsletter_submitted`, and `ui_interaction_clicked` events.

- [ ] **Step 1: Add failing generated-output assertions**

Create `tests/verify-privacy-output.js` and read `public/index.html`, `public/articles/index.html`, and `public/js/privacy/consent-runtime.js`. Assert the shared copy, two checkboxes, all three actions, footer entry point, one runtime script, and absence of legacy experiment scripts:

```js
assert(homepage.includes('Memory-only analytics and masked session replay are always active'));
assert(homepage.includes('id="persistent-analytics-consent"'));
assert(homepage.includes('id="marketing-consent"'));
assert(homepage.includes('data-accept-all'));
assert(homepage.includes('data-reject-all'));
assert(homepage.includes('data-save-privacy-settings'));
assert(homepage.includes('data-open-privacy-settings'));
assert(!homepage.includes('/js/posthog/testing/dumb-test.js'));
assert(!homepage.includes('/js/posthog/testing/main-banner-test.js'));
assert(runtime.includes('dev_academy_consent_v1'));
```

- [ ] **Step 2: Run the output test and verify it fails**

Run: `npm run build:hexo && node tests/verify-privacy-output.js`

Expected: FAIL because the UI and runtime script are not rendered.

- [ ] **Step 3: Add the EJS interface and local styling**

Render the same copy and semantic controls used in Task 3 from `privacy-controls.ejs`. Add the partial once near the end of `layout.ejs`, outside page-specific branches, so it also covers the headerless homepage and welcome layouts. The partial includes a compact always-available `Privacy settings` button for footerless layouts. Add the same action to `footer.ejs` and hide the compact duplicate when the footer action is present.

Style the fixed banner and modal in `_privacy-controls.scss`; reuse existing color, spacing, focus, and button variables rather than Cookiebot selectors. Import the file from `styles.scss` and remove the obsolete `third-parties/cookie-bot` import.

- [ ] **Step 4: Replace legacy PostHog loading**

Before loading `consent-runtime.js`, serialize only these config values into `window.DEV_ACADEMY_PRIVACY_CONFIG`: `posthogKey`, `posthogHost`, `posthogAssetHost`, and `metaPixelId`. Remove `posthog.js`, `dumb-test.js`, and `main-banner-test.js` tags from `layout.ejs`. Delete the obsolete bootstrap file; retain historical test files only if another explicit build path still references them.

Use JSON serialization rather than string interpolation, and escape `<` before
placing the value in an inline script:

```ejs
<script>
window.DEV_ACADEMY_PRIVACY_CONFIG = <%- JSON.stringify({
  posthogKey: config.privacy.posthog_key,
  posthogHost: config.privacy.posthog_host,
  posthogAssetHost: config.privacy.posthog_asset_host,
  metaPixelId: config.privacy.meta_pixel_id
}).replace(/</g, '\\u003c') %>;
</script>
```

Load `consent-runtime.js` with `defer` before `main.js`. On
`DOMContentLoaded`, the runtime binds the same selector map as the Starter Kit:
`#consent-banner`, `#privacy-dialog`, both category inputs, and the
`data-open-privacy-settings`, `data-accept-all`, `data-reject-all`, and
`data-save-privacy-settings` actions. It shows the banner and captures
`consent_banner_viewed` exactly once only when `getState().decided` is false.
Subscribers update both checkboxes and hide the banner after a decision.

- [ ] **Step 5: Instrument the newsletter-first homepage**

In `main.js`, use `window.DevAcademyPrivacy.capture` for:

```js
capture('newsletter_form_viewed', {
  topic: form.dataset.newsletterTopic,
  placement: form.dataset.newsletterPlacement,
  source_page: window.location.pathname
});

capture('newsletter_submitted', {
  topic: form.dataset.newsletterTopic,
  placement: form.dataset.newsletterPlacement,
  source_page: window.location.pathname,
  has_fbclid: new URLSearchParams(window.location.search).has('fbclid')
});
```

Use one `IntersectionObserver` and a `Set` so each form-view event fires once. Emit submit only after native validity succeeds and never include `email_address`. Map existing `data-ph` clicks to `ui_interaction_clicked` with a canonical placement and `destination` stripped to origin plus pathname.

- [ ] **Step 6: Run main-site tests**

Run:

```bash
npm run test:homepage
npm run test:privacy
rg -n "persistence: 'memory'|person_profiles: 'always'|bssk_consent_preferences" public themes/my-theme/source/js
```

Expected: homepage and privacy checks PASS; the final search has no legacy configuration/key matches.

- [ ] **Step 7: Commit UI and events**

```bash
git add themes/my-theme/layout/layout.ejs themes/my-theme/layout/partial/footer.ejs themes/my-theme/layout/partial/privacy-controls.ejs themes/my-theme/source/css/styles.scss themes/my-theme/source/css/components/_privacy-controls.scss themes/my-theme/source/js/main.js tests/verify-homepage.js tests/verify-privacy-output.js
git add -u themes/my-theme/source/js/posthog/posthog.js
git commit -m "Unify Dev Academy consent and analytics"
```

---

### Task 6: Production CSP and configuration validation

**Files:**
- Create: `/Users/bartosz/Projects/dev-academy/tests/verify-security-headers.js`
- Modify: `/Users/bartosz/Projects/dev-academy/netlify.toml`
- Modify: `/Users/bartosz/Projects/dev-academy/package.json`
- Verify: Cloudflare Pages variables for `browser-security-starter-kit`
- Verify: Netlify production variables for `dev-academy`

**Interfaces:**
- Consumes: exact PostHog and Meta endpoints used by Tasks 3–5.
- Produces: a CSP that permits those integrations on the main and proxied routes without broad wildcard expansion.

- [ ] **Step 1: Write a failing CSP test**

Create `tests/verify-security-headers.js` to parse the `Content-Security-Policy` value from `netlify.toml` and assert:

```js
assert(csp.includes("script-src 'self'"));
assert(csp.includes('https://eu-assets.i.posthog.com'));
assert(csp.includes('https://connect.facebook.net'));
assert(csp.includes('https://p.dev-academy.com'));
assert(csp.includes('https://www.facebook.com'));
assert(!csp.includes('connect-src *'));
assert(!csp.includes('script-src *'));
```

- [ ] **Step 2: Run the test and verify missing hosts**

Run: `node tests/verify-security-headers.js`

Expected: FAIL for the first-party PostHog and Meta endpoints.

- [ ] **Step 3: Narrowly extend the global CSP**

Add the PostHog asset host and `connect.facebook.net` to `script-src`, the first-party PostHog ingest host and required Meta endpoints to `connect-src`, and Meta's tracking endpoint to `img-src`. Preserve the existing directives and do not add `*`, `data:` to scripts, or another `unsafe-eval`.

- [ ] **Step 4: Validate matching deployment variables**

Before deployment, compare the four public values used by both providers:

```text
PUBLIC_POSTHOG_KEY
PUBLIC_POSTHOG_HOST=https://p.dev-academy.com
PUBLIC_POSTHOG_ASSET_HOST=https://eu-assets.i.posthog.com
PUBLIC_META_PIXEL_ID
```

Expected: both builds receive the same PostHog project values and the production Meta Pixel ID; no command prints the actual values into logs.

- [ ] **Step 5: Run all static checks**

Run:

```bash
npm run test:homepage
npm run test:privacy
node tests/verify-security-headers.js
git diff --check
```

Expected: all checks PASS and the build leaves no generated `public/` changes staged.

- [ ] **Step 6: Commit CSP validation**

```bash
git add netlify.toml package.json tests/verify-security-headers.js
git commit -m "Allow consent-gated analytics endpoints"
```

---

### Task 7: Browser verification and coordinated production rollout

**Files:**
- Verify only: both repository build outputs and production URLs.
- Deploy: Cloudflare Pages project `browser-security-starter-kit`, then Netlify site `dev-academy`.

**Interfaces:**
- Consumes: green Tasks 1–6, approved privacy-notice wording, and matching production vendor configuration.
- Produces: verified same-origin consent and analytics behavior on `https://dev-academy.com`.

- [ ] **Step 1: Obtain the privacy release gate**

Confirm the live privacy notice describes memory-only PostHog analytics and masked session replay before a decision, persistent PostHog under **Remember visits**, and Meta Pixel under **Marketing measurement**. Record the responsible owner's approval in the release notes. Do not continue without it.

- [ ] **Step 2: Run pre-deploy browser checks on both applications**

Use a fresh browser profile for each matrix row:

| State | PostHog persistence | Replay | Meta request |
| --- | --- | --- | --- |
| Undecided | memory only | yes | no |
| Reject all | memory only | yes | no |
| Analytics only | localStorage/cookie | yes | no |
| Marketing only | memory only | yes | yes |
| Accept all | localStorage/cookie | yes | yes |

Also verify dialog focus/keyboard behavior, masked email inputs, query-free captured URLs, and failure-safe form/checkout behavior with vendor requests blocked.

- [ ] **Step 3: Deploy Starter Kit first**

From `/Users/bartosz/Projects/browser-security-starter-kit`:

```bash
npm run build
npx wrangler pages deploy dist --project-name browser-security-starter-kit --branch main
```

Expected: a successful production Pages deployment. Do not stage `docs/ads-report-1.csv`.

- [ ] **Step 4: Deploy Dev Academy second**

Push the tested Dev Academy commits to the Netlify production branch or trigger the existing production deployment workflow. Wait for the deployment to report success before browser verification.

- [ ] **Step 5: Verify the production same-origin flow**

In a new production browser context:

1. Open `https://dev-academy.com/` and confirm `dev_academy_consent_v1` is absent, PostHog/replay requests occur, no PostHog durable identifier exists, and Meta is absent.
2. Select analytics-only and record the PostHog `distinct_id`.
3. Navigate normally to `https://dev-academy.com/security-starter-kit/` and confirm no second banner and the same `distinct_id`.
4. Enable marketing and confirm one Pixel initialization/page event.
5. Revoke analytics and confirm PostHog durable keys/cookies disappear and a new memory-only ID is not linked to the old ID.
6. Revoke marketing and confirm reload plus no Pixel script in the new document.
7. Change preferences in a second tab and confirm the first tab synchronizes.

- [ ] **Step 6: Verify vendor-side evidence**

In the Dev Academy PostHog project, confirm `$pageview`, `consent_banner_viewed`, `consent_preferences_updated`, newsletter events, `checkout_started`, and masked replays arrive without PII or query strings. In Meta Events Manager, confirm PageView/ViewContent/InitiateCheckout appear only for marketing-consented test sessions.

- [ ] **Step 7: Record rollout completion**

Add the deployment URLs, verification time, PostHog test distinct IDs, Meta test-event reference, privacy approval, and the explicitly out-of-scope server-side `purchase_completed` integration to the project recovery log. Do not record email addresses or other test PII.

---

## Completion gate

- Both repositories pass their complete existing and new test suites.
- Both production applications read only `dev_academy_consent_v1` for this consent model.
- The new banner is shown once per production origin decision, regardless of which application is visited first.
- One persistent PostHog identity crosses `/` and `/security-starter-kit/`.
- Session replay works before a decision and masks all form inputs.
- Meta Pixel is absent unless `marketing` is true.
- Revocation removes durable behavior and cross-tab changes synchronize.
- CSP allows the exact production integrations on the reverse-proxied route.
- Vendor-side inspection confirms the event taxonomy and absence of PII/query strings.
- Privacy wording and the pre-decision replay policy have explicit owner approval.
