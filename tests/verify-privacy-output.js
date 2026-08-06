'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function readPublic(relativePath) {
  return fs.readFileSync(path.join(PUBLIC_DIR, relativePath), 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function runCheck(name, check) {
  try {
    check();
    console.log('PASS ' + name);
  } catch (error) {
    console.error('FAIL ' + name + ': ' + error.message);
    process.exitCode = 1;
  }
}

const homepage = readPublic('index.html');
const articles = readPublic('articles/index.html');
const welcome = readPublic('welcome/index.html');
const webSecurityGift = readPublic('web-security-welcome-gift/index.html');
const checklistGift = readPublic('checklist-welcome-gift/index.html');
const runtime = readPublic('js/privacy/consent-runtime.js');
const mainSource = fs.readFileSync(
  path.join(ROOT, 'themes', 'my-theme', 'source', 'js', 'main.js'),
  'utf8'
);
const layoutSource = fs.readFileSync(
  path.join(ROOT, 'themes', 'my-theme', 'layout', 'layout.ejs'),
  'utf8'
);

runCheck('renders the shared consent copy and selector map once on every layout branch', function() {
  [homepage, articles, welcome].forEach(function(html) {
    assert(html.includes('Memory-only analytics and masked session replay are always active'));
    assert.strictEqual(count(html, 'id="consent-banner"'), 1);
    assert.strictEqual(count(html, 'id="privacy-dialog"'), 1);
    assert.strictEqual(count(html, 'id="persistent-analytics-consent"'), 1);
    assert.strictEqual(count(html, 'id="marketing-consent"'), 1);
    assert(html.includes('data-accept-all'));
    assert(html.includes('data-reject-all'));
    assert(html.includes('data-save-privacy-settings'));
    assert(html.includes('data-open-privacy-settings'));
  });
  assert(homepage.includes('class="privacy-settings-footer"'));
  assert(welcome.includes('class="privacy-settings-compact"'));
});

runCheck('loads one consent runtime before main and removes legacy vendor scripts', function() {
  [homepage, articles, welcome].forEach(function(html) {
    assert.strictEqual(count(html, '/js/privacy/consent-runtime.js'), 1);
    assert.strictEqual(count(html, '/js/main.js'), 1);
    assert(html.indexOf('/js/privacy/consent-runtime.js') < html.indexOf('/js/main.js'));
    assert(!html.includes('/js/posthog/posthog.js'));
    assert(!html.includes('/js/posthog/testing/dumb-test.js'));
    assert(!html.includes('/js/posthog/testing/main-banner-test.js'));
  });
  assert(runtime.includes('dev_academy_consent_v1'));
});

function exerciseGiftPage(html, pathname, expectedGift) {
  const inlineScripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g));
  const pageScript = inlineScripts.map(function(match) { return match[1]; }).find(function(source) {
    return source.includes('startCountdown');
  });
  const calls = [];
  const listeners = {};
  const storage = {};
  const elements = {
    hours: {innerHTML: ''},
    minutes: {innerHTML: ''},
    seconds: {innerHTML: ''},
    'countdown-timer': {innerHTML: ''},
    'progress-bar': {style: {}},
    link: {href: 'https://courses.dev-academy.com/p/security-starter-kit/'}
  };
  const window = {
    location: {
      origin: 'https://dev-academy.com',
      pathname: pathname,
      search: '?id=synthetic%40example.invalid&utm_source=test',
      hash: '#private'
    },
    history: {
      replaceState: function(state, title, url) { calls.push(['history:replace', url]); }
    },
    addEventListener: function(type, listener) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(listener);
    }
  };
  const document = {
    getElementById: function(id) { return elements[id]; }
  };
  const localStorage = {
    getItem: function(key) { return storage[key] || null; },
    setItem: function(key, value) { storage[key] = value; }
  };

  assert(pageScript, 'expected a gift-page inline script');
  vm.runInNewContext(pageScript, {
    window: window,
    document: document,
    localStorage: localStorage,
    URL: URL,
    URLSearchParams: URLSearchParams,
    Date: Date,
    setInterval: function(callback) { callback(); return 1; },
    clearInterval: function() {},
    setTimeout: function() { return 1; },
    clearTimeout: function() {}
  });

  assert.deepStrictEqual(calls[0], ['history:replace', pathname]);
  assert(storage.countDownDate, 'countdown must initialize without PostHog');
  assert(elements.link.href.includes('countDownDate='));
  assert(!elements.link.href.includes('#id='));
  assert.strictEqual(listeners.PH_Ready, undefined);

  window.DevAcademyPrivacy = {
    capture: function(event, properties) { calls.push(['capture', event, properties]); }
  };
  (listeners.DOMContentLoaded || []).forEach(function(listener) { listener(); });
  assert.deepStrictEqual(plain(calls.slice(-1)[0]), [
    'capture',
    'gift_confirmation_viewed',
    { gift: expectedGift }
  ]);
}

