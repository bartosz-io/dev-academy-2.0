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
const blogPost = readPublic('preventing-xss-in-angular/index.html');
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
const footerStyles = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'source', 'css', 'layout', '_footer.scss'),
  'utf8'
);
const newsletterForms = homepage.match(
  /<form\b(?=[^>]*\bclass="[^"]*\bnewsletter-form\b[^"]*")[\s\S]*?<\/form>/g
) || [];

assert(homepage.includes('class="newsletter-homepage"'));
assert(articles.includes('posts-wrapper'));
readPublic('angular-cors/index.html');

assert(homepage.includes('href="/articles/"'));
assert(homepage.includes('href="/podcast/"'));
assert(homepage.includes('href="/web-security/"'));
assert(homepage.includes('href="/about"'));
assert.strictEqual(count(homepage, 'href="/#get-free-pills"'), 2);
assert.strictEqual(count(blogPost, 'href="/#get-free-pills"'), 2);
assert(!/<div class="slack"(?:\s|>)/.test(blogPost));
assert(
  /#get-free-pills\s*\{[\s\S]*?scroll-margin-top:\s*calc\(#\{\$header-height-mobile\}\s*\+\s*2rem\);/.test(
    newsletterStyles
  ),
  'Pills form anchor must clear the fixed mobile header'
);
assert(
  /@media\s*\(min-width:\s*992px\)[\s\S]*?#get-free-pills\s*\{[\s\S]*?scroll-margin-top:\s*calc\(#\{\$header-height-desktop\}\s*\+\s*2rem\);/.test(
    newsletterStyles
  ),
  'Pills form anchor must clear the fixed desktop header'
);
assert.strictEqual(count(homepage, '>Free lessons</a>'), 2);
assert(blogPost.includes('Get the free Pills'));
assert(homepage.includes('aria-controls="primary-navigation"'));
assert(homepage.includes('aria-expanded="false"'));
assert(mainJs.includes('setAttribute("aria-expanded","true")'));
assert(mainJs.includes('setAttribute("aria-expanded","false")'));
assert(mainJs.includes('stickyNavigation(),mobileNavigation()'));
assert(!homepage.includes('securitystarterkit.net'));
assert(!homepage.includes('websecurity-academy.com'));
assert(!homepage.includes('>Courses<'));
assert(!homepage.includes('>Contributors<'));
assert(
  /\.footer-navigation-brand\s*\{[\s\S]*?p\s*\{[\s\S]*?padding-bottom:\s*0;/.test(footerStyles),
  'footer brand paragraphs must not inherit the global paragraph bottom padding'
);

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
  assert(form.includes('data-newsletter-topic="security"'));
  assert(form.includes('name="email_address"'));
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function(key) {
    assert(form.includes('name="fields[' + key + ']"'));
    assert(form.includes('data-newsletter-attribution="' + key + '"'));
  });
  assert(!form.includes('name="fields[fbclid]"'));
  assert(!form.includes('name="fields[first_name]"'));
  assert(form.includes('for="' + formId + '-email"'));
  assert(form.includes('id="' + formId + '-email"'));
  if (placement === 'homepage_hero') {
    assert(form.includes('Free. First Security lesson after confirmation. Unsubscribe anytime.'));
  } else {
    assert(form.includes('Check your inbox'));
  }
  assert(form.includes('class="newsletter-form-submit-label"'));
  assert(form.includes('class="newsletter-form-submit-loading"'));
  assert(form.includes('class="newsletter-form-submit-spinner"'));
  assert(form.includes('Sending…'));
});

