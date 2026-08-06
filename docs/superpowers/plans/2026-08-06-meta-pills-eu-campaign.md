# Meta Knowledge Pills EU Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare privacy-safe attribution and confirmation measurement, produce eight placement-ready video exports, and build a four-ad Meta website-leads campaign for EU developers in the active PSC account without activating spend.

**Architecture:** Keep the acquisition funnel on the existing Hexo homepage and Kit form `Pills 2026`. Add allowlisted first-party attribution to the form and expose consent-gated Meta `Lead` calls through the existing privacy runtime. Preserve the existing post-confirmation destination and UI at `https://dev-academy.com/security-starter-kit/?subscription=confirmed`, where the Starter Kit already records `subscription_confirmed_landing_viewed`. Build one paused Meta campaign and one broad EU ad set; attach four concepts with separate 1:1 and 9:16 media through placement asset customization.

**Tech Stack:** Hexo 5, EJS, vanilla JavaScript, Node built-in assertions, Kit forms and sequences, PostHog, Meta Pixel, Meta Ads MCP, Meta Ads Manager, Canva, Netlify.

## Global Constraints

- Primary destination is `https://dev-academy.com/`.
- Market is all current European Union member states; ad and landing-page language is English.
- Test duration is 14 full days after a separate activation approval.
- Daily budget is the PLN equivalent of EUR 20 on the activation date.
- Use the active PSC ad account; do not use the `UNSETTLED` `promocja` account.
- Use one campaign, one broad ad set, and exactly four launch concepts.
- Optimize initially for standard website `Lead`; confirmed subscribers remain the primary business KPI.
- Keep the campaign, ad set, creatives, and ads `PAUSED` throughout implementation.
- Never activate spend without a new, explicit user approval after final previews and event QA.
- Do not use Meta Instant Forms, a dedicated launch retargeting ad set, or inactive EU lookalikes.
- Do not upload or reuse historical customer, course, webinar, or waitlist lists without a separately verified legal basis.
- Do not send names, email addresses, form contents, subscriber IDs, `fbclid` values, or arbitrary query parameters to PostHog.
- Meta Pixel events run only when `DevAcademyPrivacy.getState().marketing === true`.
- Persist only the four allowlisted attribution fields: `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`.
- Preserve `/welcome/` as the immediate post-submit “check your inbox” page.
- Preserve `https://dev-academy.com/security-starter-kit/?subscription=confirmed`
  as the only post-confirmation destination; do not create `/confirmed/`.
- Preserve the untracked `.playwright-cli/` directory; never stage or modify it.
- Follow TDD for repository changes and create a focused commit after each code task.

## File and service map

- `themes/my-theme/layout/partial/homepage/newsletter-form.ejs`: renders the Kit form and hidden campaign fields.
- `themes/my-theme/source/js/main.js`: reads allowlisted UTMs, populates the form, emits first-party funnel events, and requests consent-gated Meta events.
- `themes/my-theme/source/js/privacy/consent-runtime.js`: owns Meta Pixel loading, consent state, and the public `trackMeta()` boundary.
- `source/welcome/index.html`: remains the pre-confirmation inbox instruction page.
- `/Users/bartosz/Projects/browser-security-starter-kit/src/components/LandingPage.astro`: existing Starter Kit confirmed-state implementation; no replacement route is required.
- `/Users/bartosz/Projects/browser-security-starter-kit/tests/verify-confirmed-offer-bar.mjs`: existing confirmed-state regression coverage.
- `tests/verify-homepage.js`: generated-output acceptance checks for forms and both welcome states.
- `tests/verify-privacy-output.js`: unit-style checks for attribution, submit, and confirmation analytics in `main.js`.
- `tests/verify-privacy-runtime.js`: consent and Meta queue behavior.
- `docs/marketing/meta-pills-eu-launch-assets.md`: committed creative export manifest and copy checklist.
- `docs/marketing/meta-pills-eu-launch-runbook.md`: committed IDs, QA evidence, monitoring formulas, and day-7/day-14 decision log.
- Kit form `Pills 2026` (`9764408`): owns double opt-in and post-confirmation routing.
- Kit sequences `@ PILLS 2026 - onboarding`, `@ SECURITY PILLS 2026`, and `@ TESTING PILLS 2026`: deliver the approved subscriber journey.
- Meta Page `Dev-Academy.com` and Instagram account `bartosz_io`: own the ads.

