# Headerless `/welcome` page

Date: 2026-08-04  
Status: approved design

## Objective

Render only the confirmation content on `/welcome`, without the global site header or footer.

## Scope

- Set `layout: landing` in `source/welcome/index.html`.
- Keep the current confirmation content, metadata and styling unchanged.
- Do not change `/welcome/security` or any other route.

## Design

The theme's existing `landing` layout path renders the page body directly and omits the global header, footer, newsletter form and main site script. Using it in the page front matter keeps the behavior local to `/welcome` and follows the pattern already used by standalone landing pages in this repository.

No new layout or route-specific condition will be introduced.

## Verification

Extend the generated-site acceptance test to verify that `public/welcome/index.html`:

- still contains the welcome confirmation content;
- does not contain the global header markup;
- does not contain the global footer markup.

Run the homepage acceptance test, which builds the Hexo site before checking the generated HTML.
