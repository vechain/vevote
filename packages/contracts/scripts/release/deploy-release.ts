import { ethers, network } from "hardhat";
import { ContractsConfig } from "@repo/config/contracts/type";
import { HttpNetworkConfig } from "hardhat/types";
import { deployProxy, saveContractsToFile } from "../helpers";
import { VeVoteV1 } from "../../typechain-types";
import { deployLibraries, deployLibrariesV1 } from "../helpers/deployLibraries";

export async function deployAll(config: ContractsConfig) {
  const start = performance.now();
  const networkConfig = network.config as HttpNetworkConfig;
  console.log(
    `================  Deploying VeVote SC on ${networkConfig.url} with ${config.VITE_APP_ENV} configurations `,
  );
  // Contracts are deployed using the first signer/account by default
  const [deployer] = await ethers.getSigners();

  const TEMP_ADMIN = network.name === "vechain_solo" ? config.CONTRACTS_ADMIN_ADDRESS : deployer.address;
  console.log("================================================================================");
  console.log("Temporary admin set to ", TEMP_ADMIN);
  console.log("Final admin will be set to ", config.CONTRACTS_ADMIN_ADDRESS);

  console.log(`================  Address used to deploy: ${deployer.address}`);

  // ---------------------- Deploy Contracts ----------------------
  console.log("================================================================================");
  console.log("Smart Contract Configuration:");
  console.log(`- Quorum Percentage           : ${config.QUORUM_PERCENTAGE}%`);
  console.log(`- Min Voting Delay            : ${config.INITIAL_MIN_VOTING_DELAY} blocks`);
  console.log(`- Min Voting Duration         : ${config.INITIAL_MIN_VOTING_DURATION} blocks`);
  console.log(`- Max Voting Duration         : ${config.INITIAL_MAX_VOTING_DURATION} blocks`);
  console.log(`- Initial Min Staked Amount   : ${ethers.formatEther(config.MIN_VET_STAKE)} VET`);
  console.log(`- Node Management Address     : ${config.NODE_MANAGEMENT_CONTRACT_ADDRESS}`);
  console.log(`- Stargate NFT Address        : ${config.STARGATE_CONTRACT_ADDRESS}`);
  console.log(`- Authority Contract Address  : ${config.AUTHORITY_CONTRACT_ADDRESS}`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Role Configuration:");
  console.log(`- Admin                       : ${TEMP_ADMIN}`);
  console.log(`- Upgrader                    : ${TEMP_ADMIN}`);
  console.log(`- Whitelist Admin             : ${TEMP_ADMIN}`);
  console.log(`- Whitelisted Addresses       : ${[TEMP_ADMIN]}`);
  console.log(`- Settings Manager            : ${TEMP_ADMIN}`);
  console.log(`- Node Weight Manager         : ${TEMP_ADMIN}`);
  console.log(`- Executor                    : ${TEMP_ADMIN}`);
  console.log("================================================================================");

  // ---------------------- Deploy Libraries ----------------------
  console.log("Deploying VeVote libaries...");
  const { veVoteConfiguratorV1, veVoteProposalLogicV1, veVoteQuoromLogicV1, veVoteStateLogicV1, veVoteVoteLogicV1 } =
    await deployLibrariesV1();

  console.log("VeVote libaries deployed");
  console.log("Library Addresses:");
  console.log(`- VeVoteConfigurator:     ${await veVoteConfiguratorV1.getAddress()}`);
  console.log(`- VeVoteProposalLogic:    ${await veVoteProposalLogicV1.getAddress()}`);
  console.log(`- VeVoteQuorumLogic:      ${await veVoteQuoromLogicV1.getAddress()}`);
  console.log(`- VeVoteStateLogic:       ${await veVoteStateLogicV1.getAddress()}`);
  console.log(`- VeVoteVoteLogic:        ${await veVoteVoteLogicV1.getAddress()}`);
  console.log("================================================================================");

  console.log("Deploying VeVote Smart Contract...");
  // Deploy the vevote contract
  const vevote = (await deployProxy(
    "VeVoteV1",
    [
      {
        quorumPercentage: config.QUORUM_PERCENTAGE,
        initialMinVotingDelay: config.INITIAL_MIN_VOTING_DELAY,
        initialMaxVotingDuration: config.INITIAL_MAX_VOTING_DURATION,
        initialMinVotingDuration: config.INITIAL_MIN_VOTING_DURATION,
        nodeManagement: config.NODE_MANAGEMENT_CONTRACT_ADDRESS,
        stargateNFT: config.STARGATE_CONTRACT_ADDRESS,
        authorityContract: config.AUTHORITY_CONTRACT_ADDRESS,
        initialMinStakedAmount: config.MIN_VET_STAKE,
      },
      {
        admin: TEMP_ADMIN,
        upgrader: TEMP_ADMIN,
        whitelist: [TEMP_ADMIN],
        settingsManager: TEMP_ADMIN,
        nodeWeightManager: TEMP_ADMIN,
        executor: TEMP_ADMIN,
        whitelistAdmin: TEMP_ADMIN,
      },
    ],
    {
      VeVoteVoteLogicV1: await veVoteVoteLogicV1.getAddress(),
      VeVoteStateLogicV1: await veVoteStateLogicV1.getAddress(),
      VeVoteQuorumLogicV1: await veVoteQuoromLogicV1.getAddress(),
      VeVoteProposalLogicV1: await veVoteProposalLogicV1.getAddress(),
      VeVoteConfiguratorV1: await veVoteConfiguratorV1.getAddress(),
    },
    true,
  )) as VeVoteV1;

  const date = new Date(performance.now() - start);
  console.log(`================  Contracts deployed in ${date.getMinutes()}m ${date.getSeconds()}s `);

  const contractAddresses: Record<string, string> = {
    vevote: await vevote.getAddress(),
  };

  const libraries: {
    VeVote: Record<string, string>;
  } = {
    VeVote: {
      VeVoteConfigurator: await veVoteConfiguratorV1.getAddress(),
      VeVoteProposalLogic: await veVoteProposalLogicV1.getAddress(),
      VeVoteQuoromLogic: await veVoteQuoromLogicV1.getAddress(),
      VeVoteStateLogic: await veVoteStateLogicV1.getAddress(),
      VeVoteVoteLogic: await veVoteVoteLogicV1.getAddress(),
    },
  };
  console.log(`🚀 Deployed VeVote Smart Contract: ${await vevote.getAddress()} 🚀`);
  console.log("================================================================================");
  await saveContractsToFile(contractAddresses, libraries);

  const end = new Date(performance.now() - start);
  console.log(`Total execution time: ${end.getMinutes()}m ${end.getSeconds()}s`);

  console.log("Deployment completed successfully!");
  console.log("================================================================================");

  return {
    vevote,
  };
}
