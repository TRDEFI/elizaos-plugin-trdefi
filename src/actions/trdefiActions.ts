import type { Action } from "@elizaos/core";

const API = "https://yield.trdefi.com";

async function getJson(path: string): Promise<string> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    return JSON.stringify({ error: `HTTP ${res.status}`, path });
  }
  return JSON.stringify(await res.json());
}

export const listChainsAction: Action = {
  name: "TRDEFI_LIST_CHAINS",
  similes: ["LIST_TRDEFI_CHAINS", "TRDEFI_CHAINS"],
  description:
    "List the blockchains in the TRDEFI non-custodial stablecoin liquidity catalogue. Takes no inputs.",
  validate: async () => true,
  handler: async () => {
    const text = await getJson("/api/chains");
    return { success: true, text };
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "Which chains does TRDEFI support?" } },
      {
        name: "{{agent}}",
        content: { text: "I'll fetch the TRDEFI chain list.", actions: ["TRDEFI_LIST_CHAINS"] },
      },
    ],
  ],
};

export const getStatsAction: Action = {
  name: "TRDEFI_GET_STATS",
  similes: ["TRDEFI_STATS", "TRDEFI_TOTALS"],
  description:
    "Get aggregate TRDEFI catalogue statistics: strategy, maker and pair totals plus volume. Takes no inputs.",
  validate: async () => true,
  handler: async () => {
    const text = await getJson("/api/stats");
    return { success: true, text };
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "How big is TRDEFI's liquidity catalogue?" } },
      {
        name: "{{agent}}",
        content: { text: "I'll pull the TRDEFI totals.", actions: ["TRDEFI_GET_STATS"] },
      },
    ],
  ],
};

export const listStrategiesAction: Action = {
  name: "TRDEFI_LIST_STRATEGIES",
  similes: ["LIST_TRDEFI_STRATEGIES", "TRDEFI_STRATEGIES", "FIND_TRDEFI_LIQUIDITY"],
  description:
    "List open non-custodial stablecoin liquidity strategies. The message text may carry a chain key (ethereum, base, arbitrum, optimism, polygon), a pair like USDC/USDT, or free text. Each strategy carries a strategy_hash for TRDEFI_GET_STRATEGY and TRDEFI_GET_QUOTE.",
  validate: async () => true,
  handler: async (_runtime, message) => {
    const text = (message.content.text || "").toLowerCase();
    const chains = ["ethereum", "base", "arbitrum", "optimism", "polygon"];
    const chain = chains.find((c) => text.includes(c)) ?? "base";
    const pairMatch = text.match(/[a-z0-9]{2,10}\/[a-z0-9]{2,10}/i);
    const params = new URLSearchParams({ chain });
    if (pairMatch) params.set("pair", pairMatch[0].toUpperCase());
    const out = await getJson(`/api/strategies?${params.toString()}`);
    return { success: true, text: out };
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "Find USDC/USDT liquidity on Base via TRDEFI" } },
      {
        name: "{{agent}}",
        content: { text: "I'll search TRDEFI strategies.", actions: ["TRDEFI_LIST_STRATEGIES"] },
      },
    ],
  ],
};

export const getStrategyAction: Action = {
  name: "TRDEFI_GET_STRATEGY",
  similes: ["TRDEFI_STRATEGY_DETAIL"],
  description:
    "Fetch one TRDEFI liquidity strategy by its 0x strategy hash from the message text. Returns chain, pair, tokens, status, volume and activity.",
  validate: async () => true,
  handler: async (_runtime, message) => {
    const match = (message.content.text || "").match(/0x[a-fA-F0-9]{64}/);
    if (!match) {
      return { success: false, text: "No 0x strategy hash found in the message." };
    }
    const out = await getJson(`/api/strategy-detail?hash=${match[0]}`);
    return { success: true, text: out };
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "Show me TRDEFI strategy 0xe8b59f9d281bf4d9ff6b4ef412e413c44135f92b615b145b6640797dd7d9205f" } },
      {
        name: "{{agent}}",
        content: { text: "I'll fetch that strategy.", actions: ["TRDEFI_GET_STRATEGY"] },
      },
    ],
  ],
};

export const getQuoteAction: Action = {
  name: "TRDEFI_GET_QUOTE",
  similes: ["TRDEFI_QUOTE", "QUOTE_TRDEFI_SWAP"],
  description:
    "Quote a swap against a TRDEFI strategy at the current block. Read-only simulation, moves no funds. Needs a 0x strategy hash, a chain key, an amount in base units and a direction (aToB/bToA) in the message text. Gated or unverified strategies return a structured reason — pick another strategy then.",
  validate: async () => true,
  handler: async (_runtime, message) => {
    const text = message.content.text || "";
    const hash = text.match(/0x[a-fA-F0-9]{64}/)?.[0];
    const chains = ["ethereum", "base", "arbitrum", "optimism", "polygon"];
    const chain = chains.find((c) => text.toLowerCase().includes(c)) ?? "base";
    const amount = text.match(/\b(\d{4,})\b/)?.[1] ?? "1000000";
    const direction = /btoa/i.test(text) ? "bToA" : "aToB";
    if (!hash) {
      return { success: false, text: "No 0x strategy hash found in the message." };
    }
    const params = new URLSearchParams({ hash, chain, amount, direction });
    const out = await getJson(`/api/quote?${params.toString()}`);
    return { success: true, text: out };
  },
  examples: [
    [
      { name: "{{user}}", content: { text: "Quote 1000000 aToB on base strategy 0xe8b59f9d281bf4d9ff6b4ef412e413c44135f92b615b145b6640797dd7d9205f" } },
      {
        name: "{{agent}}",
        content: { text: "I'll quote that swap.", actions: ["TRDEFI_GET_QUOTE"] },
      },
    ],
  ],
};
