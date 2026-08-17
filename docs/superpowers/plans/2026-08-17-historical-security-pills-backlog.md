# Historical Security Pills Backlog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale Security backlog with a prioritized, source-aware inventory derived from the ten supplied historical emails.

**Architecture:** Keep the existing repository-native Markdown backlog as the single editorial index. Organize only the Security section into published, next, later/reframe, and topic-mine subsections while preserving the Testing and review sections.

**Tech Stack:** Markdown, Node.js Knowledge Pills validator, Git

## Global Constraints

- `SEC-001` and `SEC-002` are already published and must not appear as future topics.
- Historical copy and technical advice are source material, not production-ready content.
- Do not change `SEC-002` frontmatter without confirmed Kit identifiers.
- Preserve the existing Testing backlog and Review due section unchanged.
- Do not draft future Pill bodies or change Kit content.

---

### Task 1: Replace the Security backlog

**Files:**
- Modify: `content/pills/backlog.md`
- Reference: `docs/superpowers/specs/2026-08-17-historical-security-pills-backlog-design.md`

**Interfaces:**
- Consumes: the approved historical-source classification in the design spec.
- Produces: a Markdown editorial inventory used to select and refresh future Security Pills.

- [x] **Step 1: Record the current baseline**

Run:

```bash
sed -n '1,240p' content/pills/backlog.md
```

Expected: the Security section contains the stale flat list with clickjacking and URL allow-list validation.

- [x] **Step 2: Replace the Security section**

Use these exact subsections and ordering:

```markdown
## Security

### Published

- `SEC-001` — Clickjacking and `frame-ancestors` (source: `1 clickjacking.pdf`)
- `SEC-002` — Exact URL origin allow-list validation (source: `url.pdf`)

### Next

1. **JWT HMAC signing-key strength** (source: `jwt.pdf`)
   - Angle: a correctly signed token is forgeable when the shared secret is guessable.
   - Refresh before drafting: verify current JOSE guidance, minimum key requirements, and library behavior using primary documentation.
2. **Password-reset tokens and referrer leakage** (source: `referer.pdf`)
   - Angle: a secret in a reset-page URL can leave the page in referrer information sent to another origin.
   - Refresh before drafting: verify current browser defaults and choose an explicit policy suitable for a sensitive reset page.
3. **Security-event logging beyond access logs** (source: `accuntable.pdf`)
   - Angle: HTTP access logs cannot answer every question about authorization decisions and user actions.
   - Refresh before drafting: define useful event context without logging credentials, reset tokens, or unnecessary personal data.
4. **XSS escape hatches in modern frameworks** (source: `xss.pdf`)
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
```

Leave the `## Testing` and `## Review due` sections byte-for-byte unchanged.

- [x] **Step 3: Run repository validation**

Run:

```bash
npm run pills:check
git diff --check
```

Expected:

```text
4 Knowledge Pills passed validation.
```

`git diff --check` exits with status `0`.

- [x] **Step 4: Review the final diff**

Run:

```bash
git diff -- content/pills/backlog.md
```

Expected: only the Security backlog changes; Testing and Review due remain unchanged.

- [x] **Step 5: Commit the backlog**

```bash
git add content/pills/backlog.md docs/superpowers/plans/2026-08-17-historical-security-pills-backlog.md
git commit -m "content: prioritize historical Security Pills backlog"
```
