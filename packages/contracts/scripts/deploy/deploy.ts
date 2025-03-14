import { ethers, network } from "hardhat"
import { ContractsConfig } from "@repo/config/contracts/type"
import { HttpNetworkConfig } from "hardhat/types"
import { deployProxy, saveContractsToFile } from "../helpers"
import { Network } from "@repo/constants"
import { AppConfig, getConfig } from "@repo/config"
import fs from "fs"
import path from "path"
import {
  NodeManagement,
  VeVote,
} from "../../typechain-types"
import { deployLibraries } from "../helpers/deployLibraries"

const appConfig = getConfig()

export async function deployAll(config: ContractsConfig) {
  const start = performance.now()
  const networkConfig = network.config as HttpNetworkConfig
  console.log(
    `================  Deploying contracts on ${network.name} (${networkConfig.url}) with ${config.VITE_APP_ENV} configurations `,
  )
  const [deployer] = await ethers.getSigners()

  const TEMP_ADMIN = network.name === "vechain_solo" ? config.CONTRACTS_ADMIN_ADDRESS : deployer.address
  console.log("================================================================================")
  console.log("Temporary admin set to ", TEMP_ADMIN)
  console.log("Final admin will be set to ", config.CONTRACTS_ADMIN_ADDRESS)

  console.log(`================  Address used to deploy: ${deployer.address}`)

  // ---------------------- Deploy Mocks ----------------------
  let vechainNodesAddress = config.VECHAIN_NODES_CONTRACT_ADDRESS // this is the mainnet address
  let vechainNodesMock = await ethers.getContractAt("TokenAuction", config.VECHAIN_NODES_CONTRACT_ADDRESS)

  let nodeManagementAddress = config.NODE_MANAGEMENT_CONTRACT_ADDRESS // this is the mainnet address
  let nodeManagement = await ethers.getContractAt("NodeManagement", config.NODE_MANAGEMENT_CONTRACT_ADDRESS)
  if (network.name !== "vechain_mainnet") {
    console.log("Deploying Vechain Nodes mock contracts")

    const TokenAuctionLock = await ethers.getContractFactory("TokenAuction")
    vechainNodesMock = await TokenAuctionLock.deploy()
    await vechainNodesMock.waitForDeployment()

    const ClockAuctionLock = await ethers.getContractFactory("ClockAuction")
    const clockAuctionContract = await ClockAuctionLock.deploy(await vechainNodesMock.getAddress(), deployer)

    await vechainNodesMock.setSaleAuctionAddress(await clockAuctionContract.getAddress())

    await vechainNodesMock.addOperator(deployer)
    vechainNodesAddress = await vechainNodesMock.getAddress()

    console.log("Vechain Nodes Mock deployed at: ", await vechainNodesMock.getAddress())

    // Deploy the NodeManagement contract
    nodeManagement = (await deployProxy("NodeManagement", [
      vechainNodesAddress,
      TEMP_ADMIN,
      TEMP_ADMIN,
    ], undefined, true)) as NodeManagement

    nodeManagementAddress = await nodeManagement.getAddress()
  }

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries()

  // ---------------------- Deploy Contracts ----------------------

  // Deploy the vevote contract
  const vevote = (await deployProxy(
    "VeVote",
    [
      {
        quorumPercentage: config.QUORUM_PERCENTAGE,
        initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
        initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
        initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
        initialMaxChoices: config.INITIAL_MAX_CHOICES,
        nodeManagement: nodeManagementAddress,
        vechainNodesContract: vechainNodesAddress,
        baseLevelNode: config.BASE_LEVEL_NODE,
      },
      {
        admin: TEMP_ADMIN,
        upgrader: TEMP_ADMIN,
        whitelist: [TEMP_ADMIN],
        settingsManager: TEMP_ADMIN,
        nodeWeightManager: TEMP_ADMIN,
        executor: TEMP_ADMIN,
      },
    ],
    {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
    true,
  )) as VeVote

  const date = new Date(performance.now() - start)
  console.log(`================  Contracts deployed in ${date.getMinutes()}m ${date.getSeconds()}s `)

  const contractAddresses: Record<string, string> = {
    vevote: await vevote.getAddress(),
  }

  const libraries: {
    VeVote: Record<string, string>
  } = {
    VeVote: {
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
    },
  }

  console.log("Contracts", contractAddresses)
  await saveContractsToFile(contractAddresses, libraries)

  const end = new Date(performance.now() - start)
  console.log(`Total execution time: ${end.getMinutes()}m ${end.getSeconds()}s`)

  console.log("Deployment completed successfully!")
  console.log("================================================================================")

  await overrideContractConfigWithNewContracts(
    {
      vevote,
      vechainNodesMock: vechainNodesAddress,
      nodeManagement: nodeManagementAddress,
    },
    appConfig.network,
  )

  return {
    vevote,
    vechainNodesMock: vechainNodesAddress,
    nodeManagement: nodeManagementAddress,
  }
  // close the script
}

export async function overrideContractConfigWithNewContracts(
  contracts: Awaited<ReturnType<typeof deployAll>>,
  network: Network,
) {
  const newConfig: AppConfig = {
    ...appConfig,
    vevoteContractAddress: await contracts.vevote.getAddress(),
  }

  // eslint-disable-next-line
  const toWrite = `import { AppConfig } from \".\" \n const config: AppConfig = ${JSON.stringify(newConfig, null, 2)};
  export default config;`

  const configFiles: { [key: string]: string } = {
    solo: "local.ts",
    testnet: "testnet.ts",
    main: "mainnet.ts",
  }
  const fileToWrite = configFiles[network.name]
  const localConfigPath = path.resolve(`../config/${fileToWrite}`)
  console.log(`Writing new config file to ${localConfigPath}`)
  fs.writeFileSync(localConfigPath, toWrite)
}
