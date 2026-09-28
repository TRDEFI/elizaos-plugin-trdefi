import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listChainsAction,
  getStatsAction,
  listStrategiesAction,
  getStrategyAction,
  getQuoteAction,
} from "./trdefiActions";

const msg = (text: string) => ({ content: { text } }) as never;
const runtime = {} as never;

describe("TRDEFI actions", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });

  it("listChains hits /api/chains", async () => {
    const r = await listChainsAction.handler(runtime, msg("chains?"), undefined, {}, undefined as never);
    expect(r?.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/chains"));
  });

  it("getStats hits /api/stats", async () => {
    const r = await getStatsAction.handler(runtime, msg("stats?"), undefined, {}, undefined as never);
    expect(r?.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/stats"));
  });

  it("listStrategies parses chain and pair", async () => {
    const r = await listStrategiesAction.handler(
      runtime, msg("USDC/USDT on base"), undefined, {}, undefined as never,
    );
    expect(r?.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/strategies?chain=base&pair=USDC%2FUSDT"),
    );
  });

  it("getStrategy requires a hash", async () => {
    const r = await getStrategyAction.handler(runtime, msg("no hash here"), undefined, {}, undefined as never);
    expect(r?.success).toBe(false);
  });

  it("getStrategy fetches by hash", async () => {
    const h = "0x" + "ab".repeat(32);
    const r = await getStrategyAction.handler(runtime, msg(`show ${h}`), undefined, {}, undefined as never);
    expect(r?.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining(h));
  });

  it("getQuote requires a hash", async () => {
    const r = await getQuoteAction.handler(runtime, msg("quote please"), undefined, {}, undefined as never);
    expect(r?.success).toBe(false);
  });

  it("getQuote builds the quote URL", async () => {
    const h = "0x" + "ab".repeat(32);
    const r = await getQuoteAction.handler(
      runtime, msg(`quote 1000000 aToB on base ${h}`), undefined, {}, undefined as never,
    );
    expect(r?.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/quote?"));
  });

  it("all actions validate", async () => {
    for (const a of [listChainsAction, getStatsAction, listStrategiesAction, getStrategyAction, getQuoteAction]) {
      expect(await a.validate(runtime, msg("x"))).toBe(true);
    }
  });
});
