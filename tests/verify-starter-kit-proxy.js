const assert = require('assert');
const fs = require('fs');
const path = require('path');

const netlifyConfig = fs.readFileSync(
  path.join(__dirname, '..', 'netlify.toml'),
  'utf8'
);

const redirectBlocks = [...netlifyConfig.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[|$)/g)].map(
  (match) => match[1]
);

const readField = (block, field) =>
  block.match(new RegExp(`^\\s*${field}\\s*=\\s*"([^"]+)"`, 'm'))?.[1];

const redirects = redirectBlocks.map((block) => ({
  from: readField(block, 'from'),
  to: readField(block, 'to'),
  status: Number(block.match(/^\s*status\s*=\s*(\d+)/m)?.[1]),
}));

const canonicalRoute = redirects.find(
  ({ from }) => from === '/security-starter-kit/ai'
);
assert.deepStrictEqual(canonicalRoute, {
  from: '/security-starter-kit/ai',
  to: '/security-starter-kit/ai/',
  status: 301,
});

const legacyRoute = redirects.find(({ from }) => from === '/ai');
assert.deepStrictEqual(legacyRoute, {
  from: '/ai',
  to: '/security-starter-kit/ai/',
  status: 301,
});

const canonicalIndex = redirects.indexOf(canonicalRoute);
const proxyIndex = redirects.findIndex(
  ({ from }) => from === '/security-starter-kit/*'
);
assert(canonicalIndex > -1 && canonicalIndex < proxyIndex);

console.log('Starter Kit proxy routing checks passed.');
