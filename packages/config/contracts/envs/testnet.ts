import { defineConfig } from "../defineConfig";
export function createTestnetConfig() {
  return defineConfig({
    VITE_APP_ENV: "testnet",
    XAPP_BASE_URI: "ipfs://",
    CONTRACTS_ADMIN_ADDRESS: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
  });
}