assert(homepage.includes('<h1 id="newsletter-hero-title">The weekly web <span class="newsletter-highlight newsletter-highlight-security">security</span> email for developers.</h1>'));
assert(homepage.includes('One vulnerability. One code example. One practical fix. Under five minutes.'));
assert.strictEqual(count(homepage, 'Get the first email →'), 3);
assert(!homepage.includes('Your code works. Do you know if it’s'));
assert(!homepage.includes('newsletter-highlight-testing'));
assert(/\.newsletter-hero-copy\s*\{[\s\S]*?h1\s*\{[\s\S]*?line-height:\s*1\.1;/.test(newsletterStyles));
assert(newsletterStyles.includes('.newsletter-highlight-security'));
assert(!newsletterStyles.includes('.newsletter-highlight-testing'));
assert(
  /\.newsletter-highlight-security\s*\{[\s\S]*?background:\s*linear-gradient\(to bottom, transparent 0 62%, #9c7bff 62% 90%, transparent 90% 100%\);/.test(
    newsletterStyles
  )
);
assert(/\.newsletter-mini-pill-icon\s*\{[\s\S]*?width:\s*2rem;/.test(newsletterStyles));
assert(!/\.newsletter-proof-line\s*\{/.test(newsletterStyles));
assert(!/\.newsletter-cadence\s*\{/.test(newsletterStyles));
assert(!homepage.includes('For JavaScript &amp; TypeScript developers'));
assert(!homepage.includes('class="newsletter-cadence"'));
assert(homepage.includes('Free. First Security lesson after confirmation. Unsubscribe anytime.'));
assert(homepage.includes('Security Email #1 · 3-min email'));
assert(homepage.includes('Security Email #2 · 3-min email'));
assert(!homepage.includes('Testing Friday · 4-min email'));
assert(homepage.includes('value.startsWith(&#39;https://safe-app.com&#39;)'));
assert(homepage.includes('class="newsletter-mini-pill newsletter-mini-pill-security-secondary"'));
assert(!homepage.includes('class="newsletter-mini-pill newsletter-mini-pill-testing"'));
assert.strictEqual(count(homepage, 'class="newsletter-mini-pill-icon"'), 2);
assert(!homepage.includes('class="newsletter-proof-line"'));
assert(!homepage.includes('Previous Web Security &amp; Full-stack Testing programs'));
assert(homepage.includes('Every email is a short Knowledge Pill — one practical lesson you can read in under five minutes and use right away.'));
assert(!homepage.includes('Every Pill stands on its own.'));
assert(homepage.includes('Security Email #1 · Clickjacking'));
assert(homepage.includes('Security Email #2 · URL allow-list'));
assert(!homepage.includes('Testing Friday · example email'));
assert(homepage.includes('Would this malicious URL pass your allow-list?'));
assert(homepage.includes('https://safe-app.com.evil.com'));
assert(homepage.includes('Parse the URL and compare its exact origin'));
assert(homepage.includes('class="hljs-keyword">const</span>'));
assert(homepage.includes('class="hljs-string">&#x27;https://safe-app.com&#x27;</span>'));
assert(
  /\.newsletter-email-security-secondary\s*\{[\s\S]*?code\s*\{[\s\S]*?line-height:\s*1\.35;/.test(
    newsletterStyles
  )
);
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
assert(homepage.includes('AI can generate features and security fixes.'));
assert(homepage.includes('unsafe input handling, exposed secrets, and fixes that protect the wrong thing.'));
assert(homepage.includes('Dev Academy trains the security judgment behind the code — one focused email at a time.'));
assert(!homepage.includes('class="newsletter-proof"'));
assert(!homepage.includes('900+ course enrollments'));
assert(!homepage.includes('From a previous Web Security Academy program'));
assert(!newsletterStyles.includes('.newsletter-proof'));
assert(!newsletterStyles.includes('.newsletter-testimonial'));
assert(homepage.includes('class="newsletter-about-bartosz"'));
assert(homepage.includes('Building production software since 2013. Teaching developers since 2017.'));
assert(homepage.includes('Practical teaching for people who ship real software.'));
assert(homepage.includes('Your first security email arrives immediately'));
assert(homepage.includes('One practical security lesson every week.'));
assert(homepage.includes('One vulnerability. One code example. One practical fix. Free for JavaScript and TypeScript developers.'));
assert(homepage.includes('Want the next security email in your inbox?'));
assert(homepage.includes('Every email starts with a situation a developer can recognize and ends with something concrete to apply.'));
assert(!homepage.includes('Security Tuesday. Testing Friday.'));
assert(!homepage.includes('Security and Testing'));
assert(!homepage.includes('Testing Friday'));
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
assert(homepage.includes('<title>Weekly web security email for developers | Dev Academy</title>'));
assert(homepage.includes('<meta name="description" content="A weekly web security email for developers: one vulnerability, one code example, and one practical fix in under five minutes.">'));
assert(homepage.includes('A weekly web security email for JavaScript and TypeScript developers.'));
assert(homepage.includes('<meta property="og:site_name" content="Dev Academy — Web security for developers">'));
assert(!homepage.includes('Testing &amp; automation'));
assert(!homepage.includes('<meta property="article:tag" content="testing">'));
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
assert(
  /\.newsletter-about-image\s*\{[\s\S]*?img\s*\{[\s\S]*?height:\s*auto;/.test(
    newsletterStyles
  ),
  'author image must preserve its square aspect ratio on narrow screens'
);

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
assert(!emailExamplesTemplate.includes('testing_pill'));
assert(!emailExamplesTemplate.includes('newsletter-email-label-testing'));
assert(/\.newsletter-email-card\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto 1fr;/.test(newsletterStyles));
assert(!/\.newsletter-email\s*\{[\s\S]*?height:\s*100%;/.test(newsletterStyles));

assert(welcome.includes('class="welcome-confirmation"'));
assert(welcome.includes('Check your inbox'));
assert(welcome.includes('Open the email'));
assert(welcome.includes('Confirm your subscription'));
assert(welcome.includes('You are not subscribed yet'));
assert(!welcome.includes('<header class="header">'));
assert(!welcome.includes('<footer class="footer">'));
assert.strictEqual(count(homepage, '/js/privacy/consent-runtime.js'), 1);
assert.strictEqual(count(welcome, '/js/privacy/consent-runtime.js'), 1);
assert(!homepage.includes('data-open-privacy-settings'));
assert(!welcome.includes('data-open-privacy-settings'));
assert(!welcome.includes('id="consent-banner"'));
assert(!welcome.includes('id="privacy-dialog"'));
assert(!homepage.includes('/js/posthog/posthog.js'));

console.log('Newsletter homepage acceptance checks passed.');
