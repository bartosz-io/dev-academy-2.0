'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const pills = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'pills', 'index.html'),
  'utf8'
);
const pillsStyles = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'source', 'css', 'pages', '_pills-landing.scss'),
  'utf8'
);

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const forms = pills.match(
  /<form\b(?=[^>]*\bclass="[^"]*\bnewsletter-form\b[^"]*")[\s\S]*?<\/form>/g
) || [];

assert(pills.includes('<body class="pills-landing-page ">'));
assert(pills.includes('<main class="pills-landing"'));
assert(!pills.includes('<header class="header">'));
assert(!pills.includes('<footer class="footer">'));
assert(!pills.includes('<nav'));

assert(pills.includes('class="pills-landing-brand"'));
assert(pills.includes('src="/img/nav-logo.png"'));
assert(pills.includes('<span>Dev Academy</span>'));
assert.strictEqual(count(pills, '<h1'), 1);
assert(pills.includes('The weekly web <span class="pills-landing-highlight">security</span> email for developers.'));
assert(pills.includes('1 vulnerability. 1 code example. 1 practical fix. Under 5 minutes.'));
assert(pillsStyles.includes('#b39cff'));

assert.strictEqual(forms.length, 1);
const form = forms[0];
assert(form.includes('id="pills-signup"'));
assert(form.includes('method="post"'));
assert(form.includes('action="https://app.kit.com/forms/9764408/subscriptions"'));
assert(form.includes('data-sv-form="9764408"'));
assert(form.includes('data-newsletter-topic="security"'));
assert(form.includes('data-newsletter-placement="pills_landing"'));
assert(form.includes('name="email_address"'));
assert(form.includes('Get the first email →'));
assert(form.includes('Free. First Security lesson after confirmation. Unsubscribe anytime.'));
['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (key) {
  assert(form.includes('name="fields[' + key + ']"'));
});
assert(!form.includes('name="fields[fbclid]"'));

assert(pills.includes('"trackingMode":"no-persistent-browser-identifiers"'));
assert(!pills.includes('id="consent-banner"'));
assert(!pills.includes('id="privacy-dialog"'));
assert.strictEqual(count(pills, '/js/privacy/consent-runtime.js'), 1);
assert.strictEqual(count(pills, '/js/main.js'), 1);

assert(pills.includes('<title>Weekly web security email for developers | Dev Academy</title>'));
assert(pills.includes('<meta name="description" content="A weekly web security email for developers: one vulnerability, one code example, and one practical fix in under five minutes.">'));
assert(pills.includes('<meta property="og:url" content="https://dev-academy.com/pills/">'));
assert.strictEqual(count(pills, '<link rel="canonical" href="https://dev-academy.com/pills/"/>'), 1);

console.log('Pills landing acceptance checks passed.');
