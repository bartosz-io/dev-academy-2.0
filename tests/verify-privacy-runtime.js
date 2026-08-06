'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var RUNTIME_PATH = path.join(
  __dirname,
  '..',
  'themes',
  'my-theme',
  'source',
  'js',
  'privacy',
  'consent-runtime.js'
);
var CONFIG_PATH = path.join(__dirname, '..', 'scripts', 'privacy-config.js');
var yaml = require('js-yaml');
var CONSENT_KEY = 'dev_academy_consent_v1';
var VALID_CONFIG = {
  enabled: true,
  posthogKey: 'phc_public_test_key',
  posthogHost: 'https://p.dev-academy.com',
  posthogAssetHost: 'https://eu-assets.i.posthog.com',
  metaPixelId: '123456789012345'
};
var testsRun = 0;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function test(name, callback) {
  callback();
  testsRun += 1;
  console.log('ok - ' + name);
}

function makePostHog(calls) {
  return {
    init: function(key, options) {
      calls.push(['posthog:init', key, options]);
    },
    capture: function(event, properties) {
      calls.push(['posthog:capture', event, plain(properties)]);
    },
    set_config: function(options) {
      calls.push(['posthog:set_config', plain(options)]);
    },
    reset: function(resetDeviceId) {
      calls.push(['posthog:reset', resetDeviceId]);
    },
    persistence: {
      clear: function() {
        calls.push(['posthog:persistence:clear']);
      }
    }
  };
}

