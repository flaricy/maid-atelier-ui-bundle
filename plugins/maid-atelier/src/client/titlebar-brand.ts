/**
 * Build the skin's original, product-neutral title-bar lockup.
 *
 * The mark deliberately uses only text and CSS-addressable spans: no vendor
 * wordmark, mascot, icon path, or other third-party artwork is embedded here.
 */
export function createMaidAtelierTitlebarBrand(): HTMLSpanElement {
  const lockup = document.createElement('span')
  lockup.dataset.maidTitlebarLockup = ''

  const monogram = document.createElement('span')
  monogram.dataset.maidTitlebarMonogram = ''
  monogram.textContent = 'DSH'

  const separator = document.createElement('span')
  separator.dataset.maidTitlebarSeparator = ''

  const name = document.createElement('span')
  name.dataset.maidTitlebarName = ''
  name.textContent = 'MAID ATELIER'

  lockup.append(monogram, separator, name)
  return lockup
}
