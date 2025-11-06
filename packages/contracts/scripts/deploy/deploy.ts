import { ethers, network } from "hardhat";
import { ContractsConfig } from "@repo/config/contracts/type";
import { HttpNetworkConfig } from "hardhat/types";
import {
  deployAndUpgrade,
  saveContractsToFile,
  initialTokenLevels,
  createNodeHolder,
  deployUpgradeableWithoutInitialization,
  initializeProxy,
  initializeProxyAllVersions,
  deployStargateNFTLibraries,
  vthoRewardPerBlockPerLevel,
  TokenLevelId,
  deployAndInitializeLatest,
} from "../helpers";
import { NodeManagement, Stargate, StargateDelegation, StargateNFT, VeVote } from "../../typechain-types";
import { deployLibraries, deployLibrariesV1 } from "../helpers/deployLibraries";
import { createValidator } from "../helpers/validators";

export async function deployAll(config: ContractsConfig) {
  const start = performance.now();
  const networkConfig = network.config as HttpNetworkConfig;
  console.log(
    `================  Deploying contracts on ${networkConfig.url} with ${config.VITE_APP_ENV} configurations `,
  );
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
    validatorHolder1,
    masterNode1,
    validatorHolder2,
    masterNode2,
    whitelistedAccount,
  ] = await ethers.getSigners();

  const TEMP_ADMIN = network.name === "vechain_solo" ? config.CONTRACTS_ADMIN_ADDRESS : deployer.address;
  console.log("================================================================================");
  console.log("Temporary admin set to ", TEMP_ADMIN);
  console.log("Final admin will be set to ", config.CONTRACTS_ADMIN_ADDRESS);

  console.log(`================  Address used to deploy: ${deployer.address}`);

  // ---------------------- Deploy Mocks ----------------------
  let stargateSCAddress = config.STARGATE_CONTRACT_ADDRESS; // this is the mainnet address
  let stargateMock = await ethers.getContractAt("StargateNFT", config.STARGATE_CONTRACT_ADDRESS);

  let nodeManagementAddress = config.NODE_MANAGEMENT_CONTRACT_ADDRESS; // this is the mainnet address
  let nodeManagement = await ethers.getContractAt("NodeManagement", config.NODE_MANAGEMENT_CONTRACT_ADDRESS);

  const vthoAddress = "0x0000000000000000000000000000456E65726779";
  if (network.name !== "vechain_mainnet") {
    console.log("Deploying Vechain Nodes mock contracts");

    const TokenAuctionLock = await ethers.getContractFactory("TokenAuctionMock");
    const vechainNodesMock = await TokenAuctionLock.deploy();
    await vechainNodesMock.waitForDeployment();
    const vechainNodesMockAddress = await vechainNodesMock.getAddress();

    console.log("Vechain Nodes Mock deployed at: ", await vechainNodesMock.getAddress());

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
      true,
    );

    const stargateProxyAddress = await deployUpgradeableWithoutInitialization(
      "Stargate",
      {
        Clock: await StargateNFTClockLib.getAddress(),
      },
      true,
    );

    const stargate = (await initializeProxy(
      stargateProxyAddress,
      "Stargate",
      [
        {
          admin: TEMP_ADMIN,
          protocolStakerContract: config.PROTOCOL_STAKER_CONTRACT_ADDRESS ?? TEMP_ADMIN,
          stargateNFTContract: stargateNFTProxyAddress,
          maxClaimablePeriods: (config as any).MAX_CLAIMABLE_PERIODS ?? 832,
        },
      ],
      {
        Clock: await StargateNFTClockLib.getAddress(),
      },
    )) as unknown as Stargate;

    const stargateDelegationProxyAddress = await deployUpgradeableWithoutInitialization("StargateDelegation", {}, true);

    stargateMock = (await initializeProxyAllVersions(
      "StargateNFT",
      stargateNFTProxyAddress,
      [
        {
          args: [
            {
              tokenCollectionName: "StarGate Delegator Token",
              tokenCollectionSymbol: "SDT",
              baseTokenURI: "ipfs://todo/metadata/",
              admin: TEMP_ADMIN,
              upgrader: TEMP_ADMIN,
              pauser: TEMP_ADMIN,
              levelOperator: TEMP_ADMIN,
              legacyNodes: vechainNodesMockAddress,
              legacyLastTokenId: TEMP_ADMIN,
              levelsAndSupplies: initialTokenLevels,
              stargateDelegation: stargateDelegationProxyAddress,
              vthoToken: vthoAddress,
            },
          ],
        },
        { args: [[]], version: 2 },
        { args: [stargateProxyAddress, [], []], version: 3 },
      ],
      true,
    )) as StargateNFT;

    stargateSCAddress = await stargateMock.getAddress();

    (await initializeProxy(
      stargateDelegationProxyAddress,
      "StargateDelegation",
      [
        {
          upgrader: config.CONTRACTS_ADMIN_ADDRESS,
          admin: config.CONTRACTS_ADMIN_ADDRESS,
          stargateNFT: await stargateMock.getAddress(),
          vthoToken: vthoAddress,
          vthoRewardPerBlock: vthoRewardPerBlockPerLevel,
          delegationPeriod: 10, // 10 blocks"
          operator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      ],
      {},
    )) as unknown as StargateDelegation;

    nodeManagement = (await deployAndInitializeLatest(
      "NodeManagement",
      [
        {
          name: "initialize",
          args: [vechainNodesMockAddress, TEMP_ADMIN, deployer.address],
        },
        {
          name: "initializeV3",
          args: [await stargateMock.getAddress()],
        },
      ],
      {},
      true,
    )) as NodeManagement;

    nodeManagementAddress = await nodeManagement.getAddress();

    // Mock builtin Authority contract
    const AuthorityContractMock = await ethers.getContractFactory("Authority");
    const authorityContractMock = await AuthorityContractMock.deploy();
    await authorityContractMock.waitForDeployment();

    // ---------------------- Create Node Holders ----------------------
    // Stargate already initialized above
    const validator = await strengthHolder.getAddress();
    const validator2 = await thunderHolder.getAddress();
    await createNodeHolder(TokenLevelId.Strength, deployer, strengthHolder, stargateMock, stargate);
    await createNodeHolder(TokenLevelId.Thunder, deployer, thunderHolder, stargateMock, stargate);
    await createNodeHolder(TokenLevelId.Mjolnir, deployer, mjolnirHolder, stargateMock, stargate);
    await createNodeHolder(
      TokenLevelId.VeThorX,
      deployer,
      veThorXHolder,
      stargateMock,
      stargate,
      vechainNodesMock,
      validator,
    );
    await createNodeHolder(
      TokenLevelId.StrengthX,
      deployer,
      strengthXHolder,
      stargateMock,
      stargate,
      vechainNodesMock,
      validator,
    );
    await createNodeHolder(
      TokenLevelId.ThunderX,
      deployer,
      thunderXHolder,
      stargateMock,
      stargate,
      vechainNodesMock,
      validator2,
    );
    await createNodeHolder(
      TokenLevelId.MjolnirX,
      deployer,
      mjolnirXHolder,
      stargateMock,
      stargate,
      vechainNodesMock,
      validator2,
    );
    await createNodeHolder(TokenLevelId.Dawn, deployer, dawnHolder, stargateMock, stargate);
    await createNodeHolder(TokenLevelId.Lightning, deployer, lighteningHolder, stargateMock, stargate);
    await createNodeHolder(TokenLevelId.Flash, deployer, flashHolder, stargateMock, stargate);
    //await createNodeHolderV2(validatorHolder1, authorityContractMock, masterNode1);
    //await createNodeHolderV2(validatorHolder2, authorityContractMock, masterNode2);
  }

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfiguratorV1, veVoteProposalLogicV1, veVoteQuoromLogicV1, veVoteStateLogicV1, veVoteVoteLogicV1 } =
    await deployLibrariesV1();

  // ---------------------- Deploy Contracts ----------------------

  // Deploy VeVote V1 and upgrade to latest VeVote
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

  const vevote = (await deployAndUpgrade(
    ["VeVoteV1", "VeVote"],
    [
      [
        {
          quorumPercentage: config.QUORUM_PERCENTAGE,
          initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
          initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
          initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
          nodeManagement: nodeManagementAddress,
          stargateNFT: stargateSCAddress,
          authorityContract: config.AUTHORITY_CONTRACT_ADDRESS,
          initialMinStakedAmount: config.MIN_VET_STAKE,
        },
        {
          admin: TEMP_ADMIN,
          upgrader: TEMP_ADMIN,
          whitelist: [TEMP_ADMIN, whitelistedAccount.address],
          settingsManager: TEMP_ADMIN,
          nodeWeightManager: TEMP_ADMIN,
          executor: TEMP_ADMIN,
          whitelistAdmin: TEMP_ADMIN,
        },
      ],
      [],
    ],
    {
      versions: [undefined, 2],
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
      logOutput: true,
    },
  )) as VeVote;

  const date = new Date(performance.now() - start);
  console.log(`================  Contracts deployed in ${date.getMinutes()}m ${date.getSeconds()}s `);

  const contractAddresses: Record<string, string> = {
    vevote: await vevote.getAddress(),
  };

  const libraries: {
    VeVote: Record<string, string>;
  } = {
    VeVote: {
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
    },
  };

  console.log("Contracts", contractAddresses);
  await saveContractsToFile(contractAddresses, libraries);

  const end = new Date(performance.now() - start);
  console.log(`Total execution time: ${end.getMinutes()}m ${end.getSeconds()}s`);

  console.log("Deployment completed successfully!");
  console.log("================================================================================");

  return {
    vevote,
    stargateMock: stargateMock,
    nodeManagement: nodeManagement,
  };
}
