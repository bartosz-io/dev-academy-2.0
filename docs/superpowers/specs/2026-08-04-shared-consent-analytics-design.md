# Shared Consent and Analytics Design

Date: 2026-08-04

## Goal

Give the Dev Academy homepage, blog, confirmation pages, and Browser Security
Starter Kit one coherent privacy and analytics model while keeping the two sites
independently deployable.

The production routes are:

- `https://dev-academy.com/` and the other Hexo routes from the `dev-academy`
  repository;
- `https://dev-academy.com/security-starter-kit/`, served from the
  `browser-security-starter-kit` Cloudflare Pages project through the existing
  Netlify reverse proxy.

The proxy makes both applications same-origin in production. They therefore
share browser `localStorage` and first-party PostHog persistence without any
proxy-side consent synchronization or HTML rewriting.

## Decisions

- Each repository owns an independent consent runtime.
- The runtimes implement the same versioned storage contract and behavior.
- The applications use one PostHog project for all of `dev-academy.com`.
- PostHog starts before a privacy decision in memory-only mode.
- PostHog session replay is enabled before and after a privacy decision.
- Persistent PostHog analytics and Meta Pixel are separate optional choices.
- The consent interfaces use the same content and semantics but may use local
  styling appropriate to each landing page.
- Existing `bssk_consent_preferences` values are not migrated. Every visitor
  makes a new decision under the shared contract.
- The reverse proxy remains a delivery rule. It does not inspect, inject, or
  transform consent state.

## Consent contract

Both runtimes read and write this localStorage key:

```text
dev_academy_consent_v1
```

The stored value is a complete JSON object:

```json
{
  "schemaVersion": 1,
  "persistentAnalytics": true,
  "marketing": false
}
```

The presence of a valid object means the visitor has made a decision. A missing
key, invalid JSON, missing or non-boolean preference, or unsupported schema
version means the state is undecided and the application shows its consent
banner.

The legacy `bssk_consent_preferences` key is ignored. It does not suppress the
new banner and is not a fallback source of preferences.

Direct Cloudflare Pages preview URLs have a different origin and therefore a
separate localStorage state. The shared-state guarantee applies to the
production `dev-academy.com` routes.

## Categories and interface behavior

The interface exposes two independent optional choices:

- **Remember visits** (`persistentAnalytics`): allow PostHog to persist its
  anonymous identifier and connect visits across pages and browser sessions.
- **Marketing measurement** (`marketing`): allow Meta Pixel to load and measure
  campaign and checkout activity.

The available actions behave as follows:

| Action | `persistentAnalytics` | `marketing` |
| --- | ---: | ---: |
| Accept all | `true` | `true` |
| Reject all | `false` | `false` |
| Save preferences | checkbox value | checkbox value |

Both applications provide a persistent **Privacy settings** entry point so a
visitor can reopen the dialog and change either choice. A `storage` event
listener applies changes made in another tab on the same origin.

Rejecting optional preferences does not disable PostHog. It leaves PostHog and
session replay in memory-only mode.

## PostHog behavior

Both applications use identical build-time configuration for:

- the Dev Academy PostHog project key;
- the ingest host, preferably the existing first-party
  `https://p.dev-academy.com` host;
- the PostHog asset host.

Both runtimes initialize the SDK with:

- `autocapture` disabled;
- automatic pageview capture disabled in favor of an explicit `$pageview`;
- person profiles set to `identified_only`;
- session replay enabled;
- form fields and other designated sensitive elements masked;
- persistence selected from the current consent state.

When the state is undecided or `persistentAnalytics` is false, persistence is
memory-only. No PostHog identifier may remain in localStorage or cookies. When
the preference changes to true, the current anonymous session becomes
persistent and its identifier is available to the next Dev Academy route.

When persistent analytics is revoked, the runtime removes PostHog's durable
identity, breaks the link with the previous identifier, and begins a new
memory-only anonymous session. The implementation must verify this effect in a
real browser rather than relying only on an SDK method call.

## Session replay and data minimization

Session replay operates even before a visitor makes an analytics choice. This
is an explicit product decision and must not be presented as a legal conclusion
that replay is strictly necessary.

The runtime and page markup must minimize replay and event data:

- mask all form inputs;
- exclude explicitly sensitive elements with PostHog no-capture markers;
- remove query strings from page URLs and captured destinations;
- record only the referrer domain, not the full referrer URL;
- never send names, email addresses, subscriber identifiers, checkout data, or
  arbitrary URL parameters as event properties;
- disable broad autocapture and emit only named events;
- use `event_schema_version: 2` on new and migrated custom events.

Before production release, the privacy notice must describe the pre-decision
memory-only analytics and replay behavior, and the person responsible for the
privacy policy must explicitly review this decision.

## Meta Pixel behavior

The Meta Pixel script is not requested unless `marketing` is true.

Changing marketing from false to true loads the Pixel without a page reload and
emits the appropriate initial page/content event once. Changing it from true to
false sends the supported revoke signal and reloads the page so the Pixel script
is no longer present in the document. A cross-tab revocation produces the same
result.

The checkout URL may carry a derived `marketing_consent=1|0` value when required
by the existing checkout integration, but no value returned from the checkout
may silently overwrite the stored browser preference.

## Runtime boundary

Each repository implements the same browser-facing interface:

```js
window.DevAcademyPrivacy.getState()
window.DevAcademyPrivacy.setPreferences({ persistentAnalytics, marketing })
window.DevAcademyPrivacy.acceptAll()
window.DevAcademyPrivacy.rejectAll()
window.DevAcademyPrivacy.subscribe(listener)
window.DevAcademyPrivacy.capture(event, properties)
```

