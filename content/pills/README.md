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
3. Draft subject, preview text, and one standalone email.
4. Obtain Bartosz's explicit content approval.
5. Save the canonical Markdown and run `npm run pills:check`.
6. Create an unpublished Kit draft through MCP.
7. Save the returned Kit identifiers in frontmatter.
8. Give Bartosz the Kit confirmation URL.
9. Publish only after a separate explicit instruction.

## Evergreen reviews

- Foundations: 18 months.
- Browser, standard, and framework behavior: 12 months.
- Tool- and library-specific guidance: 6 months.

An overdue production Pill must be reviewed, updated, or retired.
