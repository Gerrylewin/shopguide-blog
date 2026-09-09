## 2024-05-18 - Mobile Nav Focus State & ARIA

**Learning:** Dialog/modal interactive elements (like the close button) often lose their context for screen reader users if labelled identically to their triggers (e.g. "Toggle Menu" on both open and close buttons).
**Action:** Always ensure that interior modal close buttons explicitly state "Close" or similar instead of reusing the trigger's generic label. Verify keyboard `focus-visible` states are present on custom buttons.
## 2024-05-18 - Audio Player Button Focus States

**Learning:** Custom interactive elements within media players (like Play, Pause, Rewind buttons in `<AudioPlayer>`) often lack default visual focus states since they use generic `button` wrappers with Tailwind padding/background classes.
**Action:** Consistently apply `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500` to all icon-only or custom interactive buttons in media components to ensure keyboard navigation remains accessible.
