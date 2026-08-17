# Knowledge Pills HTML Code Snippets Design

## Goal

Make syntax-highlighted, self-contained HTML the standard representation for
block code snippets in canonical Dev Academy Knowledge Pills, then migrate the
two block snippets in the `SEC-003` draft to that format.

Short inline technical references remain lightweight Markdown code spans.

## Why this becomes a process rule

Kit receives a manual copy of the canonical repository body. A fenced Markdown
block does not preserve the intended syntax colors when transferred into the
email editor. The repository therefore needs to contain the final snippet
markup rather than relying on a later, undocumented conversion step.

`TST-002` already demonstrates the accepted email-safe pattern. The process
documentation will make that pattern explicit for future Pills.

## Canonical snippet structure

Every block code snippet must use:

- one outer `<div>` with `role="region"`;
- a concise, content-specific `aria-label`;
- inline presentation styles only;
- one `<pre><code>` pair for whitespace and code semantics;
- `<span>` or `<strong>` elements with inline colors for syntax emphasis;
- HTML entities for characters that would otherwise be parsed as markup;
- wrapping rules that keep long code usable on narrow email clients.

The shared visual baseline is:

- `margin: 24px 0`;
- `padding: 20px 22px`;
- `background: #f6f8fa`;
- `border: 1px solid #d0d7de`;
- `border-radius: 10px`;
- text color `#24292f`;
- font stack `SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`;
- font size `15px`;
- line height `1.65`;
- `white-space: pre-wrap`;
- `overflow-wrap: anywhere`.

Use the existing token palette when applicable:

- keyword/import blue: `#0000cc`;
- string green: `#0a7a28`;
- declaration purple: `#8250df`;
- warning or insecure value red: `#cf222e`;
- comment or punctuation gray: `#57606a`;
- regular identifiers: inherited `#24292f`.

Color must supplement the code rather than carry meaning alone. The text and
`aria-label` must remain sufficient without the colors.

## Inline code boundary

Short technical references inside prose remain Markdown code spans, for
example:

- `HS256`;
- `randomBytes(32)`;
- `target="_blank"`.

Only standalone code examples use the HTML snippet structure.

## SEC-003 migration

Convert exactly two standalone snippets.

### Deployment configuration

Replace the Markdown code span containing `JWT_HMAC_KEY=secret123` with an HTML
region labelled `Weak JWT HMAC key configuration`.

Render:

- `JWT_HMAC_KEY` in the inherited code color;
- `=` in gray;
- `secret123` in red and bold.

### Node.js provisioning example

Replace the fenced JavaScript block with an HTML region labelled
`Generating a random HS256 key in Node.js`.

Highlight:

- `import` and `from` in blue;
- `const` in purple;
- string literals in green;
- `randomBytes`, `toString`, `console`, and `log` in bold inherited color;
- parentheses, punctuation, and identifiers as ordinary readable text.

Encode single quotes as `&#39;` within `<code>` so the content is safe and
portable when pasted into Kit.

The wording, technical claims, metadata, status, sources, and sequence position
of `SEC-003` remain unchanged.

## Process documentation

Update `content/pills/README.md` in two places.

### Monday handoff

The drafting step must state that standalone code snippets use the canonical
syntax-highlighted HTML pattern while surrounding email copy remains
plain-text-first.

### Kit content rule

Clarify that:

- the email remains plain-text-first with lightweight Markdown;
- standalone code snippets are intentional, self-contained HTML islands;
- Codex authors those snippets in the canonical file before review;
- Codex does not convert the complete body to HTML or write it to Kit;
- Bartosz still performs the final manual paste and visual review.

Add a `Code snippet rule` subsection containing the required structure,
styling, escaping, accessibility, and inline-code boundary.

## Documentation consistency

Update the existing SEC-003 design and implementation plan because they
currently require the absence of HTML and specify Markdown snippets.

The revised documents must:

- require two HTML code regions;
- include the exact migrated snippet markup in the implementation plan;
- replace the `no HTML` assertion with checks for two labelled regions,
  `<pre><code>`, syntax-color spans, escaped strings, and no fenced code blocks;
- keep the expected body word count derived from visible text, not markup.

## Test strategy

Use a red-green acceptance check against the current `SEC-003` file.

The initial check must fail because the draft still contains fenced or
Markdown-only standalone snippets.

After migration, the check must confirm:

1. exactly two `role="region"` code containers;
2. both required `aria-label` values;
3. exactly two `<pre` and two `<code>` openings;
4. presence of the shared background, border, font, wrapping, and token colors;
5. the weak value `secret123` is marked red and bold;
6. JavaScript keyword, declaration, and string colors are present;
7. `&#39;` is used for JavaScript string quotes;
8. no fenced code block remains in `SEC-003`;
9. no external stylesheet, `<script>`, or event-handler attribute is present;
10. the Pill remains within the 900-word limit and retains its existing
    metadata and technical assertions.

These counts apply to code regions identified by their two approved code labels
and `<pre><code>` structures. SEC-003 may contain the separately approved
non-code HTML visualization region; acceptance must not infer the number of code
snippets from the total `role="region"` count.

Then run:

- `npm run test:pills`;
- `npm run pills:check`;
- `git diff --check`.

## Scope boundaries

This change does not retroactively migrate other Security Pills. Existing
HTML snippets in `TST-002` remain unchanged. Future code-block migrations can
be scheduled when each Pill is reviewed.

This change does not alter Kit content, publication state, Pill status,
backlog ordering, images, or technical guidance.