---

### Task 1: Allowlisted paid attribution in the Kit form

**Files:**
- Modify: `themes/my-theme/layout/partial/homepage/newsletter-form.ejs`
- Modify: `themes/my-theme/source/js/main.js`
- Modify: `tests/verify-homepage.js`
- Modify: `tests/verify-privacy-output.js`

**Interfaces:**
- Consumes: `window.location.search` and a `.newsletter-form` element.
- Produces: `paidAttribution(search)` returning exactly `{ utm_source, utm_medium, utm_campaign, utm_content }`, `populateNewsletterAttribution(form, attribution)`, four Kit hidden fields, and the same four properties on `newsletter_submitted`.

- [ ] **Step 1: Confirm or create the four Kit custom fields**

Use Kit MCP `list_custom_fields`. Reuse exact keys if they already exist; otherwise create these exact keys and labels:

```text
key: utm_source    label: utm_source
key: utm_medium    label: utm_medium
key: utm_campaign  label: utm_campaign
key: utm_content   label: utm_content
```

Do not create or populate a new `fbclid` field. The existing `fbclid` field is outside this campaign contract.

- [ ] **Step 2: Write failing generated-form assertions**

Extend the per-form loop in `tests/verify-homepage.js` with:

```js
['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (key) {
  assert(form.includes('name="fields[' + key + ']"'));
  assert(form.includes('data-newsletter-attribution="' + key + '"'));
});
assert(!form.includes('name="fields[fbclid]"'));
```

- [ ] **Step 3: Write failing attribution tests for `main.js`**

Add a `runCheck` in `tests/verify-privacy-output.js` that calls the exported sandbox function directly:

```js
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
```

Extend the existing `newsletter_submitted` expectation with `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`. Keep the assertions proving that raw `fbclid` and email values never appear in captures.

- [ ] **Step 4: Run the focused tests and verify failure**

Run:

```bash
npm run build:hexo
node tests/verify-homepage.js
node tests/verify-privacy-output.js
```

Expected: homepage verification fails because the hidden fields are absent, and privacy-output verification fails because `paidAttribution` and the four submitted properties are absent.

- [ ] **Step 5: Render the four empty hidden fields**

Add inside `newsletter-form.ejs`, immediately before the visible email input:

```ejs
<% ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (key) { %>
    <input type="hidden" name="fields[<%- key %>]" value="" data-newsletter-attribution="<%- key %>">
<% }); %>
```

- [ ] **Step 6: Implement allowlisted attribution helpers**

Add before `newsletterAnalytics()` in `main.js`:

```js
function paidAttribution(search) {
    var params = new URLSearchParams(search || '');
    return {
        utm_source: canonicalAnalyticsValue(params.get('utm_source')),
        utm_medium: canonicalAnalyticsValue(params.get('utm_medium')),
        utm_campaign: canonicalAnalyticsValue(params.get('utm_campaign')),
        utm_content: canonicalAnalyticsValue(params.get('utm_content'))
    };
}

function populateNewsletterAttribution(form, attribution) {
    Object.keys(attribution).forEach(function(key) {
        var input = form.querySelector('[data-newsletter-attribution="' + key + '"]');
        if (input) input.value = attribution[key] === 'unknown' ? '' : attribution[key];
    });
}
```

Compute attribution once inside `newsletterAnalytics()`, populate every form, and extend `newsletter_submitted` with the four canonical values. Do not add a raw query string or raw `fbclid`.

- [ ] **Step 7: Run focused and complete privacy/homepage verification**

Run:

