# Newsletter submit loader

## Goal

Give an immediate, accessible visual response after a visitor submits any homepage newsletter form and while Kit processes the subscription before redirecting to `/welcome/`.

## Scope

The change applies to the three homepage newsletter forms rendered by the shared `newsletter-form.ejs` partial. It does not change submission data, Kit configuration, validation rules, or redirect behavior.

## Interaction design

- A valid form submission changes the submit button from “Send me the Pills” to a small animated spinner followed by “Sending…”.
- The button keeps its existing dimensions as closely as possible so the form does not visibly reflow.
- While submission is pending, the button is disabled and exposes `aria-busy="true"` to assistive technology.
- Native browser validation remains in charge. An invalid form does not enter the loading state.
- The loading state remains visible until Kit redirects the visitor.
- If Kit renders a form error instead of redirecting, the original button label and enabled state are restored so the visitor can try again.
- If the browser restores the homepage from its back-forward cache, all submit buttons return to their initial state.

## Components

### Shared form markup

The shared newsletter partial will render stable elements for the normal label and loading label. This preserves the original label without reconstructing markup in JavaScript and gives CSS explicit styling hooks.

### Submission behavior

The global homepage script will initialize each `.newsletter-form`. On the form's `submit` event, it will check native validity and then apply the loading state without preventing the existing Kit submission. It will observe the form's Kit error container and restore the normal state when a non-empty error appears. A `pageshow` handler will reset stale states restored from browser cache.

### Styling

Homepage SCSS will hide the loading label by default, swap the two labels in the loading state, and draw a lightweight CSS spinner. The animation will be disabled under `prefers-reduced-motion: reduce` while retaining the visible pending label.

## Error handling

The loader must not replace Kit's error messages or intercept submission. Restoring the button after a rendered Kit error lets the existing integration remain the source of truth and permits a retry.

## Testing

The generated-homepage acceptance test will verify that every newsletter form contains the normal and loading labels and that the compiled script contains loader initialization. Source-level style assertions will cover the loading-state selector, spinner animation, and reduced-motion rule. The normal homepage build and acceptance command will provide regression coverage for the existing Kit form contract and redirect URL.
