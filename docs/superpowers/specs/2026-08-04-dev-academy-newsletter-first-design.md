# Dev Academy newsletter-first rebuild

Date: 2026-08-04  
Status: approved design  
Primary domain: `https://dev-academy.com`

## Objective

Rebuild Dev Academy as an English-language, newsletter-first brand for JavaScript and TypeScript developers. The immediate objective is to build a high-quality owned audience without requiring a new premium course to exist first.

The brand promise is:

> Build web applications you can trust.

The free product delivering this transformation is a pair of concise, original Knowledge Pills:

- Security Tuesday;
- Testing Friday;
- each email is readable in under five minutes;
- each Pill is a standalone lesson, not part of a progressive course;
- the sequence is evergreen: every subscriber starts at the beginning while new Pills are appended weekly.

Dev Academy is a personal-led brand: `Dev Academy by Bartosz Pietrucha`. The content and products belong to Dev Academy, while Bartosz is the visible teacher and sender.

## Audience and positioning

The primary audience is JavaScript and TypeScript developers. The site does not target beginners preparing for their first job or pentesters.

The transformation is practical engineering judgment: recognizing whether a web application is secure and meaningfully tested, including when frameworks, packages or AI generate code that appears to work.

AI-assisted coding supports the urgency but does not define the brand. The supporting narrative is:

> Code gets produced faster. Judgment doesn't.

## Site architecture

### `/`

The homepage replaces the current article listing and becomes the primary conversion landing page. Its single conversion goal is a double-opt-in subscription to both Security Tuesday and Testing Friday. It does not present paid-product pricing.

The existing article listing moves to `/articles/`. Existing article permalinks remain unchanged.

### `/web-security/`

This is the evergreen Web Security Academy landing page while cohort enrollment is closed. Its conversion bundle is:

- Security Tuesday only;
- Web Security Checklist;
- notification about the next cohort.

The page must not promise an unvalidated cohort duration or fixed curriculum. `websecurity-academy.com` already redirects here and the redirect remains.

### `/security-starter-kit/`

This is the canonical sales page for the Browser Security Starter Kit.

- regular price: EUR 37;
- post-confirmation welcome offer: EUR 19 for 30 minutes;
- the offer timer begins only after double-opt-in confirmation;
- expiry persistence uses localStorage;
- a visitor without a valid offer sees EUR 37;
- an expired offer falls back to EUR 37 in that browser;
- localStorage is a soft marketing control, not a security boundary.

`securitystarterkit.net` will not be renewed. Before expiry, active ads, email links and meaningful backlinks must be migrated to the canonical path.

### Welcome pages

- `/welcome/` is the post-confirmation destination for homepage subscriptions;
- `/welcome/security/` is the post-confirmation destination for `/web-security/` subscriptions and delivers the checklist;
- both start and display the 30-minute EUR 19 Starter Kit offer;
- neither exposes email or subscriber identifiers in the URL or analytics.

## Homepage content design

### Visual direction

Use a light editorial layout with a distinctive technical layer. Code and email artifacts provide the developer identity. Avoid a generic corporate-course appearance and an overly dark hacker aesthetic.

### Header

The compact navigation contains Articles, Podcast, Web Security, About and a highlighted `Get the free Pills` CTA. Do not add a course catalog or Testing Academy link before those offers have an active role.

### Hero

Use a split layout.

Left side:

- audience label: `For JavaScript & TypeScript developers`;
- headline: `Build web applications you can trust.`;
- mechanism: two practical Knowledge Pills each week, each under five minutes;
- email-only form;
- double-opt-in, free and unsubscribe reassurance;
- `900+ course enrollments across Web Security & Full-stack Testing`.

Right side:

- overlapping previews for Security Tuesday and Testing Friday;
- previews make the problem/solution teaching format visible without a scroll.

### Value-first page sequence

1. Hero with immediate previews and first form.
2. Two authentic email previews: one real Security Pill and one real Testing Pill.
3. Second email-only form.
4. AI-era relevance: `Code gets produced faster. Judgment doesn't.`
5. Social proof: 900+ enrollments, defensible company-logo context and 2–3 real testimonials from previous programs.
6. Bartosz section: `Building production software since 2013. Teaching developers since 2017.`
7. Final CTA and third email-only form.
8. Legal, contact and personal social links.

