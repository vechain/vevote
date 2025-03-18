import { ethers, network } from "hardhat"
import { ContractsConfig } from "@repo/config/contracts/type"
import { HttpNetworkConfig } from "hardhat/types"
import { deployProxy, saveContractsToFile } from "../helpers"
import { getConfig } from "@repo/config"
import {
  NodeManagement,
  VeVote,
} from "../../typechain-types"
import { deployLibraries } from "../helpers/deployLibraries"
import { createNodeHolder } from "../../test/helpers/xnode"

const appConfig = getConfig()

export async function deployAll(config: ContractsConfig) {
  const start = performance.now()
  const networkConfig = network.config as HttpNetworkConfig
  console.log(
    `================  Deploying contracts on ${networkConfig.url} with ${config.VITE_APP_ENV} configurations `,
  )
  // Contracts are deployed using the first signer/account by default
  const [
    deployer,
    strengthHolder,
    thunderHolder,
    mjolnirHolder,
    veThorXHolder,
    strengthXHolder,
    thunderXHolder,
    mjolnirXHolder,
    flashHolder,
    lighteningHolder,
    dawnHolder,
    validatorHolder
  ] = await ethers.getSigners()

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

    // Create mock node holders

    // ---------------------- Create Node Holders ----------------------
    await createNodeHolder(1, strengthHolder, vechainNodesMock)
    await createNodeHolder(2, thunderHolder, vechainNodesMock)
    await createNodeHolder(3, mjolnirHolder, vechainNodesMock)
    await createNodeHolder(4, veThorXHolder, vechainNodesMock)
    await createNodeHolder(5, strengthXHolder, vechainNodesMock)
    await createNodeHolder(6, thunderXHolder, vechainNodesMock)
    await createNodeHolder(7, mjolnirXHolder, vechainNodesMock)
    await createNodeHolder(8, flashHolder, vechainNodesMock)
    await createNodeHolder(9, lighteningHolder, vechainNodesMock)
    await createNodeHolder(10, dawnHolder, vechainNodesMock)
    await createNodeHolder(11, validatorHolder, vechainNodesMock)
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

  return {
    vevote,
    vechainNodes: vechainNodesMock,
    nodeManagement: nodeManagement,
  }
}