runCheck('keeps both gift confirmations functional with PostHog blocked and emits no identity', function() {
  [webSecurityGift, checklistGift].forEach(function(html) {
    assert(!html.includes('PH_Ready'));
    assert(!html.includes('posthog.identify'));
    assert(!html.includes('posthog.get_distinct_id'));
    assert(!html.includes("posthog.capture('wsda_subscribe_confirm'"));
  });
  exerciseGiftPage(webSecurityGift, '/web-security-welcome-gift/', 'web_security_course');
  exerciseGiftPage(checklistGift, '/checklist-welcome-gift/', 'security_checklist');
});

runCheck('serializes only escaped public vendor configuration', function() {
  const match = homepage.match(/window\.DEV_ACADEMY_PRIVACY_CONFIG\s*=\s*({[^;]+});/);
  assert(match, 'missing serialized privacy config');
  const config = vm.runInNewContext('(' + match[1] + ')');
  assert.deepStrictEqual(
    Object.keys(config).sort(),
    ['metaPixelId', 'posthogAssetHost', 'posthogHost', 'posthogKey']
  );
  assert(/^phc_[A-Za-z0-9_-]{20,}$/.test(config.posthogKey), 'PostHog production default must be versioned');
  assert(/^\d{8,}$/.test(config.metaPixelId) && config.metaPixelId !== '000000000000000', 'Meta production default must be versioned');
  assert(config.posthogHost === 'https://p.dev-academy.com', 'PostHog ingest host must use the first-party endpoint');
  assert(config.posthogAssetHost === 'https://eu-assets.i.posthog.com', 'PostHog asset host must use the approved endpoint');
  assert(layoutSource.includes(".replace(/</g, '\\\\u003c')"));
});

function listenerTarget() {
  const listeners = {};
  return {
    listeners: listeners,
    addEventListener: function(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    }
  };
}

function evaluateMain(document, window, extras) {
  const sandbox = Object.assign({
    console: console,
    document: document,
    window: window,
    MutationObserver: function() { this.observe = function() {}; },
    IntersectionObserver: function() { this.observe = function() {}; },
    URL: URL,
    URLSearchParams: URLSearchParams,
    Set: Set
  }, extras || {});
  vm.createContext(sandbox);
  vm.runInContext(mainSource, sandbox);
  return sandbox;
}

function control() {
  const target = listenerTarget();
  target.hidden = true;
  target.checked = false;
  return target;
}

