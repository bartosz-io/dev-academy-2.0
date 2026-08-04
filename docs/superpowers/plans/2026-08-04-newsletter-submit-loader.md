# Newsletter Submit Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an accessible spinner and “Sending…” label immediately after a valid homepage newsletter submission and until Kit redirects the visitor.

**Architecture:** Extend the shared EJS form partial with stable normal/loading labels, then initialize the pending state from the existing global browser script without intercepting Kit's submission. Keep presentation in the homepage SCSS, restore the button when Kit renders an error, and clear stale pending state on browser history restoration.

**Tech Stack:** Hexo 5, EJS, browser JavaScript (ES5-compatible style used by the theme), SCSS, Node.js `assert` acceptance tests

## Global Constraints

- Apply the behavior to all three homepage newsletter forms rendered by `newsletter-form.ejs`.
- Keep the existing Kit endpoint, fields, form identifiers, validation, redirect configuration, and `/welcome/` destination unchanged.
- Display an animated spinner followed by the exact label `Sending…` only after a valid submission.
- Disable the pending button and expose `aria-busy="true"`.
- Restore the normal button after a Kit-rendered error or a back-forward-cache restoration.
- Respect `prefers-reduced-motion: reduce` while keeping the pending label visible.

---

### Task 1: Accessible newsletter submission state

**Files:**
- Modify: `tests/verify-homepage.js:20-100`
- Modify: `themes/my-theme/layout/partial/homepage/newsletter-form.ejs:31-33`
- Modify: `themes/my-theme/source/js/main.js:13-42`
- Modify: `themes/my-theme/source/css/pages/_newsletter-homepage.scss:100-155`

**Interfaces:**
- Consumes: existing `.newsletter-form`, `.newsletter-form-submit`, and `[data-element="errors"]` markup; Kit's existing submit and error-rendering behavior.
- Produces: `newsletterSubmitLoaders(): void`, `.newsletter-form-submit-label`, `.newsletter-form-submit-loading`, `.newsletter-form-submit-spinner`, and `.is-submitting` as the shared DOM/CSS contract.

- [ ] **Step 1: Write the failing acceptance assertions**

Add the uncompiled browser source next to the existing `mainJs` fixture:

```js
const mainSource = fs.readFileSync(
  path.join(__dirname, '..', 'themes', 'my-theme', 'source', 'js', 'main.js'),
  'utf8'
);
```

Inside the existing loop that checks each newsletter form, add:

```js
  assert(form.includes('class="newsletter-form-submit-label"'));
  assert(form.includes('class="newsletter-form-submit-loading"'));
  assert(form.includes('class="newsletter-form-submit-spinner"'));
  assert(form.includes('Sending…'));
```

After that loop, add behavior and styling contract assertions:

```js
assert(mainSource.includes('newsletterSubmitLoaders();'));
assert(mainSource.includes("form.addEventListener('submit'"));
assert(mainSource.includes("form.checkValidity()"));
assert(mainSource.includes("button.setAttribute('aria-busy', 'true')"));
assert(mainSource.includes("new MutationObserver"));
assert(mainSource.includes("window.addEventListener('pageshow'"));
assert(/\.newsletter-form-submit\.is-submitting\s*\{[\s\S]*?\.newsletter-form-submit-label\s*\{[\s\S]*?display:\s*none;/.test(newsletterStyles));
assert(/\.newsletter-form-submit-spinner\s*\{[\s\S]*?animation:\s*newsletter-submit-spin/.test(newsletterStyles));
assert(/prefers-reduced-motion:\s*reduce[\s\S]*?\.newsletter-form-submit-spinner\s*\{[\s\S]*?animation:\s*none;/.test(newsletterStyles));
```

- [ ] **Step 2: Run the acceptance test and verify RED**

Run:

```bash
npm run test:homepage
```

Expected: FAIL at `class="newsletter-form-submit-label"` because the shared button still contains only plain text.

- [ ] **Step 3: Add stable normal and loading button markup**

Replace the contents of `.newsletter-form-submit` in `newsletter-form.ejs` with:

```ejs
        <button class="newsletter-form-submit button button-primary" type="submit">
            <span class="newsletter-form-submit-label"><%- buttonLabel %></span>
            <span class="newsletter-form-submit-loading" aria-live="polite">
                <span class="newsletter-form-submit-spinner" aria-hidden="true"></span>
                Sending…
            </span>
        </button>
```

Do not change any form attributes or Kit settings.

- [ ] **Step 4: Add the submission lifecycle behavior**

Call the initializer in the existing `DOMContentLoaded` handler immediately before `loadConvertKit()`:

```js
    newsletterSubmitLoaders();
    loadConvertKit();
```

Add this focused initializer near `loadConvertKit()`:

```js
function newsletterSubmitLoaders() {
    var forms = document.querySelectorAll('.newsletter-form');

    forms.forEach(function(form) {
        var button = form.querySelector('.newsletter-form-submit');
        var errors = form.querySelector('[data-element="errors"]');

        if (!button || !errors) {
            return;
        }

        function resetButton() {
            button.disabled = false;
            button.classList.remove('is-submitting');
            button.removeAttribute('aria-busy');
        }

        form.addEventListener('submit', function() {
            if (!form.checkValidity()) {
                return;
            }

            button.disabled = true;
            button.classList.add('is-submitting');
            button.setAttribute('aria-busy', 'true');
        });

        new MutationObserver(function() {
            if (errors.textContent.trim()) {
                resetButton();
            }
        }).observe(errors, {
            childList: true,
            subtree: true,
            characterData: true
        });

        window.addEventListener('pageshow', resetButton);
    });
}
```

This listener must not call `preventDefault()`, alter request fields, or implement its own redirect.

- [ ] **Step 5: Style the pending label and spinner**

Add the following next to the existing `.newsletter-form-submit` rule in `_newsletter-homepage.scss`:

```scss
.newsletter-form-submit-label {
  display: inline;
}

.newsletter-form-submit-loading {
  align-items: center;
  display: none;
  gap: .8rem;
  justify-content: center;
}

.newsletter-form-submit.is-submitting {
  cursor: wait;

  .newsletter-form-submit-label {
    display: none;
  }

  .newsletter-form-submit-loading {
    display: inline-flex;
  }
}

.newsletter-form-submit-spinner {
  animation: newsletter-submit-spin .7s linear infinite;
  border: .2rem solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
  height: 1.4rem;
  width: 1.4rem;
}

@keyframes newsletter-submit-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .newsletter-form-submit-spinner {
    animation: none;
  }
}
```

- [ ] **Step 6: Run the focused acceptance test and verify GREEN**

Run:

```bash
npm run test:homepage
```

Expected: PASS with `Newsletter homepage acceptance checks passed.` and no build error.

- [ ] **Step 7: Inspect the complete change**

Run:

```bash
git diff --check
git diff -- tests/verify-homepage.js themes/my-theme/layout/partial/homepage/newsletter-form.ejs themes/my-theme/source/js/main.js themes/my-theme/source/css/pages/_newsletter-homepage.scss
```

Expected: no whitespace errors; the diff contains only the loader markup, lifecycle behavior, styles, and acceptance assertions.

- [ ] **Step 8: Commit the implementation**

```bash
git add tests/verify-homepage.js themes/my-theme/layout/partial/homepage/newsletter-form.ejs themes/my-theme/source/js/main.js themes/my-theme/source/css/pages/_newsletter-homepage.scss
git commit -m "feat: show newsletter submit loader"
```
