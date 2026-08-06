'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const postHtml = fs.readFileSync(
  path.join(ROOT, 'public', 'angular-architecture-best-practices', 'index.html'),
  'utf8'
);
const homepageHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const subscribeTagSource = fs.readFileSync(
  path.join(ROOT, 'themes', 'my-theme', 'scripts', 'subscribe.js'),
  'utf8'
);
let subscribeTagRenderer;
vm.runInNewContext(subscribeTagSource, {
  hexo: {
    config: { newsletter: { uid: '23709cd512' } },
    extend: {
      tag: {
        register: function (name, renderer) {
          assert.strictEqual(name, 'subscribe');
          subscribeTagRenderer = renderer;
        }
      }
    }
  }
});
assert(subscribeTagRenderer, 'subscribe tag renderer must be registered');
const subscribeTagHtml = subscribeTagRenderer();
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
assert(postHtml.includes('data-formkit-toggle="23709cd512"'));
assert(postHtml.includes('href="https://dev-academy.ck.page/23709cd512"'));
assert(!postHtml.includes('data-formkit-toggle="e4bf864ac2"'));
assert(subscribeTagHtml.includes('data-formkit-toggle="23709cd512"'));
assert(subscribeTagHtml.includes('href="https://dev-academy.ck.page/23709cd512"'));
assert(!subscribeTagSource.includes('e4bf864ac2'));

console.log('Pills modal checks passed.');
