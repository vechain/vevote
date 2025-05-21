import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-truffle5"
import "hardhat-contract-sizer"
import "@vechain/sdk-hardhat-plugin"
import "hardhat-ignore-warnings"
import { getConfig } from "@repo/config"
import "solidity-coverage"
import "solidity-docgen"
import { EnvConfig } from "@repo/config/contracts"
import { HDKey } from "@vechain/sdk-core"
import { getMnemonic } from "./scripts/helpers/env"

const config: HardhatUserConfig = {
  solidity: "0.8.20",
}

const getSoloUrl = () => {
  const url = process.env.VITE_APP_ENV
    ? getConfig(process.env.VITE_APP_ENV as EnvConfig).network.urls[0]
    : "http://localhost:8669";
  return url
}

module.exports = {
  solidity: {
    version: "0.8.20",
    evmVersion: "paris",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  mocha: {
    timeout: 1800000,
  },
  defaultNetwork: process.env.IS_TEST_COVERAGE ? "hardhat" : "vechain_solo",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    vechain_solo: {
      url: getSoloUrl(),
      accounts: {
        mnemonic: getMnemonic(),
        count: 20,
        path: HDKey.VET_DERIVATION_PATH,
      },
      restful: true,
      gas: 10000000,
    },
    vechain_devnet: {
      url: process.env.VECHAIN_URL_DEVNET,
      accounts: {
        mnemonic: getMnemonic(),
        count: 20,
        path: HDKey.VET_DERIVATION_PATH,
      },
      restful: true,
      gas: 10000000,
    },
    vechain_testnet: {
      url: "https://testnet.vechain.org",
      accounts: {
        mnemonic: getMnemonic(),
        count: 20,
        path: HDKey.VET_DERIVATION_PATH,
      },
      restful: true,
      gas: 10000000,
    },
    vechain_mainnet: {
      url: "https://mainnet.vechain.org",
      accounts: {
        mnemonic: getMnemonic(),
        count: 20,
        path: HDKey.VET_DERIVATION_PATH,
      },
      restful: true,
      gas: 10000000,
    },
  },
  docgen: {
    pages: "files",
  },
}

export default config
