# Pills Subscription Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy ConvertKit subscription modal with an email-only Knowledge Pills signup backed by the same Kit form as the homepage.

**Architecture:** The existing `ck-form.ejs` partial remains the single modal entry point, but it consumes `config.newsletter` instead of hard-coded legacy identifiers. A dedicated rendered-output test owns the modal contract independently of the homepage form and verifies integration, copy, trigger, redirect, and placement.

**Tech Stack:** Hexo 5, EJS, Kit `ck.5.js`, SCSS, Node.js `assert`

## Global Constraints

- Preserve the modal on every non-homepage, non-landing layout.
- Do not render the modal on the homepage.
- Use Kit form ID `9764408`, UID `23709cd512`, and the configured Pills action and privacy URL.
- Collect only `email_address`; do not require or render a first-name field.
- Redirect successful subscriptions to `https://dev-academy.com/welcome`.
- Trigger the modal after 50% content progress on all devices, at most once per day, with no modal timer.
- Use the exact approved English copy from the design specification.
- Preserve unrelated user changes and `.playwright-cli/`.

---

### Task 1: Replace the legacy Kit modal with the Pills signup

**Files:**
- Create: `tests/verify-pills-modal.js`
- Modify: `package.json`
- Modify: `themes/my-theme/layout/partial/ck-form.ejs`
- Modify: `themes/my-theme/source/css/third-parties/_ck-form.scss`

**Interfaces:**
- Consumes: `config.newsletter.action`, `config.newsletter.form_id`, `config.newsletter.uid`, and `config.newsletter.privacy_url`
- Produces: one Kit modal form with `data-format="modal"`, `data-ph="pills-modal__submit"`, and an email-only submission contract

- [ ] **Step 1: Create the failing rendered-output test**

Create `tests/verify-pills-modal.js`:

```js
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const postHtml = fs.readFileSync(
  path.join(ROOT, 'public', 'angular-architecture-best-practices', 'index.html'),
  'utf8'
);
const homepageHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const modalMatch = postHtml.match(/<form[^>]*data-format="modal"[\s\S]*?<\/form>/);

assert(modalMatch, 'a post must render the Pills modal form');
const modal = modalMatch[0];

function attribute(name) {
  const match = modal.match(new RegExp(name + '="([^"]+)"'));
  assert(match, 'modal must render ' + name);
  return match[1];
}

function decode(value) {
  return value
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

const options = JSON.parse(decode(attribute('data-options')));

assert.strictEqual(attribute('action'), 'https://app.kit.com/forms/9764408/subscriptions');
assert.strictEqual(attribute('data-sv-form'), '9764408');
assert.strictEqual(attribute('data-uid'), '23709cd512');
assert.strictEqual(options.settings.after_subscribe.action, 'redirect');
assert.strictEqual(options.settings.after_subscribe.redirect_url, 'https://dev-academy.com/welcome');
assert.deepStrictEqual(options.settings.modal, {
  trigger: 'scroll',
  scroll_percentage: '50',
  devices: 'all',
  show_once_every: '1'
});
assert.strictEqual((modal.match(/name="email_address"/g) || []).length, 1);
assert(!modal.includes('fields[first_name]'));
assert(modal.includes('Get two practical Knowledge Pills every week'));
assert(modal.includes('Security Tuesday + Testing Friday.'));
assert(modal.includes('Each one takes under 5 minutes.'));
assert(modal.includes('Your email address'));
assert(modal.includes('you@example.com'));
assert(modal.includes('Send me the Pills'));
assert(modal.includes('Free. Double opt-in. Check your inbox to confirm. Unsubscribe anytime.'));
assert(modal.includes('href="https://courses.dev-academy.com/p/privacy"'));
assert(modal.includes('data-ph="pills-modal__submit"'));
assert(!homepageHtml.includes('data-format="modal"'));

console.log('Pills modal checks passed.');
```

- [ ] **Step 2: Wire the modal test into the homepage suite**

Append the new verifier to `test:homepage`:

