# Remove the post slackbar

## Goal

Remove the yellow fixed promotional banner from every rendered blog post.

## Design

The shared site layout will stop rendering `partial/slackbar` when `is_post()` is true. The existing header CTA, newsletter forms, in-content CTAs, and privacy controls remain unchanged.

The unused partial and its styles will remain in the repository. Removing those assets is outside this change and is unnecessary to remove the banner from the rendered site.

## Verification

The homepage acceptance test will inspect a generated blog post and assert that the slackbar markup is absent. The complete homepage test suite will then verify that the surrounding layout and newsletter behavior still render correctly.
