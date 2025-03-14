import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { NodeManagement, TokenAuction, VeVote } from "../../typechain-types"
import { createLocalConfig } from "@repo/config/contracts/envs/local"
import { deployProxy } from "../../scripts/helpers"
import { deployLibraries } from "../../scripts/helpers/deployLibraries"
import { createNodeHolder } from "./xnode"

interface DeployInstance {
  admin: HardhatEthersSigner
  whitelistedAccount: HardhatEthersSigner
  otherAccount: HardhatEthersSigner
  strengthHolder: HardhatEthersSigner
  thunderHolder: HardhatEthersSigner
  mjolnirHolder: HardhatEthersSigner
  veThorXHolder: HardhatEthersSigner
  strengthXHolder: HardhatEthersSigner
  thunderXHolder: HardhatEthersSigner
  mjolnirXHolder: HardhatEthersSigner
  flashHolder: HardhatEthersSigner
  lighteningHolder: HardhatEthersSigner
  dawnHolder: HardhatEthersSigner
  validatorHolder: HardhatEthersSigner
  otherAccounts: HardhatEthersSigner[]
  vevote: VeVote
  nodeManagement: NodeManagement
  vechainNodesMock: TokenAuction
}

let cachedDeployInstance: DeployInstance | undefined = undefined
export const getOrDeployContractInstances = async ({ forceDeploy = false, config = createLocalConfig() }) => {
  if (!forceDeploy && cachedDeployInstance !== undefined) {
    return cachedDeployInstance
  }

  // Contracts are deployed using the first signer/account by default
  const [
    admin,
    whitelistedAccount,
    otherAccount,
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
    validatorHolder,
    ...otherAccounts
  ] = await ethers.getSigners()

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries()

  // ---------------------- Deploy Mocks ----------------------

  // deploy Mocks
  const TokenAuctionLock = await ethers.getContractFactory("TokenAuction")
  const vechainNodesMock = await TokenAuctionLock.deploy()
  await vechainNodesMock.waitForDeployment()

  const ClockAuctionLock = await ethers.getContractFactory("ClockAuction")
  const clockAuctionContract = await ClockAuctionLock.deploy(
    await vechainNodesMock.getAddress(),
    await admin.getAddress(),
  )

  await vechainNodesMock.setSaleAuctionAddress(await clockAuctionContract.getAddress())

  await vechainNodesMock.addOperator(await admin.getAddress())

  const nodeManagement = (await deployProxy(
    "NodeManagement",
    [await vechainNodesMock.getAddress(), admin.address, admin.address],
    undefined,
    false,
  )) as NodeManagement

  // ---------------------- Deploy Contracts ----------------------
  const vevote = (await deployProxy(
    "VeVote",
    [
      {
        quorumPercentage: config.QUORUM_PERCENTAGE,
        initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
        initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
        initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
        initialMaxChoices: config.INITIAL_MAX_CHOICES,
        nodeManagement: await nodeManagement.getAddress(),
        vechainNodesContract: await vechainNodesMock.getAddress(),
        baseLevelNode: config.BASE_LEVEL_NODE,
      },
      {
        admin: admin.address,
        upgrader: admin.address,
        whitelist: [whitelistedAccount.address],
        settingsManager: admin.address,
        nodeWeightManager: admin.address,
        executor: admin.address,
      },
    ],
    {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
    false,
  )) as VeVote

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

  cachedDeployInstance = {
    vevote,
    nodeManagement,
    admin,
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
    validatorHolder,
    whitelistedAccount,
    otherAccount,
    otherAccounts,
    vechainNodesMock,
  }
  return cachedDeployInstance
}
