# SEC-003 Offline Key Guessing HTML Visual Design

## Goal

Add one compact visualization to `SEC-003` that explains how an attacker tests
candidate HS256 keys offline. The visual must make clear that the attacker
guesses the shared signing key, computes an authentication code, and compares
the result with the signature in a captured JWT.

The visualization is canonical HTML inside the Pill. It is not an SVG, raster
image, attachment, or external asset.

## Scope

Modify only the canonical `SEC-003` email and the documentation needed to keep
its acceptance checks consistent. Do not change Kit, publication state,
frontmatter, backlog ordering, sources, or other Pills.

## Placement

Insert the visualization after the paragraph ending:

> That work happens offline. It does not require repeated login attempts, so
> your application’s rate limiter does not slow it down.

The following paragraph about recovering the shared key remains immediately
after the visualization. This placement lets the diagram explain the offline
mechanism before the email describes the attacker's impact.

## Layout

Use a self-contained light-gray region with a title, subtitle, a 2-by-2 flow,
two outcome banners, and one closing line.

The flow follows a snake-shaped path so connectors never cross:

```text
1 → 2
    ↓
4 ← 3
```

Implement the layout with presentation tables and inline styles. Do not use CSS
Grid, Flexbox as the primary layout mechanism, external CSS, media queries,
SVG, canvas, scripts, or event-handler attributes. The layout must remain two
columns at typical email width.

## Exact visible copy

### Region heading

- Title: `Guessing a weak JWT signing key`
- Subtitle: `One captured token is enough to test candidate keys offline.`

### Step 1

- Eyebrow: `1 · OBTAIN A TOKEN`
- Heading: `Captured JWT`
- Context: `For example, from a request visible in browser DevTools`

### Step 2

- Eyebrow: `2 · CHOOSE A CANDIDATE KEY`
- Heading: `secret123?`
- Context: `Try a common password or the next value from a wordlist`

### Step 3

- Eyebrow: `3 · COMPUTE LOCALLY`
- Heading: `HMAC-SHA-256`
- Context: `Sign the captured header and payload with the candidate key`

### Step 4

- Eyebrow: `4 · COMPARE`
- Heading: `Signatures match?`
- Context: `Compare the result with the signature in the captured JWT`

### Outcomes and closing line

- Failure: `NO ↺ try the next candidate key`
- Success: `YES → signing key recovered`
- Closing line:
  `No login attempts · No requests to the application · No rate limiting`

## HTML and presentation contract

The outer element must be:

- a `<div>` with `role="region"`;
- labelled with
  `aria-label="How an attacker guesses a weak JWT signing key offline"`;
- styled entirely inline;
- visually aligned with the existing SEC-003 code blocks by reusing the light
  background, gray border, rounded corners, and established warning, success,
  purple, gray, and dark text colors.

Use the approved palette exactly:

- region background `#f6f8fa`, border `#d0d7de`, and primary text `#24292f`;
- muted text and connectors `#57606a`;
- warning text and border `#cf222e` on `#fff5f5` or `#fff1f0`;
- computation text and border `#8250df` on `#faf5ff`;
- success text `#0a7a28` on `#dafbe1`.

Use `Arial, Helvetica, sans-serif` for explanatory text and
`Consolas, Menlo, monospace` for the candidate key. The flow table columns are
`46% / 8% / 46%`, with the narrow middle column reserved for horizontal
arrows. The vertical arrow occupies the third column between the two step rows.

Use `<table role="presentation">` for both the four-step flow and the two
outcome banners. Use real text characters for the arrows. The region must remain
understandable without color because its numbers, labels, arrows, and outcome
words carry the meaning.

## Technical accuracy

The diagram must not say that the attacker guesses the authentication code.
The candidate is the shared key. For each candidate key, the attacker computes
HMAC-SHA-256 over the captured JWT's encoded header and payload, then compares
the result with the token's signature.

Browser DevTools is an example of where a legitimate user or tester can observe
a JWT included in an application request. The diagram does not claim that every
application exposes a token to JavaScript or stores it in the same location.

## Accessibility and email safety

- Keep all explanatory copy as real HTML text.
- Supply the content-specific accessible region label.
- Use presentation roles on layout tables.
- Do not communicate match and mismatch through color alone.
- Do not include remote resources, linked stylesheets, scripts, SVG, images,
  canvas, forms, or event-handler attributes.
- Encode characters if they could be interpreted as markup.

## Repository changes

Expected implementation changes:

1. add the approved HTML region to
   `content/pills/security/SEC-003-jwt-hmac-key-strength.md`;
2. update existing SEC-003 design and implementation documentation only where
   their acceptance expectations would otherwise contradict the third HTML
   region;
3. add no files under `content/pills/assets/SEC-003/`.

## Acceptance criteria

Implementation is complete when:

1. `SEC-003` contains the approved visual immediately after the offline-attack
   paragraph;
2. the complete visible copy above is present exactly once;
3. the outer visualization has the approved `role` and `aria-label`;
4. the visualization contains two presentation tables and no SVG, image,
   canvas, script, linked stylesheet, or event handler;
5. the four numbered steps and their arrows follow the approved snake order;
6. the existing two syntax-highlighted code regions remain unchanged;
7. SEC-003 remains `ready`, at sequence position 3, with unchanged sources and
   publication record;
8. `npm run test:pills`, `npm run pills:check`, the focused HTML acceptance
   check, and `git diff --check` all pass.
