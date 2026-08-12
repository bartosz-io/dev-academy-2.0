# Homepage Headline Marker Design

## Goal

Reduce the visual weight of the `secure` and `tested` highlights in the homepage hero on mobile and desktop without changing the approved headline, typography, wrapping, or semantic markup.

## Approved treatment

- Replace each full-height colored rectangle with a linear-gradient marker: transparent from 0–62%, color from 62–90%, and transparent from 90–100% of the line box.
- Preserve the current color association: purple for `secure`, green for `tested`.
- Remove horizontal highlight padding so the treatment does not widen either word or influence headline wrapping.
- Remove the heavy inset bottom shadow and large rounded box treatment.
- Use the same relative marker depth at every breakpoint so mobile and desktop remain visually consistent.
- Keep the highlight decorative; no HTML, accessibility, copy, analytics, or form behavior changes are required.

## Implementation boundary

Only the homepage highlight styles and their structural CSS acceptance checks should change. The implementation must not alter headline font sizing, line height, spacing, layout, or downstream content.

## Verification

- A CSS acceptance check must require the marker-style gradient treatment and reject a solid full-height background declaration.
- The homepage test suite must pass.
- Visual verification at 382 × 800 and 1440 × 1000 must confirm that the colored band sits behind the lower portion of the letters, does not enlarge the highlighted words, wraps cleanly, and causes no horizontal overflow.
