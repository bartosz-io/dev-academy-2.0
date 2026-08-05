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
      calls.push(['posthog:init', key, plain(options)]);
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
  var values = {};
  var storageWrites = [];
  var appendedScripts = [];
  var calls = [];
  var listeners = {};
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
  var window = {
    DEV_ACADEMY_PRIVACY_CONFIG: config,
    localStorage: localStorage,
    location: {
      origin: 'https://dev-academy.com',
      pathname: options.pathname || '/knowledge-pills/',
      search: '?email=private%40example.com',
      reload: function() { calls.push(['reload']); }
    },
    addEventListener: function(type, listener) {
      listeners[type] = listener;
    }
  };
  var context = {
    window: window,
    document: document,
    URL: URL,
    console: console
  };
  context.self = window;
  context.global = context;

  var source = fs.readFileSync(RUNTIME_PATH, 'utf8');
  vm.runInNewContext(source, context, { filename: RUNTIME_PATH });

  return {
    window: window,
    document: document,
    values: values,
    storageWrites: storageWrites,
    appendedScripts: appendedScripts,
    calls: calls,
    listeners: listeners,
    api: window.DevAcademyPrivacy,
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
  assert.deepStrictEqual(init[2], {
    api_host: VALID_CONFIG.posthogHost,
    autocapture: false,
    capture_pageview: false,
    person_profiles: 'identified_only',
    persistence: 'memory',
    disable_session_recording: false,
    session_recording: { maskAllInputs: true }
  });

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
  assert.deepStrictEqual(harness.calls, [
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
    ['track', 'PageView'],
    ['track', 'ViewContent']
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

console.log('Privacy runtime verification passed: ' + testsRun + '/' + testsRun + ' tests.');
