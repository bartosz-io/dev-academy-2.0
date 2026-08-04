# Dev Academy Knowledge Pills editorial system

Date: 2026-08-04  
Status: proposed for final review  
Primary repository: `/Users/bartosz/Projects/dev-academy`

## Objective

Create a sustainable editorial system for producing and maintaining two evergreen email sequences for JavaScript and TypeScript developers:

- Security Tuesday;
- Testing Friday.

The system must support a weekly production cadence within a two-hour Monday session, preserve Dev Academy's original problem-mechanism-solution teaching style, and keep every active Pill technically accurate over time.

Kit is the delivery system. The Dev Academy repository is the canonical source of content, metadata, sources, and revision history.

## Editorial model

Each sequence is independent. Security and Testing Pills may reference one another when there is a natural connection, but weekly topics do not need to form pairs.

Every new subscriber starts with the first Pill in the relevant sequence. New Pills are appended to the end. A homepage subscriber enters both sequences, while a security-specific subscriber may enter Security Tuesday only.

Each Pill is a standalone lesson, not a chapter in a curriculum. Public subject lines and email copy must not imply that earlier Pills are prerequisites.

The compulsory Monday output is email only:

- one production-ready Security Pill;
- one production-ready Testing Pill.

LinkedIn posts, Instagram carousels, podcast episodes, and other derivatives are outside the compulsory Monday workflow. They may be produced separately for selected topics.

## Positioning and writing principles

Dev Academy teaches the engineering judgment required to ship secure, meaningfully tested software, including software produced with coding agents.

AI-assisted development supports the urgency but does not need to be forced into every email. A Pill should mention agents only when the connection improves the lesson. Relevant agentic framing may cover:

- what requirements to specify;
- what generated implementation to review;
- what automated check should remain in the repository.

The default narrative preserves Bartosz's established style:

1. A recognizable situation from a developer's work.
2. A surprising or easily missed problem.
3. A concise explanation of the underlying mechanism.
4. A concrete mitigation or testing strategy.
5. One practical takeaway.

## Repository structure

Knowledge Pills live outside Hexo's published `source/` tree so unpublished sequence content is not exposed automatically.

```text
content/
└── pills/
    ├── README.md
    ├── backlog.md
    ├── security/
    │   ├── SEC-001-clickjacking.md
    │   └── SEC-002-referrer-policy.md
    ├── testing/
    │   ├── TST-001-architecture-tests.md
    │   └── TST-002-code-coverage.md
    └── assets/
        ├── SEC-001/
        └── TST-001/
```

Historical PDFs remain an archive. They are source material, not canonical production emails. A historical Pill becomes canonical only after it has been fact-checked, edited, and saved in the new Markdown format.

## Pill file format

One Markdown file represents one email. The frontmatter stores operational metadata; the Markdown body contains the exact approved email copy.

```yaml
---
id: SEC-001
track: security
status: added-to-kit
sequence_position: 1

subject: "Can another website click your buttons?"
preview_text: "Authentication does not prove user intent."

created: 2026-08-10
last_verified: 2026-08-10
review_after: 2027-08-10

kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://developer.mozilla.org/
  - https://owasp.org/
---
```

The initial status lifecycle is deliberately small:

```text
idea -> draft -> ready -> added-to-kit -> retired
```

An active Pill whose review date has passed is treated as `needs-review` operationally even if this is computed rather than stored as a permanent status.

Substantive changes made in Kit must be synchronized back to the Markdown file. The repository remains canonical.

## Initial launch buffer

Before opening the new subscription flow, prepare:

- four production-ready Security Pills;
- four production-ready Testing Pills.

This provides approximately one month of runway for each weekly sequence. The remaining historical emails enter the backlog and are refreshed gradually. They must not be imported wholesale without verification.

## Monday production workflow

The session is capped at approximately two hours.

### 1. Topic selection - 10 minutes

Review the backlog, active sequences, previous subjects, engagement signals, and any overdue reviews. Select one topic for each independent track.

### 2. Technical verification - 20 minutes

Prefer primary and authoritative sources:

- specifications and standards;
- OWASP guidance;
- browser and framework documentation;
- official tool and library documentation;
- small executable examples when behavior is uncertain.

Identify behavior that changed since the historical email, framework-specific claims, absolute statements, and advice likely to age quickly.

### 3. Drafting - 60 minutes