The email examples should look like authentic inbox messages rather than redesigned course cards. They must remain readable on mobile and use real email content. Testimonials must explicitly refer to previous programs, not the new newsletter.

## Subscription behavior

All subscriptions use double opt-in without exceptions.

Homepage flow:

1. Submit an email-only form.
2. Show a check-your-inbox state.
3. Confirm via Kit.
4. Redirect to `/welcome/`.
5. Start the 30-minute offer.
6. Send Security Pill #1 immediately.
7. Send Testing Pill #1 on the next configured Friday.
8. Continue Security on Tuesdays and Testing on Fridays.

Web Security flow:

1. Submit an email-only form.
2. Confirm via Kit.
3. Redirect to `/welcome/security/`.
4. Deliver the checklist and start the offer.
5. Send Security Pill #1 immediately.
6. Continue Security on Tuesdays.

Pills do not form a curriculum. Each message delivers a complete idea. Sequence numbering may reflect delivery order but must not imply prerequisites.

## Blog conversion model

Use contextual inline forms rather than sending every reader to the homepage.

- security article: Security Tuesday + checklist;
- testing article: Testing Friday;
- general article: both Pills;
- high-commercial-intent security article: contextual link to `/web-security/` in addition to the form.

Every priority article receives an end-of-article form. High-value articles may also receive one inline form after roughly 25–40% of the content. Avoid competing opt-ins, stale modal copy and links to retired domains.

## Organic content model

The primary distribution channels are Bartosz's personal LinkedIn and Instagram profiles. The sustainable cadence is two topics per week:

- Tuesday: a security topic distributed as a Pill, LinkedIn post and adapted Instagram carousel;
- Friday: a testing topic distributed in the same way.

Social posts deliver a useful solution rather than hiding it behind an email form. Video and regular podcast production are deferred. Existing podcast episodes remain visible as credibility and passive acquisition assets.

## SEO model

Use `refresh before expansion` for the first 8–12 weeks:

- preserve existing article URLs;
- move only the index to `/articles/`;
- repair canonical URLs, sitemap, redirects and internal product links;
- add contextual conversion forms;
- refresh the ten existing articles with the highest recovery potential;
- build a useful Web Security hub;
- measure article-to-confirmed-subscriber conversion;
- create new SEO pages only for validated search gaps or proven Pill topics.

## Proof rules

- Use `900+ course enrollments`, not `900+ developers` or `900+ students`, because enrollments overlap.
- Describe company logos as companies where participating developers work, not enterprise customers unless proven.
- Identify the original program context of historical testimonials.
- Use fixed dates (`since 2013`, `since 2017`) instead of age-dependent year counts.

## Analytics design

The new funnel uses event schema version 2:

- `newsletter_form_viewed`;
- `newsletter_submitted`;
- `newsletter_confirmed`;
- `oto_viewed`;
- `oto_expired`;
- `checkout_started`;
- `purchase_completed`;
- `cohort_interest_registered`.

Newsletter events include `topic` (`security`, `testing`, `both`), `placement`, `source_page`, schema version and privacy-safe attribution properties. Forms never send email addresses or names to PostHog.

Core placements are `homepage_hero`, `homepage_after_examples`, `homepage_final`, `web_security_hero`, `article_inline` and `article_end`.

The primary acquisition KPI is confirmed subscribers, not submitted forms. Starter Kit revenue reduces effective acquisition cost but does not replace engagement and retention measurements.

## Out of scope for the first implementation

- paid acquisition campaigns;
- new podcast episodes;
- video-first social publishing;
- producing or promising a new premium cohort;
- migrating every blog post to a new CMS or URL structure;
- exposing a course catalog on the homepage;
- hard server-side enforcement for the welcome offer.

## Acceptance criteria

- The homepage communicates audience, transformation, format, frequency and time commitment above the fold.
- A visitor can inspect both a Security and Testing email before subscribing.
- All forms require only email and use double opt-in.
- The three homepage forms enter the same two sequences and emit distinct placements.
- Confirmed homepage subscribers receive Security Pill #1 immediately.
- Confirmed security subscribers receive their checklist and Security Pill #1.
- The EUR 19 offer starts only after confirmation and changes to EUR 37 after 30 minutes.
- Existing article URLs remain unchanged and the listing is available at `/articles/`.
- The homepage does not expose paid-product pricing or an unvalidated cohort promise.
- Analytics contains no PII and distinguishes submit, confirm, OTO and purchase.