function createHarness(options) {
  options = options || {};
  var values = Object.assign({}, options.storageValues || {});
  var sessionValues = Object.assign({}, options.sessionStorageValues || {});
  var storageWrites = [];
  var cookieWrites = [];
  var cookieValues = Object.assign({}, options.cookieValues || {});
  var appendedScripts = [];
  var calls = [];
  var listeners = {};
  var eventIds = (options.eventIds || []).slice();
  var generatedEventCount = 0;
  var nowValue = options.now || 1700000000000;
  var config = options.config === undefined ? VALID_CONFIG : options.config;

  if (options.rawConsent !== undefined && options.rawConsent !== null) {
    values[CONSENT_KEY] = options.rawConsent;
  }

  var localStorage = {
    getItem: function(key) {
      if (options.throwOnStorageRead) throw new Error('storage read denied');
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    setItem: function(key, value) {
      if (options.throwOnStorageWrite) throw new Error('storage write denied');
      storageWrites.push([key, value]);
      calls.push(['storage:set', key, value]);
      values[key] = value;
    },
    removeItem: function(key) {
      calls.push(['storage:remove', key]);
      delete values[key];
    }
  };
  var sessionStorage = {
    removeItem: function(key) {
      calls.push(['session-storage:remove', key]);
      delete sessionValues[key];
    }
  };

  function appendScript(script) {
    appendedScripts.push(script);
    calls.push(['script:append', script.src]);
  }

  var document = {
    referrer: options.referrer || 'https://search.example/results?secret=1',
    head: { appendChild: appendScript },
    createElement: function(tagName) {
      return { tagName: tagName, async: false, src: '', onload: null, onerror: null };
    },
    getElementsByTagName: function() {
      return [{ parentNode: { insertBefore: appendScript } }];
    }
  };
  Object.defineProperty(document, 'cookie', {
    get: function() {
      return Object.keys(cookieValues).map(function(name) {
        return name + '=' + cookieValues[name];
      }).join('; ');
    },
    set: function(value) {
      cookieWrites.push(value);
      calls.push(['cookie:write', value]);
      var pair = value.split(';')[0].split('=');
      var name = pair.shift();
      var cookieValue = pair.join('=');
      if (/expires=Thu, 01 Jan 1970/i.test(value) || /max-age=0/i.test(value)) {
        delete cookieValues[name];
      } else {
        cookieValues[name] = cookieValue;
      }
    }
  });
  var window = {
    DEV_ACADEMY_PRIVACY_CONFIG: config,
    localStorage: localStorage,
    sessionStorage: sessionStorage,
    location: {
      origin: 'https://dev-academy.com',
      hostname: 'dev-academy.com',
      pathname: options.pathname || '/knowledge-pills/',
      search: options.search || '?email=private%40example.com',
      reload: function() { calls.push(['reload']); }
    },
    crypto: {
      randomUUID: function() {
        var eventId = eventIds[generatedEventCount] || 'generated-event-' + generatedEventCount;
        generatedEventCount += 1;
        return eventId;
      }
    },
    fetch: function(url, init) {
      calls.push(['fetch', url, {
        method: init.method,
        credentials: init.credentials,
        headers: plain(init.headers),
        keepalive: init.keepalive,
        body: init.body
      }]);
      return Promise.resolve({ ok: true, status: 200 });
    },
    addEventListener: function(type, listener) {
      listeners[type] = listener;
    }
  };
  var context = {
    window: window,
    document: document,
    URL: URL,
    URLSearchParams: URLSearchParams,
    Date: { now: function() { return nowValue; } },
    crypto: window.crypto,
    console: {
      warn: function(message) { calls.push(['diagnostic', message]); },
      log: function() {}
    }
  };
  context.self = window;
  context.global = context;

  var source = fs.readFileSync(RUNTIME_PATH, 'utf8');
  vm.runInNewContext(source, context, { filename: RUNTIME_PATH });

  return {
    window: window,
    document: document,
    values: values,
    sessionValues: sessionValues,
    storageWrites: storageWrites,
    cookieWrites: cookieWrites,
    cookieValues: cookieValues,
    appendedScripts: appendedScripts,
    calls: calls,
    listeners: listeners,
    api: window.DevAcademyPrivacy,
    setNow: function(value) { nowValue = value; },
    attachPostHog: function() {
      var script = appendedScripts.filter(function(candidate) {
        return /\/static\/array\.js$/.test(candidate.src);
      })[0];
      assert(script, 'expected the PostHog asset script');
      window.posthog = makePostHog(calls);
      script.onload();
      return window.posthog;
    },
    failPostHog: function() {
      var script = appendedScripts.filter(function(candidate) {
        return /\/static\/array\.js$/.test(candidate.src);
      })[0];
      assert(script, 'expected the PostHog asset script');
      script.onerror();
    }
  };
}

function captures(harness, event) {
  return harness.calls.filter(function(call) {
    return call[0] === 'posthog:capture' && (!event || call[1] === event);
  });
}

test('exposes the shared v1 API and treats absent or inaccessible storage as undecided', function() {
  var harness = createHarness({ config: null });
  assert.strictEqual(harness.api.CONSENT_KEY, CONSENT_KEY);
  assert.deepStrictEqual(plain(harness.api.getState()), {
    decided: false,
    persistentAnalytics: false,
    marketing: false
  });
  assert.doesNotThrow(function() {
    createHarness({ config: null, throwOnStorageRead: true }).api.getState();
  });
});

test('parses only complete v1 decisions, including all four preference combinations', function() {
  [false, true].forEach(function(persistentAnalytics) {
    [false, true].forEach(function(marketing) {
      var raw = JSON.stringify({
        schemaVersion: 1,
        persistentAnalytics: persistentAnalytics,
        marketing: marketing
      });
      assert.deepStrictEqual(plain(createHarness({ rawConsent: raw, config: null }).api.getState()), {
        decided: true,
        persistentAnalytics: persistentAnalytics,
        marketing: marketing
      });
    });
  });

  ['{', '{}', '{"schemaVersion":2,"persistentAnalytics":true,"marketing":true}',
    '{"schemaVersion":1,"persistentAnalytics":1,"marketing":false}'].forEach(function(raw) {
    assert.strictEqual(createHarness({ rawConsent: raw, config: null }).api.getState().decided, false);
  });
});

test('acceptAll and rejectAll store the exact contract and notify removable subscribers', function() {
  var harness = createHarness({ config: null });
  var notifications = [];
  var unsubscribe = harness.api.subscribe(function(state) { notifications.push(plain(state)); });

  harness.api.acceptAll();
  assert.strictEqual(
    harness.values[CONSENT_KEY],
    '{"schemaVersion":1,"persistentAnalytics":true,"marketing":true}'
  );
  unsubscribe();
  harness.api.rejectAll();
  assert.strictEqual(
    harness.values[CONSENT_KEY],
    '{"schemaVersion":1,"persistentAnalytics":false,"marketing":false}'
  );
  assert.deepStrictEqual(notifications, [{ decided: true, persistentAnalytics: true, marketing: true }]);
});

test('loads PostHog asynchronously in memory with masked replay and drains captures', function() {
  var harness = createHarness();
  var posthogScript = harness.appendedScripts[0];
  assert.strictEqual(posthogScript.async, true);
  assert.strictEqual(posthogScript.src, 'https://eu-assets.i.posthog.com/static/array.js');

  harness.api.capture('runtime_test', {
    safe_property: 'yes',
    event_schema_version: 99,
    page_path: '/leaked?email=private@example.com',
    posthog_key: VALID_CONFIG.posthogKey,
    meta_pixel_id: VALID_CONFIG.metaPixelId
  });
  assert.strictEqual(captures(harness).length, 0);
  harness.attachPostHog();

  var init = harness.calls.filter(function(call) { return call[0] === 'posthog:init'; })[0];
  assert.strictEqual(init[1], VALID_CONFIG.posthogKey);
  assert.strictEqual(init[2].api_host, VALID_CONFIG.posthogHost);
  assert.strictEqual(init[2].autocapture, false);
  assert.strictEqual(init[2].capture_pageview, false);
  assert.strictEqual(init[2].person_profiles, 'identified_only');
  assert.strictEqual(init[2].persistence, 'memory');
  assert.strictEqual(init[2].disable_session_recording, false);
  assert.strictEqual(init[2].session_recording.maskAllInputs, true);

  var queued = captures(harness, 'runtime_test')[0][2];
  assert.deepStrictEqual(queued, {
    event_schema_version: 2,
    page_path: '/knowledge-pills/',
    safe_property: 'yes'
  });

  var pageview = captures(harness, '$pageview')[0][2];
  assert.strictEqual(pageview.$current_url, 'https://dev-academy.com/knowledge-pills/');
  assert.strictEqual(pageview.$referrer, 'search.example');
  assert.strictEqual(pageview.page_path, '/knowledge-pills/');
  assert.strictEqual(JSON.stringify(pageview).indexOf('?'), -1);
  assert.strictEqual(JSON.stringify(pageview).indexOf(VALID_CONFIG.posthogKey), -1);
  assert.strictEqual(JSON.stringify(pageview).indexOf(VALID_CONFIG.metaPixelId), -1);
});

test('sanitizes SDK-enriched custom events without rewriting replay snapshots', function() {
  var harness = createHarness();
  harness.attachPostHog();
  var init = harness.calls.filter(function(call) { return call[0] === 'posthog:init'; })[0][2];
  var unsafeUrl = 'https://dev-academy.com/confirmation/?subscriber=synthetic%40example.invalid&utm_source=test#private';
  var unsafeReferrer = 'https://search.example/results?fbclid=test#private';
  var timestamp = new Date('2026-08-05T10:00:00.000Z');
  var event;
  var snapshot;
  var request;

  assert.strictEqual(typeof init.before_send, 'function');
  assert.strictEqual(init.save_campaign_params, false);
  assert.strictEqual(init.save_referrer, false);
  assert.strictEqual(init.asset_host, VALID_CONFIG.posthogAssetHost);

  event = init.before_send({
    event: 'custom_safe_event',
    properties: {
      token: 'required-ingest-token',
      $current_url: unsafeUrl,
      $referrer: unsafeReferrer,
      $initial_referrer: unsafeReferrer,
      $utm_source: 'test-campaign',
      utm_campaign: 'test-campaign',
      $gclid: 'test-click-id',
      $fbclid: 'test-click-id',
      posthog_copy: VALID_CONFIG.posthogKey,
      meta_copy: VALID_CONFIG.metaPixelId,
      nested: {
        href: unsafeUrl,
        contact: 'synthetic@example.invalid',
        safe: 'kept'
      }
    },
    $set: { contact: 'synthetic@example.invalid' },
    timestamp: timestamp
  });

  assert.strictEqual(event.properties.token, 'required-ingest-token');
  assert.strictEqual(event.properties.$current_url, 'https://dev-academy.com/confirmation/');
  assert.strictEqual(event.properties.$referrer, 'search.example');
  assert.strictEqual(event.properties.$initial_referrer, 'search.example');
  assert.strictEqual(event.properties.nested.href, 'https://dev-academy.com/confirmation/');
  assert.strictEqual(event.properties.nested.safe, 'kept');
  ['$utm_source', 'utm_campaign', '$gclid', '$fbclid', 'posthog_copy', 'meta_copy'].forEach(function(name) {
    assert.strictEqual(Object.prototype.hasOwnProperty.call(event.properties, name), false);
  });
  assert.strictEqual(Object.prototype.hasOwnProperty.call(event.properties.nested, 'contact'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(event.$set, 'contact'), false);
  assert.strictEqual(event.timestamp, timestamp);

  snapshot = {
    event: '$snapshot',
    properties: {
      token: 'required-ingest-token',
      $current_url: unsafeUrl,
      $snapshot_data: {
        type: 4,
        data: { href: unsafeUrl, referrer: unsafeReferrer }
      }
    }
  };
  assert.strictEqual(init.before_send(snapshot), snapshot);
  assert.strictEqual(snapshot.properties.$current_url, unsafeUrl);
  assert.strictEqual(snapshot.properties.$snapshot_data.data.href, unsafeUrl);
  assert.strictEqual(snapshot.properties.$snapshot_data.data.referrer, unsafeReferrer);

  assert.strictEqual(typeof init.session_recording.maskCapturedNetworkRequestFn, 'function');
  request = init.session_recording.maskCapturedNetworkRequestFn({ name: unsafeUrl });
  assert.strictEqual(request.name, 'https://dev-academy.com/confirmation/');
});

test('drops queued and future captures after a PostHog loading failure without retrying', function() {
  var harness = createHarness();
  harness.api.capture('before_failure');
  harness.failPostHog();
  harness.api.capture('after_failure');
  assert.strictEqual(captures(harness).length, 0);
  assert.strictEqual(harness.appendedScripts.length, 1);
});

test('skips vendor requests for missing, disabled, and placeholder configuration', function() {
  [null, { enabled: false }, {
    enabled: true,
    posthogKey: 'phc_placeholder',
    posthogHost: 'https://p.dev-academy.com',
    posthogAssetHost: 'https://eu-assets.i.posthog.com',
    metaPixelId: '000000000000000'
  }].forEach(function(config) {
    var harness = createHarness({ config: config });
    harness.api.acceptAll();
    assert.strictEqual(harness.appendedScripts.length, 0);
    assert.strictEqual(harness.window.fbq, undefined);
  });
});

test('reports missing placeholder vendor configuration once without values', function() {
  var harness = createHarness({
    config: {
      enabled: true,
      posthogKey: 'phc_placeholder',
      posthogHost: 'https://p.dev-academy.com',
      posthogAssetHost: 'https://eu-assets.i.posthog.com',
      metaPixelId: '000000000000000'
    }
  });
  harness.api.acceptAll();
  harness.api.acceptAll();
  var diagnostics = harness.calls.filter(function(call) { return call[0] === 'diagnostic'; });
  assert.strictEqual(diagnostics.length, 2);
  assert(diagnostics.some(function(call) { return call[1].indexOf('analytics') !== -1; }));
  assert(diagnostics.some(function(call) { return call[1].indexOf('marketing') !== -1; }));
  assert.strictEqual(JSON.stringify(diagnostics).indexOf('phc_placeholder'), -1);
  assert.strictEqual(JSON.stringify(diagnostics).indexOf('000000000000000'), -1);
});

test('grants durable PostHog persistence and revokes it in save-reset-clear-memory-capture-reload order', function() {
  var harness = createHarness();
  harness.attachPostHog();
  harness.calls.length = 0;

  harness.api.setPreferences({ persistentAnalytics: true, marketing: false });
  assert.deepStrictEqual(harness.calls.slice(0, 3), [
    ['storage:set', CONSENT_KEY, '{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}'],
    ['posthog:set_config', { persistence: 'localStorage+cookie' }],
    ['posthog:capture', 'consent_preferences_updated', {
      event_schema_version: 2,
      page_path: '/knowledge-pills/',
      action: 'save_preferences',
      persistent_analytics: true,
      marketing: false
    }]
  ]);

  harness.calls.length = 0;
  harness.api.setPreferences({ persistentAnalytics: false, marketing: false });
  assert.deepStrictEqual(harness.calls.filter(function(call) {
    return call[0] === 'storage:set' || call[0].indexOf('posthog:') === 0 || call[0] === 'reload';
  }), [
    ['storage:set', CONSENT_KEY, '{"schemaVersion":1,"persistentAnalytics":false,"marketing":false}'],
    ['posthog:reset', true],
    ['posthog:persistence:clear'],
    ['posthog:set_config', { persistence: 'memory' }],
    ['posthog:capture', 'consent_preferences_updated', {
      event_schema_version: 2,
      page_path: '/knowledge-pills/',
      action: 'save_preferences',
      persistent_analytics: false,
      marketing: false
    }],
    ['reload']
  ]);
});

test('revocation removes only this project durable identity before reload when PostHog is pending or failed', function() {
  var mainName = 'ph_' + VALID_CONFIG.posthogKey + '_posthog';
  var projectNames = [mainName, mainName + '__flags', mainName + '__surveys'];

  ['pending', 'failed'].forEach(function(sdkState) {
    var storageValues = { ph_unrelated_posthog: 'keep' };
    var sessionValues = { ph_unrelated_posthog: 'keep' };
    projectNames.forEach(function(name) {
      storageValues[name] = 'old-identity';
      sessionValues[name] = 'old-session';
    });
    var harness = createHarness({
      rawConsent: '{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}',
      storageValues: storageValues,
      sessionStorageValues: sessionValues
    });
    if (sdkState === 'failed') harness.failPostHog();
    harness.calls.length = 0;

    harness.api.setPreferences({ persistentAnalytics: false, marketing: false });

    assert.strictEqual(
      harness.values[CONSENT_KEY],
      '{"schemaVersion":1,"persistentAnalytics":false,"marketing":false}'
    );
    projectNames.forEach(function(name) {
      assert.strictEqual(harness.values[name], undefined);
      assert.strictEqual(harness.sessionValues[name], undefined);
      assert(harness.cookieWrites.some(function(write) { return write.indexOf(name + '=') === 0; }));
    });
    assert.strictEqual(harness.values.ph_unrelated_posthog, 'keep');
    assert.strictEqual(harness.sessionValues.ph_unrelated_posthog, 'keep');

    var saveIndex = harness.calls.findIndex(function(call) { return call[0] === 'storage:set'; });
    var cleanupIndex = harness.calls.findIndex(function(call) { return call[0] === 'storage:remove'; });
    var reloadIndex = harness.calls.findIndex(function(call) { return call[0] === 'reload'; });
    assert(saveIndex < cleanupIndex);
    assert(cleanupIndex < reloadIndex);
  });
});

test('loads Meta once on grant and revokes consent before reload', function() {
  var harness = createHarness({
    config: {
      enabled: true,
      posthogKey: 'phc_placeholder',
      posthogHost: 'https://p.dev-academy.com',
      posthogAssetHost: 'https://eu-assets.i.posthog.com',
      metaPixelId: VALID_CONFIG.metaPixelId
    }
  });
  harness.api.setPreferences({ persistentAnalytics: false, marketing: true });
  var firstQueue = plain(harness.window.fbq.queue);
  assert.deepStrictEqual(firstQueue, [
    ['consent', 'grant'],
    ['init', VALID_CONFIG.metaPixelId],
    ['track', 'PageView', {}, { eventID: 'generated-event-0' }],
    ['track', 'ViewContent', {}, { eventID: 'generated-event-1' }]
  ]);
  assert.strictEqual(harness.appendedScripts.filter(function(script) {
    return script.src === 'https://connect.facebook.net/en_US/fbevents.js';
  }).length, 1);

  harness.api.setPreferences({ persistentAnalytics: false, marketing: true });
  assert.deepStrictEqual(plain(harness.window.fbq.queue), firstQueue);
  harness.calls.length = 0;
  harness.api.setPreferences({ persistentAnalytics: false, marketing: false });
  assert.strictEqual(harness.calls[0][0], 'storage:set');
  assert.deepStrictEqual(plain(harness.window.fbq.queue).slice(-1)[0], ['consent', 'revoke']);
  assert.deepStrictEqual(harness.calls.slice(-1)[0], ['reload']);
});

test('captures fbclid only after marketing consent and mirrors landing events with shared IDs', function() {
  var harness = createHarness({
    config: {
      enabled: true,
      posthogKey: 'phc_placeholder',
      posthogHost: 'https://p.dev-academy.com',
      posthogAssetHost: 'https://eu-assets.i.posthog.com',
      metaPixelId: VALID_CONFIG.metaPixelId
    },
    search: '?fbclid=test-click-123&email=private%40example.com',
    eventIds: ['page-event-id', 'view-event-id'],
    now: 1700000000000
  });

  assert.strictEqual(harness.cookieValues._fbc, undefined);
  assert.strictEqual(harness.calls.filter(function(call) { return call[0] === 'fetch'; }).length, 0);

  harness.setNow(1800000000000);
  harness.api.setPreferences({ persistentAnalytics: false, marketing: true });

  assert.strictEqual(harness.cookieValues._fbc, 'fb.1.1700000000000.test-click-123');
  var pixelEvents = plain(harness.window.fbq.queue).filter(function(call) {
    return call[0] === 'track';
  });
  assert.deepStrictEqual(pixelEvents, [
    ['track', 'PageView', {}, { eventID: 'page-event-id' }],
    ['track', 'ViewContent', {}, { eventID: 'view-event-id' }]
  ]);

  var serverPayloads = harness.calls.filter(function(call) {
    return call[0] === 'fetch';
  }).map(function(call) {
    assert.strictEqual(call[1], '/api/meta/events');
    assert.strictEqual(call[2].method, 'POST');
    assert.strictEqual(call[2].credentials, 'same-origin');
    assert.strictEqual(call[2].keepalive, true);
    return JSON.parse(call[2].body);
  });
  assert.deepStrictEqual(serverPayloads, [
    {
      event_name: 'PageView',
      event_id: 'page-event-id',
      event_source_url: 'https://dev-academy.com/knowledge-pills/',
      fbc: 'fb.1.1700000000000.test-click-123',
      custom_data: {}
    },
    {
      event_name: 'ViewContent',
      event_id: 'view-event-id',
      event_source_url: 'https://dev-academy.com/knowledge-pills/',
      fbc: 'fb.1.1700000000000.test-click-123',
      custom_data: {}
    }
  ]);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(serverPayloads[0], 'fbclid'), false);
  assert.strictEqual(JSON.stringify(serverPayloads).indexOf('private@example.com'), -1);
});

test('removes Meta browser identifiers when marketing consent is rejected or revoked', function() {
  var stale = createHarness({
    config: null,
    cookieValues: {
      _fbc: 'fb.1.1690000000000.old-click',
      _fbp: 'fb.1.1690000000000.1234567890'
    }
  });
  stale.api.rejectAll();
  assert.strictEqual(stale.cookieValues._fbc, undefined);
  assert.strictEqual(stale.cookieValues._fbp, undefined);

  var granted = createHarness({
    rawConsent: '{"schemaVersion":1,"persistentAnalytics":false,"marketing":true}',
    config: {
      enabled: true,
      posthogKey: 'phc_placeholder',
      posthogHost: 'https://p.dev-academy.com',
      posthogAssetHost: 'https://eu-assets.i.posthog.com',
      metaPixelId: VALID_CONFIG.metaPixelId
    },
    cookieValues: {
      _fbc: 'fb.1.1690000000000.old-click',
      _fbp: 'fb.1.1690000000000.1234567890'
    }
  });
  granted.api.setPreferences({persistentAnalytics: false, marketing: false});
  assert.strictEqual(granted.cookieValues._fbc, undefined);
  assert.strictEqual(granted.cookieValues._fbp, undefined);
});

test('reuses an existing fbc and deduplicates a consented Lead without leaking custom data', function() {
  var existingFbc = 'fb.1.1690000000000.existing-click';
  var harness = createHarness({
    rawConsent: '{"schemaVersion":1,"persistentAnalytics":false,"marketing":true}',
    config: {
      enabled: true,
      posthogKey: 'phc_placeholder',
      posthogHost: 'https://p.dev-academy.com',
      posthogAssetHost: 'https://eu-assets.i.posthog.com',
      metaPixelId: VALID_CONFIG.metaPixelId
    },
    search: '?fbclid=new-click',
    cookieValues: { _fbc: existingFbc },
    eventIds: ['page-id', 'view-id', 'lead-event-id']
  });

  harness.calls.length = 0;
  var eventId = harness.api.trackMeta('Lead', {
    content_name: 'pills_eu_launch',
    content_category: 'newsletter',
    email: 'private@example.com'
  });

  assert.strictEqual(eventId, 'lead-event-id');
  assert.strictEqual(harness.cookieValues._fbc, existingFbc);
  assert.strictEqual(harness.cookieWrites.some(function(write) {
    return write.indexOf('_fbc=') === 0;
  }), false);
  assert.deepStrictEqual(plain(harness.window.fbq.queue).slice(-1)[0], [
    'track',
    'Lead',
    { content_name: 'pills_eu_launch', content_category: 'newsletter' },
    { eventID: 'lead-event-id' }
  ]);
  var request = harness.calls.filter(function(call) { return call[0] === 'fetch'; })[0];
  var payload = JSON.parse(request[2].body);
  assert.deepStrictEqual(payload, {
    event_name: 'Lead',
    event_id: 'lead-event-id',
    event_source_url: 'https://dev-academy.com/knowledge-pills/',
    fbc: existingFbc,
    custom_data: {
      content_name: 'pills_eu_launch',
      content_category: 'newsletter'
    }
  });
  assert.strictEqual(JSON.stringify(payload).indexOf('private@example.com'), -1);
  assert.strictEqual(harness.api.trackMeta('Purchase', {}), null);
});

test('applies storage synchronization without writing or emitting another consent event', function() {
  var harness = createHarness();
  harness.attachPostHog();
  harness.calls.length = 0;
  var notifications = [];
  harness.api.subscribe(function(state) { notifications.push(plain(state)); });

  harness.api.applyExternalState('{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}');
  assert.strictEqual(harness.storageWrites.length, 0);
  assert.strictEqual(captures(harness, 'consent_preferences_updated').length, 0);
  assert.deepStrictEqual(harness.calls, [['posthog:set_config', { persistence: 'localStorage+cookie' }]]);
  assert.deepStrictEqual(notifications, [{ decided: true, persistentAnalytics: true, marketing: false }]);

  harness.calls.length = 0;
  harness.api.applyExternalState('{broken');
  assert.deepStrictEqual(harness.calls, []);
  assert.strictEqual(notifications.length, 1);
});

test('keeps controls functional when storage writes fail', function() {
  var harness = createHarness({ config: null, throwOnStorageWrite: true });
  assert.doesNotThrow(function() { harness.api.acceptAll(); });
  assert.deepStrictEqual(plain(harness.api.getState()), {
    decided: true,
    persistentAnalytics: true,
    marketing: true
  });
});

test('keeps PostHog memory-only and the next load undecided when consent storage is denied', function() {
  var harness = createHarness({ throwOnStorageWrite: true });
  harness.attachPostHog();
  harness.calls.length = 0;

  assert.doesNotThrow(function() { harness.api.acceptAll(); });
  assert.deepStrictEqual(plain(harness.api.getState()), {
    decided: true,
    persistentAnalytics: true,
    marketing: true
  });
  assert.strictEqual(harness.values[CONSENT_KEY], undefined);
  assert.strictEqual(harness.calls.some(function(call) {
    return call[0] === 'posthog:set_config' && call[1].persistence === 'localStorage+cookie';
  }), false);
  assert.strictEqual(harness.calls.some(function(call) {
    return call[0] === 'posthog:set_config' && call[1].persistence === 'memory';
  }), true);

  assert.strictEqual(createHarness({ config: null }).api.getState().decided, false);
});

test('initializes a pending PostHog client in memory after an accept-all storage failure', function() {
  var harness = createHarness({ throwOnStorageWrite: true });

  harness.api.acceptAll();
  harness.attachPostHog();

  var clientCalls = harness.calls.filter(function(call) {
    return call[0].indexOf('posthog:') === 0;
  });
  var init = clientCalls[0];
  assert.strictEqual(init[0], 'posthog:init');
  assert.strictEqual(init[2].persistence, 'memory');
  assert.strictEqual(clientCalls.some(function(call) {
    return call[0] === 'posthog:init' && call[2].persistence === 'localStorage+cookie';
  }), false);
  assert.strictEqual(clientCalls.some(function(call) {
    return call[0] === 'posthog:set_config' && call[1].persistence === 'localStorage+cookie';
  }), false);
  assert.strictEqual(harness.values[CONSENT_KEY], undefined);
});

test('revokes effective persistence when a same-value durable save fails', function() {
  var mainName = 'ph_' + VALID_CONFIG.posthogKey + '_posthog';
  var projectNames = [mainName, mainName + '__flags', mainName + '__surveys'];
  var storageValues = { ph_unrelated_posthog: 'keep' };
  var sessionValues = { ph_unrelated_posthog: 'keep' };
  projectNames.forEach(function(name) {
    storageValues[name] = 'old-identity';
    sessionValues[name] = 'old-session';
  });
  var harness = createHarness({
    rawConsent: '{"schemaVersion":1,"persistentAnalytics":true,"marketing":false}',
    storageValues: storageValues,
    sessionStorageValues: sessionValues,
    throwOnStorageWrite: true
  });
  harness.attachPostHog();
  harness.calls.length = 0;

  harness.api.setPreferences({ persistentAnalytics: true, marketing: false });

  assert.strictEqual(harness.values[CONSENT_KEY], undefined);
  projectNames.forEach(function(name) {
    assert.strictEqual(harness.values[name], undefined);
    assert.strictEqual(harness.sessionValues[name], undefined);
    assert(harness.cookieWrites.some(function(write) { return write.indexOf(name + '=') === 0; }));
  });
  assert.strictEqual(harness.values.ph_unrelated_posthog, 'keep');
  assert.strictEqual(harness.sessionValues.ph_unrelated_posthog, 'keep');
  assert.deepStrictEqual(plain(harness.api.getState()), {
    decided: true,
    persistentAnalytics: true,
    marketing: false
  });
  assert.deepStrictEqual(harness.calls.filter(function(call) {
    return call[0] === 'posthog:reset' ||
      call[0] === 'posthog:persistence:clear' ||
      call[0] === 'posthog:set_config';
  }), [
    ['posthog:reset', true],
    ['posthog:persistence:clear'],
    ['posthog:set_config', { persistence: 'memory' }]
  ]);
  assert.strictEqual(harness.calls.slice(-1)[0][0], 'reload');
});

test('enables durable PostHog immediately when a same-value accept retry persists', function() {
  var options = { throwOnStorageWrite: true };
  var harness = createHarness(options);
  harness.attachPostHog();

  harness.api.acceptAll();
  options.throwOnStorageWrite = false;
  harness.calls.length = 0;
  harness.api.acceptAll();

  assert.strictEqual(
    harness.values[CONSENT_KEY],
    '{"schemaVersion":1,"persistentAnalytics":true,"marketing":true}'
  );
  assert.strictEqual(harness.calls.some(function(call) {
    return call[0] === 'posthog:set_config' && call[1].persistence === 'localStorage+cookie';
  }), true);
});

test('removes a stale durable decision when replacing consent storage is denied', function() {
  var harness = createHarness({
    rawConsent: JSON.stringify({
      schemaVersion: 1,
      persistentAnalytics: true,
      marketing: true
    }),
    throwOnStorageWrite: true
  });

  harness.api.rejectAll();

  assert.strictEqual(harness.values[CONSENT_KEY], undefined);
  assert.strictEqual(harness.calls.some(function(call) {
    return call[0] === 'storage:remove' && call[1] === CONSENT_KEY;
  }), true);
  assert.strictEqual(createHarness({
    config: null,
    storageValues: harness.values
  }).api.getState().decided, false);
});

test('Hexo privacy config honors public environment overrides without changing unrelated values', function() {
  var registered;
  var sandbox = {
    process: { env: {
      PUBLIC_POSTHOG_KEY: 'phc_from_env',
      PUBLIC_POSTHOG_HOST: 'https://ingest.example',
      PUBLIC_POSTHOG_ASSET_HOST: 'https://assets.example',
      PUBLIC_META_PIXEL_ID: '987654321098765'
    } },
    hexo: {
      config: { privacy: { enabled: true, untouched: 'value' } },
      extend: { filter: { register: function(name, callback) {
        assert.strictEqual(name, 'before_generate');
        registered = callback;
      } } }
    }
  };
  vm.runInNewContext(fs.readFileSync(CONFIG_PATH, 'utf8'), sandbox, { filename: CONFIG_PATH });
  registered();
  assert.deepStrictEqual(plain(sandbox.hexo.config.privacy), {
    enabled: true,
    untouched: 'value',
    posthog_key: 'phc_from_env',
    posthog_host: 'https://ingest.example',
    posthog_asset_host: 'https://assets.example',
    meta_pixel_id: '987654321098765'
  });
});

test('development and production configs provide versioned public analytics defaults', function() {
  ['_dev.yml', '_prod.yml'].forEach(function(filename) {
    var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'));
    var privacy = config.privacy;
    assert(/^phc_[A-Za-z0-9_-]{20,}$/.test(privacy.posthog_key), filename + ' must version the PostHog project key');
    assert(/^\d{8,}$/.test(privacy.meta_pixel_id) && privacy.meta_pixel_id !== '000000000000000', filename + ' must version the Meta Pixel ID');
    assert(privacy.posthog_host === 'https://p.dev-academy.com', filename + ' must use the first-party PostHog host');
    assert(privacy.posthog_asset_host === 'https://eu-assets.i.posthog.com', filename + ' must use the approved PostHog asset host');
  });
});

console.log('Privacy runtime verification passed: ' + testsRun + '/' + testsRun + ' tests.');
