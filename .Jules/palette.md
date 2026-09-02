## 2024-05-18 - Mobile Nav Focus State & ARIA

**Learning:** Dialog/modal interactive elements (like the close button) often lose their context for screen reader users if labelled identically to their triggers (e.g. "Toggle Menu" on both open and close buttons).
**Action:** Always ensure that interior modal close buttons explicitly state "Close" or similar instead of reusing the trigger's generic label. Verify keyboard `focus-visible` states are present on custom buttons.
