# Dev Academy homepage hero conversion redesign

Date: 2026-08-12  
Status: approved design, pending written-spec review  
Primary page: `https://dev-academy.com/`

## Objective

Increase the percentage of paid Meta visitors who submit the Knowledge Pills
form by making the first mobile screen immediately communicate:

- the developer's real uncertainty: code works, but may not be secure or well
  tested;
- the concrete benefit: spotting security risks and testing gaps;
- the delivery format: two short emails per week;
- the effort: under five minutes per email;
- the action: enter an email address to receive the free lessons.

The primary KPI remains confirmed double-opt-in subscribers. Submitted forms
are an intermediate funnel event, not a confirmed subscriber.

## Evidence and problem definition

The existing hero begins with `Build web applications you can trust.` This is a
broad brand promise that could describe a development agency, course, product,
or job offer. It describes the desired outcome but not the skill gap the
Knowledge Pills address.

Paid ads use concrete hooks such as architecture drift, clickjacking, weak
tests, and reviewing AI-generated code. The current first screen does not
continue those hooks strongly enough. On mobile, the large consent panel also
pushes the form below the fold and becomes visually stronger than the offer.

The new hero is based on the developer insight:

> The code works, but did I build it correctly? What security or testing issue
> did I miss?

The design borrows the useful clarity of newsletter landing pages such as
ByteByteGo without copying their identity: one direct promise, a visible form,
small time commitment, immediate product visualization, and secondary trust
proof.

## Approved content

### Headline

> Your code works. Do you know if it’s secure and well tested?

`secure` receives a restrained purple marker highlight. `tested` receives a
restrained green marker highlight. The treatment must look intentional and
editorial, not like red spellcheck, validation, or warning UI.

The mobile headline uses a more open rhythm than the existing version:

- approximately `1.09–1.12` line height;
- moderately negative heading tracking rather than the current aggressive
  compression;
- enough separation before the supporting copy to read as a distinct block.

### Supporting copy

> Spot security risks and testing gaps — even in AI-generated code. Two
> practical lessons a week, under 5 minutes each.

Do not restore the `For JavaScript & TypeScript developers` or `Security
Tuesday + Testing Friday` eyebrow above the headline. The ads, code examples,
and product labels already qualify the audience. Removing the eyebrow lets the
headline become the first and strongest message.

### Form and CTA

The hero contains one email-only form with:

- label or accessible name: `Your email address`;
- primary CTA: `Get the free lessons →`;
- reassurance: `Free. First Security lesson after confirmation. Unsubscribe
  anytime.`

Do not use `Send me the Pills` as the primary CTA. It depends on the visitor
having read surrounding copy and can be misread outside that context.

The form and CTA must be visible without scrolling on a representative mobile
viewport around 382 × 800 CSS pixels.

## First-screen hierarchy

The mobile first screen appears in this order:

1. Compact existing site header and brand.
2. Approved headline with `secure` and `tested` highlights.
3. Approved supporting copy.
4. Email field and primary CTA.
5. Free/confirmation/unsubscribe reassurance.
6. Two overlapping Knowledge Pill email miniatures.
7. The course-enrollment proof after the miniatures.

Remove the cadence chips from the hero. `Security Tuesday` and `Testing Friday`
are already named in the two email miniatures.

Desktop retains the existing two-column concept where useful, but must follow
the same content hierarchy. The copy and form remain the dominant left-side
elements. Both email miniatures remain visible on the right. Mobile stacks the
content without hiding either product example.

## Email miniatures

Retain both hero visualizations:

- Security Tuesday;
- Testing Friday.

They are compact product previews, not complete recreations of the detailed
email examples in the following page section. Each miniature includes only:

- a clean, rounded, single-stroke SVG envelope icon;
- series and duration label;
- subject;
- one short problem or takeaway line;
- one short code sample.

Approved labels:

- `Security Tuesday · 3-min email`;
- `Testing Friday · 4-min email`.

Do not add sender, recipient, inbox toolbar, or `Bartosz from Dev Academy` to
the miniatures. Those details duplicate the full email visualizations below the
hero and make the first screen unnecessarily dense.

The Security miniature continues to use the light/purple treatment. The
Testing miniature continues to use the dark/green treatment. The envelope icon
inherits the relevant card accent color.

## Trust proof

Keep the proof, but treat it as teaching-experience evidence rather than
newsletter readership evidence:

> **900+ course enrollments**  
> Previous Web Security & Full-stack Testing programs

Place it after the two email miniatures, not directly between the form and the
product preview. It must not imply that the new newsletter already has 900+
subscribers or that 900 unique people enrolled.

## Consent and tracking behavior

Remove the cookie/consent banner from the homepage landing experience. The page
must not use persistent analytics or marketing storage as a replacement hidden
behind the removed UI.

The approved technical constraints are:

