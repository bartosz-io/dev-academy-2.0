# TST-001: Code coverage design

## Purpose

Open the Testing Friday sequence with an evergreen mental model that is useful to ordinary JavaScript and TypeScript developers, including developers reviewing AI-generated tests.

## Core lesson

Code coverage reports which production code ran during the tests. It does not prove that the tests made valuable assertions or would detect incorrect behavior. Low coverage can reveal an obvious gap, while high coverage alone does not prove that the test suite is healthy.

## Narrative

1. Welcome the reader to their first Testing Pill.
2. Show a tiny framework-neutral JavaScript or TypeScript test that calls the important paths but makes no meaningful assertion.
3. Explain that the test can execute the covered lines even though it does not protect the behavior.
4. Introduce the body-temperature analogy: an abnormal result can warn you, but a normal result is not a complete diagnosis.
5. Connect the lesson to AI-assisted development: generated test volume and a rising coverage number are not substitutes for reviewing what failures each test can detect.
6. End with one practical check: choose a test and answer, "What specific bug would make this test fail?"

## Delivery

- Plain-text-first canonical Markdown.
- No image required.
- One small code example is allowed.
- No dependency on Jest, Vitest, Cypress, or another named framework.
- No Kit body update through MCP. Bartosz pastes the approved copy manually.

## Proposed metadata

- ID: `TST-001`
- Track: `testing`
- Subject: `Can high code coverage hide useless tests?`
- Preview text: `Your first Testing Pill: coverage tells you what ran—not whether your tests protect the behavior.`
- Initial status: `ready`
- Review interval: 18 months because the lesson is a tool-independent testing foundation.

## Sources for production fact-checking

- Historical Dev Academy source: `testing pills/coverage.pdf`
- Microsoft Learn, Unit testing best practices: https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices
- Microsoft Learn, Use code coverage for unit testing: https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage

## Success criteria

- A developer understands the limitation of coverage without prior testing theory.
- The example demonstrates execution without protection, rather than merely asserting that coverage is imperfect.
- The analogy supports the technical explanation without replacing it.
- The AI reference remains secondary and will still read naturally if today’s tools change.
- The email ends with one action the reader can perform immediately.
