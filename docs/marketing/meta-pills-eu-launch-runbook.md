# Meta Pills EU launch runbook

## Current state

Created through Meta MCP on 2026-08-06. Delivery remains disabled.

| Level | Name | ID | Configured status |
|---|---|---:|---|
| Campaign | `PILLS | EU | Website Leads | 2026-08` | `120247858321510148` | `PAUSED` |
| Ad set | `EU | Broad | 22-55 | Website Lead | 20 EUR` | `120247858329710148` | `PAUSED` |
| Ad | `SEC-A | Clickjacking` | `120247858677990148` | `PAUSED` |
| Ad | `SEC-B | AI Judgment` | `120247858677250148` | `PAUSED` |
| Ad | `TST-A | Tests Prove` | `120247858678210148` | `PAUSED` |
| Ad | `TST-B | Architecture Drift` | `120247858678430148` | `PAUSED` |

Meta creative-library objects do not have a delivery toggle and report
`ACTIVE`; delivery is controlled by the campaign, ad set, and ad statuses
above. No activation tool was called.

## Creative mapping

| Ad | Creative ID | Approved UTM content |
|---|---:|---|
| Security A | `1403294131719852` | `security_a` |
| Security B | `2501576370318613` | `security_b` |
| Testing A | `37983030791341662` | `testing_a` |
| Testing B | `1474254404510668` | `testing_b` |

Every URL uses:

```text
https://dev-academy.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch&utm_content=<concept>
```

## Ad set contract

- Objective: `OUTCOME_LEADS`
- Conversion location: Website
- Optimization goal: `OFFSITE_CONVERSIONS`
- Dataset: `Piksel konta PSC` (`189349068273059`)
- Event: `LEAD`
- Bid strategy: `LOWEST_COST_WITHOUT_CAP`
- Daily budget: PLN 86.10 / 8610 grosz
- Budget reference: EUR 20 at NBP EUR/PLN 4.3050, table
  `150/A/NBP/2026`, effective 2026-08-05
- Audience: all 27 EU member states, age 22-55, all genders
- Detailed targeting, languages, lookalikes, and Custom Audiences: none
- DSA beneficiary: `PSC`
- DSA payor: `PSC`

## Completed QA

- Production homepage renders Security Tuesday, Testing Friday, and the free
  Pills CTA.
- Production `/api/meta/events` is deployed and responds to unsupported methods
  with `405`.
- Dataset reports recent browser and server events.
- All eight MP4 files uploaded and resolved uniquely through Meta MCP.
- Four creatives contain the approved primary text, headline, CTA `SIGN_UP`,
  and framework-logo animation.
- Security A Ads Manager preview confirmed the approved description and exact
  destination UTM values.
- MCP returned no delivery-blocking errors for the campaign hierarchy.
- Campaign, ad set, and all four ads report configured status `PAUSED`.

## Required before activation

- Attach each uploaded 9:16 video to Stories and Reels through Ads Manager
  placement asset customization; retain each 1:1 video for feeds.
- Review Facebook Feed, Instagram Feed, Facebook Stories, Instagram Stories,
  Facebook Reels, and Instagram Reels for every concept.
- Verify the other three destination URLs in Ads Manager against their approved
  UTM content values.
- Complete a production Test Events journey with marketing consent and confirm
  browser/server `PageView` and `Lead` pairs share `event_id`, include server
  `fbc` after an `fbclid` landing, and are deduplicated.
- Confirm the four ads finish Meta review without rejection.
- Request a separate explicit user instruction before activation.
