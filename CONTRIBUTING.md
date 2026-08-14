# Contributing

Thanks for helping improve Maid Atelier UI Bundle.

## Side Panel

```sh
cd plugins/dsh-side-panel
npm ci
npm run check
npm test
npm run build
```

## Maid Atelier

```sh
cd plugins/maid-atelier
npm ci
npm test
npm run build
```

Please keep generated `lib/` files in sync with source changes. Do not add
artwork unless its source, license, attribution, and modification history are
documented in `plugins/maid-atelier/ASSET_LICENSES.md` and `NOTICE`.
