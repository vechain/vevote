export * from "./type";

import { createLocalConfig } from "./envs/local";
import { createE2EConfig } from "./envs/e2e";
import { createTestnetConfig } from "./envs/testnet";
import { createMainnetConfig } from "./envs/mainnet";

export const EnvConfigValues = ["local", "e2e", "testnet", "mainnet"] as const;
export type EnvConfig = (typeof EnvConfigValues)[number];

export function getContractsConfig(env: EnvConfig) {
  switch (env) {
    case "local":
      return createLocalConfig();
    case "e2e":
      return createE2EConfig();
    case "testnet":
      return createTestnetConfig();
    case "mainnet":
      return createMainnetConfig();

    default:
      throw new Error(`Invalid ENV "${env}"`);
  }
}

export function shouldRunSimulation() {
  return (
    process.env.VITE_APP_ENV == "local" && process.env.RUN_SIMULATION === "true"
  );
}

export function isE2E() {
  return process.env.VITE_APP_ENV == "e2e";
}
