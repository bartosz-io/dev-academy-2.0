# Knowledge Pills backlog

## Security

### Published

- `SEC-001` — Clickjacking and `frame-ancestors` (source: `1 clickjacking.pdf`)
- `SEC-002` — Exact URL origin allow-list validation (source: `url.pdf`)
- `SEC-003` — JWT HMAC signing-key strength (source: `jwt.pdf`)

### Next

1. **Password-reset tokens and referrer leakage** (source: `referer.pdf`)
   - Angle: a secret in a reset-page URL can leave the page in referrer information sent to another origin.
   - Refresh before drafting: verify current browser defaults and choose an explicit policy suitable for a sensitive reset page.
2. **Security-event logging beyond access logs** (source: `accuntable.pdf`)
   - Angle: HTTP access logs cannot answer every question about authorization decisions and user actions.
   - Refresh before drafting: define useful event context without logging credentials, reset tokens, or unnecessary personal data.
3. **XSS escape hatches in modern frameworks** (source: `xss.pdf`)
   - Angle: framework escaping helps until code deliberately crosses an HTML injection boundary.
   - Refresh before drafting: select one focused framework example and verify its current API and sanitization guidance.

### Later / requires reframing

- **How TOTP authenticator codes work** (source: `otp.pdf`)
  - Reframe: turn the historical video promotion into a standalone lesson about a shared secret, time step, verification window, replay handling, and recovery.
- **Breached-password screening with Pwned Passwords** (source: `pwned.pdf`)
  - Reframe: shift from asking readers to look up their email toward a developer check for rejecting known-compromised passwords while preserving privacy.
- **Reverse tabnabbing after modern `noopener` defaults** (source: `target blank.pdf`)
  - Reframe: verify implicit `noopener` for `target="_blank"` and focus only on remaining `window.open`, named-target, legacy, or compatibility cases.

### Topic mine from `7 steps.pdf`

- Cookie sessions versus bearer-token architectures: choose by deployment boundaries and threat model, not fashion.
- Server-side authorization on every endpoint and the principle of least privilege.
- Protection against automated login attacks: throttling, rate limits, and layered defenses.
- Automated security testing as a repeatable development feedback loop.

## Testing

- Unit-test assertions as behavioral evidence
- Network interception and contract drift

## Review due

Move active Pills here when `review_after` is approaching or has passed.
