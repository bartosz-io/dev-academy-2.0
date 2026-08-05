# Newsletter anchor offset design

## Goal

Keep the global `Get the free Pills` CTA targeting the homepage hero form at `#get-free-pills`, while ensuring the fixed header does not cover the form after fragment navigation.

## Current behavior and root cause

The CTA and target are connected correctly. The browser aligns the top of the target form with the top of the viewport. Dev Academy's header is fixed and overlays that position, hiding the start of the form. The header is `7rem` high on mobile and `8rem` high on desktop.

## Design

Apply a target-specific `scroll-margin-top` to the hero newsletter form. The offset must equal the active header height plus `2rem` of visual breathing room:

- mobile: `9rem` (`7rem` header plus `2rem` spacing);
- desktop: `10rem` (`8rem` header plus `2rem` spacing).

The existing `href="#get-free-pills"`, target ID, smooth scrolling behavior, form placement, and form submission behavior remain unchanged.

Target-specific spacing is preferred over global `scroll-padding-top` because it does not alter article anchors, table-of-contents navigation, or other fragment links. JavaScript scrolling is unnecessary because native fragment navigation already works.

## Verification

Add a focused static regression assertion proving that the newsletter homepage stylesheet defines the mobile and desktop scroll offsets for `#get-free-pills`. Run the existing homepage verification command where the local legacy toolchain permits it, and independently inspect the generated or served homepage at mobile and desktop widths to confirm that clicking the CTA leaves the form visible below the fixed header.

## Non-goals

- Changing the CTA label or destination.
- Moving the hero form.
- Changing global anchor behavior.
- Adding custom JavaScript scrolling or focus management.
