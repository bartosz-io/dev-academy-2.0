# Historical Security Pills Backlog Design

## Goal

Turn the ten supplied historical Security Tuesday emails into a prioritized,
source-aware backlog for the current evergreen Knowledge Pills sequence.

The backlog must preserve useful ideas without treating historical copy or
technical advice as production-ready. `SEC-001` and `SEC-002` are already
published and must not remain among future topics.

## Source inventory

The source set contains these historical emails:

- clickjacking and framing protection;
- a seven-step Web application security overview;
- application-level security logging and accountability;
- JWT HMAC signing-key strength;
- the TOTP mechanism behind authenticator applications;
- Have I Been Pwned and known breaches;
- password-reset token leakage through the `Referer` header;
- reverse tabnabbing from links opened in a new tab;
- exact URL allow-list validation;
- XSS escape hatches in modern frontend frameworks.

## Backlog structure

`content/pills/backlog.md` will use four Security sections.

### Published

Record `SEC-001` and `SEC-002` as published so they remain visible in the
editorial inventory without appearing as candidates for another Pill.

This section records the user's confirmed mailing state. It does not replace
the canonical Kit identifiers required by individual Pill frontmatter.

### Next

Prioritize the strongest independent lessons that already contain a concrete
failure mode and mitigation:

1. weak HMAC signing keys in JWTs;
2. password-reset token leakage through referrer information;
3. security-event logging beyond access logs;
4. XSS escape hatches in modern frontend frameworks.

Each item will include:

- the historical source filename;
- the focused angle for a new Pill;
- a refresh note identifying claims that require verification before drafting.

### Later / requires reframing

Keep useful topics whose historical treatment is incomplete, externally
dependent, or affected by platform changes:

- TOTP as a shared-secret and time-based mechanism;
- breached-password screening using Pwned Passwords;
- reverse tabnabbing and the current behavior of `target="_blank"`.

These entries must explain why the original email cannot simply be republished.

### Topic mine

Treat the broad seven-step email as an index, not as one Knowledge Pill. Extract
only distinct topics that are not already represented above:

- cookie sessions versus bearer-token architectures;
- server-side authorization on every endpoint and least privilege;
- protection against automated login attacks;
- automated security testing as a development feedback loop.

## Prioritization rules

The ordering favors topics that:

1. expose one hidden security assumption;
2. can show a small JavaScript or TypeScript example;
3. end with one practical check;
4. remain relevant to working Web developers;
5. can be verified against current primary documentation.

Historical drama, promotions, referral mechanics, and course references are not
backlog material.

## Technical freshness

Every future Pill remains an `idea` until its technical claims are verified.
The backlog will call out these known refresh risks:

- current minimum key requirements and library behavior for JWT HMAC signing;
- modern default browser referrer policy and the recommendation for sensitive
  reset pages;
- avoiding credentials, reset tokens, and unnecessary personal data in logs;
- current Angular, React, Vue, and browser behavior around HTML injection;
- secure enrollment, secret storage, replay handling, and recovery for TOTP;
- the current Pwned Passwords API privacy model;
- implicit `noopener` behavior and remaining `window.open` or legacy cases.

## Repository changes

The implementation will:

1. replace the stale Security list in `content/pills/backlog.md` with the four
   approved sections;
2. retain the existing Testing backlog and Review due section unchanged;
3. avoid changing `SEC-002` frontmatter until its confirmed Kit identifiers are
   available;
4. run `npm run pills:check` and `git diff --check` after editing.

## Out of scope

- drafting `SEC-003` or later emails;
- copying historical email bodies into the repository;
- changing Kit content, scheduling, or publication state;
- inventing Kit identifiers;
- verifying every technical claim before a specific Pill is selected for
  production.
