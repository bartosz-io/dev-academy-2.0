# Contextual Knowledge Pills CTAs for Top Blog Posts

## Goal

Convert readers of the five most-viewed blog posts into visitors of the Dev Academy Knowledge Pills landing page without making the articles feel like sales pages.

## Selection

PostHog `$pageview` data for `dev-academy.com` identifies the same five leading blog posts over both the last 90 days and the last 365 days:

1. `/angular-architecture-best-practices/`
2. `/vue-design-patterns/`
3. `/angular-session-storage/`
4. `/angular-cors/`
5. `/angular-authentication-with-openid-connect/`

The 365-day counts at design time were 1,519; 1,007; 815; 638; and 584 respectively.

## CTA design

Each selected article receives one inline CTA at a natural topic boundary around 25–35% of its reading progress. Every CTA contains:

- a short headline tied to the surrounding article topic;
- one contextual bridge from that topic to security or testing judgment;
- the shared promise of practical Security Tuesday and Testing Friday Knowledge Pills;
- a `Get the free Knowledge Pills →` link to `/` with no fragment or query parameters;
- a shared `data-ph="article-pills-cta__link"` tracking placement.

All five CTAs use one shared visual component: a compact inline card that is distinct from article prose but substantially quieter than a promotional banner. Copy is authored separately for each article.

## Contextual angles

- **Angular architecture:** architectural boundaries need continuous review and tests, not only diagrams.
- **Vue design patterns:** adapters reduce dependency-change blast radius, while security and testing judgment determine whether the boundary is trustworthy.
- **Angular session storage:** developers should evaluate what browser-stored data an XSS flaw could expose before saving it.
- **Angular CORS:** fixing a CORS error by broadly allowing origins can turn a development shortcut into a security problem.
- **Angular OIDC:** copying authentication configuration is insufficient; developers must understand the security decisions behind the flow.

## Remove obsolete promotion

Within only these five source posts:

- remove legacy `popup` front matter blocks;
- remove every `review_screen` shortcode that links to `websecurity-academy.com`;
- remove or rewrite prose that promotes Web Security Academy;
- remove inactive legacy promotional metadata such as `bannerHeader` when present.

Editorial links that genuinely support the article, including links to other technical Dev Academy articles, remain.

## Implementation shape

The five Markdown files contain their unique CTA copy and shared semantic HTML classes. A dedicated SCSS component supplies the common presentation and is imported by the theme stylesheet. No client-side JavaScript is required beyond the existing `data-ph` click analytics.

## Verification

Rendered-output tests verify that:

- every selected post contains exactly one contextual CTA;
- every CTA links to `/` and not to `/#get-free-pills`;
- no selected post contains the obsolete popup, `review-screen`, `websecurity-academy.com`, or old discount copy;
- non-selected posts and the global layout are unchanged;
- the existing homepage and privacy analytics suites continue to pass.