```bash
npm run test:homepage
npm run test:privacy
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit the attribution contract**

```bash
git add themes/my-theme/layout/partial/homepage/newsletter-form.ejs themes/my-theme/source/js/main.js tests/verify-homepage.js tests/verify-privacy-output.js
git commit -m "feat: preserve paid Pills attribution"
```

---

### Task 2: Consent-gated Meta `Lead` tracking

**Files:**
- Modify: `themes/my-theme/source/js/privacy/consent-runtime.js`
- Modify: `themes/my-theme/source/js/main.js`
- Modify: `tests/verify-privacy-runtime.js`
- Modify: `tests/verify-privacy-output.js`

**Interfaces:**
- Consumes: Meta event name `Lead` or `CompleteRegistration` plus a small allowlisted property object.
- Produces: `window.DevAcademyPrivacy.trackMeta(eventName, properties): boolean`; returns `true` only when the event is queued with active marketing consent.

- [ ] **Step 1: Write failing privacy-runtime tests**

Add a test proving that `trackMeta('Lead', ...)` returns false without marketing consent, queues `['track', 'Lead', {content_name: 'pills_eu_launch'}]` after marketing consent, removes an `email` property, and rejects `Purchase` because only `Lead` and `CompleteRegistration` are allowed.

- [ ] **Step 2: Write a failing submit-to-Meta test**

In the newsletter submit test, add a fake `trackMeta` method and assert a valid submit requests:

```js
['meta:Lead', {
  content_name: 'pills_eu_launch',
  content_category: 'newsletter'
}]
```

- [ ] **Step 3: Run both tests and verify failure**

Run:

```bash
node tests/verify-privacy-runtime.js
node tests/verify-privacy-output.js
```

Expected: failures report that `trackMeta` is not defined and that `meta:Lead` was not captured.

- [ ] **Step 4: Add the privacy-runtime boundary**

Add this method to `window.DevAcademyPrivacy`:

```js
trackMeta: function(eventName, properties) {
  var allowedEvents = ['Lead', 'CompleteRegistration'];
  var safeProperties = {};
  if (!state.marketing || !window.fbq || allowedEvents.indexOf(eventName) === -1) return false;
  if (properties && typeof properties.content_name === 'string') {
    safeProperties.content_name = properties.content_name.slice(0, 80);
  }
  if (properties && typeof properties.content_category === 'string') {
    safeProperties.content_category = properties.content_category.slice(0, 80);
  }
  try {
    window.fbq('track', eventName, safeProperties);
    return true;
  } catch (error) {
    return false;
  }
},
```

- [ ] **Step 5: Request `Lead` after a valid form submit**

After the existing `newsletter_submitted` capture, add:

```js
if (typeof window.DevAcademyPrivacy.trackMeta === 'function') {
    window.DevAcademyPrivacy.trackMeta('Lead', {
        content_name: 'pills_eu_launch',
        content_category: 'newsletter'
    });
}
```

Do not call `window.fbq` from `main.js`.

- [ ] **Step 6: Run and commit**

Run `npm run test:privacy`, require exit 0, then:

```bash
git add themes/my-theme/source/js/privacy/consent-runtime.js themes/my-theme/source/js/main.js tests/verify-privacy-runtime.js tests/verify-privacy-output.js
git commit -m "feat: track consented Pills leads in Meta"
```

---

### Task 3: Preserve and verify the existing Starter Kit confirmed state

**Files:**
- Inspect: `/Users/bartosz/Projects/browser-security-starter-kit/src/components/LandingPage.astro`
- Verify: `/Users/bartosz/Projects/browser-security-starter-kit/tests/verify-confirmed-offer-bar.mjs`

**Interfaces:**
- Consumes: `subscription=confirmed` on the Starter Kit landing page.
- Produces: the existing confirmed UI and first-party
  `subscription_confirmed_landing_viewed` event.

- [ ] **Step 1: Verify the existing state in source**

Confirm that `LandingPage.astro` treats only the exact value `confirmed` as the
confirmed subscription state and renders the Starter Kit offer without needing
a separate confirmation page.

- [ ] **Step 2: Run the existing regression test**

From `/Users/bartosz/Projects/browser-security-starter-kit`, run:

```bash
node tests/verify-confirmed-offer-bar.mjs
```

Require exit 0. Do not change the route or introduce `source/confirmed/index.html`
in the Dev Academy repository.

- [ ] **Step 3: Verify confirmation measurement**

Confirm that loading the exact post-confirmation URL records
`subscription_confirmed_landing_viewed` without including an email address, Kit
subscriber ID, or raw `fbclid` in the event payload.

- [ ] **Step 4: Keep Meta confirmation optimization optional**

Do not add `CompleteRegistration` as a launch blocker. The initial campaign
optimizes for consent-gated `Lead`; confirmed subscriptions are evaluated from
Kit and `subscription_confirmed_landing_viewed`. A later implementation may add
consent-gated `CompleteRegistration` to this existing Starter Kit state after a
separate design and QA pass.

---

### Task 4: Configure and verify the Kit subscriber journey

**Files:**
- No repository file change is required for the established confirmation route.

**Interfaces:**
- Consumes: Kit form `Pills 2026`, the three active 2026 sequences, `/welcome/`,
  and the Starter Kit confirmed-state URL.
- Produces: a verified double-opt-in flow where submit redirects to `/welcome/`,
  confirmation redirects to the existing Starter Kit state, and the subscriber
  enters the approved sequences.

- [ ] **Step 1: Inspect current Kit automation before changing it**

Use Kit MCP and the Kit UI to verify:

```text
Form: Pills 2026 (9764408)
Pre-confirmation submit redirect: https://dev-academy.com/welcome/
Double opt-in: enabled
Post-confirmation redirect: https://dev-academy.com/security-starter-kit/?subscription=confirmed
Sequences:
  @ PILLS 2026 - onboarding
  @ SECURITY PILLS 2026
  @ TESTING PILLS 2026
