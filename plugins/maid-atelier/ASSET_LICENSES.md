# Asset provenance and licence status

This file records what the upstream repository states and what evidence is
actually present in the repository. It is not a warranty of ownership or
legal advice.

## Declared attribution chain

1. 上善 — original whale-girl character design:
   <https://www.pixiv.net/users/62155430>
2. ZipZipPipe / zipzip — maid redesign adding DeepSeek elements, described by
   upstream as generated with GPT Image 2:
   <https://www.pixiv.net/users/18604994>
3. Small-tailqwq — tertiary redesign and the `maid-atelier` skin:
   <https://github.com/Small-tailqwq/dsh-deep-whale>

The upstream repository declares the derivative theme under CC BY-NC-SA 4.0.
That declaration requires attribution, non-commercial use, a modification
notice, and ShareAlike for downstream adaptations.

## Files carrying or reproducing the artwork

The declared chain applies to the visual assets shipped by upstream,
including:

- `assets/*.webp`;
- `src/client/art.ts`;
- `src/client/background-art.generated.ts`;
- `src/client/chrome-art.generated.ts`;
- `src/client/workspace-art.generated.ts`;
- the generated `lib/client.js` bundle;
- `preview/light.webp` and `preview/dark.webp`;
- the bundle-level screenshot `../../docs/images/hero.webp`.

The 2026-08-14 downstream revision changes layout, colour, contrast, and
interaction code. It does not intentionally alter the binary artwork.

## Evidence gap

The repository contains profile links and the attribution statement above,
but no original work URLs or IDs, licence notices attached by the initial or
secondary artist, or written permission allowing adaptation, public
redistribution, and CC BY-NC-SA 4.0 relicensing. A generative-image tool's
involvement does not by itself resolve rights in a pre-existing character.

Before an independent public release, obtain written confirmation from the
relevant artists covering repository distribution, compiled Data URIs, and
preview screenshots. If that is not possible, replace every file listed
above with independently created or clearly licensed material.

DeepSeek names and marks are not licensed by CC BY-NC-SA 4.0. Compatibility
references must not imply affiliation, official status, or endorsement.
