# Newsletter email grid spacing fix

## Problem

The call-to-action below the two example emails appears attached to the cards even though `.newsletter-examples-form` has a `4rem` top margin. Each `.newsletter-email` uses `height: 100%` inside a wrapper that also contains the email label. The label and its margin make the card overflow the grid row and visually consume the intended spacing.

## Design

- Add a shared class to each email-and-label wrapper.
- Make that wrapper a vertical flex container.
- Replace the email card's `height: 100%` with `flex: 1`, preserving equal card heights without overflowing the grid.
- Keep the existing `4rem` CTA margin unchanged.
- Apply the same behavior at desktop and mobile breakpoints.

## Verification

- Add a regression assertion for the wrapper class and flex sizing before changing production markup and CSS.
- Run the homepage acceptance test through a red-green cycle.
- Verify the gap visually at desktop and mobile widths.
- Run the production build and ensure the Git worktree remains clean except for the intended commit.

## Non-goals

- No copy, color, form, card-content, or CTA-size changes.
- No arbitrary increase to the CTA margin to conceal the overflow.
