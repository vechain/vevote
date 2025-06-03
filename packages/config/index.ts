import localConfig from "./local";
import testnetConfig from "./testnet";
import mainnetConfig from "./mainnet";
import testnetStagingConfig from "./testnet-staging";
import galaticaTestConfig from "./galactica-test";
import { EnvConfig, getContractsConfig } from "./contracts";
import { Network } from "@repo/constants";

export type AppConfig = {
  environment: EnvConfig;
  basePath?: string;
  vevoteContractAddress: string;
  nodeManagementContractAddress: string;
  stargateNFTContractAddress: string;
  vechainNodesContractAddress: string;
  nodeUrl: string;
  network: Network;
  ipfsPinningService: string;
  ipfsFetchingService: string;
  indexerUrl: string;
};

export const getConfig = (env?: EnvConfig): AppConfig => {
  const appEnv = env || process.env.VITE_APP_ENV;
  if (!appEnv) throw new Error("VITE_APP_ENV env variable must be set or a type must be passed to getConfig()");
  if (appEnv === "local") return localConfig;
  if (appEnv === "e2e") return localConfig;
  if (appEnv === "testnet") return testnetConfig;
  if (appEnv === "testnet-staging") return testnetStagingConfig;
  if (appEnv === "mainnet") return mainnetConfig;
  if (appEnv === "galactica-test") return galaticaTestConfig;
  throw new Error(`Unsupported VITE_APP_ENV ${appEnv}`);
};

export { getContractsConfig };
