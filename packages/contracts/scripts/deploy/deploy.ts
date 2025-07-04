import { ethers, network } from "hardhat";
import { ContractsConfig } from "@repo/config/contracts/type";
import { HttpNetworkConfig } from "hardhat/types";
import {
  deployProxy,
  saveContractsToFile,
  initialTokenLevels,
  createNodeHolder,
  deployUpgradeableWithoutInitialization,
  initializeProxy,
  deployStargateNFTLibraries,
  vthoRewardPerBlockPerLevel,
  TokenLevelId,
  deployAndInitializeLatest,
} from "../helpers";
import { getConfig } from "@repo/config";
import { NodeManagement, StargateDelegation, StargateNFT, VeVote } from "../../typechain-types";
import { deployLibraries } from "../helpers/deployLibraries";
import { createValidator } from "../helpers/validators";

const appConfig = getConfig();

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

    const TokenAuctionLock = await ethers.getContractFactory("TokenAuction");
    const vechainNodesMock = await TokenAuctionLock.deploy();
    await vechainNodesMock.waitForDeployment();

    const ClockAuctionLock = await ethers.getContractFactory("ClockAuction");
    const clockAuctionContract = await ClockAuctionLock.deploy(await vechainNodesMock.getAddress(), deployer);

    await vechainNodesMock.setSaleAuctionAddress(await clockAuctionContract.getAddress());

    await vechainNodesMock.addOperator(deployer);
    const vechainNodesMockAddress = await vechainNodesMock.getAddress();

    console.log("Vechain Nodes Mock deployed at: ", await vechainNodesMock.getAddress());

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
      true,
    );

    const stargateDelegationProxyAddress = await deployUpgradeableWithoutInitialization("StargateDelegation", {}, true);

    stargateMock = (await initializeProxy(
      stargateNFTProxyAddress,
      "StargateNFT",
      [
        {
          tokenCollectionName: "VeChain Node Token",
          tokenCollectionSymbol: "VNT",
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
    await createNodeHolder(TokenLevelId.Strength, deployer, strengthHolder, stargateMock);
    await createNodeHolder(TokenLevelId.Thunder, deployer, thunderHolder, stargateMock);
    await createNodeHolder(TokenLevelId.Mjolnir, deployer, mjolnirHolder, stargateMock);
    await createNodeHolder(TokenLevelId.VeThorX, deployer, veThorXHolder, stargateMock);
    await createNodeHolder(TokenLevelId.StrengthX, deployer, strengthXHolder, stargateMock);
    await createNodeHolder(TokenLevelId.ThunderX, deployer, thunderXHolder, stargateMock);
    await createNodeHolder(TokenLevelId.MjolnirX, deployer, mjolnirXHolder, stargateMock);
    await createNodeHolder(TokenLevelId.Dawn, deployer, dawnHolder, stargateMock);
    await createNodeHolder(TokenLevelId.Lightning, deployer, lighteningHolder, stargateMock);
    await createNodeHolder(TokenLevelId.Flash, deployer, flashHolder, stargateMock);
    await createValidator(validatorHolder1, authorityContractMock, masterNode1);
    await createValidator(validatorHolder2, authorityContractMock, masterNode2);
  }

  // ---------------------- Deploy Libraries ----------------------
  const { veVoteConfigurator, veVoteProposalLogic, veVoteQuoromLogic, veVoteStateLogic, veVoteVoteLogic } =
    await deployLibraries();

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
        stargateNFT: await stargateMock.getAddress(),
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
    {
      VeVoteVoteLogic: await veVoteVoteLogic.getAddress(),
      VeVoteStateLogic: await veVoteStateLogic.getAddress(),
      VeVoteQuorumLogic: await veVoteQuoromLogic.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogic.getAddress(),
      VeVoteConfigurator: await veVoteConfigurator.getAddress(),
    },
    true,
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
