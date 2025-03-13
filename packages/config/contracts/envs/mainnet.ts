import { defineConfig } from "../defineConfig";
export function createMainnetConfig() {
  return defineConfig({
    VITE_APP_ENV: "mainnet",
    XAPP_BASE_URI: "ipfs://",
    CONTRACTS_ADMIN_ADDRESS: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
    VECHAIN_NODES_CONTRACT_ADDRESS: "0xb81E9C5f9644Dec9e5e3Cac86b4461A222072302", // The contract address of the VeChainNodes contract on mainnet
  });
}
