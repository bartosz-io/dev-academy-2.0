---
id: SEC-002
track: security
status: ready
sequence_position: 2
subject: "Would this malicious URL pass your allow-list?"
preview_text: "This three-line validator looks reasonable. Would you approve it?"
created: 2026-08-05
last_verified: 2026-08-05
review_after: 2027-08-05
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://url.spec.whatwg.org/
  - https://developer.mozilla.org/en-US/docs/Web/API/URL/origin
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
---

## Email body

Hi developer,

It’s time for another Security Pill. 💊

Imagine an agent opens a pull request containing this URL allow-list:

```js
function isTrustedUrl(value) {
  return value.startsWith('https://safe-app.com');
}
```

The intention is simple: accept URLs from `https://safe-app.com` and reject everything else.

The question is:

**Is this validation secure?**

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

Imagine an attacker controls `evil.com` and creates this subdomain:

`https://safe-app.com.evil.com`

Will it pass our check?

**Yes.** The entire string starts with `https://safe-app.com`.

But the browser does not treat that text as the trusted domain. The hostname is `safe-app.com.evil.com`, which belongs under `evil.com`.

The problem is that `startsWith()` understands strings—not URL structure or hostname boundaries.

Parse the URL first and compare the exact property your application trusts:

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

For HTTP and HTTPS URLs, `origin` represents the scheme, hostname, and port. This check therefore rejects a different scheme, hostname, non-default port, or malformed URL.

This example intentionally allows one exact origin. If your product must trust multiple origins or selected subdomains, define that allow-list explicitly—do not loosen the check back into string matching.

AI can generate a validator that looks perfectly reasonable. Your review still has to verify whether the code enforces the real security boundary.

**Your check for today**

Search your project for `startsWith`, `includes`, or `endsWith` near URLs, redirects, origins, callbacks, or webhook destinations.

For every match, ask:

**Are we comparing a string, or the exact URL property we actually trust?**

That’s all for today. One deceptive string, one parser, one practical check. 💊

See you next Tuesday,  
Bartosz  
Dev Academy
