# Knowledge Pills

This directory is the canonical source for Dev Academy Security Tuesday and Testing Friday emails. Kit contains delivery copies, not the source of truth.

## Tracks and filenames

- Security: `security/SEC-NNN-topic-slug.md`
- Testing: `testing/TST-NNN-topic-slug.md`
- Assets: `assets/SEC-NNN/` or `assets/TST-NNN/`

Internal IDs and sequence positions are not required in public subject lines.

## Lifecycle

`idea -> draft -> ready -> added-to-kit -> retired`

Only `ready` and `added-to-kit` are production statuses. `added-to-kit` means a Kit draft or live email exists and therefore requires `kit_sequence_id` and `kit_email_id`.

## Monday handoff

1. Select one independent topic per track.
2. Verify technical claims using authoritative sources.
3. Draft subject, preview text, and one standalone email in plain-text-first style. Render every standalone code snippet with the syntax-highlighted HTML pattern defined below.
4. Obtain Bartosz's explicit content approval.
5. Save the canonical Markdown and run `npm run pills:check`.
6. Mark image locations with explicit placeholders and keep the source assets under the matching Pill ID.
7. Bartosz manually pastes the approved copy into Kit and uploads the images.
8. Use Kit MCP only to inspect or synchronize sequence metadata and Kit identifiers, not to transfer or overwrite the email body.
9. Save the confirmed Kit identifiers in frontmatter and set the status to `added-to-kit`.
10. Publish only after a separate explicit instruction.

## Kit content rule

The repository copy is written and reviewed as plain-text-first content with lightweight Markdown. Standalone code snippets are intentional, self-contained HTML islands authored in the canonical file before review. Codex does not convert the complete body to HTML or write the body to Kit through MCP. Bartosz performs the final paste, image upload, and visual review in Kit. Kit's remaining internal HTML representation is a delivery detail and is never the canonical source.

## Code snippet rule

Every standalone code snippet must:

- use an outer `<div role="region" aria-label="…">` with a concise, content-specific label;
- use one `<pre><code>` pair inside that region;
- use inline styles only, with no external stylesheet, `<script>`, or event-handler attribute;
- use `margin: 24px 0`, `padding: 20px 22px`, `background: #f6f8fa`, `border: 1px solid #d0d7de`, and `border-radius: 10px` on the outer region;
- use `color: #24292f`, `font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace`, `font-size: 15px`, `line-height: 1.65`, `white-space: pre-wrap`, and `overflow-wrap: anywhere` on `<pre>`;
- encode characters such as `<`, `>`, and quotes when they could be parsed as markup;
- use the established palette when applicable: `#0000cc` for keywords, `#0a7a28` for strings, `#8250df` for declarations, `#cf222e` for insecure or warning values, and `#57606a` for comments or punctuation;
- remain understandable without color; color supplements the text and accessible label.

Short technical references inside prose remain Markdown code spans. Do not wrap inline references in the standalone HTML structure.

## Evergreen reviews

- Foundations: 18 months.
- Browser, standard, and framework behavior: 12 months.
- Tool- and library-specific guidance: 6 months.

An overdue production Pill must be reviewed, updated, or retired.
