import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  Authority,
  NodeManagement,
  Staker,
  Stargate,
  StargateDelegation,
  StargateNFT,
  TokenAuction,
  VeVote,
} from "../../typechain-types";
import { createLocalConfig } from "@repo/config/contracts/envs/local";
import {
  createNodeHolder,
  deployAndInitializeLatest,
  deployAndUpgrade,
  deployProxy,
  deployStargateNFTLibraries,
  deployStargateNFTLibrariesV2,
  deployUpgradeableWithoutInitialization,
  initializeProxy,
  initializeProxyAllVersions,
  initialTokenLevels,
  TokenLevelId,
  vthoRewardPerBlockPerLevel,
} from "../../scripts/helpers";
import { deployLibraries, deployLibrariesV1 } from "../../scripts/helpers/deployLibraries";
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
  validatorHolder2: HardhatEthersSigner;
  validator: String;
  validator2: String;
  otherAccounts: HardhatEthersSigner[];
  vevote: VeVote;
  nodeManagement: NodeManagement;
  vechainNodesMock: TokenAuction;
  stargateNFT: StargateNFT;
  stargate: Stargate;
  authorityContractMock: Authority;
  stakerContractMock: Staker;
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
    validatorHolder2,
    amnHolder,
    ...otherAccounts
  ] = await ethers.getSigners();

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  const { veVoteConfiguratorV1, veVoteProposalLogicV1, veVoteQuoromLogicV1, veVoteStateLogicV1, veVoteVoteLogicV1 } =
    await deployLibrariesV1();

  // ---------------------- Deploy Mocks ----------------------

  const StakerContractMock = await ethers.getContractFactory("Staker");
  const stakerContractMock = await StakerContractMock.deploy();
  await stakerContractMock.waitForDeployment();

  const vthoAddress = "0x0000000000000000000000000000456E65726779";

  const TokenAuctionLock = await ethers.getContractFactory("TokenAuctionMock");
  const vechainNodesMock = await TokenAuctionLock.deploy();
  await vechainNodesMock.waitForDeployment();
  const vechainNodesMockAddress = await vechainNodesMock.getAddress();

  const {
    StargateNFTClockLib,
    StargateNFTSettingsLib,
    StargateNFTTokenLib,
    StargateNFTMintingLib,
    StargateNFTLevelsLib,
    StargateNFTTokenManagerLib,
  } = await deployStargateNFTLibraries();

  const stargateNFTProxyAddress = await deployUpgradeableWithoutInitialization(
    "StargateNFT",
    {
      Clock: await StargateNFTClockLib.getAddress(),
      MintingLogic: await StargateNFTMintingLib.getAddress(),
      Settings: await StargateNFTSettingsLib.getAddress(),
      Token: await StargateNFTTokenLib.getAddress(),
      Levels: await StargateNFTLevelsLib.getAddress(),
      TokenManager: await StargateNFTTokenManagerLib.getAddress(),
    },
    false,
  );

  // Deploy Stargate proxy (latest)
  const stargateProxyAddress = await deployUpgradeableWithoutInitialization(
    "Stargate",
    {
      Clock: await StargateNFTClockLib.getAddress(),
    },
    false,
  );

  const stargateDelegationProxyAddress = await deployUpgradeableWithoutInitialization("StargateDelegation", {}, false);

  // Initialize StargateNFT V2 (no-ops in V3 but keeps upgrade path consistent)
  const stargateNFT = (await initializeProxyAllVersions(
    "StargateNFT",
    stargateNFTProxyAddress,
    [
      {
        args: [
          {
            tokenCollectionName: "StarGate Delegator Token",
            tokenCollectionSymbol: "SDT",
            baseTokenURI: "ipfs://todo/metadata/",
            admin: admin.address,
            upgrader: admin.address,
            pauser: admin.address,
            levelOperator: admin.address,
            legacyNodes: vechainNodesMockAddress,
            legacyLastTokenId: "10000",
            levelsAndSupplies: initialTokenLevels,
            stargateDelegation: stargateDelegationProxyAddress,
            vthoToken: vthoAddress,
          },
        ],
      },
      {
        args: [[]],
        version: 2,
      },
      {
        args: [stargateProxyAddress, [], []],
        version: 3,
      },
    ],
    false,
  )) as StargateNFT;

  // Initialize Stargate V1
  const stargate = (await initializeProxy(
    stargateProxyAddress,
    "Stargate",
    [
      {
        admin: config.CONTRACTS_ADMIN_ADDRESS,
        protocolStakerContract: await stakerContractMock.getAddress(),
        stargateNFTContract: stargateNFTProxyAddress,
        maxClaimablePeriods: 832,
      },
    ],
    {
      Clock: await StargateNFTClockLib.getAddress(),
    },
  )) as Stargate;

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
  const validator = await strengthHolder.getAddress();
  const validator2 = await thunderHolder.getAddress();
  await createValidator(validatorHolder, authorityContractMock, stakerContractMock, validator);
  await createValidator(validatorHolder2, authorityContractMock, stakerContractMock, validator2);
  await createValidator(amnHolder, authorityContractMock, stakerContractMock, validator2);
  await createNodeHolder(TokenLevelId.Strength, admin, strengthHolder, stargateNFT, stargate);
  await createNodeHolder(TokenLevelId.Thunder, admin, thunderHolder, stargateNFT, stargate);
  await createNodeHolder(TokenLevelId.Mjolnir, admin, mjolnirHolder, stargateNFT, stargate);
  await createNodeHolder(
    TokenLevelId.VeThorX,
    admin,
    veThorXHolder,
    stargateNFT,
    stargate,
    vechainNodesMock,
    validator,
  );
  await createNodeHolder(
    TokenLevelId.StrengthX,
    admin,
    strengthXHolder,
    stargateNFT,
    stargate,
    vechainNodesMock,
    validator,
  );
  await createNodeHolder(
    TokenLevelId.ThunderX,
    admin,
    thunderXHolder,
    stargateNFT,
    stargate,
    vechainNodesMock,
    validator2,
  );
  await createNodeHolder(
    TokenLevelId.MjolnirX,
    admin,
    mjolnirXHolder,
    stargateNFT,
    stargate,
    vechainNodesMock,
    validator2,
  );
  await createNodeHolder(TokenLevelId.Dawn, admin, dawnHolder, stargateNFT, stargate);
  await createNodeHolder(TokenLevelId.Lightning, admin, lighteningHolder, stargateNFT, stargate);
  await createNodeHolder(TokenLevelId.Flash, admin, flashHolder, stargateNFT, stargate);

  // ---------------------- Deploy Contracts ----------------------
  const vevote = (await deployAndUpgrade(
    ["VeVoteV1", "VeVote"],
    [
      [
        {
          quorumPercentage: config.QUORUM_PERCENTAGE,
          initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
          initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
          initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
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
      [],
    ],
    {
      libraries: [
        {
          VeVoteVoteLogicV1: await veVoteVoteLogicV1.getAddress(),
          VeVoteStateLogicV1: await veVoteStateLogicV1.getAddress(),
          VeVoteQuorumLogicV1: await veVoteQuoromLogicV1.getAddress(),
          VeVoteProposalLogicV1: await veVoteProposalLogicV1.getAddress(),
          VeVoteConfiguratorV1: await veVoteConfiguratorV1.getAddress(),
        },
        {
          VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
          VeVoteStateLogic: await veVoteStateLogic.getAddress(),
          VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
          VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
          VeVoteConfigurator: await veVoteConfigurator.getAddress(),
        },
      ],
      versions: [undefined, 1],
    },
  )) as VeVote;

  // Set Staker Contract as Validator Contract in VeVote
  await vevote.setValidatorContract(await stakerContractMock.getAddress());

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
    validatorHolder2,
    validator,
    validator2,
    whitelistedAccount,
    otherAccount,
    otherAccounts,
    vechainNodesMock,
    stargateNFT,
    stargate,
    authorityContractMock,
    stakerContractMock,
  };
  return cachedDeployInstance;
};
