# SEC-003 JWT HMAC Key Strength Design

## Goal

Create a complete draft of the third Security Pill showing that a correctly
implemented HS256 JWT can still be forgeable when its shared HMAC key is
predictable.

The Pill must give working JavaScript and TypeScript developers one practical
review habit: verify how the signing key was generated, not only whether a JWT
library verifies the token.

## Status and sequence

- ID: `SEC-003`
- Track: `security`
- Status: `draft`
- Sequence position: `3`
- Filename: `content/pills/security/SEC-003-jwt-hmac-key-strength.md`
- Created and last verified: `2026-08-17`
- Review after: `2027-08-17`
- Kit identifiers: blank
- Related Pill: blank

The status remains `draft` until Bartosz explicitly approves the complete email
copy. A later approval may change it to `ready` in a separate step.

## Editorial approach

Use a configuration-review story rather than a pentesting walkthrough or a
library-specific guardrail.

Open with a plausible environment value:

```text
JWT_HMAC_KEY=secret123
```

In the canonical email, render this value as the syntax-highlighted HTML region
labelled `Weak JWT HMAC key configuration`, following the Knowledge Pills code
snippet rule.

The configuration looks operational because the application can create and
verify HS256 tokens. The hidden assumption is that using a strong hash function
makes a human-chosen shared key strong.

Explain the consequence precisely:

1. a party that obtains one token has the signing input and its MAC;
2. candidate keys can be checked offline without repeatedly calling the
   application;
3. after recovering the shared key, the party can produce altered tokens whose
   MAC the application accepts.

Do not describe this as decrypting the JWT or breaking SHA-256. The weakness is
the key, not the hash function.

## Mitigation

For HS256, state that RFC 7518 requires a key of at least 256 bits, or 32 bytes.
Also preserve the stricter and more useful requirement from RFC 8725: a
human-memorable password must not be used directly as an HS256 key.

Show Node.js generating 32 cryptographically strong random bytes:

```js
import { randomBytes } from 'node:crypto';

const encodedKey = randomBytes(32).toString('base64url');
console.log(encodedKey);
```

In the canonical email, render this example as the syntax-highlighted HTML
region labelled `Generating a random HS256 key in Node.js`.

Frame this as a one-time provisioning command. The output is stored in the
deployment's secret-management system. It is not generated at every process
start, committed to source control, or logged by the application.

If an existing key is weak, tell the reader to plan a rotation. Do not prescribe
a universal zero-downtime rotation protocol because token lifetime and key
selection are application-specific.

## Email structure

1. Standard greeting and Security Pill introduction.
2. The weak environment value near the top.
3. A direct question asking whether the configuration is safe.
4. The hidden assumption and offline attack explanation.
5. The precise impact: forged tokens accepted by services that trust the key.
6. The 32-random-byte mitigation and one-time Node.js generation example.
7. A short storage and rotation qualification.
8. A practical check asking where the current key came from, without printing
   or exposing it.
9. Standard concise Security Tuesday sign-off.

The body must remain below 900 words and readable in under five minutes.

## Proposed metadata copy

- Subject: `Could someone guess your JWT signing key?`
- Preview text: `HS256 can be correctly implemented and still rely on a weak shared secret.`

## Scope boundaries

Include only the weak-symmetric-key lesson.

Do not include:

- JWT-versus-cookie comparisons;
- the `none` algorithm;
- algorithm-confusion attacks;
- claim, issuer, or audience validation;
- asymmetric JWT signing;
- a general JWT tutorial;
- password-based key derivation as an alternative;
- AI-assisted-development framing;
- an image or image placeholder;
- a promotional CTA.

## Sources and claim boundary

Use these primary sources in frontmatter:

- `https://www.rfc-editor.org/rfc/rfc7518.html#section-3.2`
- `https://www.rfc-editor.org/rfc/rfc8725.html#section-2.2`
- `https://www.rfc-editor.org/rfc/rfc8725.html#section-3.5`
- `https://nodejs.org/api/crypto.html#cryptorandombytessize-callback`

Claims permitted by those sources:

- HS256 is an HMAC SHA-256 algorithm using a shared key;
- RFC 7518 requires an HS256 key at least as large as the hash output: 256
  bits;
- a weak symmetric key permits offline brute-force or dictionary attacks after
  a token is obtained;
- human-memorable passwords must not be used directly as HS256 keys;
- Node.js `randomBytes(32)` produces 32 bytes of cryptographically strong
  pseudorandom data.

Do not estimate cracking time or claim that every JWT library accepts weak keys.

## Acceptance and verification

Implementation must follow a red-green content acceptance cycle:

1. verify that the canonical `SEC-003` file does not yet exist;
2. create the exact approved draft;
3. confirm its ID, status, sequence position, subject, preview, sources, two
   labelled syntax-highlighted HTML code regions, one labelled email-safe HTML
   visualization of offline key guessing, no fenced code blocks or image
   assets, required mitigation, and maximum word count;
4. run `npm run test:pills`;
5. run `npm run pills:check`, expecting five valid Knowledge Pills;
6. run `git diff --check` and review the complete diff.

The backlog remains unchanged while `SEC-003` is a draft. Moving or removing
the topic from `Next` happens only when the Pill becomes production-ready.
