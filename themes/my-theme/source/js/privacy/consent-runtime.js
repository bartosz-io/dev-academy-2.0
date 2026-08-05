(function(window, document) {
  'use strict';

  var CONSENT_KEY = 'dev_academy_consent_v1';
  var SCHEMA_VERSION = 1;
  var POSTHOG_PLACEHOLDER = 'phc_placeholder';
  var META_PLACEHOLDER = '000000000000000';
  var listeners = [];
  var captureQueue = [];
  var posthogOperations = [];
  var posthogClient = null;
  var posthogSettled = false;
  var config = window.DEV_ACADEMY_PRIVACY_CONFIG || {};
  var state = readState();

  function parseConsent(raw) {
    try {
      var value = JSON.parse(raw);
      if (value.schemaVersion === SCHEMA_VERSION &&
          typeof value.persistentAnalytics === 'boolean' &&
          typeof value.marketing === 'boolean') {
        return {
          decided: true,
          persistentAnalytics: value.persistentAnalytics,
          marketing: value.marketing
        };
      }
    } catch (error) {}
    return { decided: false, persistentAnalytics: false, marketing: false };
  }

  function serializeConsent(value) {
    return JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      persistentAnalytics: value.persistentAnalytics === true,
      marketing: value.marketing === true
    });
  }

  function copyState(value) {
    return {
      decided: value.decided,
      persistentAnalytics: value.persistentAnalytics,
      marketing: value.marketing
    };
  }

  function readState() {
    try {
      return parseConsent(window.localStorage.getItem(CONSENT_KEY));
    } catch (error) {
      return parseConsent(null);
    }
  }

  function isPostHogConfigured() {
    return config.enabled !== false &&
      typeof config.posthogKey === 'string' &&
      config.posthogKey !== '' &&
      config.posthogKey !== POSTHOG_PLACEHOLDER &&
      typeof config.posthogHost === 'string' &&
      config.posthogHost !== '' &&
      typeof config.posthogAssetHost === 'string' &&
      config.posthogAssetHost !== '';
  }

  function isMetaConfigured() {
    return config.enabled !== false &&
      typeof config.metaPixelId === 'string' &&
      config.metaPixelId !== '' &&
      config.metaPixelId !== META_PLACEHOLDER;
  }

  function safeReferrerHostname() {
    if (!document.referrer) return null;
    try {
      return new URL(document.referrer).hostname;
    } catch (error) {
      return null;
    }
  }

  function safeCaptureProperties(properties) {
    var result = {
      event_schema_version: 2,
      page_path: window.location.pathname
    };
    var blockedNames = {
      event_schema_version: true,
      page_path: true,
      posthog_key: true,
      posthogKey: true,
      posthog_host: true,
      posthogHost: true,
      posthog_asset_host: true,
      posthogAssetHost: true,
      meta_pixel_id: true,
      metaPixelId: true
    };
    var vendorValues = [
      config.posthogKey,
      config.posthogHost,
      config.posthogAssetHost,
      config.metaPixelId
    ];

    if (!properties || typeof properties !== 'object') return result;
    Object.keys(properties).forEach(function(name) {
      if (blockedNames[name] || vendorValues.indexOf(properties[name]) !== -1) return;
      result[name] = properties[name];
    });
    return result;
  }

  function capture(event, properties) {
    var safeProperties = safeCaptureProperties(properties);
    if (posthogClient) {
      try {
        posthogClient.capture(event, safeProperties);
      } catch (error) {}
      return;
    }
    if (!posthogSettled) captureQueue.push([event, safeProperties]);
  }

  function withPostHog(operation) {
    if (posthogClient) {
      try {
        operation(posthogClient);
      } catch (error) {}
    } else if (!posthogSettled) {
      posthogOperations.push(operation);
    }
  }

  function notify() {
    listeners.slice().forEach(function(listener) {
      try {
        listener(copyState(state));
      } catch (error) {}
    });
  }

  function saveState() {
    try {
      window.localStorage.setItem(CONSENT_KEY, serializeConsent(state));
    } catch (error) {}
  }

  function reloadPage() {
    try {
      window.location.reload();
    } catch (error) {}
  }

  function applyState(next, action, persist) {
    var previous = state;
    var grantedPersistence;
    var revokedPersistence;
    var grantedMarketing;
    var revokedMarketing;

    state = {
      decided: true,
      persistentAnalytics: next.persistentAnalytics === true,
      marketing: next.marketing === true
    };
    if (persist) saveState();

    grantedPersistence = !previous.persistentAnalytics && state.persistentAnalytics;
    revokedPersistence = previous.persistentAnalytics && !state.persistentAnalytics;
    grantedMarketing = !previous.marketing && state.marketing;
    revokedMarketing = previous.marketing && !state.marketing;

    if (grantedPersistence) {
      withPostHog(function(client) {
        if (typeof client.set_config === 'function') {
          client.set_config({ persistence: 'localStorage+cookie' });
        }
      });
    }
    if (revokedPersistence) {
      withPostHog(function(client) {
        if (typeof client.reset === 'function') client.reset(true);
      });
      withPostHog(function(client) {
        if (client.persistence && typeof client.persistence.clear === 'function') {
          client.persistence.clear();
        }
      });
      withPostHog(function(client) {
        if (typeof client.set_config === 'function') client.set_config({ persistence: 'memory' });
      });
    }

    if (grantedMarketing) loadMetaPixel();
    if (revokedMarketing) revokeMetaPixel();

    if (persist) {
      capture('consent_preferences_updated', {
        action: action,
        persistent_analytics: state.persistentAnalytics,
        marketing: state.marketing
      });
    }
    notify();

    if (revokedPersistence || revokedMarketing) reloadPage();
    return copyState(state);
  }

  function finishPostHogLoad(client) {
    var queuedOperations;
    var queuedCaptures;

    if (!client || typeof client.init !== 'function') {
      posthogSettled = true;
      captureQueue = [];
      posthogOperations = [];
      return;
    }

    try {
      client.init(config.posthogKey, {
        api_host: config.posthogHost,
        autocapture: false,
        capture_pageview: false,
        person_profiles: 'identified_only',
        persistence: state.persistentAnalytics ? 'localStorage+cookie' : 'memory',
        disable_session_recording: false,
        session_recording: { maskAllInputs: true }
      });
      posthogClient = client;
    } catch (error) {
      posthogSettled = true;
      captureQueue = [];
      posthogOperations = [];
      return;
    }

    posthogSettled = true;
    queuedOperations = posthogOperations;
    posthogOperations = [];
    queuedOperations.forEach(function(operation) {
      try {
        operation(posthogClient);
      } catch (error) {}
    });

    capture('$pageview', {
      $current_url: window.location.origin + window.location.pathname,
      $referrer: safeReferrerHostname()
    });
    queuedCaptures = captureQueue;
    captureQueue = [];
    queuedCaptures.forEach(function(queued) {
      try {
        posthogClient.capture(queued[0], queued[1]);
      } catch (error) {}
    });
  }

  function loadPostHog() {
    var script;
    if (!isPostHogConfigured()) {
      finishPostHogLoad(null);
      return;
    }
    if (window.posthog && typeof window.posthog.init === 'function') {
      finishPostHogLoad(window.posthog);
      return;
    }

    try {
      script = document.createElement('script');
      script.async = true;
      script.src = config.posthogAssetHost + '/static/array.js';
      script.onload = function() { finishPostHogLoad(window.posthog); };
      script.onerror = function() { finishPostHogLoad(null); };
      document.head.appendChild(script);
    } catch (error) {
      finishPostHogLoad(null);
    }
  }

  function loadMetaPixel() {
    var fbq;
    var script;
    var firstScript;
    if (!isMetaConfigured()) return;

    try {
      if (window.fbq) {
        window.fbq('consent', 'grant');
        return;
      }

      fbq = function() {
        var args = Array.prototype.slice.call(arguments);
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };
      window.fbq = fbq;
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];

      script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }

      window.fbq('consent', 'grant');
      window.fbq('init', config.metaPixelId);
      window.fbq('track', 'PageView');
      window.fbq('track', 'ViewContent');
    } catch (error) {}
  }

  function revokeMetaPixel() {
    try {
      if (window.fbq) window.fbq('consent', 'revoke');
    } catch (error) {}
  }

  window.DevAcademyPrivacy = {
    CONSENT_KEY: CONSENT_KEY,
    getState: function() { return copyState(state); },
    setPreferences: function(next) {
      return applyState(next || {}, 'save_preferences', true);
    },
    acceptAll: function() {
      return applyState({ persistentAnalytics: true, marketing: true }, 'accept_all', true);
    },
    rejectAll: function() {
      return applyState({ persistentAnalytics: false, marketing: false }, 'reject_all', true);
    },
    subscribe: function(listener) {
      if (typeof listener !== 'function') return function() {};
      listeners.push(listener);
      return function() {
        listeners = listeners.filter(function(candidate) { return candidate !== listener; });
      };
    },
    capture: capture,
    applyExternalState: function(raw) {
      var external = parseConsent(raw);
      if (!external.decided) return;
      return applyState(external, 'storage_sync', false);
    }
  };

  loadPostHog();
  if (state.marketing) loadMetaPixel();
}(window, document));
