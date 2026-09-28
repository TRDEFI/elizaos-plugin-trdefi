# plugin-trdefi

ElizaOS plugin for **TRDEFI** — read-only, non-custodial stablecoin liquidity.

## Actions

| Action | What |
|---|---|
| `TRDEFI_LIST_CHAINS` | Blockchains in the TRDEFI catalogue |
| `TRDEFI_GET_STATS` | Strategy/maker/pair totals and volume |
| `TRDEFI_LIST_STRATEGIES` | Open strategies (chain + pair parsed from text) |
| `TRDEFI_GET_STRATEGY` | One strategy by `0x` hash |
| `TRDEFI_GET_QUOTE` | Read-only swap simulation (hash + chain + amount + direction) |

Funds never leave the holder's wallet — every action only `GET`s the public TRDEFI API.

## Dev

```bash
npm install
npm run build
npm test
```

## Publish (maintainer)

```bash
npm login
npm run build
npm publish --access public
```

Then the ElizaOS registry review picks it up (`docs.elizaos.ai/guides/publish-a-plugin`).
