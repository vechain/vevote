import { ethers, network } from "hardhat"
import { deployAll } from "./deploy/deploy"
import { getConfig, getContractsConfig, AppConfig } from "@repo/config"
import fs from "fs"
import path from "path"
import { Network } from "@repo/constants"
import { EnvConfig } from "@repo/config/contracts"

const env = process.env.VITE_APP_ENV as EnvConfig
if (!env) throw new Error("VITE_APP_ENV env variable must be set")
const config = getConfig()

const isSoloNetwork = network.name === "vechain_solo"
 const isStagingEnv = process.env.VITE_APP_ENV === "devnet-staging"

async function main() {
  console.log(`Checking contracts deployment on ${network.name} (${config.network.urls[0]})...`)
  await checkContractsDeployment()
  process.exit(0)
}

// check if the contracts specified in the config file are deployed on the network, if not, deploy them (only on solo network)
async function checkContractsDeployment() {
  try {
    // if contract address is not set or it does not exist on the network, consider it as not deployed
    const code = config.vevoteContractAddress === "" ? "0x" : await ethers.provider.getCode(config.vevoteContractAddress)
    if (code === "0x") {
      console.log(`vevote contract not deployed at address ${config.vevoteContractAddress}`)
      if (isSoloNetwork || isStagingEnv) {
        // deploy the contracts and override the config file
        const newAddresses = await deployAll(getContractsConfig(env))
          
        return await overrideLocalConfigWithNewContracts(newAddresses, config.network)
      } else console.log(`Skipping deployment on ${network.name}`)
    } else console.log(`vevote contract already deployed`)
  } catch (e) {
    console.log(e)
  }
}

async function overrideLocalConfigWithNewContracts(contracts: Awaited<ReturnType<typeof deployAll>>, network: Network) {
  const newConfig: AppConfig = {
    ...config,
    vevoteContractAddress: await contracts.vevote.getAddress(),
    nodeManagementContractAddress: await contracts.nodeManagement.getAddress(),
    vechainNodesContractAddress: await contracts.vechainNodes.getAddress(),
  }

  // eslint-disable-next-line
  const toWrite = `import { AppConfig } from \".\" \n const config: AppConfig = ${JSON.stringify(newConfig, null, 2)};
  export default config;`

  const configFiles: { [key: string]: string } = {
    solo: "local.ts",
    testnet: "testnet.ts",
    main: "mainnet.ts",
    devnet: "devnet-staging.ts",
  }
  const fileToWrite = configFiles[network.name]
  const localConfigPath = path.resolve(`../config/${fileToWrite}`)
  console.log(`Writing new config file to ${localConfigPath}`)
  fs.writeFileSync(localConfigPath, toWrite)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exit(1)
})
