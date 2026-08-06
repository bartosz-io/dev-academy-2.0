# Meta Knowledge Pills Paused Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Knowledge Pills EU campaign through Meta MCP with one campaign, one ad set, four video ads, and every entity in `PAUSED` state.

**Architecture:** Use Meda MCP mutation tools to create the campaign hierarchy and use Ads Manager only for the unsupported upload of eight local MP4 assets. Resolve the uploaded video IDs with MCP, create four approved video creatives, attach four paused ads, and verify the complete hierarchy without calling `ads_activate_entity`.

**Tech Stack:** Meda MCP, Meta Ads Manager media library, Meta Pixel and Conversions API, Canva MP4 exports.

## Global Constraints

- Ad account: `PSC` (`1922200578053733`), active and billed in PLN.
- Never use `promocja` (`352560445`), which is `UNSETTLED`.
- Dataset: `Piksel konta PSC` (`189349068273059`).
- Page: `Dev-Academy.com` (`696759590521785`).
- Instagram: `bartosz_io` (`17841429949860073`).
- Objective: `OUTCOME_LEADS`; conversion location: Website; optimization event: standard `Lead`.
- One campaign, one broad EU ad set, exactly four ads, Advantage+ placements.
- Daily ad-set budget: current PLN equivalent of EUR 20.
- Audience: all 27 EU countries, age 22-55, all genders, no language or detailed targeting.
- Every created campaign, ad set, creative, and ad remains `PAUSED`; never call `ads_activate_entity`.
- CTA: `SIGN_UP`; destination: `https://dev-academy.com/` with the exact approved UTM values.
- No Meta Instant Forms, Custom Audiences, lookalikes, retargeting, PII, subscriber IDs, raw `fbclid`, or `fbc` in ad URLs.

## Assets

Upload from `/Users/bartosz/Projects/dev-academy docs/ads/`:

| Concept | Feed | Stories/Reels |
|---|---|---|
| Security A | `security_A_feed.mp4` | `security_A_story.mp4` |
| Security B | `security_B_feed.mp4` | `security_B_story.mp4` |
| Testing A | `testing_A_feed.mp4` | `testing_A_story.mp4` |
| Testing B | `testing_B_feed.mp4` | `testing_B_story.mp4` |

---

### Task 1: Resolve live inputs and budget

- [ ] Use read-only MCP tools to reconfirm account, dataset, Page, and Instagram IDs.
- [ ] Verify dataset browser and server activity; record timestamps without exposing event payloads.
- [ ] Retrieve the current EUR/PLN reference rate and calculate `round(20 × EURPLN × 100)` grosz.
- [ ] Require the result to exceed the PSC minimum daily budget of 382 grosz.

### Task 2: Create the paused campaign and ad set with MCP

- [ ] Call `ads_create_campaign` with campaign name `PILLS | EU | Website Leads | 2026-08`, buying type `AUCTION`, objective `OUTCOME_LEADS`, no special category, and no campaign budget so the single ad set owns the budget.
- [ ] Require campaign status `PAUSED` and `OFFSITE_CONVERSIONS` among the returned valid optimization goals.
- [ ] Call `ads_create_ad_set` with name `EU | Broad | 22-55 | Website Lead | 20 EUR`, `IMPRESSIONS`, `OFFSITE_CONVERSIONS`, `LOWEST_COST_WITHOUT_CAP`, the calculated daily budget, destination `WEBSITE`, and promoted object `{"pixel_id":"189349068273059","custom_event_type":"LEAD"}`.
- [ ] Target exactly `AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE`, age 22-55, all genders, and no other audience or placement restriction.
- [ ] Explicitly set DSA beneficiary and payor to the exact PSC business identity only if MCP requires values; stop on ambiguity.
- [ ] Require ad-set status `PAUSED` and verify the campaign/ad-set hierarchy through `ads_get_ad_entities`.

### Task 3: Upload and resolve the eight video assets

- [ ] Use the signed-in Ads Manager media library only to upload the eight local MP4s; do not create or publish ads in the UI.
- [ ] Call `ads_get_ad_videos` by exact title until all eight new video IDs resolve uniquely.
- [ ] Reject duplicate or ambiguous titles; record exact filename-to-video-ID mapping.
- [ ] Use Meta-generated readable thumbnails unless an upload validation requires an explicit cover.

### Task 4: Create four paused creatives and ads

- [ ] Create `SEC-A | Clickjacking` with the Security A feed video, approved Security A copy, headline `Stop clickjacking before it ships`, description `Free Security + Testing Pills`, CTA `SIGN_UP`, and `utm_content=security_a`.
- [ ] Create `SEC-B | AI Judgment` with the Security B feed video, approved Security B copy, headline `AI writes code. You make the call.`, description `Free Security + Testing Pills`, CTA `SIGN_UP`, and `utm_content=security_b`.
- [ ] Create `TST-A | Tests Prove` with the Testing A feed video, approved Testing A copy, headline `Write tests that prove something`, description `Free Security + Testing Pills`, CTA `SIGN_UP`, and `utm_content=testing_a`.
- [ ] Create `TST-B | Architecture Drift` with the Testing B feed video, approved short Testing B copy, headline `Test your architecture before it drifts`, description `Free Security + Testing Pills`, CTA `SIGN_UP`, and `utm_content=testing_b`.
- [ ] Use Page `696759590521785`, Instagram `17841429949860073`, and URL parameters `utm_source=meta&utm_medium=paid_social&utm_campaign=pills_eu_launch` on every creative.
- [ ] If MCP cannot express placement asset customization, create the four paused ads with the square feed videos first and record the vertical-video attachment as a pre-activation Ads Manager QA step; do not create eight ads or restrict placements merely to work around the limitation.
- [ ] Require every ad status `PAUSED` and verify exactly four ads with `ads_get_ad_entities`, `ads_get_creatives`, and `ads_get_ad_preview`.

### Task 5: Final paused-state handoff

- [ ] Confirm campaign, ad set, and four ads are all `PAUSED`, spend is zero, and `ads_activate_entity` was never called.
- [ ] Verify the calculated PLN budget, dataset/event, all 27 EU countries, identities, CTA, copy, and four UTM destinations.
- [ ] Inspect feed previews through MCP and attach vertical assets in Ads Manager before any later activation approval.
- [ ] Report entity IDs, Ads Manager links, media mapping, validation warnings, and remaining pre-activation checks.
- [ ] Do not activate or publish delivery without a new explicit user command.

## Approved copy source

Use the exact four copy blocks in `docs/superpowers/specs/2026-08-05-meta-pills-eu-campaign-design.md`. The approved Testing B primary text is:

> Architecture rarely breaks in one commit. It erodes through dependencies nobody notices.
>
> Learn how to prevent it in one Testing Friday issue. Then get a new practical testing idea every week — plus Security Tuesday. Free and under 10 minutes a week.

## Plan self-review

- All mutations use Meta MCP except the unsupported local video upload.
- All created entities remain `PAUSED`; activation is excluded.
- The plan creates exactly four ads and does not split placements into eight ads.
- The fallback for MCP's single-video creative limitation preserves the approved campaign structure and defers vertical asset customization to pre-activation UI QA.
- Account, dataset, Page, Instagram, filenames, audience, budget model, copy source, and UTMs are exact.