```

MCP currently reports no Kit webhooks; do not add one for this launch.

- [ ] **Step 2: Preserve the post-confirmation redirect in Kit**

Keep the submit redirect at `/welcome/`. Confirm that the redirect after
successful confirmation is exactly:

```text
https://dev-academy.com/security-starter-kit/?subscription=confirmed
```

Do not create `/confirmed/`. Do not add email, subscriber ID, form ID, `fbclid`,
or UTM values to the confirmation URL.

- [ ] **Step 3: Verify sequence entry rules**

Confirm a newly activated subscriber enters all three named 2026 sequences and that onboarding sends the first Security Pill immediately, Security continues on Tuesday, Testing continues on Friday, and no legacy WSA/FTA sequence is attached. If the current automation differs, stop and show the exact rule graph before changing live membership.

- [ ] **Step 4: Run one real QA subscription**

Use a user-controlled QA inbox alias not already subscribed to form `9764408`:

1. Open `https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=security_a`.
2. Submit the QA address and verify `/welcome/` says the user is not subscribed yet.
3. Open the Kit confirmation message.
4. Confirm and verify the browser opens `https://dev-academy.com/security-starter-kit/?subscription=confirmed` and shows the existing Starter Kit confirmed state.
5. Verify the subscriber is active on `Pills 2026`, entered the three approved sequences, and received the first Security Pill.
6. Tag the record as QA or exclude it from campaign reporting.

- [ ] **Step 5: Verify analytics without exposing the QA address**

Require:

```text
newsletter_submitted:
  utm_source = meta
  utm_medium = paid_social
  utm_campaign = pills_eu_launch
  utm_content = security_a

subscription_confirmed_landing_viewed:
  source_page = /security-starter-kit/
```

Confirm no event property or captured URL contains the QA email, Kit subscriber
ID, or raw `fbclid`. The fixed `subscription=confirmed` state parameter is part
of the intended route and contains no subscriber data.

---

### Task 5: Produce and upload the eight Canva exports

**Files:**
- Create: `docs/marketing/meta-pills-eu-launch-assets.md`

**Interfaces:**
- Consumes: the approved black animated Canva template and four approved hooks.
- Produces: eight MP4 files, eight cover images, a committed asset manifest, and eight uploaded Meta video IDs.

- [ ] **Step 1: Write the asset manifest**

Create `docs/marketing/meta-pills-eu-launch-assets.md` with:

