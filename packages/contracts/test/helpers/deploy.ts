import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  Authority,
  NodeManagement,
  StargateDelegation,
  StargateNFT,
  TokenAuction,
  VeVote,
} from "../../typechain-types";
import { createLocalConfig } from "@repo/config/contracts/envs/local";
import {
  createNodeHolder,
  deployAndInitializeLatest,
  deployProxy,
  deployStargateNFTLibraries,
  deployUpgradeableWithoutInitialization,
  initializeProxy,
  initialTokenLevels,
  TokenLevelId,
  vthoRewardPerBlockPerLevel,
} from "../../scripts/helpers";
import { deployLibraries } from "../../scripts/helpers/deployLibraries";
import { createValidator } from "./common";

interface DeployInstance {
  admin: HardhatEthersSigner;
  whitelistedAccount: HardhatEthersSigner;
  otherAccount: HardhatEthersSigner;
  strengthHolder: HardhatEthersSigner;
  thunderHolder: HardhatEthersSigner;
  mjolnirHolder: HardhatEthersSigner;
  veThorXHolder: HardhatEthersSigner;
  strengthXHolder: HardhatEthersSigner;
  thunderXHolder: HardhatEthersSigner;
  mjolnirXHolder: HardhatEthersSigner;
  flashHolder: HardhatEthersSigner;
  lighteningHolder: HardhatEthersSigner;
  dawnHolder: HardhatEthersSigner;
  validatorHolder: HardhatEthersSigner;
  otherAccounts: HardhatEthersSigner[];
  vevote: VeVote;
  nodeManagement: NodeManagement;
  vechainNodesMock: TokenAuction;
  stargateNFT: StargateNFT;
  authorityContractMock: Authority;
}

let cachedDeployInstance: DeployInstance | undefined = undefined;
export const getOrDeployContractInstances = async ({ forceDeploy = false, config = createLocalConfig() }) => {
  if (!forceDeploy && cachedDeployInstance !== undefined) {
    return cachedDeployInstance;
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
  ] = await ethers.getSigners();

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  // ---------------------- Deploy Mocks ----------------------

  const vthoAddress = "0x0000000000000000000000000000456E65726779";

  const TokenAuctionLock = await ethers.getContractFactory("TokenAuction");
  const vechainNodesMock = await TokenAuctionLock.deploy();
  await vechainNodesMock.waitForDeployment();

  const ClockAuctionLock = await ethers.getContractFactory("ClockAuction");
  const clockAuctionContract = await ClockAuctionLock.deploy(await vechainNodesMock.getAddress(), admin);

  await vechainNodesMock.setSaleAuctionAddress(await clockAuctionContract.getAddress());

  await vechainNodesMock.addOperator(admin.address);
  const vechainNodesMockAddress = await vechainNodesMock.getAddress();

  const {
    StargateNFTClockLib,
    StargateNFTSettingsLib,
    StargateNFTTokenLib,
    StargateNFTMintingLib,
    StargateNFTVetGeneratedVthoLib,
    StargateNFTLevelsLib,
  } = await deployStargateNFTLibraries();

  const stargateNFTProxyAddress = await deployUpgradeableWithoutInitialization(
    "StargateNFT",
    {
      Clock: await StargateNFTClockLib.getAddress(),
      MintingLogic: await StargateNFTMintingLib.getAddress(),
      Settings: await StargateNFTSettingsLib.getAddress(),
      Token: await StargateNFTTokenLib.getAddress(),
      VetGeneratedVtho: await StargateNFTVetGeneratedVthoLib.getAddress(),
      Levels: await StargateNFTLevelsLib.getAddress(),
    },
    false,
  );

  const stargateDelegationProxyAddress = await deployUpgradeableWithoutInitialization("StargateDelegation", {}, false);

  const stargateNFT = (await initializeProxy(
    stargateNFTProxyAddress,
    "StargateNFT",
    [
      {
        tokenCollectionName: "VeChain Node Token",
        tokenCollectionSymbol: "VNT",
        baseTokenURI: "ipfs://todo/metadata/",
        admin: admin.address,
        upgrader: admin.address,
        pauser: admin.address,
        levelOperator: admin.address,
        legacyNodes: vechainNodesMockAddress,
        legacyLastTokenId: admin.address,
        levelsAndSupplies: initialTokenLevels,
        stargateDelegation: stargateDelegationProxyAddress,
        vthoToken: vthoAddress,
      },
    ],
    {
      Clock: await StargateNFTClockLib.getAddress(),
      MintingLogic: await StargateNFTMintingLib.getAddress(),
      Settings: await StargateNFTSettingsLib.getAddress(),
      Token: await StargateNFTTokenLib.getAddress(),
      VetGeneratedVtho: await StargateNFTVetGeneratedVthoLib.getAddress(),
      Levels: await StargateNFTLevelsLib.getAddress(),
    },
  )) as StargateNFT;

  (await initializeProxy(
    stargateDelegationProxyAddress,
    "StargateDelegation",
    [
      {
        upgrader: config.CONTRACTS_ADMIN_ADDRESS,
        admin: config.CONTRACTS_ADMIN_ADDRESS,
        stargateNFT: await stargateNFT.getAddress(),
        vthoToken: vthoAddress,
        vthoRewardPerBlock: vthoRewardPerBlockPerLevel,
        delegationPeriod: 10, // 10 blocks"
        operator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      },
    ],
    {},
  )) as unknown as StargateDelegation;

  const nodeManagement = (await deployAndInitializeLatest(
    "NodeManagement",
    [
      {
        name: "initialize",
        args: [vechainNodesMockAddress, admin.address, admin.address],
      },
      {
        name: "initializeV3",
        args: [await stargateNFT.getAddress()],
      },
    ],
    {},
    false,
  )) as NodeManagement;

  // Mock builtin Authority contract
  const AuthorityContractMock = await ethers.getContractFactory("Authority");
  const authorityContractMock = await AuthorityContractMock.deploy();
  await authorityContractMock.waitForDeployment();

  // Create mock node holders

  // ---------------------- Create Node Holders ----------------------
  await createNodeHolder(TokenLevelId.Strength, admin, strengthHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.Thunder, admin, thunderHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.Mjolnir, admin, mjolnirHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.VeThorX, admin, veThorXHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.StrengthX, admin, strengthXHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.ThunderX, admin, thunderXHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.MjolnirX, admin, mjolnirXHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.Dawn, admin, dawnHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.Lightning, admin, lighteningHolder, stargateNFT);
  await createNodeHolder(TokenLevelId.Flash, admin, flashHolder, stargateNFT);
  await createValidator(validatorHolder, authorityContractMock, admin);

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
        stargateNFT: await stargateNFT.getAddress(),
        authorityContract: await authorityContractMock.getAddress(),
        initialMinStakedAmount: config.MIN_VET_STAKE,
      },
      {
        admin: admin.address,
        upgrader: admin.address,
        whitelist: [whitelistedAccount.address],
        settingsManager: admin.address,
        nodeWeightManager: admin.address,
        executor: admin.address,
        whitelistAdmin: admin.address,
      },
    ],
    {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
    false,
  )) as VeVote;

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
    stargateNFT,
    authorityContractMock,
  };
  return cachedDeployInstance;
};
