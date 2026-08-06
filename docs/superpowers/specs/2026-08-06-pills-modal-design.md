# Pills subscription modal design

## Goal

Replace the legacy “Subscribe to Dev Academy” ConvertKit modal with a focused Knowledge Pills signup that adds subscribers to the same Pills form used by the homepage.

## Placement and trigger

- Preserve the modal’s current placement on every non-homepage, non-landing layout.
- Preserve the approved Kit modal behavior: trigger after 50% content progress, all devices, and show at most once per day.
- Keep the homepage free from this modal because it already contains inline Pills forms.

## Form integration

- Read the action, form ID, UID, and privacy URL from `config.newsletter` instead of duplicating identifiers in the modal partial.
- Submit to form ID `9764408` with UID `23709cd512`.
- Collect only `email_address`; remove the required first-name field.
- Redirect successful submissions to `https://dev-academy.com/welcome`, matching the homepage double-opt-in flow.
- Preserve Kit’s native modal rendering and close behavior.

## Copy

- Headline: “Get two practical Knowledge Pills every week”
- Supporting copy: “Security Tuesday + Testing Friday. Short, practical lessons for JavaScript and TypeScript developers. Each one takes under 5 minutes.”
- Field label: “Your email address”
- Placeholder: `you@example.com`
- Button: “Send me the Pills”
- Reassurance: “Free. Double opt-in. Check your inbox to confirm. Unsubscribe anytime.” followed by the configured Privacy Policy link.

## Analytics and accessibility

- Track the submit button with a dedicated `data-ph="pills-modal__submit"` placement.
- Use a visible email label and retain the Kit error list.
- Keep the existing close control supplied by Kit.

## Verification

Rendered post HTML must prove that the modal:

- uses the configured Pills form action, ID, and UID;
- has the accepted Pills copy and only one email field;
- redirects to `/welcome`;
- uses the 50% scroll trigger without a modal timer;
- remains absent from the homepage.