```markdown
# Meta Pills EU launch assets

| Concept | 1:1 MP4 | 9:16 MP4 | On-canvas text |
|---|---|---|---|
| Security A | `security-a-1080x1080.mp4` | `security-a-1080x1920.mp4` | `3-MIN SECURITY PILL / CAN ANOTHER WEBSITE / CLICK YOUR BUTTONS? / FREE EVERY TUESDAY` |
| Security B | `security-b-1080x1080.mp4` | `security-b-1080x1920.mp4` | `SECURITY + TESTING / CODE GETS PRODUCED FASTER. / JUDGMENT DOESN'T. / 2 FREE PILLS / WEEK` |
| Testing A | `testing-a-1080x1080.mp4` | `testing-a-1080x1920.mp4` | `4-MIN TESTING PILL / YOUR TESTS PASS. / WHAT DO THEY PROVE? / FREE EVERY FRIDAY` |
| Testing B | `testing-b-1080x1080.mp4` | `testing-b-1080x1920.mp4` | `TESTING FRIDAY / TEST YOUR ARCHITECTURE / BEFORE IT DRIFTS. / PRACTICAL. FREE. <5 MIN.` |
```

Add unchecked QA columns for text accuracy, safe area, loop quality, and cover frame.

- [ ] **Step 2: Duplicate the winning black Canva template four times**

Keep background, geometric motion, typeface, duration, transition timing, logo placement, and audio choice identical. Change only the approved text and the smallest necessary icon treatment.

- [ ] **Step 3: Create feed and vertical layouts**

For every concept:

```text
Feed: 1080 × 1080 px
Stories/Reels: 1080 × 1920 px
Duration: 6-8 seconds
Frame rate: 30 fps
Codec/container: H.264 MP4
Audio: identical across all variants, or absent across all variants
Maximum target file size: 15 MB per export
```

Keep every essential word inside the central 1080 × 1350 area of the vertical version.

- [ ] **Step 4: Export covers**

Export the final readable frame of each size as a JPG using the MP4 basename.

- [ ] **Step 5: Perform visual QA**

Watch three loops with sound on and off. Reject any export with clipped/covered text, unreadable timing, incorrect punctuation, inconsistent motion/audio, or a background that no longer matches the winning black system.

- [ ] **Step 6: Upload media to the PSC asset library**

The Meta Ads MCP cannot upload local videos. Upload all eight MP4s and covers through Ads Manager without publishing, then call `ads_get_ad_videos` to resolve each video ID. Record filenames, IDs, cover identifiers, and upload date in the manifest.

- [ ] **Step 7: Commit the creative manifest**

```bash
git add docs/marketing/meta-pills-eu-launch-assets.md
git commit -m "docs: inventory Meta Pills campaign assets"
```

---

### Task 6: Create the paused campaign and broad EU ad set

**Files:**
- Create: `docs/marketing/meta-pills-eu-launch-runbook.md`

**Interfaces:**
- Consumes: active PSC account, active `Piksel konta PSC` dataset, EUR/PLN reference rate, and current Meta API validation.
- Produces: one paused campaign ID and one paused ad-set ID recorded in the runbook.

- [ ] **Step 1: Resolve current account inputs read-only**

Call Meta MCP tools and require:

```text
ads_get_ad_accounts: PSC, ACTIVE, PLN, payment method present
ads_get_datasets: Piksel konta PSC, active, browser or server event in previous 24h
ads_get_ad_account_pages: Dev-Academy.com
ads_get_ig_accounts: bartosz_io
```

Stop if an identity is ambiguous or the account is no longer queryable.

- [ ] **Step 2: Resolve the paused daily budget**

Retrieve the current EUR/PLN reference rate and calculate:

```text
daily_budget_grosz = round(20 × EURPLN × 100)
```

Record the date, source rate, PLN amount, and grosz integer. Do not go below Meta’s reported account minimum.

- [ ] **Step 3: Create the campaign with Meta MCP**

Call `ads_create_campaign` for the PSC account with:

```json
{
  "campaign_name": "PILLS | EU | Website Leads | 2026-08",
  "buying_type": "AUCTION",
  "objective": "OUTCOME_LEADS",
  "special_ad_categories": "[]"
}
```

Do not pass a campaign budget because this is ABO. Require response status `PAUSED`; record `campaign_id`, Ads Manager URL, valid optimization goals, and recommended goal.

- [ ] **Step 4: Validate website optimization**

Require `OFFSITE_CONVERSIONS` in the returned valid goals. If absent, stop and inspect returned goals and Page lead-generation terms; do not switch to Instant Forms, link clicks, or landing-page views.

- [ ] **Step 5: Create the broad EU ad set**

Use exactly:

```json
{
  "age_min": 22,
  "age_max": 55,
  "geo_locations": {
    "countries": [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI",
      "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
      "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"
    ],
    "location_types": ["home", "recent"]
  }
}
```

Call `ads_create_ad_set` with:

```text
ad_set_name: EU | Broad | 22-55 | Website Lead | 20 EUR
billing_event: IMPRESSIONS
optimization_goal: OFFSITE_CONVERSIONS
bid_strategy: LOWEST_COST_WITHOUT_CAP
daily_budget: daily_budget_grosz
destination_type: WEBSITE
promoted_object: JSON.stringify({pixel_id: active_dataset_id, custom_event_type: "LEAD"})
targeting: exact JSON payload above
```

Set `active_dataset_id` to the exact `dataset_id` returned for the active `Piksel konta PSC` record in Step 1. Omit language, interests, lookalikes, device filters, manual placements, start time, and end time.

- [ ] **Step 6: Verify the paused hierarchy**

Use `ads_get_ad_entities`. Require campaign and ad set `PAUSED`, the resolved budget, `OUTCOME_LEADS`, `OFFSITE_CONVERSIONS`, all 27 country codes, no detailed targeting, and no placement restrictions.

- [ ] **Step 7: Start the runbook**

Create `docs/marketing/meta-pills-eu-launch-runbook.md` and record names, IDs, Ads Manager URLs, account/Page/Instagram/dataset names, budget calculation, timestamp, and `PAUSED — DO NOT ACTIVATE`. Do not record tokens, payment data, email addresses, or audience-list IDs.

---

### Task 7: Attach four ads with placement-specific media

**Files:**
- Modify: `docs/marketing/meta-pills-eu-launch-runbook.md`

**Interfaces:**
- Consumes: paused ad set, eight uploaded video IDs, covers, Page `Dev-Academy.com`, Instagram `bartosz_io`, and approved copy.
- Produces: exactly four paused ads, each using 1:1 feed media and 9:16 Stories/Reels media.

- [ ] **Step 1: Create Security A**

```text
Ad name: SEC-A | Clickjacking
Feed media: security-a-1080x1080.mp4
Stories/Reels media: security-a-1080x1920.mp4
Primary text: An invisible iframe can turn a normal click into a real action in your app. Security Tuesday explains the risk — and the browser header that stops it — in a 3-minute email. Get Security Tuesday + Testing Friday free.
Headline: Practical security in under 5 minutes
Description: Two free Knowledge Pills every week.
CTA: Sign Up
URL: https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=security_a
```

- [ ] **Step 2: Create Security B**

```text
Ad name: SEC-B | AI Judgment
Feed media: security-b-1080x1080.mp4
Stories/Reels media: security-b-1080x1920.mp4
Primary text: AI can generate security headers, features and tests. You still need to know whether they protect the right boundary. Build that judgment with two practical Knowledge Pills every week.
Headline: Build web apps you can trust
Description: Two free Knowledge Pills every week.
CTA: Sign Up
URL: https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=security_b
```

- [ ] **Step 3: Create Testing A**

```text
Ad name: TST-A | Tests Prove
Feed media: testing-a-1080x1080.mp4
Stories/Reels media: testing-a-1080x1920.mp4
Primary text: Your test suite is green. But does it protect behavior — or only execute lines? Testing Friday gives you one practical testing idea in under 5 minutes. Plus Security Tuesday.
Headline: Write tests that prove something
Description: Two free Knowledge Pills every week.
CTA: Sign Up
URL: https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=testing_a
```

- [ ] **Step 4: Create Testing B**

```text
Ad name: TST-B | Architecture Drift
Feed media: testing-b-1080x1080.mp4
Stories/Reels media: testing-b-1080x1920.mp4
Primary text: Architecture rarely breaks in one commit. It erodes through imports nobody notices. Learn to turn architectural intentions into executable rules — one focused Knowledge Pill at a time.
Headline: Turn architecture into executable rules
Description: Two free Knowledge Pills every week.
CTA: Sign Up
URL: https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=testing_b
```

- [ ] **Step 5: Verify identity and tracking**

For all four require Page `Dev-Academy.com`, Instagram `bartosz_io`, conversion domain `dev-academy.com`, dataset `Piksel konta PSC`, event `Lead`, CTA `SIGN_UP`, and status `PAUSED`. Require exactly the four approved UTM parameters and no PII or obsolete domain.

- [ ] **Step 6: Inspect previews**

Preview Facebook Feed, Instagram Feed, Facebook Stories, Instagram Stories, Facebook Reels, and Instagram Reels. Reject an ad if Meta crops essential text, uses the wrong ratio, changes punctuation/destination, or shows the wrong identity.

- [ ] **Step 7: Verify entities through Meta MCP**

Use `ads_get_ad_entities`, `ads_get_creatives`, and `ads_get_ad_preview` to confirm exactly four ads under the paused ad set. Record ad IDs, creative IDs, preview evidence, and statuses.

- [ ] **Step 8: Commit the runbook**

```bash
git add docs/marketing/meta-pills-eu-launch-runbook.md
git commit -m "docs: record paused Meta Pills campaign"
```

---

### Task 8: Final prelaunch verification and activation handoff

**Files:**
- Modify: `docs/marketing/meta-pills-eu-launch-runbook.md`

**Interfaces:**
- Consumes: repository tests, production landing pages, Kit flow, Meta previews, and paused hierarchy.
- Produces: an evidence-backed launch checklist and a separate activation request; it does not activate the campaign.

- [ ] **Step 1: Run repository verification from a clean build**

Run:

```bash
npm run clean
npm run test:homepage
npm run test:privacy
npm run test:security
```

Expected: all commands exit 0. Record timestamps and pass summaries in the runbook.

- [ ] **Step 2: Inspect the production destination**

Verify whether `https://dev-academy.com/` serves the newsletter-first homepage. If it still serves the old article index, mark deployment as a hard blocker and do not request activation.

