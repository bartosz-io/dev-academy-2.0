---
id: TST-002
track: testing
status: ready
sequence_position: 2
subject: "The feature works. But did it break your architecture?"
preview_text: "A passing test suite cannot detect a boundary it was never asked to protect."
created: 2026-08-14
last_verified: 2026-08-14
review_after: 2028-02-14
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://www.archunit.org/motivation
  - https://www.archunit.org/userguide/html/000_Index.html
  - https://ts-arch.github.io/ts-arch/index.html
---

## Email body

Hi developer,

It’s time for another Testing Pill. 💊

Imagine an agent opens a pull request with a working feature.

The code compiles.

The unit tests pass.

The application behaves correctly.

But the controller now imports the repository directly, bypassing the service layer:

```ts
// checkout.controller.ts
import { paymentsRepository } from './payments.repository';
```

Is the pull request safe to merge?

Functionally? Maybe.

Architecturally? No.

In this application, the intended dependency direction is:

```text
Controller → Service → Repository
```

**[IMAGE PLACEHOLDER — upload `assets/TST-002/clean-layered-architecture.png` here]**

The new import creates a shortcut:

```text
Controller ─────────→ Repository
```

The behavior-focused tests may still pass because they verify what the feature does. They do not enforce the direction of dependencies unless we explicitly ask them to.

An agent can complete a local task while missing an unwritten system-wide constraint. A developer can make the same mistake.

If an architectural boundary matters, turn it into an executable rule:

```text
Files matching: *.controller.ts
must not depend directly on:
*.repository.ts
```

Run this rule in your CI/CD pipeline. The moment a controller imports a repository directly, the architecture test fails—even if the feature works and every unit test is green.

One shortcut will not destroy an application. But repeated shortcuts slowly replace the intended architecture with a web of accidental dependencies.

**[IMAGE PLACEHOLDER — upload `assets/TST-002/big-ball-of-mud.png` here]**

The important point is not that every project must use controllers, services, and repositories.

The point is this:

Choose the boundaries that matter in your application—and enforce them automatically.

✅ Your check for today

Choose one architectural boundary in your application.

Can your CI detect when someone—or an agent—breaks it?

If the rule exists only in documentation or someone’s head, it is not being enforced automatically.

That’s all for today.
One hidden shortcut, one executable boundary, one practical check. 💊

See you next Friday,
Bartosz | Dev Academy