runCheck('binds consent controls once and filters cross-app storage synchronization', function() {
  const banner = control();
  const dialog = control();
  dialog.open = false;
  dialog.showModal = function() { dialog.open = true; };
  dialog.close = function() { dialog.open = false; };
  const persistent = control();
  const marketing = control();
  const configure = control();
  const accept = control();
  const reject = control();
  const save = control();
  const captures = [];
  const externalStates = [];
  const subscriptions = [];
  const calls = [];
  const runtimeApi = {
    CONSENT_KEY: 'dev_academy_consent_v1',
    getState: function() {
      return {decided: false, persistentAnalytics: false, marketing: false};
    },
    subscribe: function(listener) { subscriptions.push(listener); },
    capture: function(event, properties) { captures.push([event, properties]); },
    acceptAll: function() { calls.push('accept'); },
    rejectAll: function() { calls.push('reject'); },
    setPreferences: function(value) { calls.push(['save', value]); },
    applyExternalState: function(raw) { externalStates.push(raw); }
  };
  const documentTarget = listenerTarget();
  const document = Object.assign(documentTarget, {
    body: {dataset: {}},
    querySelector: function(selector) {
      return {
        '#consent-banner': banner,
        '#privacy-dialog': dialog,
        '#persistent-analytics-consent': persistent,
        '#marketing-consent': marketing,
        '[data-reject-all]': reject,
        '[data-save-privacy-settings]': save
      }[selector] || null;
    },
    querySelectorAll: function(selector) {
      if (selector === '[data-open-privacy-settings]') return [configure];
      if (selector === '[data-accept-all]') return [accept];
      return [];
    }
  });
  const windowTarget = listenerTarget();
  const window = Object.assign(windowTarget, {
    DevAcademyPrivacy: runtimeApi,
    location: {origin: 'https://dev-academy.com', pathname: '/', search: ''}
  });
  const sandbox = evaluateMain(document, window);

  sandbox.privacyControls();
  assert.strictEqual(banner.hidden, false);
  assert.deepStrictEqual(captures, [['consent_banner_viewed', undefined]]);
  assert.strictEqual(window.listeners.storage.length, 1);

  subscriptions[0]({decided: true, persistentAnalytics: true, marketing: false});
  assert.strictEqual(persistent.checked, true);
  assert.strictEqual(marketing.checked, false);
  assert.strictEqual(banner.hidden, true);

  configure.listeners.click[0]();
  accept.listeners.click[0]();
  reject.listeners.click[0]();
  persistent.checked = false;
  marketing.checked = true;
  save.listeners.click[0]();
  assert.deepStrictEqual(plain(calls), [
    'accept',
    'reject',
    ['save', {persistentAnalytics: false, marketing: true}]
  ]);

  window.listeners.storage[0]({key: 'unrelated', newValue: 'ignored'});
  window.listeners.storage[0]({key: 'dev_academy_consent_v1', newValue: 'shared'});
  assert.deepStrictEqual(externalStates, ['shared']);
});

runCheck('allowlists and canonicalizes paid attribution values', function() {
  const sandbox = evaluateMain(listenerTarget(), listenerTarget());
  assert.deepStrictEqual(plain(sandbox.paidAttribution(
    '?utm_source=Meta&utm_medium=paid social&utm_campaign=pills_eu_launch' +
    '&utm_content=security_a&email=secret%40example.com&fbclid=secret-click'
  )), {
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'pills_eu_launch',
    utm_content: 'security_a'
  });
});

runCheck('captures each newsletter view once and only valid privacy-safe submissions', function() {
  const captures = [];
  const observers = [];
  function newsletterForm(placement, valid) {
    const target = listenerTarget();
    const attributionInputs = {
      utm_source: {value: ''},
      utm_medium: {value: ''},
      utm_campaign: {value: ''},
      utm_content: {value: ''}
    };
    return Object.assign(target, {
      dataset: {newsletterTopic: 'both', newsletterPlacement: placement},
      attributionInputs: attributionInputs,
      checkValidity: function() { return valid.value; },
      querySelector: function(selector) {
        const match = selector.match(/^\[data-newsletter-attribution="([a-z_]+)"\]$/);
        return match ? attributionInputs[match[1]] || null : null;
      }
    });
  }
  const validity = {value: false};
  const first = newsletterForm('homepage_hero', validity);
  const second = newsletterForm('homepage_final', {value: true});
  const documentTarget = listenerTarget();
  const document = Object.assign(documentTarget, {
    querySelectorAll: function(selector) {
      return selector === '.newsletter-form' ? [first, second] : [];
    }
  });
  const windowTarget = listenerTarget();
  const window = Object.assign(windowTarget, {
    DevAcademyPrivacy: {
      capture: function(event, properties) { captures.push([event, properties]); }
    },
    location: {
      origin: 'https://dev-academy.com',
      pathname: '/',
      search: '?utm_source=Meta&utm_medium=paid social&utm_campaign=pills_eu_launch' +
        '&utm_content=security_a&fbclid=secret-click&id=email%40example.com'
    }
  });
  function FakeIntersectionObserver(callback) {
    this.callback = callback;
    this.observed = [];
    this.observe = function(node) { this.observed.push(node); };
    this.unobserve = function() {};
    observers.push(this);
  }
  const sandbox = evaluateMain(document, window, {IntersectionObserver: FakeIntersectionObserver});

  sandbox.newsletterAnalytics();
  assert.strictEqual(observers.length, 1);
  assert.deepStrictEqual(observers[0].observed, [first, second]);
  assert.deepStrictEqual(plain(first.attributionInputs), {
    utm_source: {value: 'meta'},
    utm_medium: {value: 'paid_social'},
    utm_campaign: {value: 'pills_eu_launch'},
    utm_content: {value: 'security_a'}
  });
  observers[0].callback([{target: first, isIntersecting: true}]);
  observers[0].callback([{target: first, isIntersecting: true}]);
  assert.strictEqual(captures.filter(function(call) {
    return call[0] === 'newsletter_form_viewed';
  }).length, 1);

  first.listeners.submit[0]();
  assert.strictEqual(captures.filter(function(call) {
    return call[0] === 'newsletter_submitted';
  }).length, 0);
  validity.value = true;
  first.listeners.submit[0]();
  const submission = captures.find(function(call) { return call[0] === 'newsletter_submitted'; });
  assert.deepStrictEqual(plain(submission), ['newsletter_submitted', {
    topic: 'both',
    placement: 'homepage_hero',
    source_page: '/',
    has_fbclid: true,
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'pills_eu_launch',
    utm_content: 'security_a'
  }]);
  assert(!JSON.stringify(captures).includes('secret-click'));
  assert(!JSON.stringify(captures).includes('email@example.com'));
});

