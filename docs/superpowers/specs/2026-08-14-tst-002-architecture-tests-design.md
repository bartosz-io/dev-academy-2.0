# TST-002: Architecture tests as executable boundaries design

## Purpose

Teach ordinary JavaScript and TypeScript developers that working code and passing functional tests do not prove that a change respects the application's intended dependency boundaries. Show how an important architecture decision can become an executable rule in CI/CD without making the lesson depend on one library.

## Core lesson

An agent or developer can complete a local task while missing an unwritten system-wide constraint. If an architectural boundary matters, encode it as an automated test so the delivery pipeline can detect violations before they accumulate into structural drift.

## Narrative

1. Present an agent-generated pull request containing a working feature.
2. State that the code compiles, the unit tests pass, and the application behaves correctly.
3. Reveal that `checkout.controller.ts` now imports `payments.repository.ts` directly and bypasses the service layer.
4. Ask whether the pull request is safe to merge, then distinguish functional correctness from architectural compliance.
5. Show the intended dependency direction with the original clean layered-architecture diagram.
6. Explain that behavior-focused tests do not automatically enforce dependency direction.
7. Convert the design decision into a tool-independent executable rule:

   ```text
   Files matching: *.controller.ts
   must not depend directly on:
   *.repository.ts
   ```

8. Tell the reader to run the rule in the CI/CD pipeline. A direct controller-to-repository dependency must fail even when the feature works and the unit tests remain green.
9. Show the original big-ball-of-mud diagram as the cumulative outcome of unguarded shortcuts.
10. End with one practical check: choose one important architectural boundary and determine whether CI can detect a violation.

## Opening

The production email opens with this structure:

> Imagine an agent opens a pull request with a working feature.  
> The code compiles.  
> The unit tests pass.  
> The application behaves correctly.
>
> But the controller now imports the repository directly, bypassing the service layer.
>
> Is the pull request safe to merge?

The answer uses the concise contrast:

> Functionally? Maybe.  
> Architecturally? No.

## Example

Use one minimal TypeScript import to make the violation concrete:

```ts
// checkout.controller.ts
import { paymentsRepository } from './payments.repository';
```

The example illustrates one explicitly chosen architecture. It does not claim that every application must use controllers, services, or repositories. The lesson is to enforce the dependency boundaries that the team deliberately selected for its own system.

## Image delivery

Recover and preserve the two original diagrams from `testing pills/arch test.pdf`. Store the production assets under `content/pills/assets/TST-002/`.

The canonical email must contain these exact explicit upload placeholders:

```text
**[IMAGE PLACEHOLDER — upload `assets/TST-002/clean-layered-architecture.png` here]**
```

Place it immediately after introducing the intended dependency direction.

```text
**[IMAGE PLACEHOLDER — upload `assets/TST-002/big-ball-of-mud.png` here]**
```

Place it after explaining how isolated shortcuts accumulate into structural deterioration.

Do not reuse the old TSArch code screenshot. The rule in the email remains readable, copyable, and independent of a particular library API.

## Evergreen constraints

- Teach the architecture-testing concept, not TSArch syntax.
- Do not prescribe one architecture as universally correct.
- Keep AI secondary: the same boundary can be broken by a person or an agent.
- Do not imply that ordinary unit tests cannot detect architecture violations; state only that they do not enforce a boundary unless a test or static rule explicitly checks it.
- Mention that relevant tools exist across ecosystems only if the sentence helps the final rhythm; tool names are not required.
- Use an 18-month review interval because this is a tool-independent testing foundation.

## Closing check

The final action is:

> **Your check for today**
>
> Choose one architectural boundary in your application.
>
> Can your CI detect when someone—or an agent—breaks it?
>
> If the rule exists only in documentation or someone's head, it is not being enforced automatically.

## Delivery

- Plain-text-first canonical Markdown.
- One minimal TypeScript import and one tool-independent rule block.
- Two explicit image placeholders using the filenames defined above.
- No Kit body creation or update through MCP.
- Bartosz manually pastes the approved copy into Kit and uploads the diagrams.
- Code may later be rendered as an HTML embed in Kit, but HTML is not the canonical source.

## Proposed metadata

- ID: `TST-002`
- Track: `testing`
- Sequence position: `2`
- Subject: `The feature works. But did it break your architecture?`
- Preview text: `A passing test suite cannot detect a boundary it was never asked to protect.`
- Initial status: `ready`
- Review interval: 18 months.

## Sources for production fact-checking

- Historical Dev Academy source: `testing pills/arch test.pdf`
- ArchUnit, Why test your architecture?: https://www.archunit.org/motivation
- ArchUnit User Guide, dependency and layered-architecture rules: https://www.archunit.org/userguide/html/000_Index.html
- TSArch documentation, architecture conventions and dependency checks for TypeScript and JavaScript: https://ts-arch.github.io/ts-arch/index.html

The named tools support fact-checking that architecture rules can inspect dependencies. They do not appear in the core teaching example.

## Success criteria

- A developer understands how code can be functionally correct while violating an intended dependency boundary.
- The example remains valid without knowledge of a named architecture-testing library.
- The email distinguishes the selected project rule from a universal architecture prescription.
- Both original diagrams appear beside the concepts they reinforce, using explicit upload placeholders.
- The AI reference remains secondary and will still read naturally if today's coding tools change.
- The reader leaves with one architectural boundary to evaluate in their own CI/CD pipeline.
