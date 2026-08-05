# SEC-002: URL allow-list validation design

## Purpose

Teach ordinary JavaScript and TypeScript developers why URL security boundaries must not be validated as arbitrary strings, and provide one small pattern they can apply during human or AI-assisted code review.

## Core lesson

`startsWith()`, `includes()`, and `endsWith()` do not understand URL structure or domain boundaries. Parse the candidate with the platform URL parser and compare the exact semantic property required by the trust decision. For an exact HTTPS origin allow-list, compare `URL.origin` with the trusted origin.

## Narrative

1. Present a plausible validator that accepts values beginning with `https://safe-app.com`.
2. Ask whether the validation is secure.
3. Preserve Bartosz's historical interactive pacing with `Think for a while before you continue. 🙂` followed by exactly 12 lines containing a single period.
4. Reveal `https://safe-app.com.evil.com` and ask whether it passes.
5. Explain that the string begins with the trusted text but its hostname is controlled under `evil.com`.
6. Replace string-prefix validation with `new URL(value).origin === TRUSTED_ORIGIN` inside `try`/`catch` so malformed inputs are rejected.
7. Briefly note that an agent can generate plausible string validation, but a developer must review the actual security boundary.
8. End with one repository check: find URL trust decisions implemented with string matching.

## Pause block

The production email uses this exact plain-text block:

```text
Think for a while before you continue. 🙂
.
.
.
.
.
.
.
.
.
.
.
.
Ready?
```

The period lines are intentional content, not placeholders. They preserve vertical space when the email is pasted into Kit.

## Safe example

```js
const TRUSTED_ORIGIN = 'https://safe-app.com';

function isTrustedUrl(value) {
  try {
    return new URL(value).origin === TRUSTED_ORIGIN;
  } catch {
    return false;
  }
}
```

This pattern intentionally implements an exact-origin rule. It rejects different schemes, hostnames, and non-default ports. A different product requirement, such as allowing selected subdomains, needs a separately defined allow-list rather than a looser string comparison.

## Delivery

- Plain-text-first canonical Markdown.
- No image required; the bad code, pause, bypass, and corrected code create the visual rhythm.
- No Kit body creation or update through MCP.
- Bartosz manually pastes the approved copy into Kit.
- The AI reference remains secondary and tool-independent.

## Proposed metadata

- ID: `SEC-002`
- Track: `security`
- Sequence position: `2`
- Subject: `Would this malicious URL pass your allow-list?`
- Preview text: `safe-app.com.evil.com starts with your trusted domain—and that’s the problem.`
- Initial status: `ready`
- Review interval: 12 months because the advice depends on Web-platform URL semantics.

## Sources for production fact-checking

- Historical Dev Academy source: `pills/url.pdf`
- WHATWG URL Standard: https://url.spec.whatwg.org/
- MDN `URL.origin`: https://developer.mozilla.org/en-US/docs/Web/API/URL/origin
- OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP Unvalidated Redirects and Forwards Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html

## Success criteria

- The bypass is understandable without prior URL-parser knowledge.
- The 12-line pause delays the reveal without introducing ambiguous placeholder text.
- The corrected example rejects the malicious suffix domain, invalid URLs, HTTP, and non-default ports.
- The email distinguishes an exact-origin requirement from other possible URL allow-list requirements.
- The reader leaves with one practical code-review action.
