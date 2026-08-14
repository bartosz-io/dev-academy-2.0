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

<div
  role="region"
  aria-label="Controller importing a repository directly"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code><span style="color:#57606a;">// checkout.controller.ts</span>
<span style="color:#0000cc;">import</span> { <strong>paymentsRepository</strong> } <span style="color:#0000cc;">from</span> <span style="color:#0a7a28;">'./payments.repository'</span>;</code></pre>
</div>

Is the pull request safe to merge?

Functionally? Maybe.

Architecturally? No.

In this application, the intended dependency direction is:

<div
  role="region"
  aria-label="Intended dependency direction"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
    text-align: center;
  "
>
  <div
    style="
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 16px;
      line-height: 1.65;
      overflow-wrap: anywhere;
    "
  >
    <strong style="color:#0969da;">Controller</strong>
    <span style="color:#57606a;"> → </span>
    <strong style="color:#8250df;">Service</strong>
    <span style="color:#57606a;"> → </span>
    <strong style="color:#1a7f37;">Repository</strong>
  </div>
</div>

**[IMAGE PLACEHOLDER — upload `assets/TST-002/clean-layered-architecture.png` here]**

The new import creates a shortcut:

<div
  role="region"
  aria-label="Controller bypassing the service layer"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #fff5f5;
    border: 1px solid #ffb3b3;
    border-radius: 10px;
    text-align: center;
  "
>
  <div
    style="
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 16px;
      line-height: 1.65;
      overflow-wrap: anywhere;
    "
  >
    <strong style="color:#0969da;">Controller</strong>
    <span style="color:#cf222e;"> ─────────→ </span>
    <strong style="color:#cf222e;">Repository</strong>
  </div>
</div>

The behavior-focused tests may still pass because they verify what the feature does. They do not enforce the direction of dependencies unless we explicitly ask them to.

An agent can complete a local task while missing an unwritten system-wide constraint. A developer can make the same mistake.

If an architectural boundary matters, turn it into an executable rule.

For example, with TSArch and Jest, this rule can look like this:

<div
  role="region"
  aria-label="TSArch architecture test"
  style="
    margin: 24px 0;
    padding: 20px 22px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 10px;
  "
>
  <pre
    style="
      margin: 0;
      color: #24292f;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 15px;
      line-height: 1.65;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    "
  ><code><span style="color:#0000cc;">import</span> <span style="color:#0a7a28;">&#39;tsarch/dist/jest&#39;</span>;
<span style="color:#0000cc;">import</span> { <strong>filesOfProject</strong> } <span style="color:#0000cc;">from</span> <span style="color:#0a7a28;">&#39;tsarch&#39;</span>;

<strong>describe</strong>(<span style="color:#0a7a28;">&#39;Application architecture&#39;</span>, () =&gt; {
  <strong>it</strong>(
    <span style="color:#0a7a28;">&#39;controllers should not depend on repositories&#39;</span>,
    <span style="color:#8250df;">async</span> () =&gt; {
      <span style="color:#8250df;">const</span> rule = <strong>filesOfProject</strong>()
        .inFolder(<span style="color:#0a7a28;">&#39;controllers&#39;</span>)
        .shouldNot()
        .dependOnFiles()
        .inFolder(<span style="color:#0a7a28;">&#39;repositories&#39;</span>);

      <span style="color:#cf222e;">await</span> <strong>expect</strong>(rule).toPassAsync();
    }
  );
});</code></pre>
</div>

The exact folder names depend on your project. The important part is that the boundary becomes executable.

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
