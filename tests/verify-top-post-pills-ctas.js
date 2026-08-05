'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const posts = [
  ['angular-architecture-best-practices', 'angular-architecture-best-practices.md'],
  ['vue-design-patterns', 'vue-design-patterns.md'],
  ['angular-session-storage', 'angular-session-storage.md'],
  ['angular-cors', 'angular-cors.md'],
  ['angular-authentication-with-openid-connect', 'angular-authentication-with-openid-connect.md']
];

posts.forEach(function(entry) {
  const route = entry[0];
  const sourceName = entry[1];
  const html = fs.readFileSync(path.join(ROOT, 'public', route, 'index.html'), 'utf8');
  const source = fs.readFileSync(path.join(ROOT, 'source', '_posts', sourceName), 'utf8');
  const ctas = html.match(/<aside class="article-pills-cta"[\s\S]*?<\/aside>/g) || [];

  assert.strictEqual(ctas.length, 1, route + ' must render exactly one Pills CTA');
  assert(ctas[0].includes('href="/"'));
  assert(!ctas[0].includes('#get-free-pills'));
  assert(ctas[0].includes('data-ph="article-pills-cta__link"'));
  assert(ctas[0].includes('Get the free Knowledge Pills'));
  assert(!html.includes('class="main-banner"'), route + ' must not render the obsolete fixed sales banner');
  assert(!html.includes('id="popup"'));
  assert(!html.includes('class="review-screen"'));
  assert(!source.includes('websecurity-academy.com'));
  assert(!source.includes('\npopup:'));
  assert(!source.includes('{% review_screen'));
  assert(!source.includes('Join with 40% OFF'));
  assert(!source.includes('bannerHeader:'));
});

const stylesEntry = fs.readFileSync(path.join(ROOT, 'themes', 'my-theme', 'source', 'css', 'styles.scss'), 'utf8');
const componentPath = path.join(ROOT, 'themes', 'my-theme', 'source', 'css', 'components', '_article-pills-cta.scss');
assert(stylesEntry.includes("@import 'components/article-pills-cta';"));
assert(fs.existsSync(componentPath), 'shared Pills CTA stylesheet must exist');
const component = fs.readFileSync(componentPath, 'utf8');
assert(component.includes('.article-pills-cta'));
assert(component.includes('@media (max-width: 575px)'));
assert(
  /p\s*\{[^}]*padding-bottom:\s*0;/s.test(component),
  'Pills CTA paragraphs must reset the global paragraph padding'
);

console.log('Top post Pills CTA checks passed.');
