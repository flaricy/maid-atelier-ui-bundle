# Changelog

## Unreleased

### Fixed

- Covered the alias design tokens that plugin-owned panels read (the plugin
  market's segmented tab rows, selected pills, primary buttons, dialogs,
  toasts, tooltips, scrollbars) so those surfaces no longer render with stock
  colors inside the skin, in both light and dark modes. Gave the market's
  sticky rows a glass surface (`--dshm-sticky-bg` / `--dshm-stuck-bg`) so
  cards no longer scroll visibly beneath them.
- Prevented Cordis Plugin and future `sidebar.footer.action` entries from
  pushing Settings below the viewport. The footer now grows into the
  scrollable workspace in both wide and rail layouts.
- Made the live turn status readable over artwork and unified Think, Bash,
  and other process rows with one restrained surface across loading, expanded,
  and settled states.
- Raised message-tail action contrast with compact icon surfaces and clear
  hover, keyboard-focus, selected, and unavailable states.

### Changed

- Reduced background interference and restored the composer occlusion layer.
- Improved contrast and type hierarchy for tool rows and subagent overlays.
- Normalised side-panel integration and neutral interface icon treatment.
- Replaced copied product wordmark geometry with a neutral skin-owned title.
- Stopped advertising an unshipped source map from the browser bundle.
- Added Git-subdirectory installation through `flaricy/maid-atelier-ui-bundle`.

### Documentation

- Added explicit artwork provenance, third-party licence, modification, and
  non-endorsement notices.

## 0.0.1

- Initial upstream `maid-atelier` release.