- [ ] **Step 3: Request explicit deployment approval**

Show the code diff and test evidence for the homepage attribution and `Lead`
changes. State explicitly that the existing Starter Kit confirmed state and Kit
redirect are preserved. Deploy or push only after the user explicitly approves
the external website change.

- [ ] **Step 4: Repeat production funnel QA after deployment**

Repeat the Task 4 subscription and verify homepage/forms, pre-confirmation
`/welcome/`, post-confirmation
`/security-starter-kit/?subscription=confirmed`, consent-aware
`newsletter_submitted`, Meta `Lead`,
`subscription_confirmed_landing_viewed`, first-Pill delivery, and absence of PII
in URLs and analytics. `CompleteRegistration` is not required for launch.

- [ ] **Step 5: Validate the paused Meta hierarchy**

Use Meta MCP to confirm campaign, ad set, and all four ads remain `PAUSED`; budget matches the recorded PLN amount; and spend is zero.

- [ ] **Step 6: Add monitoring table and formulas**

Append:

```markdown
| Checkpoint | Spend | Impressions | Link CTR | Landing views | Leads | Confirmed | Confirmation rate | Confirmed CPL | First-Pill opens | Unsubscribes/spam | Decision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Day 3 | | | | | | | | | | | Technical checks only |
| Day 7 | | | | | | | | | | | Keep two best concepts |
| Day 14 | | | | | | | | | | | Scale, iterate, or stop |
```

