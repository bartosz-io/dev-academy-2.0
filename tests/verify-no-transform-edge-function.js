const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.join(
  __dirname,
  '..',
  'netlify',
  'edge-functions',
  'no-transform-html.js'
);
const source = fs
  .readFileSync(sourcePath, 'utf8')
  .replace('export default async', 'const handler = async')
  .replace('export const config', 'const config')
  .concat('\nmodule.exports = { handler, config };');

class TestHeaders {
  constructor(initial = {}) {
    const entries = initial instanceof TestHeaders ? initial.values : initial;
    this.values = { ...entries };
  }

  get(name) {
    return this.values[name.toLowerCase()] || null;
  }

  set(name, value) {
    this.values[name.toLowerCase()] = value;
  }
}

class TestResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers =
      init.headers instanceof TestHeaders ? init.headers : new TestHeaders(init.headers);
  }
}

const sandbox = {
  Headers: TestHeaders,
  Response: TestResponse,
  module: { exports: {} },
};
vm.runInNewContext(source, sandbox, { filename: sourcePath });

const { handler, config } = sandbox.module.exports;

(async () => {
  const html = new TestResponse('<html></html>', {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public,max-age=0,must-revalidate',
    },
  });
  const transformedHtml = await handler(null, { next: async () => html });

  assert.strictEqual(config.path, '/*');
  assert.strictEqual(
    transformedHtml.headers.get('cache-control'),
    'public,max-age=0,must-revalidate, no-transform'
  );

  const css = new TestResponse('body{}', {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': 'public,max-age=2678400,must-revalidate',
    },
  });
  const untouchedCss = await handler(null, { next: async () => css });

  assert.strictEqual(untouchedCss, css);
  assert.strictEqual(
    untouchedCss.headers.get('cache-control'),
    'public,max-age=2678400,must-revalidate'
  );

  console.log('No-transform HTML edge function verification passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
