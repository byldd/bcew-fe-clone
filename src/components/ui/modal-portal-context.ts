import * as React from "react";

// Radix's Dialog locks page scroll by only allowing wheel/touch scroll inside its own content
// node (react-remove-scroll's `shards: [contentRef]`). Any Radix primitive that portals its
// overlay to the default `document.body` (Popover, Select, ...) sits outside that node, so every
// wheel event inside it gets cancelled while a modal is open. `useModal` provides its DialogContent
// node through this context (as a ref, not a value, so mounting it doesn't need a state
// update/re-render) so those primitives' content can portal into it instead; outside a modal this
// stays `null` and the primitive's Portal falls back to its default container.
export const ModalPortalContext = React.createContext<React.RefObject<HTMLElement | null> | null>(null);
