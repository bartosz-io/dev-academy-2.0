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
assert(articles.includes('posts-wrapper'));
readPublic('preventing-xss-in-angular/index.html');

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
