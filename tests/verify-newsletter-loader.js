'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainSource = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'source', 'js', 'main.js'),
  'utf8'
);

function createHarness(isValid) {
  const classes = new Set();
  const attributes = new Map();
  const submitHandlers = [];
  const domContentLoadedHandlers = [];
  const pageShowHandlers = [];
  const observerCallbacks = [];
  const errors = {textContent: ''};
  const button = {
    disabled: false,
    classList: {
      add: function (name) { classes.add(name); },
      remove: function (name) { classes.delete(name); },
      contains: function (name) { return classes.has(name); }
    },
    setAttribute: function (name, value) { attributes.set(name, value); },
    removeAttribute: function (name) { attributes.delete(name); },
    getAttribute: function (name) { return attributes.get(name); }
  };
  const form = {
    checkValidity: function () { return isValid; },
    querySelector: function (selector) {
      if (selector === '.newsletter-form-submit') return button;
      if (selector === '[data-element="errors"]') return errors;
      return null;
    },
    addEventListener: function (eventName, handler) {
      if (eventName === 'submit') submitHandlers.push(handler);
    }
  };
  const sandbox = {
    console: console,
    document: {
      addEventListener: function (eventName, handler) {
        if (eventName === 'DOMContentLoaded') domContentLoadedHandlers.push(handler);
      },
      querySelectorAll: function (selector) {
        return selector === '.newsletter-form' ? [form] : [];
      }
    },
    MutationObserver: function (callback) {
      observerCallbacks.push(callback);
      this.observe = function () {};
    },
    window: {
      addEventListener: function (eventName, handler) {
        if (eventName === 'pageshow') pageShowHandlers.push(handler);
      }
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(mainSource, sandbox);
  sandbox.stickyNavigation = function () {};
  sandbox.mobileNavigation = function () {};
  sandbox.isLaptop = function () { return false; };
  sandbox.isPostPage = function () { return false; };
  sandbox.isIndexPage = function () { return false; };
  sandbox.isTagPage = function () { return false; };
  sandbox.addPostHogDynamicInserts = function () {};
  sandbox.loadDisqusComments = function () {};
  sandbox.loadConvertKit = function () {};
  sandbox.relatedPosts = function () {};
  sandbox.contributors = function () {};
  sandbox.userGoals = function () {};
  domContentLoadedHandlers.forEach(function (handler) { handler(); });

  return {
    button: button,
    errors: errors,
    submit: function () { submitHandlers.forEach(function (handler) { handler(); }); },
    showKitError: function (message) {
      errors.textContent = message;
      observerCallbacks.forEach(function (callback) { callback(); });
    },
    restorePage: function () {
      pageShowHandlers.forEach(function (handler) { handler(); });
    }
  };
}

const validSubmission = createHarness(true);
validSubmission.submit();
assert.strictEqual(validSubmission.button.disabled, true);
assert(validSubmission.button.classList.contains('is-submitting'));
assert.strictEqual(validSubmission.button.getAttribute('aria-busy'), 'true');

validSubmission.showKitError('Please try again.');
assert.strictEqual(validSubmission.button.disabled, false);
assert(!validSubmission.button.classList.contains('is-submitting'));
assert.strictEqual(validSubmission.button.getAttribute('aria-busy'), undefined);

validSubmission.submit();
validSubmission.restorePage();
assert.strictEqual(validSubmission.button.disabled, false);
assert(!validSubmission.button.classList.contains('is-submitting'));
assert.strictEqual(validSubmission.button.getAttribute('aria-busy'), undefined);

const invalidSubmission = createHarness(false);
invalidSubmission.submit();
assert.strictEqual(invalidSubmission.button.disabled, false);
assert(!invalidSubmission.button.classList.contains('is-submitting'));
assert.strictEqual(invalidSubmission.button.getAttribute('aria-busy'), undefined);

console.log('Newsletter submit loader behavior checks passed.');
