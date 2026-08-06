# Meta Ads EU launch for Knowledge Pills

Date: 2026-08-05

Status: approved design

Primary destination: `https://dev-academy.com/`

## Objective

Acquire high-quality, confirmed subscribers in the European Union for Dev
Academy's free English-language Knowledge Pills:

- Security Tuesday;
- Testing Friday;
- each Pill takes less than five minutes to read;
- every homepage subscriber receives both tracks;
- the first Security Pill arrives after double opt-in confirmation.

The primary business KPI is cost per confirmed subscriber, not the number of
form submissions reported by Meta. Revenue from the post-confirmation Browser
Security Starter Kit offer may reduce effective acquisition cost, but does not
replace subscriber quality metrics.

## Constraints and account state

- Test duration: 14 full days.
- Daily budget: the PLN equivalent of EUR 20 on the launch date.
- Total reference budget: approximately EUR 280.
- Target market: all European Union member states.
- Ad and landing-page language: English.
- Ad account: the active `PSC` account, billed in PLN.
- The historical `promocja` account is not used because Meta reports it as
  `UNSETTLED` and not queryable.
- The active PSC dataset receives browser and server events, but its current
  `Lead` volume is too low to optimize reliably for a deeper conversion.
- Existing EU lookalike audiences are inactive. Existing warm engagement
  audiences and historical customer lists are not separate launch ad sets.

Historical customer or subscriber lists may be used only when their original
collection terms and the current legal basis permit advertising audience use.
They are not automatically included in this campaign.

## Chosen campaign approach

Use a creative-led broad prospecting campaign:

- objective: `Leads`;
- conversion location: `Website`;
- one campaign;
- one broad ad set;
- four ads in the ad set;
- Advantage+ placements;
- initial optimization event: standard `Lead` after a valid form submission;
- no dedicated retargeting budget during the first test.

One ad set keeps the small daily budget concentrated and lets Meta compare the
four creative concepts without starving several audiences of delivery data.

### Alternatives not selected

**Broad plus lookalike:** rejected for launch because two ad sets would split the
budget, and the available EU lookalikes are inactive. A fresh lookalike can be
tested after the confirmed-subscriber seed is larger.

**Meta Instant Forms:** rejected because the campaign should qualify visitors
through the real Pill examples on the website, preserve the double-opt-in
journey, and optimize for subscriber quality rather than the cheapest form fill.

## Audience and delivery settings

- Location: all current European Union member states.
- Age: 22-55.
- Gender: all.
- Language targeting: none. English creative provides natural language
  qualification without excluding multilingual developers whose account
  language is not English.
- Detailed targeting: none for the first test.
- Placements: Advantage+ placements, supported by deliberate 1:1 and 9:16
  creative exports.

Current subscribers should be excluded only when Dev Academy has an up-to-date,
lawfully usable Custom Audience for that purpose. Old course, webinar, and
waitlist lists are not assumed to represent current Knowledge Pills subscribers.

## Creative system

Retain the previously successful visual mechanism:

- dark or black background;
- animated geometric lines;
- strong central typography;
- restrained technical icons;
- the same duration, motion treatment, and audio choice across variants;
- one principal hook per ad.

Prepare every ad in at least:

- 1:1 for feeds;
- 9:16 for Stories and Reels.

Keep essential text inside the safe central area in both exports. Avoid showing
Vue, Angular, React, and Node logos together; the newsletter targets JavaScript
and TypeScript developers more broadly than a specific framework.

### Security A: concrete vulnerability

Animation text:

```text
3-MIN SECURITY PILL
CAN ANOTHER WEBSITE
CLICK YOUR BUTTONS?
FREE EVERY TUESDAY
```

Primary text:

> An invisible iframe can turn a normal click into a real action in your app.
> Security Tuesday explains the risk — and the browser header that stops it —
> in a 3-minute email. Get Security Tuesday + Testing Friday free.

Headline: `Practical security in under 5 minutes`

Description: `Two free Knowledge Pills every week.`

CTA: `Sign Up`

### Security B: AI and engineering judgment

Animation text:

```text
SECURITY + TESTING
CODE GETS PRODUCED FASTER.
JUDGMENT DOESN'T.
2 FREE PILLS / WEEK
```

Primary text:

> AI can generate security headers, features and tests. You still need to know
> whether they protect the right boundary. Build that judgment with two
> practical Knowledge Pills every week.

Headline: `Build web apps you can trust`

Description: `Two free Knowledge Pills every week.`

CTA: `Sign Up`

### Testing A: tests that do not prove enough

Animation text:

