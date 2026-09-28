import type { Plugin } from "@elizaos/core";
import {
  listChainsAction,
  getStatsAction,
  listStrategiesAction,
  getStrategyAction,
  getQuoteAction,
} from "./actions/trdefiActions";

export const trdefiPlugin: Plugin = {
  name: "plugin-trdefi",
  description:
    "TRDEFI — read-only, non-custodial stablecoin liquidity: chains, stats, strategies and swap quotes. Funds never leave the holder's wallet.",
  actions: [listChainsAction, getStatsAction, listStrategiesAction, getStrategyAction, getQuoteAction],
  providers: [],
  services: [],
};

export default trdefiPlugin;