Produce subject, preview text, and complete email body for both Pills. Preserve one focused lesson per email. Include agentic-development framing only when it adds practical value.

### 4. Editorial review - 20 minutes

Apply the Definition of Done below and obtain Bartosz's explicit content approval.

### 5. Repository and Kit handoff - 10 minutes

1. Save the approved Markdown and assets in the repository.
2. Mark the Pill `ready`.
3. Inspect the target Kit sequence and current final position.
4. Add the email through Kit MCP as an unpublished draft.
5. Set subject, preview text, HTML content, delay, weekday restriction, and append position.
6. Store the returned Kit identifiers in the Markdown frontmatter.
7. Give Bartosz the Kit `confirm_url` for final visual review.
8. After it exists in Kit, set the repository status to `added-to-kit` while leaving the Kit email unpublished.

## Kit publishing safety

The default MCP operation creates an unpublished draft with `published: false`.

For regular appended emails:

- Security Tuesday uses Tuesday as its allowed send day;
- Testing Friday uses Friday as its allowed send day;
- the delay is measured from the previous sequence email and is configured to preserve weekly cadence;
- the email is appended rather than inserted into an occupied position.

The first emails in the initial sequences may use different entry delays according to the approved subscriber journey: the first Security Pill can arrive immediately, while the first Testing Pill can wait until the next permitted Friday.

Kit returns a `confirm_url` after creating or updating a sequence email. Bartosz uses it to check the rendered email, links, images, mobile appearance, and sequence settings.

Publishing is a separate action:

- Bartosz may publish manually in Kit; or
- after visual review, Bartosz may explicitly instruct Codex to set `published: true` through Kit MCP.

Codex must not publish a sequence email merely because its content was approved. Content approval authorizes draft creation; publishing requires a separate explicit instruction.

If the Kit write fails, the approved Markdown remains `ready`, the error is reported, and no `kit_email_id` is invented. The operation may be retried after inspecting the target sequence to avoid duplicates.

## Definition of Done

A production-ready Pill:

- teaches one complete idea;
- takes less than five minutes to read;
- is understandable without earlier emails;
- targets a regular JavaScript or TypeScript developer, not a pentester;
- explains the mechanism rather than presenting only a copied fix;
- avoids unjustified absolute claims;
- includes a concrete action, decision, or verification technique;
- avoids unnecessary dependence on a temporary tool or framework version;
- includes an approved subject and preview text;
- records authoritative sources and a future review date;
- uses links and assets that were checked;
- matches the canonical repository copy when handed to Kit.

## Evergreen maintenance

Default review intervals are based on volatility:

- foundational HTTP, architecture, and test-design concepts: 18 months;
- browser security, standards, and framework behavior: 12 months;
- tool- and library-specific instructions: 6 months.

At review time, a Pill is:

- verified and left unchanged;
- updated in both the repository and Kit;
- or retired and disabled or removed from the active Kit sequence.

A future `npm run pills:check` command should validate:

- unique Pill IDs;
- unique sequence positions per track;
- required metadata;
- valid status values;
- subject and preview text presence;
- configured length limit;
- at least one source for production content;
- valid `related_pill` references;
- absence of overdue active Pills.

This check supports editorial QA but does not replace technical fact-checking or Kit preview review.

## Measurement and editorial feedback

Open rate is not the sole optimization signal. Monthly review should consider:

- `GREAT / OK / BAD` ratings where implemented;
- direct replies;
- unsubscribes associated with individual emails;
- clicks to supporting materials and tools;
- recurring questions from subscribers;
- later interest in paid products.

Quarterly review should reorder the backlog, identify topics worth expanding, and decide whether observed demand supports a paid Starter Kit, cohort, testing product, or another offer.

## Acceptance criteria

- Security Tuesday and Testing Friday exist as separate Kit sequences.
- Every new subscriber starts at the beginning of the applicable evergreen sequence.
- The repository, not Kit, is the canonical content source.
- The initial launch buffer contains four approved Pills per track.
- Each Monday can produce one approved Pill per track within approximately two hours.
- Every production Pill satisfies the Definition of Done and has a review date.
- Kit MCP adds approved content as an unpublished draft and returns a review link.
- No Kit sequence email is published through MCP without a separate explicit instruction from Bartosz.
- Historical PDFs remain available but are not treated as production-ready content.
- Social-media derivatives do not block the weekly email cadence.