```text
4-MIN TESTING PILL
YOUR TESTS PASS.
WHAT DO THEY PROVE?
FREE EVERY FRIDAY
```

Primary text:

> Your test suite is green. But does it protect behavior — or only execute
> lines? Testing Friday gives you one practical testing idea in under 5
> minutes. Plus Security Tuesday.

Headline: `Write tests that prove something`

Description: `Two free Knowledge Pills every week.`

CTA: `Sign Up`

### Testing B: architecture drift

Animation text:

```text
TESTING FRIDAY
TEST YOUR ARCHITECTURE
BEFORE IT DRIFTS.
PRACTICAL. FREE. <5 MIN.
```

Primary text:

> Architecture rarely breaks in one commit. It erodes through imports nobody
> notices. Learn to turn architectural intentions into executable rules — one
> focused Knowledge Pill at a time.

Headline: `Turn architecture into executable rules`

Description: `Two free Knowledge Pills every week.`

CTA: `Sign Up`

## Destination and message match

All four ads lead to the newsletter-first homepage. The page must be deployed
before the campaign starts. Its hero and first screen must communicate:

- JavaScript and TypeScript audience;
- two practical Pills per week;
- Security Tuesday and Testing Friday;
- less than ten minutes total per week;
- the first Security Pill arrives after confirmation;
- free subscription and double opt-in.

The Security and Testing examples on the page must substantiate the claims in
the ads. The campaign must not send paid traffic to the old article-index
homepage currently visible in production.

## Attribution and event flow

Use this funnel as the measurement model:

```text
Meta ad impression/click
  -> newsletter landing-page view
  -> valid form submission
  -> /welcome/ check-your-inbox state
  -> Kit double opt-in confirmation
  -> /security-starter-kit/?subscription=confirmed
  -> first Pill open/click
  -> optional Starter Kit checkout/purchase
```

UTM convention:

- `utm_source=meta`
- `utm_medium=paid_social`
- `utm_campaign=pills_eu_launch`
- `utm_content=security_a`, `security_b`, `testing_a`, or `testing_b`

Every paid landing page must also support Meta click attribution. The homepage
is the only launch landing page, but the implementation must be reusable by
future landing pages that load the shared privacy runtime:

- read `fbclid` from the landing URL without sending it to PostHog or Kit;
- after the existing marketing-consent state is `true`, reuse a valid `_fbc`
  cookie or derive `fbc` as `fb.1.<creation_time_ms>.<fbclid>` and persist it as
  `_fbc`;
- attach `fbc` to every applicable Conversions API event when it is available;
- generate a fresh `event_id` on the frontend for each logical Meta event;
- send the same `event_name` and `event_id` through the browser Pixel and the
  Netlify Edge Function so Meta can deduplicate the browser/server pair;
- never send the CAPI access token to the browser.

Required events:

- Meta `PageView` on the destination when marketing measurement is permitted;
- Meta standard `Lead` after a valid form submission when marketing measurement
  is permitted;
- a matching server-side `PageView` and `Lead` through Meta Conversions API,
  carrying the same `event_id` as the corresponding browser event and `fbc`
  whenever the landing click supplied it;
- privacy-safe `newsletter_submitted` in the Dev Academy analytics model;
- existing privacy-safe `subscription_confirmed_landing_viewed` event from the
  Starter Kit confirmed state after double opt-in;
- Kit confirmation and engagement records as the source of truth for subscriber
  status and email quality.

Do not create a separate confirmation page. Kit must redirect confirmed
subscribers to exactly
`https://dev-academy.com/security-starter-kit/?subscription=confirmed`, which
already renders the Starter Kit confirmed state and records
`subscription_confirmed_landing_viewed`. A distinct Meta conversion such as
standard `CompleteRegistration` may later be added to that existing state only
with a valid consent signal and without exposing email addresses or subscriber
identifiers. Until that deeper event is proven reliable, optimize delivery for
`Lead` and evaluate confirmed results using Kit and first-party analytics.

Conversions API is required for launch and must run through a same-origin
Netlify Edge Function. The function reads `META_CAPI_ACCESS_TOKEN` only from the
Netlify Functions-scoped environment, uses Pixel ID `189349068273059`, accepts
only allowlisted website events, adds the request user agent and Netlify edge
client IP, and forwards no email address, form value, subscriber identifier, or
arbitrary query parameter. Both the Pixel call and the Edge Function request
remain gated by the already implemented `DevAcademyPrivacy` marketing-consent
state. `fbc` improves click matching; deduplication specifically depends on
matching `event_name` plus `event_id` across browser and server events.

## KPI model