Use `confirmation_rate = confirmed / leads` and `confirmed_cpl = spend / confirmed`. Display `—` when the denominator is zero.

- [ ] **Step 7: Record approved decision rules**

```text
Confirmed CPL <= EUR 4: good initial result
Confirmed CPL EUR 4-7: review quality and Starter Kit revenue
Confirmed CPL > EUR 7: insufficient unless downstream revenue offsets it
Landing view -> submit >= 15%: initial healthy signal
Submit -> confirmation >= 60%: initial healthy signal
Submit -> confirmation < 50%: fix inbox guidance/deliverability before scaling
Do not pause an ad before about 2,000 impressions or EUR 25 equivalent spend
After that minimum, CTR < 0.8% and zero leads permits pausing
```

- [ ] **Step 8: Request separate activation approval**

Present production funnel evidence, six placement previews for each concept, daily budget and approximate 14-day maximum, entity IDs, confirmed `PAUSED` status, and Day 3/7/14 dates. Only after explicit “activate/publish” approval may a later task set the 14-day schedule and activate campaign, ad set, and ads. Activation is outside this plan.

---

## Plan self-review checklist

- Every campaign requirement maps to a repository, Kit, creative, Meta, or QA task.
- `/welcome/` remains the pre-confirmation state, while
  `/security-starter-kit/?subscription=confirmed` remains the existing
  post-confirmation Starter Kit state.
- Submit and confirmation are distinct analytics events.
- Meta event calls are centralized behind marketing consent.
- Paid attribution is restricted to four canonical fields and survives in Kit subscriber records.
- The four concepts, eight placement exports, copy, URLs, country codes, and entity names are exact.
- No step activates spend, deploys, or changes live sequence membership without an explicit approval gate.
- Dynamic IDs and exchange rates are resolved from named authoritative tools and verified before use.
