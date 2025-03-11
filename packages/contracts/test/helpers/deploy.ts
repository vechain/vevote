import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { NodeManagement, TokenAuction, VeVote } from "../../typechain-types"
import { createLocalConfig } from "@repo/config/contracts/envs/local"
import { deployProxy} from "../../scripts/helpers"
import { deployLibraries } from "../../scripts/helpers/deployLibraries"

interface DeployInstance {
  admin: HardhatEthersSigner
  otherAccount: HardhatEthersSigner
  otherAccounts: HardhatEthersSigner[]
  vevote: VeVote
  nodeManagement: NodeManagement
  vechainNodesMock: TokenAuction
}


let cachedDeployInstance: DeployInstance | undefined = undefined
export const getOrDeployContractInstances = async ({
  forceDeploy = false,
  config = createLocalConfig(),
}) => {
  if (!forceDeploy && cachedDeployInstance !== undefined) {
    return cachedDeployInstance
  }

  // Contracts are deployed using the first signer/account by default
  const [admin, otherAccount, ...otherAccounts] = await ethers.getSigners()

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

  const nodeManagement = (await deployProxy("NodeManagement", [
    await vechainNodesMock.getAddress(),
    admin.address,
    admin.address,
  ], undefined, true)) as NodeManagement

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
          upgrader:  admin.address,
          whitelist: [ admin.address],
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
  
    
  cachedDeployInstance = {
    vevote,
    nodeManagement,
    admin,
    otherAccount,
    otherAccounts,
    vechainNodesMock,
  }
  return cachedDeployInstance
}