### Primary KPI

Cost per confirmed subscriber:

- up to EUR 4: good initial result;
- EUR 4-7: review subscriber quality and Starter Kit revenue;
- above EUR 7: insufficient unless downstream revenue materially reduces the
  effective cost.

These are calibration thresholds for the first test, not permanent unit
economics. Replace them with observed acquisition cost and subscriber value
after the first cohort matures.

### Diagnostic and quality metrics

- Link CTR.
- Cost per landing-page view.
- Landing-page view to valid form submission rate.
- Submission to double-opt-in confirmation rate.
- First Pill open and click rate.
- Unsubscribe and spam-complaint rate.
- Starter Kit checkout, purchase, and attributed revenue.

Initial health thresholds:

- landing-page view to submission: at least 15%;
- submission to confirmation: at least 60%;
- below 50% confirmation requires investigation of inbox instructions,
  confirmation-email delivery, and message match before creative scaling.

## Test operation and decision rules

### Before launch

1. Deploy the newsletter-first homepage.
2. Test the form on mobile and desktop.
3. Complete a real test journey from submit through confirmation and first Pill.
4. Verify `PageView` and `Lead` in Meta Events Manager.
5. Verify each test event appears from Browser and Server with the same
   `event_id` and is reported as deduplicated; verify server events include
   `fbc` after a test URL containing `fbclid`.
6. Verify `newsletter_submitted` and
   `subscription_confirmed_landing_viewed` in the first-party funnel reports.
7. Confirm that no email address or subscriber identifier enters a URL or
   analytics payload.
8. Preview every ad in all material placements and check text safe areas.
9. Build the campaign in `PAUSED` state and perform final QA before activation.

### During the test

- Days 1-3: make no optimization edits unless there is a technical fault,
  rejection, broken destination, or missing conversion signal.
- Do not pause an ad before it reaches approximately 2,000 impressions or EUR
  25 equivalent spend.
- After that minimum, an ad with link CTR below 0.8% and no leads may be paused.
- Day 7: retain the best two concepts according to cost per confirmed
  subscriber, using CTR and submitted leads only as diagnostic evidence.
- Day 14: decide to scale, iterate, or stop.

When scaling, increase the daily budget by no more than approximately 20% every
two to three days. Avoid frequent edits that destabilize delivery.

## Failure handling

- **Rejected ad:** revise only the affected ad and leave the rest of the ad set
  unchanged.
- **Kit records submissions but Meta reports no Leads:** pause spend and repair
  campaign measurement.
- **Many submissions but few confirmations:** investigate the check-inbox state,
  confirmation email, and deliverability before changing targeting.
- **Good CTR but weak landing conversion:** repair landing-page message match
  before producing more creatives.
- **All four concepts are expensive:** test a materially new concept in round
  two rather than cosmetic variations of the same hook.

## Round-two options

Preserve the best first-round hook and test one new variable:

- proof: `900+ course enrollments`;
- a real excerpt or visual from a Pill;
- a founder-led version featuring Bartosz;
- a fresh EU lookalike based on confirmed subscribers;
- a separate warm retargeting ad set after budget or audience volume grows.

Do not combine all of these changes in one ad. Each round should retain a clear
reason for its result.

## Acceptance criteria

- The campaign uses the active PSC account and remains paused until explicit
  activation approval.
- The campaign has one broad EU ad set and exactly four launch concepts.
- Both 1:1 and 9:16 creative exports pass placement preview checks.
- All links use the agreed UTM values and reach the newsletter-first homepage.
- A test subscriber can complete the full double-opt-in journey and receive the
  first Security Pill.
- Confirmation opens the existing Starter Kit state at
  `https://dev-academy.com/security-starter-kit/?subscription=confirmed`; no new
  confirmation page is introduced.
- Meta receives the permitted launch conversion events.
- Browser Pixel and CAPI copies use identical `event_name` and `event_id`, are
  deduplicated in Meta Test Events, and carry a valid `fbc` when the landing URL
  contains `fbclid` and marketing consent is granted.
- First-party reporting distinguishes form submission from confirmation.
- No PII appears in URLs or analytics events.
- Day-7 and day-14 decisions use confirmed subscribers and quality signals, not
  Meta-reported leads alone.

## Out of scope

- Publishing or activating the campaign without a separate explicit approval.
- A dedicated retargeting campaign during the EUR 20/day test.
- Immediate optimization for confirmed subscriptions before sufficient event
  volume exists.
- Meta Instant Forms.
- Automatic reuse of historical customer, course, webinar, or waitlist lists.
- Redesigning the approved newsletter homepage.