runCheck('maps data-ph clicks to canonical placements and query-free destinations', function() {
  const captures = [];
  const documentTarget = listenerTarget();
  const document = Object.assign(documentTarget, {querySelectorAll: function() { return []; }});
  const windowTarget = listenerTarget();
  const window = Object.assign(windowTarget, {
    DevAcademyPrivacy: {
      capture: function(event, properties) { captures.push([event, properties]); }
    },
    location: {
      origin: 'https://dev-academy.com',
      pathname: '/articles/',
      search: ''
    }
  });
  const sandbox = evaluateMain(document, window);
  const link = {
    getAttribute: function(name) {
      if (name === 'data-ph') return 'Footer Nav / Articles';
      if (name === 'href') return '/articles/?email=user%40example.com#private';
      return null;
    }
  };

  sandbox.uiInteractionAnalytics();
  document.listeners.click[0]({
    target: {closest: function(selector) { return selector === '[data-ph]' ? link : null; }}
  });
  assert.deepStrictEqual(plain(captures), [['ui_interaction_clicked', {
    placement: 'footer_nav_articles',
    destination: 'https://dev-academy.com/articles/'
  }]]);
});

runCheck('keeps legacy site initializers off footerless landing pages', function() {
  const calls = [];
  const documentTarget = listenerTarget();
  const document = Object.assign(documentTarget, {
    body: {
      classList: {
        contains: function(name) { return name === 'landing-page'; }
      }
    }
  });
  const window = Object.assign(listenerTarget(), {
    location: {origin: 'https://dev-academy.com', pathname: '/welcome/', search: ''}
  });
  const sandbox = evaluateMain(document, window);
  [
    'privacyControls',
    'newsletterAnalytics',
    'uiInteractionAnalytics',
    'stickyNavigation',
    'mobileNavigation',
    'isLaptop',
    'isPostPage',
    'isIndexPage',
    'isTagPage',
    'addPostHogDynamicInserts',
    'newsletterSubmitLoaders',
    'loadDisqusComments',
    'loadConvertKit',
    'relatedPosts',
    'contributors',
    'userGoals'
  ].forEach(function(name) {
    sandbox[name] = function() { calls.push(name); };
  });

  document.listeners.DOMContentLoaded[0]();
  assert.deepStrictEqual(calls, [
    'privacyControls',
    'newsletterAnalytics',
    'uiInteractionAnalytics'
  ]);
});

if (process.exitCode) {
  throw new Error('Privacy output checks failed.');
}

console.log('Privacy output and browser integration checks passed.');
