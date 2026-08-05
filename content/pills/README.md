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
3. Draft subject, preview text, and one standalone email in plain-text style.
4. Obtain Bartosz's explicit content approval.
5. Save the canonical Markdown and run `npm run pills:check`.
6. Mark image locations with explicit placeholders and keep the source assets under the matching Pill ID.
7. Bartosz manually pastes the plain-text copy into Kit and uploads the images.
8. Use Kit MCP only to inspect or synchronize sequence metadata and Kit identifiers, not to transfer or overwrite the email body.
9. Save the confirmed Kit identifiers in frontmatter and set the status to `added-to-kit`.
10. Publish only after a separate explicit instruction.

## Kit content rule

The repository copy is written and reviewed as plain text with lightweight Markdown for the canonical file. Codex does not convert the body to HTML or write the body to Kit through MCP. Bartosz performs the final paste and image upload in Kit. Kit's internal HTML representation is a delivery detail and is never the canonical source.

## Evergreen reviews

- Foundations: 18 months.
- Browser, standard, and framework behavior: 12 months.
- Tool- and library-specific guidance: 6 months.

An overdue production Pill must be reviewed, updated, or retired.
