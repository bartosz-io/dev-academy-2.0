# Welcome Page Without Persistent Browser Identifiers

## Goal

Remove the consent UI and persistent browser identifiers from `/welcome` while preserving anonymous PostHog event collection and the existing double-opt-in confirmation flow.

## Tracking mode

Rename the existing `memory-only-server-capi` mode to:

```text
no-persistent-browser-identifiers
```

The name describes the actual boundary:

- PostHog may collect browser events, but its persistence remains `memory`.
- PostHog must not persist identity in cookies or localStorage.
- Meta browser Pixel must not load or execute.
- The `_fbc` cookie must not be read or written.
- An `fbc` value may still be derived transiently from `fbclid` in page memory and sent to Meta CAPI when an allowed Meta event is explicitly emitted.
- The public consent API and cross-tab consent updates must not enable persistent storage in this mode.

## Page configuration

- The homepage continues to use `no-persistent-browser-identifiers` automatically.
- `/welcome` opts into the same mode explicitly through page frontmatter.
- Layout behavior is driven by the resolved tracking mode, not by a hardcoded `/welcome` pathname.
- Pages using this mode render no consent banner, privacy dialog, or privacy-settings trigger.
- Other pages and landing pages remain `consent-managed` unless they explicitly opt in later.

## Welcome flow

- Do not add a new Meta event on `/welcome`.
- Do not alter the Kit redirect, double-opt-in instructions, confirmation state, Starter Kit flow, page copy, or layout.
- Keep the shared privacy runtime and main script loaded once.

## Verification

- Runtime tests must use the renamed tracking mode and retain all existing memory-only, no-Pixel, no-cookie, consent-mutation, and CAPI assertions.
- Generated-output tests must prove both `/` and `/welcome` serialize `no-persistent-browser-identifiers` and omit all consent controls.
- Generated-output tests must prove a normal article remains `consent-managed` with consent controls.
- Homepage and privacy suites must pass.