- PostHog uses memory-only persistence;
- PostHog receives no email address or other form PII;
- the page does not create an `_fbc` cookie;
- `fbclid` may be held only in page memory for the current visit;
- the frontend generates an `event_id` for the logical conversion;
- the form flow passes the in-memory click attribution and `event_id` to the
  Netlify Edge Function;
- the Edge Function constructs or forwards the applicable `fbc` value and sends
  the server-side Meta CAPI event;
- the implementation must not claim that moving a conversion server-side is,
  by itself, proof of legal compliance.

The implementation plan must inspect the current browser Pixel behavior. If a
browser `Lead` event remains active, its consent and deduplication implications
must be resolved explicitly before release. The approved landing direction is
server-side CAPI plus memory-only PostHog, not silent persistent browser
tracking.

## Component boundaries

### Hero content data

`source/_data/homepage.yml` remains the source of truth for headline,
supporting copy, proof, and both miniature contents. New labels should be data,
not duplicated strings embedded in templates.

### Hero template

`themes/my-theme/layout/partial/homepage/hero.ejs` owns semantic ordering and
the highlighted headline spans. It reuses the existing newsletter form partial
and keeps the two miniatures as presentation-only articles.

### Hero styling

`themes/my-theme/source/css/pages/_newsletter-homepage.scss` owns responsive
hierarchy, marker highlights, typography, form placement, overlapping
miniatures, and the SVG icon sizing. No new design framework is required.

### Tracking runtime

The shared privacy/analytics runtime owns memory-only PostHog and transient Meta
click attribution. The visual hero must not contain tracking logic.

## Data and event flow

```text
Meta ad click with fbclid
  -> homepage stores click attribution in page memory only
  -> visitor reads hero and submits email form
  -> frontend creates one logical event_id
  -> newsletter_submitted is recorded without PII
  -> click attribution + event_id go to the Netlify Edge Function
  -> Edge Function sends the server-side Meta CAPI conversion
  -> Kit starts double opt-in
  -> confirmed subscriber follows the existing confirmation journey
```

The hero redesign does not change Kit form membership, double opt-in, or the
confirmed Starter Kit route.

## Error handling

- Preserve the existing visible form validation and submission error state.
- A PostHog or CAPI failure must not block the Kit form submission.
- Missing `fbclid` must not block submission; the CAPI event proceeds without
  `fbc` when appropriate.
- Repeated clicks on the submit button must not create multiple logical
  conversion IDs for one in-flight submission.
- The CTA retains a clear loading state while the form is in flight.

## Measurement

Compare performance before and after release using:

- landing page views;
- valid submitted forms;
- confirmed double-opt-in subscribers;
- landing-page-view → submitted-form conversion;
- submitted-form → confirmed-subscriber conversion;
- confirmed subscriber cost by Meta creative.

Do not judge the redesign from Ads Manager `Leads` alone. Kit submissions and
confirmed subscribers remain the source for the two downstream funnel stages.

## Verification

Implementation verification must cover:

- exact approved copy and CTA;
- no eyebrow or cadence chips above the hero form;
- both highlighted headline terms remain readable at mobile and desktop sizes;
- headline line height does not create collisions or cramped wrapping;
- form and CTA are visible without scroll near 382 × 800 CSS pixels;
- both miniature labels use `3-min email` / `4-min email`;
- the SVG envelope icon renders cleanly at mobile density;
- both full email examples below the hero remain unchanged;
- trust proof appears after the miniatures and retains the enrollment qualifier;
- no consent banner is rendered on the homepage;
- no `_fbc` cookie or persistent PostHog identifier is created;
- missing analytics or CAPI does not block form submission;
- attribution and `event_id` reach the Edge Function without PII leaking into
  PostHog;
- keyboard navigation, focus styling, labels, contrast, and reduced-motion
  behavior remain accessible;
- existing privacy and Knowledge Pills tests continue to pass.

## Acceptance criteria

- The first message is the approved `Your code works…` headline.
- `secure` and `tested` have distinct, restrained highlights.
- Supporting copy is the approved two-sentence short version.
- The CTA reads `Get the free lessons →`.
- The form is visible without scrolling on the target mobile viewport.
- The hero contains two compact, clearly email-like miniatures.
- The page retains both detailed email visualizations below the hero.
- The course-enrollment proof is secondary and accurately qualified.
- The homepage does not display a cookie banner or introduce persistent hidden
  tracking storage.
- The double-opt-in and confirmed subscription journey do not change.

## Out of scope

- Dynamic hero copy by `utm_content`;
- separate paid landing pages for each Meta creative;
- rewriting the detailed Security and Testing email sections below the hero;
- changing the Knowledge Pills editorial cadence;
- changing the Starter Kit offer or confirmation route;
- claiming legal compliance solely from the selected tracking architecture.
