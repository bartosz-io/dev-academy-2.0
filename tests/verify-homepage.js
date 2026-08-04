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
  const canonicalTags = html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) || [];
  return canonicalTags.filter(function (tag) {
    return tag.includes('href="' + canonicalUrl + '"');
  }).length;
}

const homepage = readPublic('index.html');
const welcome = readPublic('welcome/index.html');
const articles = readPublic('articles/index.html');
const mainJs = readPublic('js/main.js');
const sitemapIndex = readPublic('sitemap.xml');
const pageSitemap = readPublic('page-sitemap.xml');
const postSitemap = readPublic('post-sitemap.xml');
const emailExamplesTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'layout', 'partial', 'homepage', 'email-examples.ejs'),
  'utf8'
);
const newsletterStyles = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'source', 'css', 'pages', '_newsletter-homepage.scss'),
  'utf8'
);
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
assert(mainJs.includes('stickyNavigation(),mobileNavigation()'));
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
  assert(form.includes('action="https://app.kit.com/forms/9764408/subscriptions"'));
  assert(form.includes('data-sv-form="9764408"'));
  assert(form.includes('data-uid="23709cd512"'));
  assert(form.includes('data-options='));
  assert(form.includes('redirect'));
  assert(form.includes('https://dev-academy.com/welcome'));
  assert(form.includes('data-element="errors"'));
  assert(form.includes('data-element="fields"'));
  assert(form.includes('data-newsletter-topic="both"'));
  assert(form.includes('name="email_address"'));
  assert(!form.includes('name="fields[first_name]"'));
  assert(form.includes('for="' + formId + '-email"'));
  assert(form.includes('id="' + formId + '-email"'));
  assert(form.includes('Check your inbox'));
});

assert(homepage.includes('For JavaScript &amp; TypeScript developers'));
assert(homepage.includes('Build web applications you can trust.'));
assert(homepage.includes('Security Tuesday'));
assert(homepage.includes('Testing Friday'));
assert(homepage.includes('Under five minutes'));
assert(homepage.includes('900+ course enrollments across Web Security &amp; Full-stack Testing'));
assert(homepage.includes('big ball of mud'));
assert(homepage.includes('Restrict the dependencies with testing'));
assert(homepage.includes('controllers should not depend on APIs'));
assert(homepage.includes('clickjacking'));
assert(homepage.includes('invisible iframe'));
assert(homepage.includes('frame-ancestors'));
assert(!homepage.includes('working JavaScript'));
assert(!homepage.includes('900+ developers'));
assert(!homepage.includes('900+ students'));
assert(!homepage.includes('12-week'));
assert(!homepage.includes('5-week'));
assert(homepage.includes('class="newsletter-ai-judgment"'));
assert(homepage.includes('Code gets produced faster. Judgment doesn&#39;t.'));
assert(homepage.includes('class="newsletter-proof"'));
assert.strictEqual(count(homepage, 'From a previous Web Security Academy program'), 2);
assert(homepage.includes('Hassan A Mohamed'));
assert(homepage.includes('Ishan Soni'));
assert(homepage.includes('class="newsletter-about-bartosz"'));
assert(homepage.includes('Building production software since 2013. Teaching developers since 2017.'));
assert(homepage.includes('Practical teaching for people who ship real software.'));
assert(homepage.includes('Your first Security Pill arrives immediately'));
assert(homepage.includes('Two useful ideas every week. Less than ten minutes total.'));
assert.strictEqual(count(homepage, 'name="email_address"'), 3);
assert.strictEqual(count(homepage, 'name="fields[first_name]"'), 0);
assert.strictEqual(
  count(homepage, 'https://app.kit.com/forms/9764408/subscriptions'),
  3
);
assert(homepage.includes('data-newsletter-placement="homepage_hero"'));
assert(homepage.includes('data-newsletter-placement="homepage_after_examples"'));
assert(homepage.includes('data-newsletter-placement="homepage_final"'));
assert(!homepage.includes('€19'));
assert(!homepage.includes('€37'));
assert(homepage.includes('<title>Build web applications you can trust | Dev Academy</title>'));
assert(homepage.includes('<meta name="description" content="Practical Security Tuesday and Testing Friday Knowledge Pills for JavaScript and TypeScript developers.">'));
assert(homepage.includes('<meta property="og:url" content="https://dev-academy.com/">'));
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
assert.strictEqual(count(homepage, '<h1'), 1);

const headingLevels = Array.from(homepage.matchAll(/<h([1-6])\b/g)).map(function (match) {
  return Number(match[1]);
});
assert.strictEqual(headingLevels[0], 1);
headingLevels.slice(1).forEach(function (level, index) {
  assert(level - headingLevels[index] <= 1, 'heading hierarchy must not skip levels');
});

const imageTags = homepage.match(/<img\b[^>]*>/g) || [];
assert(imageTags.length > 0);
imageTags.forEach(function (tag) {
  assert(/\salt="[^"]*"/.test(tag), 'every image must define alt text');
});
assert(homepage.includes('alt="Bartosz Pietrucha, founder of Dev Academy"'));

assert.strictEqual(
  count(pageSitemap, '<loc>https://dev-academy.com/</loc>'),
  1,
  'homepage must occur once in page sitemap'
);
assert(sitemapIndex.includes('<loc>https://dev-academy.com/articles-sitemap.xml</loc>'));
const articleSitemap = readPublic('articles-sitemap.xml');
assert(articleSitemap.includes('<loc>https://dev-academy.com/articles/</loc>'));
assert(postSitemap.includes('<loc>https://dev-academy.com/preventing-xss-in-angular/</loc>'));
assert.strictEqual(count(emailExamplesTemplate, 'class="newsletter-email-card"'), 2);
assert(/\.newsletter-email-card\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto 1fr;/.test(newsletterStyles));
assert(!/\.newsletter-email\s*\{[\s\S]*?height:\s*100%;/.test(newsletterStyles));

assert(welcome.includes('class="welcome-confirmation"'));
assert(welcome.includes('Check your inbox'));
assert(welcome.includes('Open the email'));
assert(welcome.includes('Confirm your subscription'));
assert(welcome.includes('You are not subscribed yet'));
assert(!welcome.includes('<header class="header">'));
assert(!welcome.includes('<footer class="footer">'));

console.log('Newsletter homepage acceptance checks passed.');
