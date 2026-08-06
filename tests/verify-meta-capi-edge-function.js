'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.join(
  __dirname,
  '..',
  'netlify',
  'edge-functions',
  'meta-capi.js'
);
const source = fs
  .readFileSync(sourcePath, 'utf8')
  .replace('export default async', 'const handler = async')
  .replace('export const config', 'const config')
  .concat('\nmodule.exports = { handler, config };');

const upstreamCalls = [];
const logs = [];
let accessToken = 'server-only-token';
let upstreamBehavior = async () => new Response(JSON.stringify({events_received: 1}), {
  status: 200,
  headers: {'content-type': 'application/json'}
});

const sandbox = {
  Date: {now: () => 1700000000123},
  JSON: JSON,
  Netlify: {
    env: {
      get: (name) => name === 'META_CAPI_ACCESS_TOKEN' ? accessToken : undefined
    }
  },
  Request: Request,
  Response: Response,
  URL: URL,
  console: {
    log: (...args) => logs.push(['log', args]),
    warn: (...args) => logs.push(['warn', args]),
    error: (...args) => logs.push(['error', args])
  },
  fetch: async (url, init) => {
    upstreamCalls.push([url, init]);
    return upstreamBehavior(url, init);
  },
  module: {exports: {}}
};
vm.runInNewContext(source, sandbox, {filename: sourcePath});

const {handler, config} = sandbox.module.exports;
const context = {ip: '203.0.113.10'};

function metaRequest(body, options = {}) {
  const method = options.method || 'POST';
  const headers = Object.assign({
    origin: 'https://dev-academy.com',
    'content-type': 'application/json',
    'user-agent': 'test-agent'
  }, options.headers || {});
  const init = {method, headers};
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('https://dev-academy.com/api/meta/events', init);
}

function validPayload(overrides = {}) {
  return Object.assign({
    event_name: 'Lead',
    event_id: 'lead-event-id',
    event_source_url: 'https://dev-academy.com/',
    fbc: 'fb.1.1700000000000.test-click-123',
    custom_data: {
      content_name: 'pills_eu_launch',
      content_category: 'newsletter'
    }
  }, overrides);
}

async function json(response) {
  return JSON.parse(await response.text());
}

(async () => {
  assert.strictEqual(config.path, '/api/meta/events');

  let response = await handler(metaRequest(null, {method: 'GET'}), context);
  assert.strictEqual(response.status, 405);

  response = await handler(metaRequest(validPayload(), {
    headers: {origin: 'https://attacker.example'}
  }), context);
  assert.strictEqual(response.status, 403);

  response = await handler(metaRequest('{broken'), context);
  assert.strictEqual(response.status, 400);

  const invalidPayloads = [
    validPayload({event_name: 'Purchase'}),
    validPayload({event_id: 'short'}),
    validPayload({event_source_url: 'https://attacker.example/'}),
    validPayload({event_source_url: 'https://dev-academy.com/?email=private@example.com'}),
    validPayload({fbc: 'invalid'}),
    Object.assign(validPayload(), {fbclid: 'must-not-cross-boundary'})
  ];
  for (const payload of invalidPayloads) {
    response = await handler(metaRequest(payload), context);
    assert.strictEqual(response.status, 400, JSON.stringify(payload));
  }

  response = await handler(metaRequest('x'.repeat(9000)), context);
  assert.strictEqual(response.status, 413);

  accessToken = undefined;
  response = await handler(metaRequest(validPayload()), context);
  assert.strictEqual(response.status, 503);
  assert.deepStrictEqual(await json(response), {accepted: false});
  accessToken = 'server-only-token';

  upstreamCalls.length = 0;
  logs.length = 0;
  response = await handler(metaRequest(validPayload({
    custom_data: {
      content_name: 'pills_eu_launch',
      content_category: 'newsletter',
      email: 'private@example.com'
    }
  })), context);
  assert.strictEqual(response.status, 200);
  const successBody = await response.text();
  assert.deepStrictEqual(JSON.parse(successBody), {accepted: true});
  assert.strictEqual(response.headers.get('cache-control'), 'no-store');
  assert.strictEqual(upstreamCalls.length, 1);
  assert.strictEqual(
    upstreamCalls[0][0],
    'https://graph.facebook.com/v23.0/189349068273059/events'
  );
  assert.strictEqual(upstreamCalls[0][1].method, 'POST');
  assert.strictEqual(upstreamCalls[0][1].headers['content-type'], 'application/json');
  assert.strictEqual(
    upstreamCalls[0][1].headers.authorization,
    'Bearer server-only-token'
  );
  assert.deepStrictEqual(JSON.parse(upstreamCalls[0][1].body), {
    data: [{
      event_name: 'Lead',
      event_time: 1700000000,
      event_id: 'lead-event-id',
      action_source: 'website',
      event_source_url: 'https://dev-academy.com/',
      user_data: {
        client_ip_address: '203.0.113.10',
        client_user_agent: 'test-agent',
        fbc: 'fb.1.1700000000000.test-click-123'
      },
      custom_data: {
        content_name: 'pills_eu_launch',
        content_category: 'newsletter'
      }
    }]
  });
  assert.deepStrictEqual(logs, []);
  assert.strictEqual(successBody.includes('server-only-token'), false);

  upstreamBehavior = async () => new Response(JSON.stringify({events_received: 0}), {
    status: 200,
    headers: {'content-type': 'application/json'}
  });
  response = await handler(metaRequest(validPayload()), context);
  assert.strictEqual(response.status, 502);

  upstreamBehavior = async () => new Response(JSON.stringify({error: {message: 'rejected'}}), {
    status: 400,
    headers: {'content-type': 'application/json'}
  });
  response = await handler(metaRequest(validPayload()), context);
  assert.strictEqual(response.status, 502);

  upstreamBehavior = async () => { throw new Error('network down'); };
  response = await handler(metaRequest(validPayload()), context);
  assert.strictEqual(response.status, 502);

  assert.strictEqual(logs.length, 0);
  console.log('Meta CAPI edge function verification passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