```json
"test:homepage": "npm run build:hexo && node tests/verify-homepage.js && node tests/verify-newsletter-loader.js && node tests/verify-no-transform-edge-function.js && node tests/verify-starter-kit-proxy.js && node tests/verify-top-post-pills-ctas.js && node tests/verify-pills-modal.js"
```

- [ ] **Step 3: Run the focused verifier and confirm RED**

Run:

```bash
node tests/verify-pills-modal.js
```

Expected: FAIL because the rendered modal still targets form `1921330`, asks for first name, and uses the legacy subscription copy.

- [ ] **Step 4: Replace `ck-form.ejs` with the config-driven Pills modal**

Use an EJS options object instead of hand-maintained encoded JSON:

```ejs
<%
var pillsModalOptions = {
    settings: {
        after_subscribe: {
            action: 'redirect',
            success_message: 'Success! Now check your email to confirm your subscription.',
            redirect_url: 'https://dev-academy.com/welcome'
        },
        modal: {
            trigger: 'scroll',
            scroll_percentage: '50',
            devices: 'all',
            show_once_every: '1'
        },
        powered_by: {show: false},
        recaptcha: {enabled: false},
        return_visitor: {action: 'show', custom_content: ''}
    },
    version: '5'
};
%>
<form action="<%- config.newsletter.action %>"
      class="seva-form formkit-form"
      method="post"
      data-sv-form="<%- config.newsletter.form_id %>"
      data-uid="<%- config.newsletter.uid %>"
      data-format="modal"
      data-version="5"
      data-options="<%= JSON.stringify(pillsModalOptions) %>">
    <div data-style="card">
        <div data-element="column" class="formkit-column formkit-column-header">
            <div class="formkit-background"></div>
            <div class="formkit-header" data-element="header">
                <h2>Get two practical Knowledge Pills every week</h2>
            </div>
        </div>
        <div data-element="column" class="formkit-column formkit-column-body">
            <div class="formkit-subheader" data-element="subheader">
                <p>Security Tuesday + Testing Friday. Short, practical lessons for JavaScript and TypeScript developers. Each one takes under 5 minutes.</p>
            </div>
            <ul class="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul>
            <div data-element="fields" class="seva-fields formkit-fields">
                <div class="formkit-field">
                    <label class="formkit-label" for="pills-modal-email">Your email address</label>
                    <input id="pills-modal-email" class="formkit-input" name="email_address" autocomplete="email" inputmode="email" placeholder="you@example.com" required type="email">
                </div>
                <button data-element="submit" data-ph="pills-modal__submit" class="formkit-submit button button-primary button-large button-block">
                    <span>Send me the Pills</span>
                </button>
            </div>
            <div class="formkit-guarantee" data-element="guarantee">
                <p>Free. Double opt-in. Check your inbox to confirm. Unsubscribe anytime. <a href="<%- config.newsletter.privacy_url %>">Privacy policy</a>.</p>
            </div>
        </div>
    </div>
</form>
```

- [ ] **Step 5: Style the visible modal label without changing global Kit forms**

Add to `_ck-form.scss`:

```scss
.formkit-modal .formkit-label {
  display: block;
  margin-bottom: .8rem;
  color: $dark-600;
  font-weight: 700;
}
```

- [ ] **Step 6: Rebuild and verify GREEN**

Run:

```bash
npm run build:hexo && node tests/verify-pills-modal.js
```

Expected: `Pills modal checks passed.`

- [ ] **Step 7: Run the complete regression suites**

Run:

```bash
npm run test:homepage && npm run test:privacy && git diff --check
```

Expected: all homepage, Pills modal, privacy runtime, privacy output, and Meta CAPI checks exit `0`. Existing local ARM warnings from legacy `sharp` and `node-sass` may appear, but the commands must complete successfully.

- [ ] **Step 8: Commit only the scoped files**

```bash
git add package.json tests/verify-pills-modal.js themes/my-theme/layout/partial/ck-form.ejs themes/my-theme/source/css/third-parties/_ck-form.scss
git commit -m "feat: convert legacy modal to Pills signup"
```

