## 2024-10-24 - Screen Reader Only Labels on Newsletter Forms

**Learning:** Adding `id` to an input element and linking it to a `sr-only` class `<label>` via `htmlFor` is an effective pattern to provide accessibility to visually-hidden or placeholder-reliant forms without compromising on clean, minimalist design typical of modern interfaces.
**Action:** Consistently use the `sr-only` class combined with `id` and `htmlFor` to add descriptive, screen-reader accessible labels to minimalist inputs that visually rely on placeholders.

## 2024-05-18 - Improve Toggle Button Accessibility

**Learning:** For custom toggle controls (like playback speed buttons: 1x, 2x, 4x), relying solely on visual styling (e.g., active vs. inactive background colors) makes it impossible for screen reader users to identify the currently selected option. Additionally, individual buttons should be grouped semantically.
**Action:** Always wrap related toggle buttons in a container with `role="group"` and an appropriate `aria-label`. Use the `aria-pressed={true/false}` attribute on each button to explicitly denote its active/inactive state to assistive technologies.

## 2024-05-18 - Improve Dynamic State Announcements

**Learning:** Loading and error states often appear dynamically without a page reload. Screen readers may miss these updates if not properly configured.
**Action:** Use `role="alert"` with `aria-live="assertive"` for critical error messages so they are announced immediately. Use `role="status"` with `aria-live="polite"` for non-critical status updates (like "Loading...") so they are announced at the next available pause.

## 2024-10-24 - Screen Reader Announcements for Dynamic Content

**Learning:** When form validation errors, success messages, or component loading errors appear dynamically without a page reload, screen reader users may not be aware of them. Simply rendering the text is not enough.
**Action:** Use `role="alert"` with `aria-live="assertive"` for critical error messages (like form submission failures or component crash boundaries) so they are announced immediately, interrupting current speech if necessary. Use `role="status"` with `aria-live="polite"` for non-critical status updates (like successful form submission) so they are announced at the next available pause without interrupting the user.