The API owns storage validation, vendor initialization, preference transitions,
cross-tab synchronization, and the analytics wrapper. The local UI owns markup,
copy, focus management, and styling.

In the `dev-academy` repository:

- the runtime replaces the unconditional legacy PostHog bootstrap;
- an EJS partial renders the banner and privacy dialog;
- the theme provides the Dev Academy-specific styles;
- homepage, blog, and confirmation-page analytics call the shared local
  `capture()` wrapper.

In the `browser-security-starter-kit` repository:

- consent and vendor initialization move out of the large
  `LandingPage.astro` inline script;
- an Astro component renders the Starter Kit-specific interface;
- offer timing, checkout URL construction, and other product UI remain separate
  from the consent runtime;
- the local analytics wrapper uses the same PostHog configuration and consent
  event names as the main site.

## Consent analytics

Both runtimes use the same explicit event names and property definitions. At a
minimum:

- `consent_banner_viewed` when the new banner is shown;
- `consent_preferences_updated` after a visitor stores or changes a decision.

`consent_preferences_updated` includes only the two boolean category values,
the action (`accept_all`, `reject_all`, or `save_preferences`), the page path,
and `event_schema_version: 2`. It contains no form values or identifiers.

Existing Starter Kit events are mapped separately to the canonical funnel-v2
taxonomy. Event migration must not change consent semantics or delay this
runtime's initialization.

## Failure behavior

Consent and analytics failures must not block content, signup forms, navigation,
offer timing, or checkout.

- If localStorage is unavailable, the runtime uses an in-memory undecided state,
  keeps PostHog memory-only, and does not load Meta Pixel before an explicit
  in-memory choice. The visitor can use the banner, and that choice applies only
  for the current page lifetime.
- If stored JSON is invalid, the runtime treats it as undecided without throwing.
- If PostHog fails to load, preference storage and all page functionality still
  work.
- If Meta Pixel fails to load, PostHog and page functionality still work.
- If vendor configuration is missing, the affected integration is disabled and
  reports a non-PII diagnostic without repeatedly retrying.
- UI state reflects the stored preference even when a vendor request fails.

## Security headers and proxy behavior

The existing Netlify reverse proxy remains:

```text
/security-starter-kit/* -> browser-security-starter-kit.pages.dev/:splat
```

The global Netlify Content Security Policy must explicitly allow the selected
PostHog asset and ingest hosts and the Meta Pixel endpoints required after
marketing consent. The implementation must keep these allowances as narrow as
the integrations permit and must test the final proxied response headers. It is
not sufficient for scripts to work only on the direct Pages preview URL.

## Verification

Each repository has local contract tests for:

- the exact key name and schema version;
- validation of missing, malformed, and unsupported stored values;
- undecided, reject-all, analytics-only, marketing-only, and accept-all states;
- reopening settings and revoking each category;
- vendor load decisions for all four preference combinations;
- memory-only PostHog and active replay before a decision;
- the absence of PII in explicit events.

A production-origin browser test verifies:

1. A new browser sees the new banner and starts PostHog with replay but without
   durable PostHog storage or Meta requests.
2. Reject all stores both values as false, keeps PostHog memory-only, and does
   not load Meta Pixel.
3. Analytics-only creates durable PostHog state and does not load Meta Pixel.
4. Marketing-only keeps PostHog memory-only and loads Meta Pixel.
5. Accept all enables both integrations.
6. The same persistent PostHog `distinct_id` survives navigation from `/` to
   `/security-starter-kit/`.
7. Revoking persistent analytics removes the durable identifier and starts an
   unlinkable memory-only session.
8. Revoking marketing stops Pixel activity and reloads without the Pixel script.
9. Changing preferences in a second tab updates the first tab.
10. Captured URLs, replay, and event properties contain no form PII or query
    strings.

The final verification includes PostHog's live event/replay views and Meta Events
Manager, not only browser-side assertions.

## Deployment order

Deploy in this order:

1. Update the privacy notice and complete the review of the pre-decision replay
   policy.
2. Deploy the Starter Kit runtime and interface using the shared v1 contract.
3. Deploy the Dev Academy runtime, project configuration, interface, and CSP.
4. Run the complete production-origin flow across both applications.
5. Verify events, persistent identity, replay, and Pixel activity in the vendor
   tools.
6. Mark the rollout complete only after all production checks pass.

Deploying Starter Kit first avoids a period where the main site has stored the
new shared preference but the old Starter Kit runtime ignores it and shows its
legacy banner again.

## Acceptance criteria

- Both production applications use `dev_academy_consent_v1` and no application
  reads the legacy Starter Kit consent key.
- Both applications initialize the same PostHog project with matching privacy
  configuration.
- PostHog and masked session replay work in memory-only mode before a decision.
- Persistent analytics and marketing remain independently configurable.
- Meta Pixel is never requested without marketing consent.
- A persistent PostHog identity crosses the reverse-proxied route boundary.
- Revocation removes the corresponding durable vendor behavior.
- Consent changes synchronize across tabs.
- Consent UI content and semantics match while local styling remains independent.
- CSP permits only the required production integrations and is verified on the
  proxied route.
- Analytics and replay contain no names, email addresses, subscriber IDs, form
  contents, or query strings.
- The privacy notice has been reviewed for the chosen pre-decision replay policy.
