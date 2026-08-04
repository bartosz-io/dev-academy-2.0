'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function readPublic(relativePath) {
  return fs.readFileSync(path.join(PUBLIC_DIR, relativePath), 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function countCanonical(html, canonicalUrl) {
  const expected = '<link rel="canonical" href="' + canonicalUrl + '">';
  return count(html, expected);
}

const homepage = readPublic('index.html');
const articles = readPublic('articles/index.html');
const mainJs = readPublic('js/main.js');
const newsletterForms = homepage.match(/<form\b[\s\S]*?<\/form>/g) || [];

assert(homepage.includes('class="newsletter-homepage"'));
assert(articles.includes('posts-wrapper'));
readPublic('preventing-xss-in-angular/index.html');
readPublic('angular-cors/index.html');

assert(homepage.includes('href="/articles/"'));
assert(homepage.includes('href="/podcast/"'));
assert(homepage.includes('href="/web-security/"'));
assert(homepage.includes('href="/about"'));
assert(homepage.includes('href="#get-free-pills"'));
assert(homepage.includes('Get the free Pills'));
assert(homepage.includes('aria-controls="primary-navigation"'));
assert(homepage.includes('aria-expanded="false"'));
assert(mainJs.includes('setAttribute("aria-expanded","true")'));
assert(mainJs.includes('setAttribute("aria-expanded","false")'));
assert(!homepage.includes('securitystarterkit.net'));
assert(!homepage.includes('websecurity-academy.com'));
assert(!homepage.includes('>Courses<'));
assert(!homepage.includes('>Contributors<'));

assert.strictEqual(newsletterForms.length, 3);
[
  ['homepage_hero', 'get-free-pills'],
  ['homepage_after_examples', 'pills-after-examples'],
  ['homepage_final', 'pills-final']
].forEach(function (entry) {
  const placement = entry[0];
  const formId = entry[1];
  const form = newsletterForms.find(function (candidate) {
    return candidate.includes('data-newsletter-placement="' + placement + '"');
  });

  assert(form, 'missing newsletter form for ' + placement);
  assert(form.includes('id="' + formId + '"'));
  assert(form.includes('method="post"'));
  assert(form.includes('action="https://app.convertkit.com/forms/1921330/subscriptions"'));
  assert(form.includes('data-sv-form="1921330"'));
  assert(form.includes('data-uid="e4bf864ac2"'));
  assert(form.includes('data-newsletter-topic="both"'));
  assert(form.includes('name="email_address"'));
  assert(!form.includes('name="fields[first_name]"'));
  assert(form.includes('for="' + formId + '-email"'));
  assert(form.includes('id="' + formId + '-email"'));
  assert(form.includes('Check your inbox'));
});

assert(homepage.includes('Build web applications you can trust.'));
assert(homepage.includes('Security Tuesday'));
assert(homepage.includes('Testing Friday'));
assert(homepage.includes('under five minutes'));
assert.strictEqual(count(homepage, 'name="email_address"'), 3);
assert.strictEqual(count(homepage, 'name="fields[first_name]"'), 0);
assert.strictEqual(
  count(homepage, 'https://app.convertkit.com/forms/1921330/subscriptions'),
  3
);
assert(homepage.includes('data-newsletter-placement="homepage_hero"'));
assert(homepage.includes('data-newsletter-placement="homepage_after_examples"'));
assert(homepage.includes('data-newsletter-placement="homepage_final"'));
assert(!homepage.includes('€19'));
assert(!homepage.includes('€37'));
assert.strictEqual(
  countCanonical(homepage, 'https://dev-academy.com/'),
  1,
  'homepage must contain exactly one canonical URL'
);
assert.strictEqual(
  countCanonical(articles, 'https://dev-academy.com/articles/'),
  1,
  'article listing must contain exactly one canonical URL'
);

console.log('Newsletter homepage acceptance checks passed.');
