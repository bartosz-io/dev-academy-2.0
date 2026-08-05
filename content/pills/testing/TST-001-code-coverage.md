---
id: TST-001
track: testing
status: ready
sequence_position: 1
subject: "Can high code coverage hide useless tests?"
preview_text: "Your first Testing Pill: coverage tells you what ran—not whether your tests protect the behavior."
created: 2026-08-05
last_verified: 2026-08-05
review_after: 2028-02-05
kit_sequence_id:
kit_email_id:
related_pill:
sources:
  - https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
  - https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage
---

## Email body

Hi developer,

Here is your first Testing Pill. 💊

Imagine an agent generates this test for you:

```js
test('calculates the total', () => {
  calculateTotal(100, true);
  calculateTotal(100, false);
});
```

It executes both paths through `calculateTotal`.

But what does it actually verify?

Nothing.

There is no assertion. The function could return the wrong price and this test would not notice. Yet the relevant lines and branches may still appear as covered.

**[IMAGE PLACEHOLDER — upload `assets/TST-001/code-coverage-lines.jpg` here]**

This is the important distinction:

**Code coverage tells you what ran. It does not tell you whether the tests protected the behavior.**

Think about body temperature.

A reading of 38.5°C warns you that something may be wrong. But a normal reading does not prove that you are completely healthy.

**[IMAGE PLACEHOLDER — upload `assets/TST-001/body-temperature.jpg` here]**

Coverage works in a similar way. Low coverage can reveal important gaps. High coverage is still only one indicator—it is not a complete diagnosis of your test suite.

This matters even more when AI generates tests quickly. An agent can produce many tests and improve the number on your dashboard. You still need to review what those tests can actually detect.

**Your check for today**

Choose one test in your project and answer this question:

**What specific bug would make this test fail?**

If you cannot name one, the test may be executing code without protecting useful behavior.

That’s all for today. One misleading metric, one mental model, one practical check. 💊

See you next Friday,  
Bartosz  
Dev Academy
